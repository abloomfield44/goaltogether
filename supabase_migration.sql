-- =====================================================================
-- DATABASE MIGRATION: INDIVIDUAL GROUP CONTRIBUTIONS
-- Run this in your Supabase SQL Editor to update your tables and RLS.
-- =====================================================================

-- 1. Add user_id column to goal_history (linking log logs to their respective authors)
ALTER TABLE public.goal_history 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Update RLS policies to allow group members to log progress for group goals
DROP POLICY IF EXISTS "Users can insert history for their goals" ON public.goal_history;

CREATE POLICY "Users and group members can insert goal history" 
ON public.goal_history FOR INSERT WITH CHECK (
  goal_id IN (
    SELECT id FROM public.goals WHERE 
      owner_id = auth.uid() OR
      group_id IN (
        SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
      )
  )
);
