/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const [profileLoading, setProfileLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [theme, setTheme] = useState("warm");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser(authUser);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (profileData) {
          setName(profileData.name || "");
          setEmail(profileData.email || authUser.email || "");
          setAvatar(profileData.avatar || "");
          setTheme(profileData.color_scheme || "warm");
        }
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        avatar,
        color_scheme: theme,
      })
      .eq("id", user.id);

    setSaving(false);
    if (!error) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Your Profile</h1>
        <p className="text-slate-500 mt-1">Manage your account settings and preferences.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your photo and personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={name} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-sm object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center text-slate-400">
                  <UserCircle className="w-12 h-12" />
                </div>
              )}
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium text-slate-700">Profile Photo URL</label>
                <input 
                  type="url" 
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
                <p className="text-xs text-slate-500">Paste an image URL to update your avatar.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={email}
                    disabled
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme("warm")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "warm" ? "border-teal-500 bg-teal-50/50" : "border-slate-200 hover:border-teal-300"
                  }`}
                >
                  <div className="h-6 w-full rounded-full bg-gradient-to-r from-teal-100 to-orange-50 mb-3"></div>
                  <div className="font-medium text-slate-800">Warm Default</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("cool")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "cool" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="h-6 w-full rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 mb-3"></div>
                  <div className="font-medium text-slate-800">Cool Breeze</div>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "dark" ? "border-slate-800 bg-slate-100" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="h-6 w-full rounded-full bg-gradient-to-r from-slate-800 to-slate-600 mb-3"></div>
                  <div className="font-medium text-slate-800">Midnight</div>
                </button>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end gap-4">
              <AnimatePresence>
                {isSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-emerald-600 font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Changes saved
                  </motion.div>
                )}
              </AnimatePresence>
              <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto px-8 bg-teal-600 hover:bg-teal-700">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
