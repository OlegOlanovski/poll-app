do $$
declare
  answer_list jsonb;
  survey_data jsonb;
  current_survey_id uuid;
  survey_index integer := 0;
begin
  for survey_data in
    select value
    from jsonb_array_elements(
      '[
        {
          "category": "Team Activities",
          "title": "Let’s Plan the Next Team Event Together",
          "description": "Choose the activity and date for our next team event.",
          "days": 1,
          "question": "Which activity should we plan for the team?",
          "answers": ["Outdoor adventure", "Office party", "Bowling"]
        },
        {
          "category": "Health & Wellness",
          "title": "Fit & wellness survey!",
          "description": "Tell us which habits support your health and wellbeing.",
          "days": 2,
          "question": "Which wellness activity would help you most?",
          "answers": ["Yoga session", "Walking challenge", "Healthy lunch"]
        },
        {
          "category": "Gaming & Entertainment",
          "title": "Gaming habits and favorite games!",
          "description": "Share your favorite games and how often you play them.",
          "days": 3,
          "question": "Which type of game do you enjoy most?",
          "answers": ["Adventure", "Strategy", "Sports"]
        },
        {
          "category": "Technology & Innovation",
          "title": "Tools for a smarter workplace",
          "description": "Help us choose the next digital tool for the team.",
          "days": 6,
          "question": "Which tool should we explore next?",
          "answers": ["AI assistant", "Automation", "Knowledge base"]
        },
        {
          "category": "Lifestyle & Preferences",
          "title": "Healthier future: Fit & wellness survey!",
          "description": "Share your ideas for a healthier and more active routine.",
          "days": 7,
          "question": "Which healthy habit should we support?",
          "answers": ["Daily movement", "Better sleep", "Balanced meals"]
        },
        {
          "category": "Education & Learning",
          "title": "Choose our next learning session",
          "description": "Vote for the topic of the next team learning session.",
          "days": 8,
          "question": "Which topic would help you most?",
          "answers": ["Accessibility", "TypeScript", "Testing"]
        },
        {
          "category": "Team Activities",
          "title": "Team Event Feedback",
          "description": "Feedback collected after our previous team event.",
          "days": -1,
          "question": "How would you rate the team event?",
          "answers": ["Excellent", "Good", "Needs improvement"]
        },
        {
          "category": "Gaming & Entertainment",
          "title": "Favorite Games Survey",
          "description": "Results from our completed favorite games survey.",
          "days": -2,
          "question": "Which game genre was your favorite?",
          "answers": ["Adventure", "Strategy", "Sports"]
        },
        {
          "category": "Health & Wellness",
          "title": "Wellness Check-in",
          "description": "Results from the previous team wellness check-in.",
          "days": -3,
          "question": "Which wellness habit worked best?",
          "answers": ["Movement", "Sleep", "Nutrition"]
        }
      ]'::jsonb
    )
  loop
    survey_index := survey_index + 1;
    current_survey_id := (
      '00000000-0000-4000-8000-' || lpad(survey_index::text, 12, '0')
    )::uuid;

    if exists (select 1 from public.surveys where id = current_survey_id) then
      continue;
    end if;

    select jsonb_agg(
      jsonb_build_object('id', gen_random_uuid(), 'text', answer_text)
    )
    into answer_list
    from jsonb_array_elements_text(survey_data->'answers') as answers(answer_text);

    perform public.create_survey(
      jsonb_build_object(
        'id', current_survey_id,
        'category', survey_data->>'category',
        'title', survey_data->>'title',
        'description', survey_data->>'description',
        'endDate', now() + make_interval(days => (survey_data->>'days')::integer),
        'createdAt', now(),
        'questions', jsonb_build_array(
          jsonb_build_object(
            'id', gen_random_uuid(),
            'question', survey_data->>'question',
            'allowMultipleAnswers', false,
            'answers', answer_list
          )
        )
      )
    );

    if (survey_data->>'days')::integer < 0 then
      update public.survey_answers as answer
      set votes = case answer.position when 0 then 7 when 1 then 4 else 2 end
      from public.survey_questions as question
      where answer.question_id = question.id
        and question.survey_id = current_survey_id;
    end if;
  end loop;
end;
$$;
