import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCard } from './survey-card';

describe('SurveyCard', (): void => {
  let component: SurveyCard;
  let fixture: ComponentFixture<SurveyCard>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [SurveyCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyCard);

    fixture.componentRef.setInput('survey', {
      id: 'test-survey',
      category: 'Team activities',
      title: 'Test survey',
      description: 'A short description for the test survey.',
      endDate: '2099-01-01T00:00:00.000Z',
      status: 'active',
    });

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
