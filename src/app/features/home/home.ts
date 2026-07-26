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
const URGENT_SCROLL_SIDE_GUTTER = 32;
const URGENT_SCROLL_THUMB_WIDTH = 64;
const SURVEY_SCROLL_THUMB_HEIGHT = 64;

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
  readonly databaseError = this.surveyStore.errorMessage;
  readonly isLoading = this.surveyStore.isLoading;
  readonly isCategoryMenuOpen = signal(false);
  readonly selectedCategory = signal<SurveyCategory | null>(null);
  readonly selectedStatus = signal<SurveyStatus>('active');
  readonly surveyScrollThumbOffset = signal('0px');
  readonly urgentScrollThumbOffset = signal('0px');
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

  /**
   * Updates the selected survey status and removes any category filter.
   *
   * @param status - Survey status that should be displayed.
   */
  selectStatus(status: SurveyStatus): void {
    this.selectedStatus.set(status);
    this.clearCategory();
  }

  /** Opens or closes the category menu. */
  toggleCategoryMenu(): void {
    this.isCategoryMenuOpen.update((isOpen: boolean): boolean => !isOpen);
  }

  /**
   * Filters surveys using the selected category.
   *
   * @param category - Category selected by the user.
   */
  selectCategory(category: SurveyCategory): void {
    this.selectedCategory.set(category);
    this.isCategoryMenuOpen.set(false);
  }

  /** Removes the selected category filter. */
  clearCategory(): void {
    this.selectedCategory.set(null);
    this.isCategoryMenuOpen.set(false);
  }

  /**
   * Moves the persistent mobile scrollbar with the urgent survey cards.
   *
   * @param event - Scroll event emitted by the urgent survey list.
   */
  updateUrgentScroll(event: Event): void {
    const list = event.currentTarget as HTMLElement;
    const maxScrollLeft = list.scrollWidth - list.clientWidth;
    const trackWidth = list.clientWidth - URGENT_SCROLL_SIDE_GUTTER;
    const maxThumbOffset = Math.max(trackWidth - URGENT_SCROLL_THUMB_WIDTH, 0);
    const scrollProgress = maxScrollLeft === 0 ? 0 : list.scrollLeft / maxScrollLeft;

    this.urgentScrollThumbOffset.set(`${Math.round(maxThumbOffset * scrollProgress)}px`);
  }

  /**
   * Moves the custom desktop scrollbar thumb with the survey list.
   *
   * @param event - Scroll event emitted by the survey list.
   */
  updateSurveyScroll(event: Event): void {
    const list = event.currentTarget as HTMLElement;
    const maxScrollTop = list.scrollHeight - list.clientHeight;
    const maxThumbOffset = list.clientHeight - SURVEY_SCROLL_THUMB_HEIGHT;
    const scrollProgress = maxScrollTop === 0 ? 0 : list.scrollTop / maxScrollTop;

    this.surveyScrollThumbOffset.set(`${Math.round(maxThumbOffset * scrollProgress)}px`);
  }
}
