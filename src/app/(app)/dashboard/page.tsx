"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Leaf,
  Plus,
  Sparkles,
  Target,
  Waves,
} from "lucide-react";

type CategoryKey = "learn" | "move" | "make" | "live";
type FilterKey = "all" | CategoryKey;
type GoalType = "phrase" | "weeklySlots" | "pages" | "minutes" | "silhouette" | "meals";

type GoalCard = {
  id: string;
  title: string;
  category: CategoryKey;
  type: GoalType;
  current: number;
  target: number;
  subtitle: string;
  description: string;
  days?: boolean[];
  weeks?: { label: string; values: boolean[] }[];
  totalPages?: number;
  pagesRead?: number;
  minutes?: number;
  meals?: { day: string; planned: boolean; made: boolean }[];
};

const categoryMap: Record<
  CategoryKey,
  { label: string; soft: string; strong: string; accent: string; subtle: string }
> = {
  learn: {
    label: "learn",
    soft: "bg-violet-100 text-violet-700",
    strong: "bg-violet-500",
    accent: "text-violet-600",
    subtle: "bg-violet-50",
  },
  move: {
    label: "move",
    soft: "bg-emerald-100 text-emerald-700",
    strong: "bg-emerald-500",
    accent: "text-emerald-600",
    subtle: "bg-emerald-50",
  },
  make: {
    label: "make",
    soft: "bg-orange-100 text-orange-700",
    strong: "bg-orange-500",
    accent: "text-orange-600",
    subtle: "bg-orange-50",
  },
  live: {
    label: "live",
    soft: "bg-sky-100 text-sky-700",
    strong: "bg-sky-500",
    accent: "text-sky-600",
    subtle: "bg-sky-50",
  },
};

const initialGoals: GoalCard[] = [
  {
    id: "phrase-1",
    title: "Learn a new phrase",
    category: "learn",
    type: "phrase",
    current: 4,
    target: 7,
    subtitle: "This week",
    description: "dorood chetori • hello, how are you?",
    days: [true, true, false, true, false, true, false],
  },
  {
    id: "yoga-1",
    title: "Yoga 3x / week",
    category: "move",
    type: "weeklySlots",
    current: 2,
    target: 3,
    subtitle: "This month",
    description: "Gentle movement and breath",
    weeks: [
      { label: "W1", values: [true, true, true] },
      { label: "W2", values: [true, false, true] },
      { label: "W3", values: [false, true, false] },
      { label: "W4", values: [true, false, false] },
    ],
  },
  {
    id: "book-1",
    title: "Read a book a month",
    category: "learn",
    type: "pages",
    current: 226,
    target: 320,
    subtitle: "Current book",
    description: "The Book of Delights",
    totalPages: 320,
    pagesRead: 226,
  },
  {
    id: "meditation-1",
    title: "Meditation",
    category: "live",
    type: "minutes",
    current: 35,
    target: 60,
    subtitle: "Minutes this week",
    description: "Calm, steady reset",
    minutes: 35,
  },
  {
    id: "exercise-1",
    title: "Exercise",
    category: "move",
    type: "silhouette",
    current: 40,
    target: 60,
    subtitle: "Minutes this week",
    description: "Movement that feels good",
    minutes: 40,
  },
  {
    id: "meal-planning",
    title: "Plan my meals",
    category: "make",
    type: "meals",
    current: 4,
    target: 7,
    subtitle: "Weekly plan",
    description: "Plan and prepare more intentionally",
    meals: [
      { day: "Mon", planned: true, made: true },
      { day: "Tue", planned: true, made: false },
      { day: "Wed", planned: true, made: true },
      { day: "Thu", planned: false, made: false },
      { day: "Fri", planned: true, made: false },
      { day: "Sat", planned: true, made: false },
      { day: "Sun", planned: false, made: false },
    ],
  },
];

const filterButtons: FilterKey[] = ["all", "learn", "move", "make", "live"];

const nextWeekValue = (values: boolean[]) => {
  const nextIndex = values.findIndex((value) => !value);
  if (nextIndex === -1) return values;

  const updated = [...values];
  updated[nextIndex] = true;
  return updated;
};

