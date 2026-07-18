import { Survey, SurveyAnswer, SurveyQuestion } from '../models/survey';
import { SurveyStatus } from '../models/survey-preview';
import { createRelativeEndDate } from '../utils/survey-date';

interface InitialSurveyInput {
  id: string;
  category: string;
  title: string;
  description: string;
  daysFromNow: number;
  status: SurveyStatus;
  question: string;
  answers: readonly string[];
  votes?: readonly number[];
}

const INITIAL_SURVEY_INPUTS: readonly InitialSurveyInput[] = [
  {
    id: 'team-event-list',
    category: 'Team Activities',
    title: 'Let’s Plan the Next Team Event Together',
    description: 'Choose the activity and date for our next team event.',
    daysFromNow: 1,
    status: 'active',
    question: 'Which activity should we plan for the team?',
    answers: ['Outdoor adventure', 'Office party', 'Bowling'],
  },
  {
    id: 'wellness-list-1',
    category: 'Health & Wellness',
    title: 'Fit & wellness survey!',
    description: 'Tell us which habits support your health and wellbeing.',
    daysFromNow: 2,
    status: 'active',
    question: 'Which wellness activity would help you most?',
    answers: ['Yoga session', 'Walking challenge', 'Healthy lunch'],
  },
  {
    id: 'gaming-list-1',
    category: 'Gaming & Entertainment',
    title: 'Gaming habits and favorite games!',
    description: 'Share your favorite games and how often you play them.',
    daysFromNow: 3,
    status: 'active',
    question: 'Which type of game do you enjoy most?',
    answers: ['Adventure', 'Strategy', 'Sports'],
  },
  {
    id: 'gaming-list-2',
    category: 'Gaming & Entertainment',
    title: 'Gaming habits and favorite games!',
    description: 'Help us understand which gaming experiences you enjoy.',
    daysFromNow: 6,
    status: 'active',
    question: 'Where do you usually play games?',
    answers: ['Computer', 'Console', 'Mobile'],
  },
  {
    id: 'wellness-list-2',
    category: 'Lifestyle & Preferences',
    title: 'Healthier future: Fit & wellness survey!',
    description: 'Share your ideas for a healthier and more active routine.',
    daysFromNow: 7,
    status: 'active',
    question: 'Which healthy habit should we support?',
    answers: ['Daily movement', 'Better sleep', 'Balanced meals'],
  },
  {
    id: 'team-event-list-2',
    category: 'Team Activities',
    title: 'Let’s Plan the Next Team Event Together',
    description: 'Vote for the activity you want to enjoy with the team.',
    daysFromNow: 8,
    status: 'active',
    question: 'When should the team event take place?',
    answers: ['Friday afternoon', 'Saturday morning', 'Saturday evening'],
  },
  {
    id: 'past-team-event',
    category: 'Team Activities',
    title: 'Team Event Feedback',
    description: 'Feedback collected after our previous team event.',
    daysFromNow: -1,
    status: 'past',
    question: 'How would you rate the team event?',
    answers: ['Excellent', 'Good', 'Needs improvement'],
    votes: [7, 3, 1],
  },
  {
    id: 'past-gaming',
    category: 'Gaming & Entertainment',
    title: 'Favorite Games Survey',
    description: 'Results from our completed favorite games survey.',
    daysFromNow: -2,
    status: 'past',
    question: 'Which game genre was your favorite?',
    answers: ['Adventure', 'Strategy', 'Sports'],
    votes: [4, 5, 2],
  },
  {
    id: 'past-wellness',
    category: 'Lifestyle & Preferences',
    title: 'Wellness Check-in',
    description: 'Results from the previous team wellness check-in.',
    daysFromNow: -3,
    status: 'past',
    question: 'Which wellness habit worked best?',
    answers: ['Movement', 'Sleep', 'Nutrition'],
    votes: [6, 3, 4],
  },
];

export const INITIAL_SURVEYS: Survey[] = INITIAL_SURVEY_INPUTS.map(
  (input: InitialSurveyInput): Survey => createInitialSurvey(input),
);

/** Creates one complete initial survey. */
function createInitialSurvey(input: InitialSurveyInput): Survey {
  return {
    id: input.id,
    category: input.category,
    title: input.title,
    description: input.description,
    endDate: createRelativeEndDate(input.daysFromNow),
    status: input.status,
    createdAt: new Date().toISOString(),
    questions: [createQuestion(input)],
  };
}

/** Creates the initial question for a survey. */
function createQuestion(input: InitialSurveyInput): SurveyQuestion {
  return {
    id: `${input.id}-question-1`,
    question: input.question,
    allowMultipleAnswers: false,
    answers: input.answers.map((answer: string, index: number): SurveyAnswer =>
      createAnswer(input.id, answer, index, input.votes?.[index] ?? 0),
    ),
  };
}

/** Creates a stable answer for an initial survey. */
function createAnswer(surveyId: string, text: string, index: number, votes: number): SurveyAnswer {
  return {
    id: `${surveyId}-answer-${index + 1}`,
    text,
    votes,
  };
}
