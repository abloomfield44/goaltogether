"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Check, Dumbbell, Heart, Plus, Sparkles, Target } from "lucide-react";

type CategoryKey = "learn" | "move" | "make" | "live";

type LibraryEntry = {
  id: string;
  category: CategoryKey;
  title: string;
  note: string;
  progress: number;
  total: number;
  mode: "phrase" | "weekly" | "count" | "book";
  days?: boolean[];
};

const categoryStyles: Record<
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

const libraryEntries: LibraryEntry[] = [
  {
    id: "phrase-1",
    category: "learn",
    title: "Language practice",
    note: "dorood chetori • hello, how are you?",
    progress: 5,
    total: 7,
    mode: "phrase",
    days: [true, true, true, false, true, false, true],
  },
  {
    id: "phrase-2",
    category: "learn",
    title: "Conversation set",
    note: "salaam, merci, behtare",
    progress: 4,
    total: 7,
    mode: "phrase",
    days: [true, false, true, true, false, true, false],
  },
  {
    id: "history-1",
    category: "learn",
    title: "History topic",
    note: "Ancient Persian architecture",
    progress: 3,
    total: 4,
    mode: "count",
  },
  {
    id: "yoga-1",
    category: "move",
    title: "Yoga flow",
    note: "3x per week",
    progress: 2,
    total: 3,
    mode: "weekly",
  },
  {
    id: "dance-1",
    category: "move",
    title: "Dance practice",
    note: "One joyful move session",
    progress: 1,
    total: 2,
    mode: "count",
  },
  {
    id: "craft-1",
    category: "make",
    title: "Hands-on project",
    note: "Pottery + small home project",
    progress: 2,
    total: 4,
    mode: "count",
  },
  {
    id: "mindfulness-1",
    category: "live",
    title: "Meditation",
    note: "One gentle reset per week",
    progress: 3,
    total: 4,
    mode: "count",
  },
  {
    id: "self-growth-1",
    category: "live",
    title: "Reflection",
    note: "Low-pressure journaling",
    progress: 2,
    total: 3,
    mode: "count",
  },
];

const categoryOrder: CategoryKey[] = ["learn", "move", "make", "live"];

export default function GoalLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("learn");

  const visibleEntries = useMemo(
    () => libraryEntries.filter((entry) => entry.category === selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="space-y-8 pb-8">
      <header className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Goal library</p>
            <h1 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">A personal collection of gentle wins.</h1>
          </div>
          <Button type="button" className="bg-slate-900 text-white hover:bg-slate-700">
            <Plus className="mr-2 h-4 w-4" /> Add an item
          </Button>
        </div>
      </header>

      <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category ? `${categoryStyles[category].soft} ring-2 ring-slate-200` : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {categoryStyles[category].label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {visibleEntries.map((entry) => {
          const style = categoryStyles[entry.category];
          const percent = Math.min(100, (entry.progress / entry.total) * 100);

          return (
            <Card key={entry.id} className="overflow-hidden border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${style.soft}`}>
                      {entry.category === "learn" && <BookOpen className="h-5 w-5" />}
                      {entry.category === "move" && <Dumbbell className="h-5 w-5" />}
                      {entry.category === "make" && <Sparkles className="h-5 w-5" />}
                      {entry.category === "live" && <Heart className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${style.accent}`}>
                        {style.label}
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-slate-800">{entry.title}</h2>
                    </div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {entry.progress}/{entry.total}
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-500">{entry.note}</p>

                <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${style.strong}`} style={{ width: `${percent}%` }} />
                </div>

                {entry.mode === "phrase" && entry.days && (
                  <div className="mt-4 flex items-center justify-between gap-2">
                    {entry.days.map((done, index) => (
                      <div
                        key={`${entry.id}-day-${index}`}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                          done ? `border-violet-300 ${style.soft}` : "border-slate-200 bg-slate-50 text-slate-400"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" /> : index + 1}
                      </div>
                    ))}
                  </div>
                )}

                {entry.mode === "weekly" && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`${entry.id}-week-${index}`}
                        className={`flex h-10 items-center justify-center rounded-xl text-sm font-semibold ${
                          index < entry.progress ? "bg-emerald-400 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                    ))}
                  </div>
                )}

                {entry.mode === "count" && (
                  <div className={`mt-4 rounded-2xl p-3 ${style.subtle}`}>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <Target className="h-4 w-4 text-slate-500" />
                      Active streak
                    </div>
                    <p className="mt-2 text-sm text-slate-600">This collection is staying warm and consistent.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
