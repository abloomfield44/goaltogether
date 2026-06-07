import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-warm-gradient flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <img 
          src="/goaltogether-logo.png" 
          alt="GoalTogether Logo" 
          className="w-20 h-20 mx-auto rounded-3xl object-contain shadow-soft"
        />
        
        <p className="text-xl md:text-2xl text-slate-600 font-medium">
          Self-improvement is easier, more motivating, and more fun when done with people you care about.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-teal-600 hover:bg-teal-700 shadow-soft-hover">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-teal-600 hover:bg-teal-700 shadow-soft-hover">
                  Log In
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full bg-white/50 border-white/50 shadow-sm backdrop-blur-sm hover:bg-white/80">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
