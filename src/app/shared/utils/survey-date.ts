import { SurveyPreview } from '../models/survey-preview';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Creates an ISO date relative to the current date.
 *
 * @param daysOffset - Number of calendar days added to the current date.
 * @returns The calculated date in ISO 8601 format.
 */
export function createRelativeEndDate(daysOffset: number): string {
  const endDate = new Date();

  endDate.setDate(endDate.getDate() + daysOffset);

  return endDate.toISOString();
}

/**
 * Calculates the number of days until a survey ends.
 *
 * @param endDate - Survey deadline in a date-compatible string format.
 * @returns The remaining whole-day count, never below zero.
 */
export function getDaysUntil(endDate: string): number {
  const endTime = new Date(endDate).getTime();
  const timeRemaining = endTime - Date.now();

  return Math.max(0, Math.ceil(timeRemaining / MILLISECONDS_PER_DAY));
}

/**
 * Creates a readable deadline label for a survey.
 *
 * @param endDate - Survey deadline in a date-compatible string format.
 * @returns A readable expiration or remaining-days label.
 */
export function formatDeadline(endDate: string): string {
  const daysRemaining = getDaysUntil(endDate);

  if (daysRemaining === 0) {
    return 'Expired';
  }

  const dayLabel = daysRemaining === 1 ? 'Day' : 'Days';

  return `Ends in ${daysRemaining} ${dayLabel}`;
}
/**
 * Sorts surveys by end date with the earliest survey first.
 *
 * @param surveys - Survey previews to copy and sort.
 * @returns A new array ordered from the earliest to the latest deadline.
 */
export function sortSurveysByEndDate(surveys: readonly SurveyPreview[]): SurveyPreview[] {
  return [...surveys].sort(
    (firstSurvey: SurveyPreview, secondSurvey: SurveyPreview): number =>
      new Date(firstSurvey.endDate).getTime() - new Date(secondSurvey.endDate).getTime(),
  );
}
