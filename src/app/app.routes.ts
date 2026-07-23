import type { Type } from '@angular/core';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: loadHome,
  },
  {
    path: 'create-survey',
    loadComponent: loadCreateSurvey,
  },
  {
    path: 'surveys/:id',
    loadComponent: loadSurveyDetail,
  },
];

/** Loads the home page only when its route is opened. */
function loadHome(): Promise<Type<unknown>> {
  return import('./features/home/home').then(({ Home }): Type<unknown> => Home);
}

/** Loads the survey creation page only when its route is opened. */
function loadCreateSurvey(): Promise<Type<unknown>> {
  return import('./features/create-survey/create-survey').then(
    ({ CreateSurvey }): Type<unknown> => CreateSurvey,
  );
}

/** Loads the survey detail page only when its route is opened. */
function loadSurveyDetail(): Promise<Type<unknown>> {
  return import('./features/survey-detail/survey-detail').then(
    ({ SurveyDetail }): Type<unknown> => SurveyDetail,
  );
}
