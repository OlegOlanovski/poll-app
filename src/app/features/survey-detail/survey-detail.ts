import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SurveyStore } from '../../core/services/survey-store';
import { Survey, SurveyAnswer, SurveyQuestion, SurveySelections } from '../../shared/models/survey';
import {
  hasCompletedSurvey,
  markSurveyAsCompleted,
} from '../../shared/utils/survey-participation-storage';

const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const FIRST_ANSWER_CHARACTER_CODE = 65;
const PERCENTAGE_MULTIPLIER = 100;
const SUBMISSION_SUCCESS_MESSAGE = 'Thank you! Your answers have been saved.';

@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly surveyStore = inject(SurveyStore);

  private readonly surveyId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly selections = signal<SurveySelections>({});
  readonly hasSubmitted = signal(hasCompletedSurvey(this.surveyId));
  readonly isResultsOpen = signal(true);
  readonly isLoading = this.surveyStore.isLoading;
  readonly isSubmitting = signal(false);
  readonly submissionError = signal<string | null>(null);
  readonly submissionFeedback = computed<string | null>(() =>
    this.hasSubmitted() ? SUBMISSION_SUCCESS_MESSAGE : this.submissionError(),
  );
  readonly survey = computed<Survey | undefined>(() =>
    this.surveyStore.getSurveyById(this.surveyId),
  );
  readonly isReadOnly = computed<boolean>(() => this.survey()?.status === 'past');
  readonly hasResults = computed<boolean>(() =>
    Boolean(this.hasStoredResults() || this.hasPreviewSelections()),
  );
  readonly canComplete = computed<boolean>(() => {
    const survey = this.survey();

    return Boolean(
      survey?.status === 'active' &&
      survey.questions.every(
        (question: SurveyQuestion): boolean => (this.selections()[question.id]?.length ?? 0) > 0,
      ),
    );
  });

  /**
   * Selects one answer or toggles a multiple answer.
   *
   * @param question - Question that owns the selected answer.
   * @param answerId - Identifier of the answer selected by the user.
   */
  toggleAnswer(question: SurveyQuestion, answerId: string): void {
    if (this.hasSubmitted() || this.isReadOnly()) {
      return;
    }

    const selectedIds = this.getNextSelection(question, answerId);

    this.selections.update((selections: SurveySelections): SurveySelections => ({
      ...selections,
      [question.id]: selectedIds,
    }));
  }

  /**
   * Returns whether an answer is currently selected.
   *
   * @param questionId - Identifier of the answer's question.
   * @param answerId - Identifier of the answer to check.
   * @returns Whether the answer is currently selected.
   */
  isAnswerSelected(questionId: string, answerId: string): boolean {
    return this.selections()[questionId]?.includes(answerId) ?? false;
  }

  /** Opens or closes the mobile results accordion. */
  toggleResults(): void {
    this.isResultsOpen.update((isOpen: boolean): boolean => !isOpen);
  }

  /**
   * Completes the survey and updates live results.
   *
   * @returns A promise that resolves after valid selections are submitted.
   */
  async completeSurvey(): Promise<void> {
    if (!this.canComplete() || this.hasSubmitted() || this.isSubmitting()) {
      return;
    }

    await this.submitSelectedAnswers();
  }

  /**
   * Submits selected answers and exposes any request error.
   *
   * @returns A promise that resolves after the submission request finishes.
   */
  private async submitSelectedAnswers(): Promise<void> {
    this.isSubmitting.set(true);
    this.submissionError.set(null);
    try {
      await this.saveVote();
    } catch {
      this.submissionError.set('Your vote could not be saved. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  /**
   * Saves selected answers and locks the completed form.
   *
   * @returns A promise that resolves after the vote is stored.
   */
  private async saveVote(): Promise<void> {
    await this.surveyStore.submitVote(this.surveyId, this.selections());
    markSurveyAsCompleted(this.surveyId);
    this.hasSubmitted.set(true);
  }

  /**
   * Returns an alphabetical answer label.
   *
   * @param answerIndex - Zero-based index of the answer.
   * @returns The corresponding alphabetical answer label.
   */
  getAnswerLabel(answerIndex: number): string {
    return String.fromCharCode(FIRST_ANSWER_CHARACTER_CODE + answerIndex);
  }

  /**
   * Formats a survey deadline for display.
   *
   * @param endDate - Survey deadline in a date-compatible string format.
   * @returns The deadline formatted for the German locale.
   */
  getDeadlineLabel(endDate: string): string {
    return DATE_FORMATTER.format(new Date(endDate));
  }

  /**
   * Calculates one answer percentage within its question.
   *
   * @param question - Question containing all current vote totals.
   * @param answer - Answer whose percentage should be calculated.
   * @returns The rounded percentage of votes received by the answer.
   */
  getVotePercentage(question: SurveyQuestion, answer: SurveyAnswer): number {
    const totalVotes = question.answers.reduce(
      (total: number, currentAnswer: SurveyAnswer): number =>
        total + this.getDisplayedVotes(question.id, currentAnswer),
      0,
    );
    const answerVotes = this.getDisplayedVotes(question.id, answer);

    return totalVotes === 0 ? 0 : Math.round((answerVotes / totalVotes) * PERCENTAGE_MULTIPLIER);
  }

  /** Returns whether the loaded survey already contains saved votes. */
  private hasStoredResults(): boolean {
    return Boolean(
      this.survey()?.questions.some((question: SurveyQuestion): boolean =>
        question.answers.some((answer: SurveyAnswer): boolean => answer.votes > 0),
      ),
    );
  }

  /** Returns whether the participant has selected at least one answer. */
  private hasPreviewSelections(): boolean {
    return Object.values(this.selections()).some(
      (selectedAnswerIds: string[]): boolean => selectedAnswerIds.length > 0,
    );
  }

  /**
   * Returns saved votes plus the participant's unsaved preview vote.
   *
   * @param questionId - Identifier of the answer's question.
   * @param answer - Answer whose displayed votes should be calculated.
   * @returns Vote count shown in the live result.
   */
  private getDisplayedVotes(questionId: string, answer: SurveyAnswer): number {
    const isPreviewVote = !this.hasSubmitted() && this.isAnswerSelected(questionId, answer.id);

    return answer.votes + Number(isPreviewVote);
  }

  /**
   * Toggles an identifier inside a multiple selection.
   *
   * @param selectedIds - Currently selected answer identifiers.
   * @param answerId - Identifier that should be added or removed.
   * @returns A new array containing the updated selection.
   */
  private toggleSelection(selectedIds: string[], answerId: string): string[] {
    return selectedIds.includes(answerId)
      ? selectedIds.filter((selectedId: string): boolean => selectedId !== answerId)
      : [...selectedIds, answerId];
  }

  /**
   * Returns the next valid selection for a question.
   *
   * @param question - Question that defines the selection mode.
   * @param answerId - Identifier selected by the user.
   * @returns The next valid answer selection for the question.
   */
  private getNextSelection(question: SurveyQuestion, answerId: string): string[] {
    const currentIds = this.selections()[question.id] ?? [];

    return question.allowMultipleAnswers ? this.toggleSelection(currentIds, answerId) : [answerId];
  }
}