export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<FilterKey>("all");
  const [monthOffset, setMonthOffset] = useState(0);
  const [goals, setGoals] = useState<GoalCard[]>(initialGoals);

  const currentMonth = useMemo(
    () => new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1),
    [monthOffset]
  );

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentMonth);

  const filteredGoals = useMemo(() => {
    if (selectedCategory === "all") return goals;
    return goals.filter((goal) => goal.category === selectedCategory);
  }, [goals, selectedCategory]);

  const summary = useMemo(
    () => [
      { label: "Activities complete", value: "12" },
      { label: "Pages read", value: "185" },
      { label: "Movement mins", value: "140" },
      { label: "New phrases", value: "4" },
    ],
    []
  );

  const updateGoal = (goalId: string) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        switch (goal.type) {
          case "phrase": {
            const nextDays = goal.days ? nextWeekValue(goal.days) : [true];
            const nextCurrent = nextDays.filter(Boolean).length;
            return { ...goal, days: nextDays, current: Math.min(goal.target, nextCurrent) };
          }
          case "weeklySlots": {
            const currentWeek = goal.weeks?.[0] ?? { label: "W1", values: [false, false, false] };
            const updatedWeek = { ...currentWeek, values: nextWeekValue(currentWeek.values) };
            const nextWeeks = goal.weeks ? [updatedWeek, ...goal.weeks.slice(1)] : [updatedWeek];
            const nextCurrent = nextWeeks.reduce((sum, week) => sum + week.values.filter(Boolean).length, 0);
            return { ...goal, weeks: nextWeeks, current: Math.min(goal.target, nextCurrent) };
          }
          case "pages": {
            const nextPagesRead = Math.min(goal.totalPages ?? goal.target, (goal.pagesRead ?? goal.current) + 25);
            return { ...goal, pagesRead: nextPagesRead, current: Math.min(goal.target, nextPagesRead) };
          }
          case "minutes": {
            const nextMinutes = Math.min(goal.target, (goal.minutes ?? goal.current) + 15);
            return { ...goal, minutes: nextMinutes, current: nextMinutes };
          }
          case "silhouette": {
            const nextMinutes = Math.min(goal.target, (goal.minutes ?? goal.current) + 15);
            return { ...goal, minutes: nextMinutes, current: nextMinutes };
          }
          case "meals": {
            const nextMeals = [...(goal.meals ?? [])];
            const nextIndex = nextMeals.findIndex((entry) => !entry.planned);
            if (nextIndex === -1) return goal;
            nextMeals[nextIndex] = { ...nextMeals[nextIndex], planned: true };
            const plannedCount = nextMeals.filter((entry) => entry.planned).length;
            return { ...goal, meals: nextMeals, current: Math.min(goal.target, plannedCount) };
          }
          default:
            return goal;
        }
      })
    );
  };

  const renderGoalCard = (goal: GoalCard) => {
    const category = categoryMap[goal.category];
    const progress = Math.min(100, (goal.current / goal.target) * 100);

    return (
      <Card key={goal.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${category.soft}`}>
                {goal.category === "learn" && <BookOpen className="h-5 w-5" />}
                {goal.category === "move" && <Dumbbell className="h-5 w-5" />}
                {goal.category === "make" && <Sparkles className="h-5 w-5" />}
                {goal.category === "live" && <Heart className="h-5 w-5" />}
              </div>
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${category.accent}`}>
                  {category.label}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-800">{goal.title}</h3>
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              onClick={() => updateGoal(goal.id)}
              className={`h-10 w-10 rounded-full border ${category.soft} hover:brightness-95`}
              variant="ghost"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-4 text-sm text-slate-500">{goal.description}</p>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>{goal.subtitle}</span>
            <span className="font-semibold text-slate-700">{goal.current}/{goal.target}</span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${category.strong}`} style={{ width: `${progress}%` }} />
          </div>

          {goal.type === "phrase" && goal.days && (
            <div className="mt-5 flex items-center justify-between gap-2">
              {goal.days.map((done, index) => (
                <div
                  key={`${goal.id}-${index}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${
                    done ? `border-violet-300 ${category.soft}` : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </div>
              ))}
            </div>
          )}

          {goal.type === "weeklySlots" && goal.weeks && (
            <div className="mt-5 space-y-3">
              {goal.weeks.map((week) => (
                <div key={`${goal.id}-${week.label}`} className="grid grid-cols-3 gap-2">
                  {week.values.map((done, index) => (
                    <div
                      key={`${goal.id}-${week.label}-${index}`}
                      className={`flex h-9 items-center justify-center rounded-xl border text-xs font-semibold ${
                        done ? "border-emerald-300 bg-emerald-400 text-white" : "border-slate-200 bg-slate-50 text-slate-400"
                      }`}
                    >
                      {done ? "✓" : index + 1}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {goal.type === "pages" && (
            <div className={`mt-5 rounded-2xl p-3 ${category.subtle}`}>
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-violet-600" />
                  Current book
                </span>
                <span>{goal.pagesRead ?? goal.current} / {goal.totalPages ?? goal.target}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{goal.description}</p>
            </div>
          )}

          {goal.type === "minutes" && (
            <div className={`mt-5 flex items-center gap-3 rounded-2xl p-3 ${category.subtle}`}>
              <div className={`flex h-11 w-11 items-center justify-center rounded-full ${goal.category === "live" ? "bg-sky-200 text-sky-700" : "bg-violet-200 text-violet-700"}`}>
                <Waves className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{goal.minutes ?? goal.current} minutes</p>
                <p className="text-xs text-slate-500">Gentle, gradual progress</p>
              </div>
            </div>
          )}

          {goal.type === "silhouette" && (
            <div className={`mt-5 flex items-center gap-3 rounded-2xl p-3 ${category.subtle}`}>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-200 text-emerald-700">
                <Dumbbell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{goal.minutes ?? goal.current} minute flow</p>
                <p className="text-xs text-slate-500">Strong and steady pace</p>
              </div>
            </div>
          )}

          {goal.type === "meals" && goal.meals && (
            <div className="mt-5 grid grid-cols-7 gap-2">
              {goal.meals.map((entry) => (
                <div key={`${goal.id}-${entry.day}`} className="space-y-1 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{entry.day}</div>
                  <div
                    className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-semibold ${
                      entry.planned ? "bg-orange-200 text-orange-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {entry.planned ? "Plan" : "-"}
                  </div>
                  <div
                    className={`flex h-8 items-center justify-center rounded-lg text-[10px] font-semibold ${
                      entry.made ? "bg-emerald-200 text-emerald-700" : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {entry.made ? "Yes" : "No"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-8">
      <header className="rounded-[30px] border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600">Goal Together</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">Small steps. Meaningful progress.</h1>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setMonthOffset((value) => value - 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {monthLabel}
            </div>
            <button
              type="button"
              onClick={() => setMonthOffset((value) => value + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterButtons.map((filter) => {
              const isActive = selectedCategory === filter;
              const label = filter === "all" ? "All" : categoryMap[filter].label;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedCategory(filter)}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? filter === "all"
                        ? "bg-slate-900 text-white"
                        : `${categoryMap[filter].soft}`
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <Button className="bg-slate-900 text-white hover:bg-slate-700">
            <Plus className="mr-2 h-4 w-4" /> Add goal
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.map((metric) => (
          <div key={metric.label} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Mood board</p>
            <h2 className="mt-2 text-2xl font-bold">A gentle rhythm for life, not pressure.</h2>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm text-violet-100 md:flex">
            <Leaf className="h-4 w-4" />
            low-pressure progress
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {Object.entries(categoryMap).map(([key, value]) => (
            <span key={key} className={`rounded-full px-3 py-1.5 text-sm font-medium ${value.soft}`}>
              {value.label}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {filteredGoals.map((goal) => renderGoalCard(goal))}
      </section>
    </div>
  );
}
