"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Lock background scroll when modal is open (important on mobile) */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 16px 16px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: 440,
          maxHeight: "calc(100vh - 76px)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "24px",
          borderColor: "var(--border-mid)",
          margin: "auto 0",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <span className="t-title" style={{ fontSize: 16 }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-lo)",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
