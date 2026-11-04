"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { THEME_EVENT, THEME_STORAGE_KEY } from "./script";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  resolved: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function subscribeThemeStore(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function getServerTheme(): Theme | null {
  return null;
}

function subscribeSystemTheme(callback: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerDark(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeThemeStore, getStoredTheme, getServerTheme);
  const systemDark = useSyncExternalStore(subscribeSystemTheme, getSystemDark, getServerDark);

  const admin = isAdminPath(pathname ?? "");
  const dark = admin && (theme ? theme === "dark" : systemDark);
  const resolved: Theme = dark ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);

  const setTheme = useCallback((next: Theme) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Ignore storage failures (private mode, quota, etc.).
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const value = useMemo(() => ({ resolved, setTheme }), [resolved, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
