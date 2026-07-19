import { inject, Injectable } from '@angular/core';

import { Survey, SurveyAnswer, SurveyQuestion, SurveySelections } from '../../shared/models/survey';
import { Json } from '../supabase/database.types';
import { SupabaseClientService } from '../supabase/supabase-client';

const SURVEY_QUERY = `
  id,
  category,
  title,
  description,
  end_date,
  created_at,
  survey_questions (
    id,
    position,
    question,
    allow_multiple_answers,
    survey_answers (id, position, text, votes)
  )
`;

interface SupabaseSurveyRow {
  id: string;
  category: string;
  title: string;
  description: string;
  end_date: string;
  created_at: string;
  survey_questions: SupabaseQuestionRow[];
}

interface SupabaseQuestionRow {
  id: string;
  position: number;
  question: string;
  allow_multiple_answers: boolean;
  survey_answers: SupabaseAnswerRow[];
}

interface SupabaseAnswerRow {
  id: string;
  position: number;
  text: string;
  votes: number;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseSurveyRepository {
  private readonly supabase = inject(SupabaseClientService);

  readonly isConfigured = this.supabase.isConfigured;

  /** Loads all surveys with their nested questions and answers. */
  async loadSurveys(): Promise<Survey[]> {
    const response = await this.supabase.database
      .from('surveys')
      .select(SURVEY_QUERY)
      .order('created_at', { ascending: false });

    if (response.error) {
      throw response.error;
    }

    const rows = (response.data ?? []) as unknown as SupabaseSurveyRow[];
    return rows.map(mapSurvey);
  }

  /** Creates a complete survey in one database transaction. */
  async createSurvey(survey: Survey): Promise<string> {
    const response = await this.supabase.database.rpc('create_survey', {
      payload: survey as unknown as Json,
    });

    if (response.error) {
      throw response.error;
    }

    return response.data;
  }

  /** Submits selected answers using one atomic database function. */
  async submitVote(surveyId: string, selections: SurveySelections): Promise<void> {
    const selectedAnswerIds = Object.values(selections).flat();
    const response = await this.supabase.database.rpc('submit_survey_vote', {
      selected_answer_ids: selectedAnswerIds,
      target_survey_id: surveyId,
    });

    if (response.error) {
      throw response.error;
    }
  }
}

/** Converts one database survey into the application model. */
function mapSurvey(row: SupabaseSurveyRow): Survey {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    description: row.description,
    endDate: row.end_date,
    createdAt: row.created_at,
    status: new Date(row.end_date).getTime() > Date.now() ? 'active' : 'past',
    questions: [...row.survey_questions].sort(byPosition).map(mapQuestion),
  };
}

/** Converts one nested database question. */
function mapQuestion(row: SupabaseQuestionRow): SurveyQuestion {
  return {
    id: row.id,
    question: row.question,
    allowMultipleAnswers: row.allow_multiple_answers,
    answers: [...row.survey_answers].sort(byPosition).map(mapAnswer),
  };
}

/** Converts one nested database answer. */
function mapAnswer(row: SupabaseAnswerRow): SurveyAnswer {
  return { id: row.id, text: row.text, votes: row.votes };
}

/** Sorts nested rows by their saved position. */
function byPosition(first: { position: number }, second: { position: number }): number {
  return first.position - second.position;
}
