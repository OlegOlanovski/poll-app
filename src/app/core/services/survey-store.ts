import { effect, inject, Injectable, signal } from '@angular/core';

import { INITIAL_SURVEYS } from '../../shared/data/initial-surveys';
import { CreateSurveyData, CreateSurveyQuestionData } from '../../shared/models/create-survey-data';
import { Survey, SurveyAnswer, SurveyQuestion, SurveySelections } from '../../shared/models/survey';
import { createRelativeEndDate } from '../../shared/utils/survey-date';
import { SupabaseSurveyRepository } from './supabase-survey-repository';

const DEFAULT_DESCRIPTION = 'No description was provided.';
const DEFAULT_SURVEY_DURATION_DAYS = 7;
const SURVEY_STORAGE_KEY = 'poll-app-surveys';
const LEGACY_CATEGORIES: Readonly<Record<string, string>> = {
  'Team activities': 'Team Activities',
  Gaming: 'Gaming & Entertainment',
  'Healthy Lifestyle': 'Lifestyle & Preferences',
};

@Injectable({
  providedIn: 'root',
})
export class SurveyStore {
  private readonly repository = inject(SupabaseSurveyRepository);
  private readonly surveysState = signal<Survey[]>(
    this.repository.isConfigured ? [] : loadLocalSurveys(),
  );

  readonly surveys = this.surveysState.asReadonly();
  readonly isLoading = signal(this.repository.isConfigured);
  readonly errorMessage = signal<string | null>(null);

  /** Initializes remote loading or local browser persistence. */
  constructor() {
    if (this.repository.isConfigured) {
      void this.refreshSurveys();
      return;
    }

    effect((): void => {
      saveLocalSurveys(this.surveysState());
    });
  }

  /**
   * Creates a survey and returns its generated identifier.
   *
   * @param data - Validated data from the survey creation form.
   * @returns A promise that resolves to the generated survey identifier.
   */
  async addSurvey(data: CreateSurveyData): Promise<string> {
    const surveyId = crypto.randomUUID();
    const survey = this.createSurvey(data, surveyId);

    if (!this.repository.isConfigured) {
      this.surveysState.update((surveys: Survey[]): Survey[] => [survey, ...surveys]);
      return surveyId;
    }

    await this.runRemoteMutation((): Promise<string> => this.repository.createSurvey(survey));
    return surveyId;
  }

  /**
   * Finds one survey by its identifier.
   *
   * @param surveyId - Identifier of the requested survey.
   * @returns The matching survey, or undefined when it does not exist.
   */
  getSurveyById(surveyId: string): Survey | undefined {
    return this.surveys().find((survey: Survey): boolean => survey.id === surveyId);
  }

  /**
   * Adds one completed participant vote to a survey.
   *
   * @param surveyId - Identifier of the survey receiving the vote.
   * @param selections - Selected answer identifiers grouped by question.
   * @returns A promise that resolves after the vote is stored.
   */
  async submitVote(surveyId: string, selections: SurveySelections): Promise<void> {
    this.assertSurveyAcceptsVotes(surveyId);

    if (this.repository.isConfigured) {
      await this.runRemoteMutation((): Promise<void> =>
        this.repository.submitVote(surveyId, selections),
      );
      return;
    }

    this.surveysState.update((surveys: Survey[]): Survey[] =>
      surveys.map((survey: Survey): Survey =>
        survey.id === surveyId ? this.addVotes(survey, selections) : survey,
      ),
    );
  }

  /**
   * Prevents votes from being submitted to missing or expired surveys.
   *
   * @param surveyId - Identifier of the survey that should receive a vote.
   * @throws An error when the survey is unavailable or no longer active.
   */
  private assertSurveyAcceptsVotes(surveyId: string): void {
    const survey = this.getSurveyById(surveyId);

    if (survey?.status !== 'active') {
      throw new Error('This survey is no longer accepting votes.');
    }
  }

  /**
   * Reloads surveys from the configured remote database.
   *
   * @returns A promise that resolves after the surveys are refreshed.
   */
  async refreshSurveys(): Promise<void> {
    if (!this.repository.isConfigured) {
      return;
    }

    await this.loadRemoteSurveys();
  }

