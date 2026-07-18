import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { SurveyStore } from '../../core/services/survey-store';
import { Survey, SurveyAnswer, SurveyQuestion, SurveySelections } from '../../shared/models/survey';

const DATE_FORMATTER = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});
const FIRST_ANSWER_CHARACTER_CODE = 65;
const PERCENTAGE_MULTIPLIER = 100;

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
  readonly hasSubmitted = signal(false);
  readonly survey = computed<Survey | undefined>(() =>
    this.surveyStore.getSurveyById(this.surveyId),
  );
  readonly hasResults = computed<boolean>(() =>
    Boolean(
      this.survey()?.questions.some((question: SurveyQuestion): boolean =>
        question.answers.some((answer: SurveyAnswer): boolean => answer.votes > 0),
      ),
    ),
  );
  readonly canComplete = computed<boolean>(() => {
    const survey = this.survey();

    return Boolean(
      survey?.questions.every(
        (question: SurveyQuestion): boolean => (this.selections()[question.id]?.length ?? 0) > 0,
      ),
    );
  });

  /** Selects one answer or toggles a multiple answer. */
  toggleAnswer(question: SurveyQuestion, answerId: string): void {
    if (this.hasSubmitted()) {
      return;
    }

    const selectedIds = this.getNextSelection(question, answerId);

    this.selections.update((selections: SurveySelections): SurveySelections => ({
      ...selections,
      [question.id]: selectedIds,
    }));
  }

  /** Returns whether an answer is currently selected. */
  isAnswerSelected(questionId: string, answerId: string): boolean {
    return this.selections()[questionId]?.includes(answerId) ?? false;
  }

  /** Completes the survey and updates live results. */
  completeSurvey(): void {
    if (!this.canComplete() || this.hasSubmitted()) {
      return;
    }

    this.surveyStore.submitVote(this.surveyId, this.selections());
    this.hasSubmitted.set(true);
  }

  /** Returns an alphabetical answer label. */
  getAnswerLabel(answerIndex: number): string {
    return String.fromCharCode(FIRST_ANSWER_CHARACTER_CODE + answerIndex);
  }

  /** Formats a survey deadline for display. */
  getDeadlineLabel(endDate: string): string {
    return DATE_FORMATTER.format(new Date(endDate));
  }

  /** Calculates one answer percentage within its question. */
  getVotePercentage(question: SurveyQuestion, answer: SurveyAnswer): number {
    const totalVotes = question.answers.reduce(
      (total: number, currentAnswer: SurveyAnswer): number => total + currentAnswer.votes,
      0,
    );

    return totalVotes === 0 ? 0 : Math.round((answer.votes / totalVotes) * PERCENTAGE_MULTIPLIER);
  }

  /** Toggles an identifier inside a multiple selection. */
  private toggleSelection(selectedIds: string[], answerId: string): string[] {
    return selectedIds.includes(answerId)
      ? selectedIds.filter((selectedId: string): boolean => selectedId !== answerId)
      : [...selectedIds, answerId];
  }

  /** Returns the next valid selection for a question. */
  private getNextSelection(question: SurveyQuestion, answerId: string): string[] {
    const currentIds = this.selections()[question.id] ?? [];

    return question.allowMultipleAnswers ? this.toggleSelection(currentIds, answerId) : [answerId];
  }
}
