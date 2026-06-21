/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/progress-ring";
import { Celebration } from "@/components/Celebration";
import { AddGoalModal } from "@/components/AddGoalModal";
import { AddWinModal } from "@/components/AddWinModal";
import { WeeklyProgressChart } from "@/components/WeeklyProgressChart";
import { BoxProgress } from "@/components/BoxProgress";
import { Plus, Sparkles, Trash2, Trophy, Users, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [wins, setWins] = useState<any[]>([]);
  const [groupWins, setGroupWins] = useState<any[]>([]);
  const [highFiveCounts, setHighFiveCounts] = useState<Record<string, number>>({});
  const [userHighFived, setUserHighFived] = useState<Record<string, boolean>>({});

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("Personal Goal Completed! 🎉");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddWinModalOpen, setIsAddWinModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUserProfile(profile);

      // 2. Fetch goals and their history
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*, goal_history(date, value)")
        .eq("owner_id", user.id);

      const formattedGoals = (goalsData || []).map((g: any) => ({
        ...g,
        history: g.goal_history || [],
      }));
      setGoals(formattedGoals);

      // 3. Fetch wins
      const { data: winsData } = await supabase
        .from("wins")
        .select("*")
        .eq("owner_id", user.id)
        .order("date", { ascending: false });
      setWins(winsData || []);

      // 4. Fetch group peer wins
      const { data: memberGroups } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      const groupIds = memberGroups?.map((mg: any) => mg.group_id) || [];

      if (groupIds.length > 0) {
        const { data: peerMembers } = await supabase
          .from("group_members")
          .select("user_id")
          .in("group_id", groupIds)
          .neq("user_id", user.id);

        const peerIds = peerMembers?.map((pm: any) => pm.user_id) || [];
        let peerWins: any[] = [];
        if (peerIds.length > 0) {
          const { data: pWins } = await supabase
            .from("wins")
            .select("*, profiles(name, avatar)")
            .in("owner_id", peerIds)
            .order("date", { ascending: false });
          
          peerWins = pWins || [];
          setGroupWins(peerWins);
        }

        // Fetch high-fives for all relevant wins (own + group)
        const allWinIds = [ ...(winsData || []).map((w:any) => w.id), ...peerWins.map((w:any) => w.id) ];
        if (allWinIds.length > 0) {
          const { data: hfData } = await supabase
            .from("wins_high_fives")
            .select("*")
            .in("win_id", allWinIds);

          const counts: Record<string, number> = {};
          const userMap: Record<string, boolean> = {};
          (hfData || []).forEach((hf: any) => {
            counts[hf.win_id] = (counts[hf.win_id] || 0) + 1;
            if (hf.user_id === user.id) userMap[hf.win_id] = true;
          });

          setHighFiveCounts(counts);
          setUserHighFived(userMap);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Calculate the featured goal (highest completion percentage)
  const sortedGoals = [...goals].sort((a, b) => {
    const aPercent = a.current_value / a.target_value;
    const bPercent = b.current_value / b.target_value;
    return bPercent - aPercent; // descending
  });
  const featuredGoal = sortedGoals[0];

  const handleLogProgress = async (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || goal.current_value >= goal.target_value) return;

    const newValue = Number(goal.current_value) + 1;
    const isCompleted = newValue === Number(goal.target_value);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("goals")
      .update({ current_value: newValue })
      .eq("id", goalId);

    if (updateError) return;

    // Log progress history point
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayName = days[new Date().getDay()];

    const { data: historyPoint } = await supabase
      .from("goal_history")
      .insert({
        goal_id: goalId,
        date: currentDayName,
        value: newValue,
      })
      .select("date, value")
      .single();

    setGoals((currentGoals) =>
      currentGoals.map((g) => {
        if (g.id === goalId) {
          const updatedHistory = [...(g.history || [])];
          if (historyPoint) {
            updatedHistory.push(historyPoint);
          }
          return { ...g, current_value: newValue, history: updatedHistory };
        }
        return g;
      })
    );

    if (isCompleted) {
      setCelebrationMessage("Personal Goal Completed! 🎉");
      setShowCelebration(true);
    }
  };

  const handleAddGoal = async (title: string, targetValue: number, frequency: string) => {
    if (!userProfile) return;

    const supabase = createClient();
    const { data: newGoal, error } = await supabase
      .from("goals")
      .insert({
        title,
        type: "count",
        target_value: targetValue,
        current_value: 0,
        owner_id: userProfile.id,
        frequency,
      })
      .select()
      .single();

    if (!error && newGoal) {
      setGoals((current) => [...current, { ...newGoal, history: [] }]);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("goals").delete().eq("id", goalId);

    if (!error) {
      setGoals((current) => current.filter((g) => g.id !== goalId));
    }
  };

  const handleAddWin = async (title: string) => {
    if (!userProfile) return;

    const supabase = createClient();
    const { data: newWin, error } = await supabase
      .from("wins")
      .insert({
        title,
        owner_id: userProfile.id,
      })
      .select()
      .single();

    if (!error && newWin) {
      setWins((current) => [newWin, ...current]);
      setCelebrationMessage("Win Added! Sparkle on! ✨");
      setShowCelebration(true);
    }
  };

  const handleToggleHighFive = async (winId: string) => {
    if (!userProfile) return;
    const supabase = createClient();
    const has = userHighFived[winId];
    if (has) {
      const { error } = await supabase
        .from("wins_high_fives")
        .delete()
        .eq("win_id", winId)
        .eq("user_id", userProfile.id);
      if (!error) {
        setHighFiveCounts((prev) => ({ ...prev, [winId]: Math.max(0, (prev[winId] || 1) - 1) }));
        setUserHighFived((prev) => ({ ...prev, [winId]: false }));
      }
    } else {
      const { data, error } = await supabase
        .from("wins_high_fives")
        .insert({ win_id: winId, user_id: userProfile.id })
        .select()
        .single();
      if (!error) {
        setHighFiveCounts((prev) => ({ ...prev, [winId]: (prev[winId] || 0) + 1 }));
        setUserHighFived((prev) => ({ ...prev, [winId]: true }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      <Celebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
        message={celebrationMessage} 
      />

      <AddGoalModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddGoal} 
      />

      <AddWinModal
        isOpen={isAddWinModalOpen}
        onClose={() => setIsAddWinModalOpen(false)}
        onAdd={handleAddWin}
      />

      {userProfile && (
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Hello, {userProfile.name}</h1>
            <p className="text-slate-500 mt-1">Let&apos;s keep the momentum going today.</p>
          </div>
          {userProfile.avatar && (
            <img 
              src={userProfile.avatar} 
              alt={userProfile.name} 
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
            />
          )}
        </header>
      )}

      {featuredGoal && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-slate-800">Featured Progress</h2>
          </div>
          <Card className="bg-gradient-to-br from-teal-50 to-blue-50 border-teal-100 shadow-md">
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="relative shrink-0">
                <ProgressRing 
                  value={featuredGoal.current_value} 
                  max={featuredGoal.target_value} 
                  size={120} 
                  strokeWidth={10} 
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-bold text-slate-800 text-2xl">{featuredGoal.current_value}</span>
                  <span className="text-slate-500 text-sm">/ {featuredGoal.target_value}</span>
                </div>
              </div>
              <div className="flex-1 w-full">
                <h3 className="font-bold text-2xl text-slate-800 mb-2">{featuredGoal.title}</h3>
                <p className="text-slate-600 mb-4">You&apos;re making incredible progress on this {featuredGoal.frequency} goal. Keep it up!</p>
                {featuredGoal.history && featuredGoal.history.length > 0 && (
                  <WeeklyProgressChart data={featuredGoal.history} color="#0D9488" />
                )}
              </div>
              <Button 
                size="lg"
                variant={featuredGoal.current_value >= featuredGoal.target_value ? "secondary" : "default"}
                disabled={featuredGoal.current_value >= featuredGoal.target_value}
                onClick={() => handleLogProgress(featuredGoal.id)}
                className="shrink-0 w-full md:w-auto px-8 py-6 rounded-2xl text-lg shadow-soft bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-200"
              >
                <Plus className="w-6 h-6 mr-2" /> Log Progress
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Your Habits & Goals</h2>
          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Goal
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <Card key={goal.id} className="relative group">
              <button 
                onClick={() => handleDeleteGoal(goal.id)}
                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                title="Delete Goal"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <CardContent className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ProgressRing 
                        value={goal.current_value} 
                        max={goal.target_value} 
                        size={64} 
                        strokeWidth={6} 
                      />
                      <div className="absolute inset-0 flex items-center justify-center font-semibold text-slate-700 text-sm">
                        {goal.current_value}/{goal.target_value}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{goal.title}</h3>
                      <p className="text-xs text-slate-500 capitalize">{goal.frequency}</p>
                    </div>
                  </div>
                  
                  <Button 
                    size="icon" 
                    variant={goal.current_value >= goal.target_value ? "secondary" : "default"}
                    disabled={goal.current_value >= goal.target_value}
                    onClick={() => handleLogProgress(goal.id)}
                    className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white disabled:bg-slate-200"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <BoxProgress 
                  value={goal.current_value} 
                  max={goal.target_value} 
                  color={goal.id === featuredGoal?.id ? "bg-teal-500" : "bg-teal-400"} 
                />
              </CardContent>
            </Card>
          ))}
          {goals.length === 0 && (
            <div className="col-span-2 text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              No habits or goals yet. Click &quot;Add Goal&quot; to get started!
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-slate-800">And Also...</h2>
            </div>
            <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => setIsAddWinModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Win
            </Button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {wins.map((win) => (
              <Card key={win.id} className="bg-gradient-to-br from-orange-50 to-pink-50 border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <p className="font-medium text-slate-800 mb-2">{win.title}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(win.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={userHighFived[win.id] ? "secondary" : "default"}
                        onClick={() => handleToggleHighFive(win.id)}
                        className="px-3"
                      >
                        🙌 {highFiveCounts[win.id] || 0}
                      </Button>
                      <span className="text-sm text-slate-500">{(highFiveCounts[win.id] || 0) === 1 ? 'high-five' : 'high-fives'}</span>
                    </div>
                  </CardContent>
              </Card>
            ))}
            {wins.length === 0 && (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                No extra wins yet this month. Click &quot;Add Win&quot; to celebrate something!
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-semibold text-slate-800">Group Wins</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {groupWins.map((win) => (
              <Card key={win.id} className="bg-indigo-50/50 border-indigo-100 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {win.profiles?.avatar && (
                      <img 
                        src={win.profiles.avatar} 
                        alt={win.profiles.name} 
                        className="w-8 h-8 rounded-full border border-white object-cover" 
                      />
                    )}
                    <span className="font-semibold text-slate-700">{win.profiles?.name || "A friend"}</span>
                  </div>
                  <p className="font-medium text-slate-800 mb-2">{win.title}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(win.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Button
                      size="sm"
                      variant={userHighFived[win.id] ? "secondary" : "default"}
                      onClick={() => handleToggleHighFive(win.id)}
                      className="px-3"
                    >
                      🙌 {highFiveCounts[win.id] || 0}
                    </Button>
                    <span className="text-sm text-slate-500">{(highFiveCounts[win.id] || 0) === 1 ? 'person engaged' : 'people engaged'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {groupWins.length === 0 && (
              <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
                No recent wins from your groups.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
