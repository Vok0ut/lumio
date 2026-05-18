"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/src/components/sidebar";
import { MobileBottomNav } from "@/src/components/mobile-nav";
import { Topbar } from "@/src/components/topbar";
import { CustomCursor } from "@/src/components/ui/custom-cursor";
import { ClickRipple } from "@/src/components/ui/click-ripple";
import { PageTransition } from "@/src/components/ui/page-transition";
import { getLevelFromXP, getRankForLevel, NAV_ITEMS } from "@/src/lib/gamification";
import { LumioLogo } from "@/src/components/ui/lumio-logo";
import { ThemeProvider } from "@/src/components/theme-provider";
import { isValidTheme } from "@/src/lib/theme";
import type { ThemeSlots } from "@/src/lib/theme";

interface UserProfile {
  totalXp: number;
  name: string | null;
  email: string;
  themeColors?: ThemeSlots | null;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/me")
        .then((r) => r.json())
        .then(setProfile)
        .catch(() => {});
    }
  }, [status, pathname]);

  /* Re-fetch profile when window regains focus (e.g. after XP changes in another tab) */
  useEffect(() => {
    const onFocus = () => {
      if (status === "authenticated") {
        fetch("/api/user/me")
          .then((r) => r.json())
          .then(setProfile)
          .catch(() => {});
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [status]);

  if (status === "loading") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <LumioLogo size={48} />
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "var(--font-sans)",
              color: "var(--text-hi)",
              marginBottom: 8,
              marginTop: 12,
            }}
          >
            lumio
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--text-lo)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const totalXp = profile?.totalXp ?? 0;
  const { level, currentLevelXP, xpToNextLevel } = getLevelFromXP(totalXp);
  const rank = getRankForLevel(level);
  const xpProgress = xpToNextLevel > 0 ? currentLevelXP / xpToNextLevel : 0;

  const currentSection = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const navItem = NAV_ITEMS.find((n) => n.key === currentSection);
  const title = navItem?.label ?? "Lumio";

  const serverTheme =
    profile?.themeColors && isValidTheme(profile.themeColors)
      ? (profile.themeColors as ThemeSlots)
      : null;

  return (
    <ThemeProvider serverTheme={serverTheme}>
      <div className="home-root custom-cursor-active">
        <CustomCursor />
        <ClickRipple />
        <Sidebar level={level} xpProgress={xpProgress} rankName={rank.name} />
        <div className="main-area">
          <Topbar
            title={title}
            level={level}
            xpProgress={xpProgress}
            totalXp={totalXp}
          />
          <div className="main-content">
            <PageTransition>{children}</PageTransition>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    </ThemeProvider>
  );
}
