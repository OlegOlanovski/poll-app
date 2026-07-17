export type SurveyStatus = 'active' | 'past';

export interface SurveyPreview {
  id: string;
  category: string;
  title: string;
  daysRemaining: number;
  status: SurveyStatus;
}
