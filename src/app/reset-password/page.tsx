"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const initializeRecoverySession = async () => {
      const supabase = createClient();

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError("Your password reset link has expired or is invalid. Please request a new one.");
            setReady(true);
            return;
          }

          setReady(true);
          return;
        }

        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const accessToken = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError("Unable to validate your secure reset session. Please request a new password reset link.");
            setReady(true);
            return;
          }

          window.history.replaceState({}, "", window.location.pathname);
          setReady(true);
          return;
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          setError(sessionError.message);
          setReady(true);
          return;
        }

        if (!session) {
          setError("Your reset link is missing or expired. Please request a new one.");
          setReady(true);
          return;
        }

        setReady(true);
      } catch {
        setError("Something went wrong while validating your reset link. Please try again.");
        setReady(true);
      }
    };

    void initializeRecoverySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Your password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login?message=Password reset successfully. Please log in with your new password.");
      router.refresh();
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-md border-slate-100 shadow-xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center pt-8">
          <img
            src="/goaltogether-logo.png"
            alt="GoalTogether Logo"
            className="w-12 h-12 mx-auto rounded-2xl object-contain shadow-soft mb-4"
          />
          <CardTitle className="text-2xl font-bold text-slate-800">Set a new password</CardTitle>
          <CardDescription className="text-slate-500">
            Choose a secure password for your GoalTogether account.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {!ready ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          ) : success ? (
            <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl border border-emerald-100 font-medium text-center">
              Password updated successfully. Redirecting you back to log in...
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium">
                {error}
              </div>
              <div className="text-center text-sm text-slate-500">
                <Link href="/forgot-password" className="text-teal-600 font-semibold hover:underline">
                  Request a new reset link
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  minLength={6}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  minLength={6}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white p-6 rounded-xl font-semibold text-base shadow-soft hover:shadow-soft-hover transition-all mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Updating password...
                  </>
                ) : (
                  "Update password"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
