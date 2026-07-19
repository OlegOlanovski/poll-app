export type Json = string | number | boolean | null | Json[] | { [key: string]: Json | undefined };

export interface Database {
  public: {
    Tables: {
      survey_answers: {
        Row: SurveyAnswerRow;
        Insert: Omit<SurveyAnswerRow, 'votes'> & { votes?: number };
        Update: Partial<SurveyAnswerRow>;
        Relationships: [];
      };
      survey_questions: {
        Row: SurveyQuestionRow;
        Insert: SurveyQuestionRow;
        Update: Partial<SurveyQuestionRow>;
        Relationships: [];
      };
      surveys: {
        Row: SurveyRow;
        Insert: SurveyRow;
        Update: Partial<SurveyRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_survey: {
        Args: { payload: Json };
        Returns: string;
      };
      submit_survey_vote: {
        Args: { selected_answer_ids: string[]; target_survey_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type SurveyRow = {
  id: string;
  category: string;
  title: string;
  description: string;
  end_date: string;
  created_at: string;
};

export type SurveyQuestionRow = {
  id: string;
  survey_id: string;
  position: number;
  question: string;
  allow_multiple_answers: boolean;
};

export type SurveyAnswerRow = {
  id: string;
  question_id: string;
  position: number;
  text: string;
  votes: number;
};
