-- ============================================
-- HGDev Flashcard Tables
-- Run this in the Supabase SQL Editor
-- ============================================

create table flashcards (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  question text not null,
  answer text not null,
  difficulty integer not null check (difficulty >= 1 and difficulty <= 3),
  sort_order integer,
  created_at timestamptz default now()
);

create table flashcard_progress (
  id uuid primary key default gen_random_uuid(),
  flashcard_id uuid not null references flashcards(id) on delete cascade,
  times_seen integer default 0,
  times_correct integer default 0,
  last_seen timestamptz,
  comfort_level integer default 1 check (comfort_level >= 1 and comfort_level <= 3),
  created_at timestamptz default now()
);

create table flashcard_sessions (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  total_cards integer,
  correct_count integer,
  session_percentage integer,
  completed_at timestamptz default now()
);

create index idx_flashcards_module_id on flashcards(module_id);
create index idx_flashcard_progress_flashcard_id on flashcard_progress(flashcard_id);
create index idx_flashcard_sessions_module_id on flashcard_sessions(module_id);
