import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SurveyAnswer, SurveyQuestion } from '../../shared/models/survey';
import { SurveyDetail } from './survey-detail';

const FIRST_ANSWER: SurveyAnswer = {
  id: 'answer-a',
  text: 'Answer A',
  votes: 1,
};
const SECOND_ANSWER: SurveyAnswer = {
  id: 'answer-b',
  text: 'Answer B',
  votes: 3,
};
const SINGLE_QUESTION: SurveyQuestion = {
  id: 'question-single',
  question: 'Choose one',
  allowMultipleAnswers: false,
  answers: [FIRST_ANSWER, SECOND_ANSWER],
};
const MULTIPLE_QUESTION: SurveyQuestion = {
  ...SINGLE_QUESTION,
  id: 'question-multiple',
  allowMultipleAnswers: true,
};

describe('SurveyDetail', () => {
  let component: SurveyDetail;
  let fixture: ComponentFixture<SurveyDetail>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [SurveyDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should replace a single answer selection', (): void => {
    component.toggleAnswer(SINGLE_QUESTION, FIRST_ANSWER.id);
    component.toggleAnswer(SINGLE_QUESTION, SECOND_ANSWER.id);

    expect(component.isAnswerSelected(SINGLE_QUESTION.id, FIRST_ANSWER.id)).toBe(false);
    expect(component.isAnswerSelected(SINGLE_QUESTION.id, SECOND_ANSWER.id)).toBe(true);
  });

  it('should keep multiple answer selections', (): void => {
    component.toggleAnswer(MULTIPLE_QUESTION, FIRST_ANSWER.id);
    component.toggleAnswer(MULTIPLE_QUESTION, SECOND_ANSWER.id);

    expect(component.selections()[MULTIPLE_QUESTION.id]).toHaveLength(2);
  });

  it('should calculate a live vote percentage', (): void => {
    expect(component.getVotePercentage(SINGLE_QUESTION, FIRST_ANSWER)).toBe(25);
    expect(component.getVotePercentage(SINGLE_QUESTION, SECOND_ANSWER)).toBe(75);
  });
});
