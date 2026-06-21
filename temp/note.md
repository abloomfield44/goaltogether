# GoalTogether — Product Vision & Project Description

## Overview

GoalTogether is a social accountability and motivation platform where friends improve themselves together through shared group goals and personal goals.

The core concept is simple:

> Self-improvement is easier, more motivating, and more fun when done with people you care about.

Users create invitation-only groups where members contribute toward collaborative goals (fitness, reading, wellness, habits, learning, etc.) while also tracking their own personal goals. The experience should feel positive, encouraging, emotionally rewarding, and visually satisfying.

The product combines:
- Habit tracking
- Social accountability
- Collaborative progress
- Celebration mechanics
- Clean modern dashboards
- Low-pressure motivation

This is not a competitive leaderboard app.
It is cooperative progress.

---

# Example Use Case

Amanda creates a private group called:

## “ACount for You”

She invites:
- Amanda
- Alexa

The group has collaborative goals:

### Group Goal 1 — Weekly Walking Goal
- Goal: 28,000 total group steps per week
- Each member contributes their own tracked steps
- Progress accumulates toward the shared target
- Once the goal is reached:
  - Confetti animation appears for all members
  - Group celebration message is sent
  - Goal history is saved
  - Members can leave reactions/comments

### Group Goal 2 — Monthly Reading Goal
- Goal: Finish 1 book together each month
- Current Book:
  *Bright Girl, Lacks Focus: A Neurodivergent Memoir*
- Each member tracks:
  - Pages read
  - Percentage complete
  - Reading sessions

- Group dashboard shows:
  - Combined completion progress
  - Individual member progress
  - Current reading streaks

Amanda also has personal goals visible in summary form to the group:

- Sauna 2x/week
- Meditate 3x/week

On Amanda’s personal dashboard she can:
- Log sessions
- Track streaks
- Add notes
- See history and analytics
- Customize reminders

---

# Product Philosophy

GoalTogether should feel:
- Encouraging
- Friendly
- Modern
- Calm
- Slightly playful
- Highly visual
- Rewarding without being childish

The emotional tone should be:

> “We’re improving together.”

Not:

> “We’re competing against each other.”

Avoid aggressive gamification.
Use cooperative reinforcement instead.

---

# Core Features

## 1. Authentication & Invitations

### User Accounts
- Email/password login
- Google login
- Optional Apple login

### Group Invitations
- Invite by email or shareable link
- Private groups only
- Group creator becomes admin

---

# 2. Group Dashboard

The group dashboard is the heart of the application.

## Dashboard Should Include

### Group Header
- Group name
- Member avatars
- Motivational tagline
- Weekly completion percentage

### Shared Goals Section

Each goal card should display:
- Goal title
- Current progress
- Contribution breakdown
- Remaining amount
- Deadline/reset period
- Celebration state if completed

Examples:
- Steps
- Books
- Workouts
- Meditation minutes
- Water intake
- Study hours

### Individual Overview Section

Quick snapshot of each member:
- Active streaks
- Goals completed this week
- Mini progress rings
- Encouraging statuses

Example:

**Amanda**
- Sauna: 1/2
- Meditation: 2/3

**Alexa**
- Yoga: 3/4
- Reading: 45%

---

# 3. Personal Dashboard

Each user has a deeper private dashboard.

## Features
- Create/edit/delete goals
- Habit frequency tracking
- Weekly/monthly analytics
- Calendar heatmaps
- Progress charts
- Notes/journaling
- Milestone tracking

## Goal Types

Support:
- Count-based goals
- Time-based goals
- Percentage completion
- Binary habits
- Recurring habits
- One-time achievements

Examples:
- Walk 5 miles
- Read 20 pages
- Meditate 10 minutes
- Sauna sessions
- Drink water
- Practice guitar

---

# 4. Goal Logging System

Users can log progress quickly.

## Logging Examples
- Add 5,000 steps
- Read 24 pages
- Completed meditation session
- Finished sauna session

Should support:
- Manual entry
- Optional integrations later
  - Apple Health
  - Fitbit
  - Google Fit

Fast logging UX is critical.

---

# 5. Celebration & Motivation System

Positive reinforcement is a key feature.

## Celebrations

When a group goal completes:
- Confetti animation
- Success modal
- Encouraging messages
- Shared timeline update

Optional:
- Sound effects
- Animated achievement badges
- Group streak counters

The design should feel emotionally rewarding without becoming noisy or addictive.

---

# 6. Activity Feed

Private group activity feed showing:
- Goal completions
- Milestones
- Encouragement comments
- Reactions
- Weekly summaries

Examples:
- “Amanda completed Meditation 3/3 this week”
- “Alexa added 6,200 steps”
- “Group goal completed: 28,000 Steps 🎉”

---

# 7. Notifications

Notifications should be supportive, not guilt-driven.

Examples:
- “Your group is only 2,000 steps away from this week’s goal”
- “Amanda completed her sauna goal”
- “You’re on a 5-week meditation streak”

Support:
- Push notifications
- Email reminders
- Weekly recap emails

---

# Design Direction

## Visual Style

Modern, clean, warm, uplifting.

Influences:
- Apple Fitness
- Headspace
- Notion
- Duolingo (light inspiration only)
- Calm
- Strava activity cards

## UI Characteristics
- Rounded cards
- Soft shadows
- Clean typography
- Minimal clutter
- Strong whitespace
- Friendly animations

## Color Palette
- Soft blues
- Warm gradients
- Light backgrounds
- Accent colors for achievements

Avoid:
- Harsh reds
- Aggressive warning states
- Corporate productivity aesthetics

---

# Suggested Tech Stack

## Frontend
- Next.js
- React
- Tailwind CSS
- Framer Motion

## Backend
- Supabase or Firebase
- PostgreSQL
- Realtime subscriptions

## Authentication
- Supabase Auth or Auth.js

## Hosting
- Vercel

## Analytics
- PostHog or Plausible

---

# Database Structure (High-Level)

## Users
- id
- name
- avatar
- email

## Groups
- id
- name
- description
- owner_id

## GroupMembers
- group_id
- user_id
- role

## Goals
- id
- owner_id
- group_id (nullable)
- type
- frequency
- target_value

## GoalEntries
- id
- goal_id
- user_id
- value
- timestamp

## Celebrations
- id
- group_goal_id
- completed_at

---

# MVP Scope

## Phase 1

Focus only on:
- User accounts
- Groups
- Shared goals
- Personal goals
- Progress tracking
- Dashboards
- Confetti celebrations

No integrations yet.

---

# Future Features

## Potential Expansions
- AI encouragement summaries
- Group challenges
- Shared journals
- Mood tracking
- Smart recommendations
- Health integrations
- Public communities
- Shared routines
- Achievement timelines
- Widgets/mobile apps

---

# Key Product Principle

The product should answer this emotional need:

> “I want to become a better version of myself, and it’s easier when my friends are growing with me.”

The app should feel like:
- Mutual encouragement
- Visible momentum
- Shared accomplishment
- Collective optimism