import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async (): Promise<void> => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
  it('should render the page title', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Collect Feedback');
  });
  it('should show active surveys by default', (): void => {
    expect(component.selectedStatus()).toBe('active');
    expect(component.filteredSurveys()).toHaveLength(6);
  });

  it('should show past surveys after selecting past status', (): void => {
    component.selectStatus('past');

    expect(component.selectedStatus()).toBe('past');
    expect(component.filteredSurveys()).toHaveLength(3);
    expect(component.filteredSurveys().every((survey) => survey.status === 'past')).toBe(true);
  });
  it('should sort urgent surveys by end date', (): void => {
    const endTimes = component.urgentSurveys.map((survey): number =>
      new Date(survey.endDate).getTime(),
    );
    const sortedEndTimes = [...endTimes].sort(
      (firstTime: number, secondTime: number): number => firstTime - secondTime,
    );

    expect(endTimes).toEqual(sortedEndTimes);
  });

  it('should render descriptions for all visible surveys', (): void => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptions = compiled.querySelectorAll(
      '.survey-card__description, .survey-list-card__description',
    );
    const everyDescriptionHasText = Array.from(descriptions).every(
      (description: Element): boolean => Boolean(description.textContent?.trim()),
    );

    expect(descriptions).toHaveLength(9);
    expect(everyDescriptionHasText).toBe(true);
  });
});
