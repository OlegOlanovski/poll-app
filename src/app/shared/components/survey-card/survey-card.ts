import { Component, computed, input } from '@angular/core';
import { SurveyPreview } from '../../models/survey-preview';

@Component({
  selector: 'app-survey-card',
  imports: [],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  readonly survey = input.required<SurveyPreview>();

  readonly endingLabel = computed(() => {
    const days = this.survey().daysRemaining;
    const dayLabel = days === 1 ? 'Day' : 'Days';

    return `Ends in ${days} ${dayLabel}`;
  });
}
