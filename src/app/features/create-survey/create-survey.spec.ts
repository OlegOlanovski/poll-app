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
});
