import { Routes } from '@angular/router';

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
];
