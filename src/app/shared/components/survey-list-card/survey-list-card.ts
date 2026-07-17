import { Component, computed, input } from '@angular/core';

import { SurveyPreview } from '../../models/survey-preview';
import { formatDeadline } from '../../utils/survey-date';

@Component({
  selector: 'app-survey-list-card',
  imports: [],
  templateUrl: './survey-list-card.html',
  styleUrl: './survey-list-card.scss',
})
export class SurveyListCard {
  readonly survey = input.required<SurveyPreview>();

  readonly endingLabel = computed<string>(() => formatDeadline(this.survey().endDate));
}
