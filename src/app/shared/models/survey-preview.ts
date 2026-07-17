export type SurveyStatus = 'active' | 'past';

export interface SurveyPreview {
  id: string;
  category: string;
  title: string;
  description: string;
  endDate: string;
  status: SurveyStatus;
}
