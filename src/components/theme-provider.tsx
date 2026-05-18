"use client";

import { createContext, useContext, useCallback, useLayoutEffect, useRef, useState } from "react";
import { ThemeSlots, DEFAULT_THEME, THEME_STORAGE_KEY, deriveCssVars, isValidTheme } from "@/src/lib/theme";

interface ThemeContextValue {
  slots: ThemeSlots;
  setSlots: (s: ThemeSlots) => void;
  setSlot: (key: keyof ThemeSlots, value: string) => void;
  resetToDefaults: () => void;
  isDefault: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  slots: DEFAULT_THEME,
  setSlots: () => {},
  setSlot: () => {},
  resetToDefaults: () => {},
  isDefault: true,
});

export const useTheme = () => useContext(ThemeContext);

function applyTheme(slots: ThemeSlots) {
  const vars = deriveCssVars(slots);
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
}

function clearTheme() {
  const vars = deriveCssVars(DEFAULT_THEME);
  const root = document.documentElement;
  for (const key of Object.keys(vars)) {
    root.style.removeProperty(key);
  }
}

function readLocalStorage(): ThemeSlots | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return isValidTheme(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function ThemeProvider({
  children,
  serverTheme,
}: {
  children: React.ReactNode;
  serverTheme?: ThemeSlots | null;
}) {
  const [slots, setSlotsState] = useState<ThemeSlots>(DEFAULT_THEME);
  const [isDefault, setIsDefault] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Hydrate from localStorage immediately (no flash)
  useLayoutEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const local = readLocalStorage();
    if (local) {
      setSlotsState(local);
      setIsDefault(false);
      applyTheme(local);
    }
  }, []);

  // Reconcile with server theme when it arrives
  useLayoutEffect(() => {
    if (serverTheme && isValidTheme(serverTheme)) {
      setSlotsState(serverTheme);
      setIsDefault(false);
      applyTheme(serverTheme);
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(serverTheme));
    }
  }, [serverTheme]);

  const persist = useCallback((next: ThemeSlots) => {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
    // Debounced API save
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch("/api/user/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      }).catch(() => {});
    }, 500);
  }, []);

  const setSlots = useCallback(
    (next: ThemeSlots) => {
      setSlotsState(next);
      setIsDefault(false);
      applyTheme(next);
      persist(next);
    },
    [persist]
  );

  const setSlot = useCallback(
    (key: keyof ThemeSlots, value: string) => {
      setSlotsState((prev) => {
        const next = { ...prev, [key]: value };
        setIsDefault(false);
        applyTheme(next);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetToDefaults = useCallback(() => {
    setSlotsState(DEFAULT_THEME);
    setIsDefault(true);
    clearTheme();
    localStorage.removeItem(THEME_STORAGE_KEY);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Clear from DB — send defaults
    fetch("/api/user/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DEFAULT_THEME),
    }).catch(() => {});
  }, []);

  return (
    <ThemeContext.Provider value={{ slots, setSlots, setSlot, resetToDefaults, isDefault }}>
      {children}
    </ThemeContext.Provider>
  );
}
