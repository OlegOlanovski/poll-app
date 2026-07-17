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
    const days = this.survey().daysRemaining;
    const dayLabel = days === 1 ? 'Day' : 'Days';

    return `Ends in ${days} ${dayLabel}`;
  });
}
