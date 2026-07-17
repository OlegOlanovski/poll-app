import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyListCard } from './survey-list-card';

describe('SurveyListCard', () => {
  let component: SurveyListCard;
  let fixture: ComponentFixture<SurveyListCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyListCard],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyListCard);

    fixture.componentRef.setInput('survey', {
      id: 'test-list-survey',
      category: 'Team activities',
      title: 'Test survey',
      daysRemaining: 1,
      status: 'active',
    });

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should show expired label for a past survey', () => {
    fixture.componentRef.setInput('survey', {
      id: 'past-survey',
      category: 'Team activities',
      title: 'Past survey',
      daysRemaining: 0,
      status: 'past',
    });

    fixture.detectChanges();

    expect(component.endingLabel()).toBe('Expired');
  });
});
