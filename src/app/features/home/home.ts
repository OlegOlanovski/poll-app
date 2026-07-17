import { Component } from '@angular/core';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyListCard } from '../../shared/components/survey-list-card/survey-list-card';
import { SurveyPreview } from '../../shared/models/survey-preview';

@Component({
  selector: 'app-home',
  imports: [SurveyCard, SurveyListCard],
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

  readonly allSurveys: SurveyPreview[] = [
    {
      id: 'team-event-list',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
    },
    {
      id: 'gaming-list-1',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
    },
    {
      id: 'gaming-list-2',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
    },
    {
      id: 'wellness-list-1',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      daysRemaining: 2,
    },
    {
      id: 'wellness-list-2',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      daysRemaining: 2,
    },
    {
      id: 'team-event-list-2',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
    },
  ];
}
