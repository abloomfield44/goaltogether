/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserCircle, Loader2, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function ProfilePage() {
  const { theme: appTheme, setTheme: setAppTheme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [theme, setTheme] = useState("warm");
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState("");

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
          const profileTheme = profileData.color_scheme || "warm";
          setTheme(profileTheme);
          setAppTheme(profileTheme);
        }
      }
      setProfileLoading(false);
    };

    fetchProfile();
  }, [setAppTheme]);

  useEffect(() => {
    if (appTheme !== theme) {
      setTheme(appTheme);
    }
  }, [appTheme]);

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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploadingAvatar(true);
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt || "png"}`;
    const filePath = `profiles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Avatar upload failed", uploadError);
      setUploadError(uploadError.message || "Could not upload profile image. Please try again.");
      setUploadingAvatar(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (data?.publicUrl) {
      setAvatar(data.publicUrl);
    } else {
      console.error("Could not get public URL for avatar", filePath);
      setUploadError("Could not get uploaded image URL.");
    }

    setUploadingAvatar(false);
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
        <h1 className="text-3xl font-bold text-theme-foreground">Your Profile</h1>
        <p className="text-theme-muted mt-1">Manage your account settings and preferences.</p>
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
                <div className="w-24 h-24 rounded-full bg-theme-surface border-4 border-white shadow-sm flex items-center justify-center text-theme-muted">
                  <UserCircle className="w-12 h-12" />
                </div>
              )}
              <div className="flex-1 space-y-3 w-full">
                <label className="text-sm font-medium text-theme-muted">Profile Photo</label>
                <div className="space-y-2">
                  <input 
                    type="url" 
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-theme-card text-theme-foreground"
                  />
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-theme-foreground bg-theme-card border border-theme rounded-lg cursor-pointer hover:bg-theme-surface">
                      <UploadCloud className="w-4 h-4 mr-2" />
                      <span>{uploadingAvatar ? "Uploading…" : "Upload Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                    </label>
                    {uploadError && <span className="text-sm text-rose-600">{uploadError}</span>}
                  </div>
                </div>
                <p className="text-xs text-theme-muted">Upload a photo or paste an image URL. Uploaded images are stored in Supabase storage.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-muted">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-theme rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-theme-card text-theme-foreground"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-theme-muted">Email Address (Read-only)</label>
                  <input 
                    type="email" 
                    value={email}
                    disabled
                    className="w-full p-2 border border-theme rounded-lg bg-theme-surface text-theme-muted cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-theme">
              <h3 className="text-lg font-semibold text-theme-foreground mb-4">Color Scheme</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTheme("warm");
                    setAppTheme("warm");
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "warm" ? "border-teal-500 bg-teal-50/50" : "border-slate-200 hover:border-teal-300"
                  }`}
                >
                  <div className="h-6 w-full rounded-full bg-gradient-to-r from-teal-100 to-orange-50 mb-3"></div>
                  <div className="font-medium text-slate-800">Warm Default</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme("cool");
                    setAppTheme("cool");
                  }}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    theme === "cool" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="h-6 w-full rounded-full bg-gradient-to-r from-indigo-100 to-blue-100 mb-3"></div>
                  <div className="font-medium text-slate-800">Cool Breeze</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    setAppTheme("dark");
                  }}
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
