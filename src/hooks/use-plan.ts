"use client";

import { useState, useEffect, useCallback } from "react";
import type { PlanType } from "@/src/lib/plans";

let cachedPlan: PlanType | null = null;

export function usePlan() {
  const [plan, setPlan] = useState<PlanType | null>(cachedPlan);
  const [loading, setLoading] = useState(!cachedPlan);

  useEffect(() => {
    if (cachedPlan) return;
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        const p = (data.plan as PlanType) ?? "FREE";
        cachedPlan = p;
        setPlan(p);
      })
      .catch(() => setPlan("FREE"))
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    cachedPlan = null;
    setLoading(true);
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        const p = (data.plan as PlanType) ?? "FREE";
        cachedPlan = p;
        setPlan(p);
      })
      .catch(() => setPlan("FREE"))
      .finally(() => setLoading(false));
  }, []);

  return {
    plan: plan ?? "FREE",
    isPremium: plan === "PREMIUM",
    loading,
    refresh,
  };
}
