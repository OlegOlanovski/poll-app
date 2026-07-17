import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Home } from './home';

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render the page title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Collect Feedback');
  });
  it('should show active surveys by default', () => {
    expect(component.selectedStatus()).toBe('active');
    expect(component.filteredSurveys()).toHaveLength(6);
  });

  it('should show past surveys after selecting past status', () => {
    component.selectStatus('past');

    expect(component.selectedStatus()).toBe('past');
    expect(component.filteredSurveys()).toHaveLength(3);
    expect(component.filteredSurveys().every((survey) => survey.status === 'past')).toBe(true);
  });
});
