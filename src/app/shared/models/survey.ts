import { SurveyPreview } from './survey-preview';

export type SurveySelections = Record<string, string[]>;

export interface SurveyAnswer {
  id: string;
  text: string;
  votes: number;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  allowMultipleAnswers: boolean;
  answers: SurveyAnswer[];
}

export interface Survey extends SurveyPreview {
  createdAt: string;
  questions: SurveyQuestion[];
}
