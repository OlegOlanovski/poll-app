const COMPLETED_SURVEY_KEY_PREFIX = 'poll-app-completed-survey:';

/**
 * Returns whether this browser has already completed a survey.
 *
 * @param surveyId - Identifier of the survey to check.
 * @returns Whether a successful submission is stored for this survey.
 */
export function hasCompletedSurvey(surveyId: string): boolean {
  if (!surveyId) {
    return false;
  }

  try {
    return localStorage.getItem(createStorageKey(surveyId)) === 'true';
  } catch {
    return false;
  }
}

/**
 * Remembers a successful survey submission in this browser.
 *
 * @param surveyId - Identifier of the completed survey.
 */
export function markSurveyAsCompleted(surveyId: string): void {
  if (!surveyId) {
    return;
  }

  try {
    localStorage.setItem(createStorageKey(surveyId), 'true');
  } catch {
    // Voting still succeeds when browser storage is unavailable.
  }
}

/**
 * Creates the browser-storage key for one survey.
 *
 * @param surveyId - Identifier appended to the storage-key prefix.
 * @returns A unique storage key for this survey.
 */
function createStorageKey(surveyId: string): string {
  return `${COMPLETED_SURVEY_KEY_PREFIX}${surveyId}`;
}