  /**
   * Loads remote surveys while maintaining request state.
   *
   * @returns A promise that resolves after the loading state is updated.
   */
  private async loadRemoteSurveys(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      this.surveysState.set(await this.repository.loadSurveys());
    } catch (error: unknown) {
      this.handleRemoteError(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Runs a database mutation and refreshes the local state.
   *
   * @param action - Asynchronous database mutation to execute.
   * @returns A promise that resolves after the mutation and refresh finish.
   * @throws The original database error when the mutation fails.
   */
  private async runRemoteMutation(action: () => Promise<unknown>): Promise<void> {
    this.errorMessage.set(null);
    try {
      await action();
      await this.refreshSurveys();
    } catch (error: unknown) {
      this.handleRemoteError(error);
      throw error;
    }
  }

  /**
   * Stores a readable remote error for the interface.
   *
   * @param error - Unknown error received from a remote request.
   */
  private handleRemoteError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'The database request failed.';
    this.errorMessage.set(message);
  }

  /**
   * Returns a survey with updated question votes.
   *
   * @param survey - Survey that receives the completed selections.
   * @param selections - Selected answer identifiers grouped by question.
   * @returns A new survey containing the incremented vote totals.
   */
  private addVotes(survey: Survey, selections: SurveySelections): Survey {
    return {
      ...survey,
      questions: survey.questions.map((question: SurveyQuestion): SurveyQuestion =>
        this.addQuestionVotes(question, selections[question.id] ?? []),
      ),
    };
  }

  /**
   * Returns a question with incremented selected answers.
   *
   * @param question - Question whose answers should be updated.
   * @param selectedAnswerIds - Identifiers of the selected answers.
   * @returns A new question containing the incremented vote totals.
   */
  private addQuestionVotes(question: SurveyQuestion, selectedAnswerIds: string[]): SurveyQuestion {
    return {
      ...question,
      answers: question.answers.map((answer: SurveyAnswer): SurveyAnswer => ({
        ...answer,
        votes: answer.votes + Number(selectedAnswerIds.includes(answer.id)),
      })),
    };
  }

  /**
   * Converts form data into a complete survey.
   *
   * @param data - Validated data from the survey creation form.
   * @param surveyId - Generated identifier assigned to the survey.
   * @returns A complete survey ready for persistence.
   */
  private createSurvey(data: CreateSurveyData, surveyId: string): Survey {
    return {
      id: surveyId,
      category: data.category,
      title: data.title.trim(),
      description: data.description.trim() || DEFAULT_DESCRIPTION,
      endDate: this.resolveEndDate(data.endDate),
      status: 'active',
      createdAt: new Date().toISOString(),
      questions: data.questions.map((question: CreateSurveyQuestionData): SurveyQuestion =>
        this.createQuestion(question),
      ),
    };
  }

  /**
   * Converts one form question into a survey question.
   *
   * @param data - Validated question data from the creation form.
   * @returns A complete survey question with generated identifiers.
   */
  private createQuestion(data: CreateSurveyQuestionData): SurveyQuestion {
    return {
      id: crypto.randomUUID(),
      question: data.question.trim(),
      allowMultipleAnswers: data.allowMultipleAnswers,
      answers: data.answers.map((answer: string): SurveyAnswer => this.createAnswer(answer)),
    };
  }

  /**
   * Creates one answer with an initial vote count.
   *
   * @param answer - Answer text entered in the creation form.
   * @returns A survey answer with a generated identifier and zero votes.
   */
  private createAnswer(answer: string): SurveyAnswer {
    return {
      id: crypto.randomUUID(),
      text: answer.trim(),
      votes: 0,
    };
  }

  /**
   * Uses the selected deadline or creates a default deadline.
   *
   * @param endDate - Optional date selected in the creation form.
   * @returns The selected or default deadline in ISO 8601 format.
   */
  private resolveEndDate(endDate: string): string {
    if (!endDate) {
      return createRelativeEndDate(DEFAULT_SURVEY_DURATION_DAYS);
    }

    return new Date(`${endDate}T23:59:59`).toISOString();
  }
}

/**
 * Loads valid saved surveys or returns the initial surveys.
 *
 * @returns Saved local surveys or the predefined initial surveys.
 */
function loadLocalSurveys(): Survey[] {
  const storedSurveys = localStorage.getItem(SURVEY_STORAGE_KEY);

  return storedSurveys ? parseLocalSurveys(storedSurveys) : updateSurveyStatuses(INITIAL_SURVEYS);
}

/**
 * Parses saved surveys and falls back to initial data.
 *
 * @param storedSurveys - Serialized survey data from local storage.
 * @returns Parsed surveys or the predefined initial surveys.
 */
function parseLocalSurveys(storedSurveys: string): Survey[] {
  try {
    const parsedSurveys: unknown = JSON.parse(storedSurveys);
    return isSurveyArray(parsedSurveys)
      ? updateSurveyStatuses(parsedSurveys)
      : updateSurveyStatuses(INITIAL_SURVEYS);
  } catch {
    return updateSurveyStatuses(INITIAL_SURVEYS);
  }
}

/**
 * Updates active and past states from each real deadline.
 *
 * @param surveys - Surveys whose status and legacy categories need updating.
 * @returns New survey objects with normalized categories and current statuses.
 */
function updateSurveyStatuses(surveys: Survey[]): Survey[] {
  return surveys.map((survey: Survey): Survey => ({
    ...survey,
    category: LEGACY_CATEGORIES[survey.category] ?? survey.category,
    status: new Date(survey.endDate).getTime() > Date.now() ? 'active' : 'past',
  }));
}

/**
 * Persists surveys in the browser.
 *
 * @param surveys - Surveys to serialize into local storage.
 */
function saveLocalSurveys(surveys: Survey[]): void {
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(surveys));
}

/**
 * Checks whether stored data is a survey collection.
 *
 * @param value - Unknown stored value to validate.
 * @returns Whether the value is a valid survey array.
 */
function isSurveyArray(value: unknown): value is Survey[] {
  return Array.isArray(value) && value.every(isSurvey);
}

/**
 * Checks the required top-level properties of stored survey data.
 *
 * @param value - Unknown item to validate as a survey.
 * @returns Whether the value contains the required survey properties.
 */
function isSurvey(value: unknown): value is Survey {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const survey = value as Record<string, unknown>;
  return typeof survey['id'] === 'string' && Array.isArray(survey['questions']);
}
