import { hasCompletedSurvey, markSurveyAsCompleted } from './survey-participation-storage';

const FIRST_SURVEY_ID = 'survey-one';
const SECOND_SURVEY_ID = 'survey-two';

describe('survey participation storage', (): void => {
  beforeEach((): void => {
    localStorage.clear();
  });

  it('should remember a completed survey', (): void => {
    expect(hasCompletedSurvey(FIRST_SURVEY_ID)).toBe(false);

    markSurveyAsCompleted(FIRST_SURVEY_ID);

    expect(hasCompletedSurvey(FIRST_SURVEY_ID)).toBe(true);
  });

  it('should keep completion state separate for every survey', (): void => {
    markSurveyAsCompleted(FIRST_SURVEY_ID);

    expect(hasCompletedSurvey(SECOND_SURVEY_ID)).toBe(false);
  });
});
