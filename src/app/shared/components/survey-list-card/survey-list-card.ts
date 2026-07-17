import { Component, computed, input } from '@angular/core';
import { SurveyPreview } from '../../models/survey-preview';

@Component({
  selector: 'app-survey-list-card',
  imports: [],
  templateUrl: './survey-list-card.html',
  styleUrl: './survey-list-card.scss',
})
export class SurveyListCard {
  readonly survey = input.required<SurveyPreview>();

  readonly endingLabel = computed(() => {
    const survey = this.survey();

    if (survey.status === 'past') {
      return 'Expired';
    }

    const dayLabel = survey.daysRemaining === 1 ? 'Day' : 'Days';

    return `Ends in ${survey.daysRemaining} ${dayLabel}`;
  });
}
