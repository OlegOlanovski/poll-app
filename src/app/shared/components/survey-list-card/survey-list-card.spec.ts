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
      description: 'A short description for the active survey.',
      endDate: '2099-01-01T00:00:00.000Z',
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
      description: 'A short description for the completed survey.',
      endDate: '2020-01-01T00:00:00.000Z',
      status: 'past',
    });

    fixture.detectChanges();

    expect(component.endingLabel()).toBe('Expired');
  });
});
