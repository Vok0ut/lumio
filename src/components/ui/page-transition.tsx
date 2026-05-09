"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      setPhase("out");
      const timer = setTimeout(() => {
        prevPath.current = pathname;
        setDisplayChildren(children);
        setPhase("in");
      }, 220);
      return () => clearTimeout(timer);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className={`page-transition ${phase === "out" ? "page-exit" : "page-enter"}`}
      style={{ height: "100%" }}
    >
      {displayChildren}
    </div>
  );
}
