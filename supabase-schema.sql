-- ============================================
-- HGDev Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- COURSES
create table courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz default now()
);

-- MODULES
create table modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer,
  created_at timestamptz default now()
);

-- LESSONS
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  content text,
  sort_order integer,
  created_at timestamptz default now()
);

-- PROGRESS
create table progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons(id) on delete cascade,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'complete')),
  notes text,
  completed_at timestamptz,
  updated_at timestamptz default now()
);

-- INDEXES
create index idx_modules_course_id on modules(course_id);
create index idx_lessons_module_id on lessons(module_id);
create index idx_progress_lesson_id on progress(lesson_id);
