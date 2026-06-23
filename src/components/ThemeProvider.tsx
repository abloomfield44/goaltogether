"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

export type ThemeOption = "warm" | "cool" | "dark";

interface ThemeContextValue {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const LOCAL_STORAGE_KEY = "goaltogether-theme";
const themeOptions: ThemeOption[] = ["warm", "cool", "dark"];

function isThemeOption(value: unknown): value is ThemeOption {
  return typeof value === "string" && themeOptions.includes(value as ThemeOption);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeOption>("warm");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (isThemeOption(savedTheme)) {
      setThemeState(savedTheme);
      setLoaded(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setLoaded(true);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("color_scheme")
        .eq("id", user.id)
        .single();

      if (!error && profile?.color_scheme && isThemeOption(profile.color_scheme)) {
        setThemeState(profile.color_scheme);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const bodyClassList = document.body.classList;
    themeOptions.forEach((option) => bodyClassList.remove(`theme-${option}`));
    bodyClassList.add(`theme-${theme}`);
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
  }, [theme, loaded]);

  const value = useMemo(() => ({ theme, setTheme: setThemeState }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
