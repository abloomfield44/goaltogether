/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupsPage() {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Group creation state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    const supabase = createClient();

    // Fetch user details
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Fetch profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setUserProfile(profile);

    // Fetch groups with members nested
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*, group_members(*, profiles(*))")
      .order("created_at", { ascending: false });

    if (groupsData) {
      const formatted = groupsData.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        members: (g.group_members || []).map((gm: any) => ({
          id: gm.user_id,
          name: gm.profiles?.name || "User",
          avatar: gm.profiles?.avatar || "",
          email: gm.profiles?.email || "",
        })),
      }));
      setGroups(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinGroup = async (e: React.MouseEvent, groupId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userProfile) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: userProfile.id,
      });

    if (!error) {
      fetchGroups();
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !userProfile) return;

    setCreating(true);
    const supabase = createClient();

    const { data: newGroup, error } = await supabase
      .from("groups")
      .insert({
        name,
        description,
        created_by: userProfile.id,
      })
      .select()
      .single();

    if (!error && newGroup) {
      // Creator automatically joins the group
      await supabase
        .from("group_members")
        .insert({
          group_id: newGroup.id,
          user_id: userProfile.id,
        });

      setName("");
      setDescription("");
      setIsCreateOpen(false);
      fetchGroups();
    }
    setCreating(false);
  };

  const isAdmin = userProfile?.email === "amandacbloomfield@gmail.com";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Your Groups</h1>
          <p className="text-slate-500 mt-1">Improve yourself with people you care about.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white shadow-soft">
            <Plus className="w-5 h-5 mr-1" /> Create Group
          </Button>
        )}
      </header>

      {/* Group Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => {
          const isMember = group.members.some((m: any) => m.id === userProfile?.id);

          const cardContent = (
            <Card className={`h-full transition-all border shadow-sm ${
              isMember ? "hover:border-teal-300 cursor-pointer" : "border-slate-100"
            }`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">{group.name}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">{group.description}</CardDescription>
                  </div>
                  <div className="bg-teal-50 p-2 rounded-xl">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-between flex-1">
                <div>
                  <div className="flex -space-x-2 mb-3">
                    {group.members.map((member: any) => (
                      member.avatar ? (
                        <img 
                          key={member.id}
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          title={member.name}
                        />
                      ) : (
                        <div 
                          key={member.id}
                          className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500"
                          title={member.name}
                        >
                          {member.name.charAt(0)}
                        </div>
                      )
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{group.members.length} members</p>
                </div>

                {!isMember && (
                  <Button 
                    onClick={(e) => handleJoinGroup(e, group.id)}
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Join Group
                  </Button>
                )}
              </CardContent>
            </Card>
          );

          return isMember ? (
            <Link href={`/groups/${group.id}`} key={group.id}>
              {cardContent}
            </Link>
          ) : (
            <div key={group.id}>
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md z-10"
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle>Create New Group</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8 rounded-full">
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateGroup} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Group Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Early Birds Gym Club"
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                        autoFocus
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Description</label>
                      <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is the purpose of this group?"
                        rows={3}
                        className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={creating} className="bg-teal-600 hover:bg-teal-700 text-white">
                        {creating ? "Creating..." : "Create Group"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
