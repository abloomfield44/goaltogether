/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Celebration } from "@/components/Celebration";
import { Button } from "@/components/ui/button";
import { AddGroupGoalModal } from "@/components/AddGroupGoalModal";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export default function GroupDashboard() {
  const { id } = useParams();
  
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [groupGoals, setGroupGoals] = useState<any[]>([]);
  const [membersPersonalGoals, setMembersPersonalGoals] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);

  const getUnitFromTitle = (title: string) => {
    const parts = title.trim().split(" ");
    if (parts.length >= 3) {
      return parts.slice(2).join(" ");
    }
    return "units";
  };

  const getSingularUnit = (unit: string) => {
    if (unit.toLowerCase().endsWith("s") && !unit.toLowerCase().endsWith("ss")) {
      return unit.slice(0, -1);
    }
    return unit;
  };

  const getMemberProgress = (goal: any, memberId: string) => {
    const memberHistory = (goal.goal_history || []).filter((h: any) => h.user_id === memberId);
    if (memberHistory.length === 0) return 0;
    return Math.max(...memberHistory.map((h: any) => Number(h.value)));
  };

  const getGroupProgress = (goal: any, membersList: any[]) => {
    return membersList.reduce((sum, m) => sum + getMemberProgress(goal, m.id), 0);
  };

  const fetchGroupData = async () => {
    if (!id) return;
    const supabase = createClient();

    // 1. Fetch current logged-in user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setUserProfile(profile);
    }

    // 2. Fetch group metadata
    const { data: groupData } = await supabase
      .from("groups")
      .select("*")
      .eq("id", id)
      .single();
    
    if (!groupData) {
      setLoading(false);
      return;
    }
    setGroup(groupData);

    // 3. Fetch group members
    const { data: membersData } = await supabase
      .from("group_members")
      .select("joined_at, profiles(*)")
      .eq("group_id", id);
    
    const formattedMembers = (membersData || []).map((m: any) => m.profiles).filter(Boolean);
    setMembers(formattedMembers);

    // 4. Fetch shared goals and their history
    const { data: sharedGoals } = await supabase
      .from("goals")
      .select("*, goal_history(*)")
      .eq("group_id", id);
    setGroupGoals(sharedGoals || []);

    // 5. Fetch personal goals for group members
    const memberIds = formattedMembers.map((m: any) => m.id);
    if (memberIds.length > 0) {
      const { data: personalGoals } = await supabase
        .from("goals")
        .select("*")
        .in("owner_id", memberIds)
        .is("group_id", null);
      setMembersPersonalGoals(personalGoals || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const handleContribute = async (goalId: string) => {
    const goal = groupGoals.find(g => g.id === goalId);
    if (!goal || !userProfile) return;

    const currentMemberProgress = getMemberProgress(goal, userProfile.id);
    const individualTarget = Number(goal.target_value);
    
    if (currentMemberProgress >= individualTarget) return;

    const newMemberProgress = currentMemberProgress + 1;
    const supabase = createClient();

    // Log the progress in history
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const currentDayName = days[new Date().getDay()];

    const { error: historyError } = await supabase
      .from("goal_history")
      .insert({
        goal_id: goalId,
        user_id: userProfile.id,
        date: currentDayName,
        value: newMemberProgress,
      });

    if (historyError) return;

    // Update overall current_value in goals table
    const newGroupProgress = members.reduce((sum, m) => {
      if (m.id === userProfile.id) return sum + newMemberProgress;
      return sum + getMemberProgress(goal, m.id);
    }, 0);

    await supabase
      .from("goals")
      .update({ current_value: newGroupProgress })
      .eq("id", goalId);

    fetchGroupData();

    // Trigger celebration if group goal is fully completed
    const groupTarget = individualTarget * members.length;
    if (newGroupProgress === groupTarget) {
      setShowCelebration(true);
    }
  };

  const handleAddGroupGoal = async (
    title: string,
    targetValue: number,
    type: "count" | "percentage" | "binary",
    frequency: string
  ) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !id) return;

    const { data: newGoal, error } = await supabase
      .from("goals")
      .insert({
        title,
        type,
        target_value: targetValue,
        current_value: 0,
        owner_id: user.id,
        group_id: id,
        frequency,
      })
      .select()
      .single();

    if (!error && newGoal) {
      fetchGroupData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!group) return <div className="p-8 text-center text-slate-500">Group not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Celebration 
        show={showCelebration} 
        onComplete={() => setShowCelebration(false)} 
        message="Group Goal Completed! 🎉" 
      />

      <AddGroupGoalModal 
        isOpen={isAddGoalOpen} 
        onClose={() => setIsAddGoalOpen(false)} 
        onAdd={handleAddGroupGoal} 
      />

      <div className="flex items-center gap-2">
        <Link href="/groups" className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-teal-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
      </div>

      <header className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">{group.name}</h1>
          <p className="text-slate-500 mt-2">{group.description}</p>
        </div>
        <div className="flex -space-x-3">
          {members.map((member) => (
            member.avatar ? (
              <img 
                key={member.id}
                src={member.avatar} 
                alt={member.name} 
                className="w-12 h-12 rounded-full border-4 border-white shadow-sm object-cover"
                title={member.name}
              />
            ) : (
              <div 
                key={member.id}
                className="w-12 h-12 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center text-sm font-bold text-slate-500"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            )
          ))}
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-800">Shared Goals</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-teal-600 hover:text-teal-700"
            onClick={() => setIsAddGoalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Add Goal
          </Button>
        </div>
        
        <div className="grid gap-6">
          {groupGoals.map((goal) => {
            const groupTarget = Number(goal.target_value) * (members.length || 1);
            const totalGroupProgress = getGroupProgress(goal, members);
            const unit = getUnitFromTitle(goal.title);
            const singularUnit = getSingularUnit(unit);

            return (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                    <div>
                      <h3 className="font-bold text-xl text-slate-800">{goal.title}</h3>
                      <p className="text-sm text-slate-500 capitalize">{goal.frequency} goal</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-slate-800">{totalGroupProgress}</span>
                      <span className="text-slate-500"> / {groupTarget} {unit} (Group Target)</span>
                    </div>
                  </div>

                  <Progress value={totalGroupProgress} max={groupTarget} className="h-4 bg-teal-50" />

                  {/* Individual breakdown list */}
                  <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Member Contributions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {members.map((m) => {
                        const progress = getMemberProgress(goal, m.id);
                        const target = Number(goal.target_value);
                        const indPercent = target > 0 ? Math.round((progress / target) * 100) : 0;
                        const grpPercent = groupTarget > 0 ? Math.round((progress / groupTarget) * 100) : 0;

                        return (
                          <div key={m.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                            {m.avatar ? (
                              <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                                {m.name.charAt(0)}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">{m.name}</p>
                              <p className="text-xs text-slate-500">
                                {progress} / {target} {unit}
                              </p>
                              <div className="text-[10px] text-slate-400 mt-1">
                                {indPercent}% of individual goal | {grpPercent}% of group goal
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contribution button */}
                  {(() => {
                    const currentMemberProgress = userProfile ? getMemberProgress(goal, userProfile.id) : 0;
                    const individualTarget = Number(goal.target_value);
                    const isUserMember = members.some((m) => m.id === userProfile?.id);

                    return (
                      isUserMember && (
                        <div className="mt-6 flex flex-wrap gap-3 items-center">
                          <Button 
                            onClick={() => handleContribute(goal.id)}
                            disabled={currentMemberProgress >= individualTarget}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl px-6 disabled:bg-slate-200"
                          >
                            Contribute 1 {singularUnit}
                          </Button>
                          {currentMemberProgress >= individualTarget && (
                            <span className="text-emerald-600 text-sm font-medium flex items-center">
                              ✓ You Completed Your Share! 🎉
                            </span>
                          )}
                        </div>
                      )
                    );
                  })()}
                </CardContent>
              </Card>
            );
          })}
          {groupGoals.length === 0 && (
            <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-2xl">
              No shared goals set for this group yet.
            </div>
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6">Member Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {members.map((member) => {
            const memberGoals = membersPersonalGoals.filter(g => g.owner_id === member.id);
            return (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name} 
                        className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-xl font-bold text-slate-500">
                        {member.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg">{member.name}</h3>
                      <p className="text-sm text-slate-500">Active Streaks: 2 🔥</p>
                    </div>
                  </div>
                  
                  {memberGoals.length > 0 && (
                    <div className="space-y-3 mt-4 border-t border-slate-100 pt-4">
                      <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Personal Goals</h4>
                      {memberGoals.map(goal => (
                        <div key={goal.id} className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 font-medium">{goal.title}</span>
                          <span className="text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                            {goal.current_value} / {goal.target_value} {goal.type === "percentage" ? "%" : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
