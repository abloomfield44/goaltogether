"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserCircle, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
    { href: "/groups", label: "My Groups", icon: Users },
  ];

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-slate-200 pb-safe md:relative md:border-t-0 md:border-r md:w-64 md:h-screen md:bg-white/50">
      <div className="flex justify-around items-center p-4 md:flex-col md:items-start md:justify-start md:gap-6 md:p-8 md:h-full">
        <div className="hidden md:flex items-center gap-2">
          <img 
            src="/goaltogether-logo.png" 
            alt="GoalTogether Logo" 
            className="object-contain"
          />
        </div>

        <div className="flex justify-around w-full md:flex-col md:gap-4 md:w-full">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium transition-colors md:w-full md:px-4 md:py-3 md:rounded-xl",
                  isActive
                    ? "text-teal-600 md:bg-teal-50 md:text-teal-700"
                    : "text-slate-500 hover:text-slate-800 md:hover:bg-slate-50"
                )}
              >
                <Icon className={cn("w-6 h-6 md:w-5 md:h-5", isActive ? "text-teal-600" : "text-slate-400")} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        <div className="md:mt-auto flex justify-around w-full md:flex-col md:gap-4">
          <Link 
            href="/profile" 
            className={cn(
              "flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium transition-colors md:w-full md:px-4 md:py-3 md:rounded-xl",
              pathname.startsWith("/profile") 
                ? "text-teal-600 md:bg-teal-50 md:text-teal-700" 
                : "text-slate-500 hover:text-slate-800 md:hover:bg-slate-50"
            )}
          >
            <UserCircle className={cn("w-6 h-6 md:w-5 md:h-5", pathname.startsWith("/profile") ? "text-teal-600" : "text-slate-400")} />
            <span>Profile</span>
          </Link>

          <button
            onClick={handleSignOut}
            className="flex flex-col md:flex-row items-center gap-1 md:gap-3 text-sm md:text-base font-medium text-slate-500 hover:text-red-600 md:hover:bg-red-50 md:w-full md:px-4 md:py-3 md:rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-6 h-6 md:w-5 md:h-5 text-slate-400 group-hover:text-red-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
