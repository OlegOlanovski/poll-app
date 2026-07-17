import { Component, computed, input } from '@angular/core';

import { SurveyPreview } from '../../models/survey-preview';
import { formatDeadline } from '../../utils/survey-date';

@Component({
  selector: 'app-survey-card',
  imports: [],
  templateUrl: './survey-card.html',
  styleUrl: './survey-card.scss',
})
export class SurveyCard {
  readonly survey = input.required<SurveyPreview>();

  readonly endingLabel = computed<string>(() => formatDeadline(this.survey().endDate));
}
