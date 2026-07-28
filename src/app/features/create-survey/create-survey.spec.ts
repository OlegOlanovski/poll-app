import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CreateSurvey } from './create-survey';

describe('CreateSurvey', (): void => {
  let component: CreateSurvey;
  let fixture: ComponentFixture<CreateSurvey>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [CreateSurvey],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });

  it('should select a required category from the custom menu', (): void => {
    component.toggleCategoryMenu();
    component.selectCategory('Education & Learning');

    expect(component.isCategoryMenuOpen()).toBe(false);
    expect(component.surveyForm.controls.category.value).toBe('Education & Learning');
    expect(component.surveyForm.controls.category.valid).toBe(true);
  });

  it('should clear the selected category', (): void => {
    component.selectCategory('Team Activities');
    component.clearCategory();

    expect(component.surveyForm.controls.category.value).toBe('');
    expect(component.surveyForm.controls.category.invalid).toBe(true);
  });

  it('should reject an end date in the past', (): void => {
    const endDateControl = component.surveyForm.controls.endDate;

    endDateControl.setValue('1900-01-01');

    expect(endDateControl.hasError('dateBeforeMinimum')).toBe(true);
  });

  it('should allow today as the end date', (): void => {
    const endDateControl = component.surveyForm.controls.endDate;

    endDateControl.setValue(component.minimumEndDate);

    expect(endDateControl.valid).toBe(true);
  });

  it('should expose today as the calendar minimum', (): void => {
    const dateInput = fixture.nativeElement.querySelector('#survey-end-date') as HTMLInputElement;

    expect(dateInput.min).toBe(component.minimumEndDate);
  });

  it('should toggle multiple answers from the checkbox', (): void => {
    const checkbox = fixture.nativeElement.querySelector(
      '.question-form__multiple input',
    ) as HTMLInputElement;

    checkbox.click();
    fixture.detectChanges();

    expect(component.questions.at(0).controls.allowMultipleAnswers.value).toBe(true);
    expect(checkbox.checked).toBe(true);
  });

  it('should delete the first question and renumber the remaining questions', (): void => {
    for (let questionIndex = 0; questionIndex < 5; questionIndex += 1) {
      if (questionIndex > 0) {
        component.addQuestion();
      }
      component.questions
        .at(questionIndex)
        .controls.question.setValue(`Question ${questionIndex + 1}`);
    }

    component.deleteQuestion(0);
    fixture.detectChanges();

    expect(component.questions.length).toBe(4);
    expect(
      component.questions.controls.map((question) => question.controls.question.value),
    ).toEqual(['Question 2', 'Question 3', 'Question 4', 'Question 5']);
    expect(fixture.nativeElement.querySelector('.question-form__header')?.textContent).toContain(
      '1. Question',
    );
  });

  it('should keep and clear the final required question', (): void => {
    component.questions.at(0).controls.question.setValue('Only question');

    component.deleteQuestion(0);

    expect(component.questions.length).toBe(1);
    expect(component.questions.at(0).controls.question.value).toBe('');
  });

  it('should reveal reserved validation slots without adding DOM elements', async (): Promise<void> => {
    const compiled = fixture.nativeElement as HTMLElement;
    const slotsBeforePublish = compiled.querySelectorAll('.create-survey-form__validation-slot');

    await component.publishSurvey();
    fixture.detectChanges();

    const slotsAfterPublish = compiled.querySelectorAll('.create-survey-form__validation-slot');

    expect(slotsBeforePublish).toHaveLength(7);
    expect(slotsAfterPublish).toHaveLength(slotsBeforePublish.length);
    expect(slotsAfterPublish[0]).toBe(slotsBeforePublish[0]);
    expect(
      compiled.querySelectorAll('.create-survey-form__validation-slot[aria-hidden="false"]'),
    ).toHaveLength(5);
  });

  it('should reject whitespace-only required text fields', async (): Promise<void> => {
    fillRequiredTextFields(component, '   ');

    await component.publishSurvey();

    expect(component.surveyForm.invalid).toBe(true);
    expect(component.isConfirmationVisible()).toBe(false);
    expect(component.publishError()).toBeNull();
  });

  it('should reveal a field error after blur', (): void => {
    const titleInput = fixture.nativeElement.querySelector('#survey-title') as HTMLInputElement;
    const titleError = fixture.nativeElement.querySelector(
      '.create-survey-form__field .create-survey-form__validation-slot',
    ) as HTMLElement;

    titleInput.value = '   ';
    titleInput.dispatchEvent(new Event('input'));
    titleInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    expect(component.surveyForm.controls.title.touched).toBe(true);
    expect(component.surveyForm.controls.title.invalid).toBe(true);
    expect(titleError.getAttribute('aria-hidden')).toBe('false');
  });
});

/**
 * Fills every required text control with the same test value.
 *
 * @param component - Create Survey component under test.
 * @param value - Text assigned to all required text controls.
 */
function fillRequiredTextFields(component: CreateSurvey, value: string): void {
  const question = component.questions.at(0);

  component.surveyForm.controls.title.setValue(value);
  component.surveyForm.controls.category.setValue('Team Activities');
  question.controls.question.setValue(value);

  for (const answer of question.controls.answers.controls) {
    answer.setValue(value);
  }
}
