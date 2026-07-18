export const SURVEY_CATEGORIES = [
  'Team Activities',
  'Health & Wellness',
  'Gaming & Entertainment',
  'Education & Learning',
  'Lifestyle & Preferences',
  'Technology & Innovation',
] as const;

export type SurveyCategory = (typeof SURVEY_CATEGORIES)[number];
