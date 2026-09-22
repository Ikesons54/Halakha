-- ==============================================================================
-- HALAKHA V1 — Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL (RBAC)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'savedsoul898@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE public.profiles.id = auth.uid()::text
        AND public.profiles.role = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'en',
  learning_preference TEXT DEFAULT 'EVERYTHING' CHECK (learning_preference IN ('QUICK_DISCOVERIES', 'GUIDED_STUDIES', 'SCRIPTURE_READING', 'EVERYTHING')),
  available_time TEXT DEFAULT '15_MIN' CHECK (available_time IN ('5_MIN', '10_MIN', '15_MIN', '20_PLUS')),
  selected_topics TEXT[] DEFAULT '{}',
  streak_days INTEGER DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  hebrew_name TEXT,
  hebrew_meaning TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCRIPTURES TABLE
CREATE TABLE IF NOT EXISTS public.scriptures (
  id TEXT PRIMARY KEY,
  book TEXT NOT NULL,
  book_abbreviation TEXT NOT NULL,
  testament TEXT NOT NULL CHECK (testament IN ('Tanakh', 'Apostolic')),
  division TEXT NOT NULL CHECK (division IN ('Torah', 'Prophets', 'Writings', 'Gospels', 'Epistles')),
  chapter INTEGER NOT NULL,
  verse_start INTEGER NOT NULL,
  verse_end INTEGER,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  translation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 5-LAYER DISCOVERY IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  hook TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  context TEXT NOT NULL,
  interpretation TEXT NOT NULL,
  application TEXT NOT NULL,
  cover_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
  featured BOOLEAN DEFAULT false,
  created_by TEXT,
  reviewed_by TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  scripture_ids TEXT[] DEFAULT '{}',
  topic_slugs TEXT[] DEFAULT '{}',
  read_time_minutes INTEGER DEFAULT 3
);

-- 7. STUDY PATHS TABLE
CREATE TABLE IF NOT EXISTS public.study_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image_url TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Deep Dive')),
  estimated_minutes INTEGER DEFAULT 15,
  published BOOLEAN DEFAULT false,
  lessons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. KNOWLEDGE GRAPH TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_graphs (
  id TEXT PRIMARY KEY,
  nodes JSONB DEFAULT '[]'::jsonb,
  links JSONB DEFAULT '[]'::jsonb,
  central_node TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER PRIVATE DATA: SAVED IDEAS (STASH)
CREATE TABLE IF NOT EXISTS public.saved_ideas (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idea_id TEXT NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_idea UNIQUE (user_id, idea_id)
);

-- 10. USER PRIVATE DATA: CUSTOM COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  idea_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. USER PRIVATE DATA: STUDY REFLECTION NOTES
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  idea_id TEXT,
  scripture_id TEXT,
  reference_title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. USER PRIVATE DATA: PROGRESS TRACKING
CREATE TABLE IF NOT EXISTS public.user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  study_path_id TEXT NOT NULL REFERENCES public.study_paths(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  completed_at TIMESTAMPTZ,
  CONSTRAINT uq_user_progress UNIQUE (user_id, study_path_id, lesson_id)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scriptures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_graphs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Public profiles can be viewed by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id OR public.is_admin())
  WITH CHECK (auth.uid()::text = id OR public.is_admin());

CREATE POLICY "Only admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- TOPICS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Topics are readable by anyone"
  ON public.topics FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can manage topics"
  ON public.topics FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- SCRIPTURES POLICIES (Read-only for users, write for admins)
-- ------------------------------------------------------------------------------
CREATE POLICY "Scriptures are readable by anyone"
  ON public.scriptures FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated admins can write scriptures"
  ON public.scriptures FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- IDEAS POLICIES (Read-only published for users, write for admins)
-- ------------------------------------------------------------------------------
CREATE POLICY "Published ideas readable by anyone"
  ON public.ideas FOR SELECT
  TO anon, authenticated
  USING (status = 'PUBLISHED' OR public.is_admin());

CREATE POLICY "Only authenticated admins can write ideas"
  ON public.ideas FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- STUDY PATHS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Published study paths readable by anyone"
  ON public.study_paths FOR SELECT
  TO anon, authenticated
  USING (published = true OR public.is_admin());

CREATE POLICY "Only admins can write study paths"
  ON public.study_paths FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- KNOWLEDGE GRAPHS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Knowledge graphs readable by anyone"
  ON public.knowledge_graphs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can modify knowledge graph"
  ON public.knowledge_graphs FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- SAVED IDEAS POLICIES (User row-level private data)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can only select their own saved ideas"
  ON public.saved_ideas FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can only insert their own saved ideas"
  ON public.saved_ideas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can only delete their own saved ideas"
  ON public.saved_ideas FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ------------------------------------------------------------------------------
-- COLLECTIONS POLICIES (User row-level private data)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can select their own collections"
  ON public.collections FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own collections"
  ON public.collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ------------------------------------------------------------------------------
-- NOTES POLICIES (User row-level private data)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can select their own notes"
  ON public.notes FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own notes"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- ------------------------------------------------------------------------------
-- USER PROGRESS POLICIES (User row-level private data)
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can select their own study progress"
  ON public.user_progress FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own study progress"
  ON public.user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own study progress"
  ON public.user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);
