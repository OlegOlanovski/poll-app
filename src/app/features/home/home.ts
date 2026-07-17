import { Component, computed, signal } from '@angular/core';

import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyListCard } from '../../shared/components/survey-list-card/survey-list-card';
import { SurveyPreview, SurveyStatus } from '../../shared/models/survey-preview';
import { createRelativeEndDate, sortSurveysByEndDate } from '../../shared/utils/survey-date';

@Component({
  selector: 'app-home',
  imports: [SurveyCard, SurveyListCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  readonly selectedStatus = signal<SurveyStatus>('active');
  readonly urgentSurveys: SurveyPreview[] = sortSurveysByEndDate([
    {
      id: 'team-event',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      description: 'Choose an activity and find the best date for the next team event.',
      endDate: createRelativeEndDate(1),
      status: 'active',
    },
    {
      id: 'wellness',
      category: 'Health & Wellness',
      title: 'Fit & wellness survey!',
      description: 'Share which wellness activities would help you feel your best.',
      endDate: createRelativeEndDate(2),
      status: 'active',
    },
    {
      id: 'gaming',
      category: 'Gaming & Entertainment',
      title: 'Gaming habits and favorite games!',
      description: 'Tell us which games and gaming experiences you enjoy most.',
      endDate: createRelativeEndDate(3),
      status: 'active',
    },
  ]);

  readonly allSurveys: SurveyPreview[] = [
    {
      id: 'team-event-list',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      description: 'Choose the activity and date for our next team event.',
      endDate: createRelativeEndDate(1),
      status: 'active',
    },
    {
      id: 'gaming-list-1',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      description: 'Share your favorite games and how often you play them.',
      endDate: createRelativeEndDate(3),
      status: 'active',
    },
    {
      id: 'gaming-list-2',
      category: 'Gaming',
      title: 'Gaming habits and favorite games!',
      description: 'Help us understand which gaming experiences you enjoy.',
      endDate: createRelativeEndDate(3),
      status: 'active',
    },
    {
      id: 'wellness-list-1',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      description: 'Tell us which habits support your health and wellbeing.',
      endDate: createRelativeEndDate(2),
      status: 'active',
    },
    {
      id: 'wellness-list-2',
      category: 'Healthy Lifestyle',
      title: 'Healthier future: Fit & wellness survey!',
      description: 'Share your ideas for a healthier and more active routine.',
      endDate: createRelativeEndDate(2),
      status: 'active',
    },
    {
      id: 'team-event-list-2',
      category: 'Team activities',
      title: 'Let’s Plan the Next Team Event Together',
      description: 'Vote for the activity you want to enjoy with the team.',
      endDate: createRelativeEndDate(1),
      status: 'active',
    },
    {
      id: 'past-team-event',
      category: 'Team activities',
      title: 'Team Event Feedback',
      description: 'Feedback collected after our previous team event.',
      endDate: createRelativeEndDate(-1),
      status: 'past',
    },
    {
      id: 'past-gaming',
      category: 'Gaming',
      title: 'Favorite Games Survey',
      description: 'Results from our completed favorite games survey.',
      endDate: createRelativeEndDate(-2),
      status: 'past',
    },
    {
      id: 'past-wellness',
      category: 'Healthy Lifestyle',
      title: 'Wellness Check-in',
      description: 'Results from the previous team wellness check-in.',
      endDate: createRelativeEndDate(-3),
      status: 'past',
    },
  ];
  readonly filteredSurveys = computed<SurveyPreview[]>(() => {
    const selectedStatus = this.selectedStatus();

    return this.allSurveys.filter((survey: SurveyPreview) => survey.status === selectedStatus);
  });

  /** Updates the selected survey status. */
  selectStatus(status: SurveyStatus): void {
    this.selectedStatus.set(status);
  }
}
