"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
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
          <CardTitle className="text-2xl font-bold text-slate-800">Reset your password</CardTitle>
          <CardDescription className="text-slate-500">
            Enter your email and we&apos;ll send a secure reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          {success ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl border border-emerald-100 font-medium">
                Check your inbox for a password reset link. If it doesn&apos;t appear in a few minutes, try again with the same email address.
              </div>
              <div className="text-center text-sm text-slate-500">
                <Link href="/login" className="text-teal-600 font-semibold hover:underline">
                  Back to log in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
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
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending reset link...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>

              <div className="text-center text-sm text-slate-500">
                Remembered your password?{" "}
                <Link href="/login" className="text-teal-600 font-semibold hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
