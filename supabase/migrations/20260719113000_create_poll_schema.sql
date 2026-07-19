create extension if not exists pgcrypto;

create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in (
      'Team Activities',
      'Health & Wellness',
      'Gaming & Entertainment',
      'Education & Learning',
      'Lifestyle & Preferences',
      'Technology & Innovation'
    )
  ),
  title text not null check (char_length(trim(title)) >= 3),
  description text not null default 'No description was provided.',
  end_date timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.survey_questions (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  position smallint not null check (position >= 0),
  question text not null check (char_length(trim(question)) > 0),
  allow_multiple_answers boolean not null default false,
  unique (survey_id, position)
);

create table public.survey_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.survey_questions(id) on delete cascade,
  position smallint not null check (position >= 0),
  text text not null check (char_length(trim(text)) > 0),
  votes integer not null default 0 check (votes >= 0),
  unique (question_id, position)
);

create index survey_questions_survey_id_idx on public.survey_questions(survey_id);
create index survey_answers_question_id_idx on public.survey_answers(question_id);
create index surveys_end_date_idx on public.surveys(end_date);

alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_answers enable row level security;

create policy "Surveys are publicly readable"
on public.surveys for select
to anon, authenticated
using (true);

create policy "Survey questions are publicly readable"
on public.survey_questions for select
to anon, authenticated
using (true);

create policy "Survey answers are publicly readable"
on public.survey_answers for select
to anon, authenticated
using (true);

create or replace function public.create_survey(payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  survey_id uuid := (payload->>'id')::uuid;
  question_data jsonb;
  question_id uuid;
  question_position integer := 0;
  answer_data jsonb;
  answer_position integer;
begin
  if jsonb_typeof(payload->'questions') <> 'array'
    or jsonb_array_length(payload->'questions') = 0 then
    raise exception 'A survey requires at least one question.';
  end if;

  insert into public.surveys (id, category, title, description, end_date, created_at)
  values (
    survey_id,
    payload->>'category',
    trim(payload->>'title'),
    coalesce(nullif(trim(payload->>'description'), ''), 'No description was provided.'),
    (payload->>'endDate')::timestamptz,
    coalesce((payload->>'createdAt')::timestamptz, now())
  );

  for question_data in select value from jsonb_array_elements(payload->'questions') loop
    if jsonb_typeof(question_data->'answers') <> 'array'
      or jsonb_array_length(question_data->'answers') < 2 then
      raise exception 'Every question requires at least two answers.';
    end if;

    question_id := (question_data->>'id')::uuid;
    insert into public.survey_questions (
      id,
      survey_id,
      position,
      question,
      allow_multiple_answers
    ) values (
      question_id,
      survey_id,
      question_position,
      trim(question_data->>'question'),
      coalesce((question_data->>'allowMultipleAnswers')::boolean, false)
    );

    answer_position := 0;
    for answer_data in select value from jsonb_array_elements(question_data->'answers') loop
      insert into public.survey_answers (id, question_id, position, text)
      values (
        (answer_data->>'id')::uuid,
        question_id,
        answer_position,
        trim(answer_data->>'text')
      );
      answer_position := answer_position + 1;
    end loop;

    question_position := question_position + 1;
  end loop;

  return survey_id;
end;
$$;

create or replace function public.submit_survey_vote(
  target_survey_id uuid,
  selected_answer_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(cardinality(selected_answer_ids), 0) = 0 then
    raise exception 'Select at least one answer.';
  end if;

  if not exists (
    select 1 from public.surveys
    where id = target_survey_id and end_date > now()
  ) then
    raise exception 'The survey is unavailable or has ended.';
  end if;

  if cardinality(selected_answer_ids) <>
    (select count(distinct answer_id) from unnest(selected_answer_ids) as answer_id) then
    raise exception 'Duplicate answers are not allowed.';
  end if;

  if exists (
    select 1
    from unnest(selected_answer_ids) as selected(answer_id)
    left join public.survey_answers answer on answer.id = selected.answer_id
    left join public.survey_questions question on question.id = answer.question_id
    where answer.id is null or question.survey_id <> target_survey_id
  ) then
    raise exception 'An answer does not belong to this survey.';
  end if;

  if exists (
    select question.id
    from public.survey_questions question
    join public.survey_answers answer on answer.question_id = question.id
    where answer.id = any(selected_answer_ids)
    group by question.id, question.allow_multiple_answers
    having not question.allow_multiple_answers and count(*) > 1
  ) then
    raise exception 'Only one answer is allowed for this question.';
  end if;

  if exists (
    select 1
    from public.survey_questions question
    where question.survey_id = target_survey_id
      and not exists (
        select 1
        from public.survey_answers answer
        where answer.question_id = question.id
          and answer.id = any(selected_answer_ids)
      )
  ) then
    raise exception 'Every question requires an answer.';
  end if;

  update public.survey_answers
  set votes = votes + 1
  where id = any(selected_answer_ids);
end;
$$;

revoke all on public.surveys, public.survey_questions, public.survey_answers
from anon, authenticated;

grant select on public.surveys, public.survey_questions, public.survey_answers
to anon, authenticated;

revoke all on function public.create_survey(jsonb) from public;
revoke all on function public.submit_survey_vote(uuid, uuid[]) from public;

grant execute on function public.create_survey(jsonb) to anon, authenticated;
grant execute on function public.submit_survey_vote(uuid, uuid[]) to anon, authenticated;
