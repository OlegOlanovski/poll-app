import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SurveyStore } from '../../core/services/survey-store';
import { Header } from '../../shared/components/header/header';
import { SurveyCard } from '../../shared/components/survey-card/survey-card';
import { SurveyListCard } from '../../shared/components/survey-list-card/survey-list-card';
import { SURVEY_CATEGORIES, SurveyCategory } from '../../shared/constants/survey-categories';
import { SurveyPreview, SurveyStatus } from '../../shared/models/survey-preview';
import { sortSurveysByEndDate } from '../../shared/utils/survey-date';

const URGENT_SURVEY_COUNT = 3;

@Component({
  selector: 'app-home',
  imports: [Header, RouterLink, SurveyCard, SurveyListCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly surveyStore = inject(SurveyStore);

  readonly allSurveys = this.surveyStore.surveys;
  readonly categories = SURVEY_CATEGORIES;
  readonly isCategoryMenuOpen = signal(false);
  readonly selectedCategory = signal<SurveyCategory | null>(null);
  readonly selectedStatus = signal<SurveyStatus>('active');
  readonly urgentSurveys = computed<SurveyPreview[]>(() => {
    const activeSurveys = this.allSurveys().filter(
      (survey: SurveyPreview): boolean => survey.status === 'active',
    );

    return sortSurveysByEndDate(activeSurveys).slice(0, URGENT_SURVEY_COUNT);
  });
  readonly filteredSurveys = computed<SurveyPreview[]>(() => {
    const selectedStatus = this.selectedStatus();
    const selectedCategory = this.selectedCategory();

    return this.allSurveys().filter(
      (survey: SurveyPreview): boolean =>
        survey.status === selectedStatus &&
        (selectedCategory === null || survey.category === selectedCategory),
    );
  });

  /** Updates the selected survey status. */
  selectStatus(status: SurveyStatus): void {
    this.selectedStatus.set(status);
  }

  /** Opens or closes the category menu. */
  toggleCategoryMenu(): void {
    this.isCategoryMenuOpen.update((isOpen: boolean): boolean => !isOpen);
  }

  /** Filters surveys using the selected category. */
  selectCategory(category: SurveyCategory): void {
    this.selectedCategory.set(category);
    this.isCategoryMenuOpen.set(false);
  }

  /** Removes the selected category filter. */
  clearCategory(): void {
    this.selectedCategory.set(null);
  }
}
