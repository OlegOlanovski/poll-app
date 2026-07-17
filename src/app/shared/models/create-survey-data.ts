export interface CreateSurveyQuestionData {
  question: string;
  allowMultipleAnswers: boolean;
  answers: string[];
}

export interface CreateSurveyData {
  category: string;
  title: string;
  description: string;
  endDate: string;
  questions: CreateSurveyQuestionData[];
}
