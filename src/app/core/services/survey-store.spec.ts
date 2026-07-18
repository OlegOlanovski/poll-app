import { TestBed } from '@angular/core/testing';

import { CreateSurveyData } from '../../shared/models/create-survey-data';
import { Survey } from '../../shared/models/survey';
import { SurveyStore } from './survey-store';

const TEST_SURVEY_DATA: CreateSurveyData = {
  category: 'Team activities',
  title: 'Test survey',
  description: 'Test description',
  endDate: '',
  questions: [
    {
      question: 'Which option do you prefer?',
      allowMultipleAnswers: false,
      answers: ['Option A', 'Option B'],
    },
  ],
};

describe('SurveyStore', () => {
  let service: SurveyStore;

  beforeEach((): void => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SurveyStore);
  });

  it('should be created', (): void => {
    expect(service).toBeTruthy();
  });

  it('should create a complete survey', (): void => {
    const surveyId = service.addSurvey(TEST_SURVEY_DATA);
    const survey = service.getSurveyById(surveyId);

    expect(survey?.title).toBe('Test survey');
    expect(survey?.questions).toHaveLength(1);
    expect(survey?.questions[0].answers).toHaveLength(2);
  });

  it('should increment only selected answer votes', (): void => {
    const surveyId = service.addSurvey(TEST_SURVEY_DATA);
    const survey = service.getSurveyById(surveyId);

    if (!survey) {
      throw new Error('Expected the test survey to exist.');
    }

    service.submitVote(surveyId, createSelection(survey));

    const updatedSurvey = service.getSurveyById(surveyId);
    expect(updatedSurvey?.questions[0].answers[0].votes).toBe(1);
    expect(updatedSurvey?.questions[0].answers[1].votes).toBe(0);
  });
});

/** Creates a vote for the first answer of the first question. */
function createSelection(survey: Survey): Record<string, string[]> {
  const question = survey.questions[0];
  const answer = question.answers[0];

  return { [question.id]: [answer.id] };
}
