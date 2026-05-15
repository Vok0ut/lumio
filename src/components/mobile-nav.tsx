"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/src/components/ui/icons";
import { MOBILE_NAV_ITEMS } from "@/src/lib/gamification";
import { useIsMobile } from "@/src/hooks/use-mobile";

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const href = `/${item.key === "dashboard" ? "dashboard" : item.key}`;
        const active = pathname === href;
        return (
          <button
            key={item.key}
            onClick={() => router.push(href)}
            style={{
              background: "none",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              color: active ? "var(--accent)" : "var(--text-lo)",
              transition: "color 0.15s",
              padding: "4px 8px",
            }}
          >
            <Icon name={item.icon} size={18} />
            <span
              style={{
                fontSize: 9,
                fontFamily: "var(--font-mono)",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.04em",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
