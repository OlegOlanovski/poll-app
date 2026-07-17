import { Component, computed, signal } from '@angular/core';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyListCard } from '../../shared/components/survey-list-card/survey-list-card';
import { SurveyPreview, SurveyStatus } from '../../shared/models/survey-preview';

@Component({
  selector: 'app-home',
  imports: [SurveyCard, SurveyListCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly selectedStatus = signal<SurveyStatus>('active');
  readonly urgentSurveys: SurveyPreview[] = [
    {
      id: 'team-event',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
      status: 'active',
    },
    {
      id: 'wellness',
      category: 'Health & Wellness',
      title: 'Fit & wellness survey!',
      daysRemaining: 2,
      status: 'active',
    },
    {
      id: 'gaming',
      category: 'Gaming & Entertainment',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
      status: 'active',
    },
  ];

  readonly allSurveys: SurveyPreview[] = [
    {
      id: 'team-event-list',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
      status: 'active',
    },
    {
      id: 'gaming-list-1',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
      status: 'active',
    },
    {
      id: 'gaming-list-2',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      daysRemaining: 3,
      status: 'active',
    },
    {
      id: 'wellness-list-1',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      daysRemaining: 2,
      status: 'active',
    },
    {
      id: 'wellness-list-2',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      daysRemaining: 2,
      status: 'active',
    },
    {
      id: 'team-event-list-2',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      daysRemaining: 1,
      status: 'active',
    },
    {
      id: 'past-team-event',
      category: 'Team activities',
      title: 'Team Event Feedback',
      daysRemaining: 0,
      status: 'past',
    },
    {
      id: 'past-gaming',
      category: 'Gaming',
      title: 'Favorite Games Survey',
      daysRemaining: 0,
      status: 'past',
    },
    {
      id: 'past-wellness',
      category: 'Healthy Lifestyle',
      title: 'Wellness Check-in',
      daysRemaining: 0,
      status: 'past',
    },
  ];
  readonly filteredSurveys = computed(() => {
    const selectedStatus = this.selectedStatus();

    return this.allSurveys.filter((survey) => survey.status === selectedStatus);
  });

  selectStatus(status: SurveyStatus): void {
    this.selectedStatus.set(status);
  }
}
