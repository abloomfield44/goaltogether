-- =====================================================================
-- GOALTOGETHER DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor to initialize tables,
-- triggers, default data, and RLS security policies.
-- =====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar TEXT,
  color_scheme TEXT NOT NULL DEFAULT 'warm',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. GROUPS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Groups Policies
CREATE POLICY "Allow public read access to groups" ON public.groups
  FOR SELECT USING (true);

CREATE POLICY "Allow group creation by admin only" ON public.groups
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'email' = 'amandacbloomfield@gmail.com'
  );

CREATE POLICY "Allow creator or admin to update/delete groups" ON public.groups
  FOR ALL USING (
    created_by = auth.uid() OR auth.jwt() ->> 'email' = 'amandacbloomfield@gmail.com'
  );

-- Seed the Default Group
INSERT INTO public.groups (id, name, description)
VALUES (
  'a1ce0000-b600-4172-91c0-d42a64180668',
  'ACount for you',
  'Self-improvement is easier when done together.'
) ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------
-- 3. GROUP MEMBERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.group_members (
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (group_id, user_id)
);

-- Enable RLS on Group Members
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Group Members Policies
CREATE POLICY "Allow read access to group members" ON public.group_members
  FOR SELECT USING (true);

CREATE POLICY "Allow users to join a group" ON public.group_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to leave a group" ON public.group_members
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4. GOALS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('count', 'percentage', 'binary')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Goals Policies
CREATE POLICY "Users can read goals they own or that belong to their groups" ON public.goals
  FOR SELECT USING (
    owner_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update goals they own or group goals they participate in" ON public.goals
  FOR UPDATE USING (
    owner_id = auth.uid() OR
    group_id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own goals" ON public.goals
  FOR DELETE USING (owner_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. GOAL HISTORY TABLE (for charting)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goal_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  date TEXT NOT NULL, -- e.g., 'Mon', 'Tue' or full iso dates
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Goal History
ALTER TABLE public.goal_history ENABLE ROW LEVEL SECURITY;

-- Goal History Policies
CREATE POLICY "Users can read history of goals they can access" ON public.goal_history
  FOR SELECT USING (
    goal_id IN (
      SELECT id FROM public.goals WHERE
        owner_id = auth.uid() OR
        group_id IN (
          SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Users can insert history for their goals" ON public.goal_history
  FOR INSERT WITH CHECK (
    goal_id IN (
      SELECT id FROM public.goals WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete history of their goals" ON public.goal_history
  FOR DELETE USING (
    goal_id IN (
      SELECT id FROM public.goals WHERE owner_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- 6. WINS TABLE ("And also...")
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on Wins
ALTER TABLE public.wins ENABLE ROW LEVEL SECURITY;

-- Wins Policies
CREATE POLICY "Users can read their own wins and wins of peers in shared groups" ON public.wins
  FOR SELECT USING (
    owner_id = auth.uid() OR
    owner_id IN (
      -- peers who share any group with the user
      SELECT user_id FROM public.group_members WHERE group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create their own wins" ON public.wins
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own wins" ON public.wins
  FOR DELETE USING (auth.uid() = owner_id);

-- ---------------------------------------------------------------------
-- 7. NEW USER TRIGGER (Profiles & Default Group Entry)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 1. Create a profile record
  INSERT INTO public.profiles (id, name, email, avatar, color_scheme)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/150?u=' || new.id),
    'warm'
  );

  -- 2. Add user to "ACount for you" default group
  INSERT INTO public.group_members (group_id, user_id)
  VALUES ('a1ce0000-b600-4172-91c0-d42a64180668', new.id)
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution link
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
