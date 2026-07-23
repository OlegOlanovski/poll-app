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

  constructor() {
    if (this.repository.isConfigured) {
      void this.refreshSurveys();
      return;
    }

    effect((): void => {
      saveLocalSurveys(this.surveysState());
    });
  }

  /** Creates a survey and returns its generated identifier. */
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

  /** Finds one survey by its identifier. */
  getSurveyById(surveyId: string): Survey | undefined {
    return this.surveys().find((survey: Survey): boolean => survey.id === surveyId);
  }

  /** Adds one completed participant vote to a survey. */
  async submitVote(surveyId: string, selections: SurveySelections): Promise<void> {
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

  /** Reloads surveys from the configured remote database. */
  async refreshSurveys(): Promise<void> {
    if (!this.repository.isConfigured) {
      return;
    }

    await this.loadRemoteSurveys();
  }

  /** Loads remote surveys while maintaining request state. */
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

  /** Runs a database mutation and refreshes the local state. */
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

  /** Stores a readable remote error for the interface. */
  private handleRemoteError(error: unknown): void {
    const message = error instanceof Error ? error.message : 'The database request failed.';
    this.errorMessage.set(message);
  }

  /** Returns a survey with updated question votes. */
  private addVotes(survey: Survey, selections: SurveySelections): Survey {
    return {
      ...survey,
      questions: survey.questions.map((question: SurveyQuestion): SurveyQuestion =>
        this.addQuestionVotes(question, selections[question.id] ?? []),
      ),
    };
  }

  /** Returns a question with incremented selected answers. */
  private addQuestionVotes(question: SurveyQuestion, selectedAnswerIds: string[]): SurveyQuestion {
    return {
      ...question,
      answers: question.answers.map((answer: SurveyAnswer): SurveyAnswer => ({
        ...answer,
        votes: answer.votes + Number(selectedAnswerIds.includes(answer.id)),
      })),
    };
  }

  /** Converts form data into a complete survey. */
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

  /** Converts one form question into a survey question. */
  private createQuestion(data: CreateSurveyQuestionData): SurveyQuestion {
    return {
      id: crypto.randomUUID(),
      question: data.question.trim(),
      allowMultipleAnswers: data.allowMultipleAnswers,
      answers: data.answers.map((answer: string): SurveyAnswer => this.createAnswer(answer)),
    };
  }

  /** Creates one answer with an initial vote count. */
  private createAnswer(answer: string): SurveyAnswer {
    return {
      id: crypto.randomUUID(),
      text: answer.trim(),
      votes: 0,
    };
  }

  /** Uses the selected deadline or creates a default deadline. */
  private resolveEndDate(endDate: string): string {
    if (!endDate) {
      return createRelativeEndDate(DEFAULT_SURVEY_DURATION_DAYS);
    }

    return new Date(`${endDate}T23:59:59`).toISOString();
  }
}

/** Loads valid saved surveys or returns the initial surveys. */
function loadLocalSurveys(): Survey[] {
  const storedSurveys = localStorage.getItem(SURVEY_STORAGE_KEY);

  return storedSurveys ? parseLocalSurveys(storedSurveys) : updateSurveyStatuses(INITIAL_SURVEYS);
}

/** Parses saved surveys and falls back to initial data. */
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

/** Updates active and past states from each real deadline. */
function updateSurveyStatuses(surveys: Survey[]): Survey[] {
  return surveys.map((survey: Survey): Survey => ({
    ...survey,
    category: LEGACY_CATEGORIES[survey.category] ?? survey.category,
    status: new Date(survey.endDate).getTime() > Date.now() ? 'active' : 'past',
  }));
}

/** Persists surveys in the browser. */
function saveLocalSurveys(surveys: Survey[]): void {
  localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(surveys));
}

/** Checks whether stored data is a survey collection. */
function isSurveyArray(value: unknown): value is Survey[] {
  return Array.isArray(value) && value.every(isSurvey);
}

/** Checks the required top-level properties of stored survey data. */
function isSurvey(value: unknown): value is Survey {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const survey = value as Record<string, unknown>;
  return typeof survey['id'] === 'string' && Array.isArray(survey['questions']);
}
