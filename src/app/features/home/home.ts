import { Component } from '@angular/core';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyPreview } from '../../shared/models/survey-preview';

@Component({
  selector: 'app-home',
  imports: [SurveyCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly urgentSurveys: SurveyPreview[] = [
    {
      id: 'team-event',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
    },
    {
      id: 'wellness',
      category: 'Health & Wellness',
      title: 'Fit & wellness survey!',
      daysRemaining: 2,
    },
    {
      id: 'gaming',
      category: 'Gaming & Entertainment',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
    },
  ];
}
