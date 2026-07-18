import { Routes } from '@angular/router';
import { SurveyDetail } from './features/survey-detail/survey-detail';

import { CreateSurvey } from './features/create-survey/create-survey';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'create-survey',
    component: CreateSurvey,
  },
  {
    path: 'surveys/:id',
    component: SurveyDetail,
  },
];
