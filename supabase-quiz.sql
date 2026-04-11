-- ============================================
-- HGDev Quiz Tables
-- Run this in the Supabase SQL Editor
-- ============================================

-- QUIZ QUESTIONS
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index >= 0 and correct_index <= 3),
  explanation text,
  sort_order integer,
  created_at timestamptz default now()
);

-- QUIZ ATTEMPTS
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  score integer not null,
  total integer not null,
  percentage integer not null,
  answers jsonb,
  completed_at timestamptz default now()
);

-- INDEXES
create index idx_quiz_questions_module_id on quiz_questions(module_id);
create index idx_quiz_attempts_module_id on quiz_attempts(module_id);
