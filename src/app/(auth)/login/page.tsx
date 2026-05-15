"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

import { LumioLogo } from "@/src/components/ui/lumio-logo";

const CanvasRevealEffect = dynamic(
  () => import("@/src/components/ui/canvas-reveal").then((m) => m.CanvasRevealEffect),
  { ssr: false }
);

/* ─── Nav ─── */

function LoginNav({ onGoogleSignIn }: { onGoogleSignIn: () => void }) {
  return (
    <nav className="login-nav">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LumioLogo size={24} />
        <span className="login-nav-logo">lumio</span>
      </div>
      <div className="login-nav-links">
        <span className="login-nav-link">Producto</span>
        <span className="login-nav-link">Pricing</span>
      </div>
      <button className="login-nav-btn" onClick={onGoogleSignIn}>
        Entrar con Google
      </button>
    </nav>
  );
}

/* ─── Main Login Page ─── */

type Step = "email" | "code" | "devcode" | "success";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("email");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [devCodeInput, setDevCodeInput] = useState("");

  const [initialCanvasVisible, setInitialCanvasVisible] = useState(true);
  const [reverseCanvasVisible, setReverseCanvasVisible] = useState(false);

  const handleGoogleSignIn = useCallback(() => {
    signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  /* ── Email step ── */
  const handleEmailSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Error al enviar el codigo");
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [email]);

  /* Focus first code input when entering code step */
  useEffect(() => {
    if (step === "code") {
      setTimeout(() => codeRefs.current[0]?.focus(), 400);
    }
  }, [step]);

  /* ── Verify OTP ── */
  const handleCodeComplete = useCallback(async (fullCode: string) => {
    setError("");
    setReverseCanvasVisible(true);
    setTimeout(() => setInitialCanvasVisible(false), 50);

    try {
      /* 1. Verify OTP — this is the real validation */
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => ({}));
        throw new Error(data.error || "Codigo incorrecto");
      }

      const { token } = await verifyRes.json();

      /* 2. Establish session — ignore signIn result quirks in NextAuth v5.
         If the session truly failed, the dashboard auth guard will redirect. */
      try {
        await signIn("credentials", { email, token, redirect: false });
      } catch {
        /* signIn can throw or return error in NextAuth v5 even on success */
      }

      setTimeout(() => setStep("success"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setReverseCanvasVisible(false);
      setInitialCanvasVisible(true);
    }
  }, [email]);

  /* ── Code input handling ── */
  const handleCodeChange = useCallback((index: number, value: string) => {
    if (value.length > 1) return;
    const next = [...code];
    next[index] = value;
    setCode(next);

    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }

    if (index === 5 && value) {
      const full = next.every((d) => d.length === 1);
      if (full) {
        handleCodeComplete(next.join(""));
      }
    }
  }, [code, handleCodeComplete]);

  const handleCodeKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const handleBack = useCallback(() => {
    setStep("email");
    setCode(["", "", "", "", "", ""]);
    setError("");
    setReverseCanvasVisible(false);
    setInitialCanvasVisible(true);
  }, []);

  return (
    <div className="login-root">
      {/* Three.js dot matrix background */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {initialCanvasVisible && (
          <div style={{ position: "absolute", inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={3}
              colors={[[232, 230, 223], [200, 198, 190]]}
              dotSize={6}
              reverse={false}
            />
          </div>
        )}
        {reverseCanvasVisible && (
          <div style={{ position: "absolute", inset: 0 }}>
            <CanvasRevealEffect
              animationSpeed={4}
              colors={[[232, 230, 223], [200, 198, 190]]}
              dotSize={6}
              reverse={true}
            />
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at center, rgba(9,9,9,1) 0%, transparent 100%)",
        }} />
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "33%",
          background: "linear-gradient(to bottom, #090909, transparent)",
        }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", flex: 1, width: "100%" }}>
        <LoginNav onGoogleSignIn={handleGoogleSignIn} />

        <div className="login-form-wrap">
          <AnimatePresence mode="wait">
            {/* ── Email Step ── */}
            {step === "email" && (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <div style={{ marginBottom: 32 }}>
                  <LumioLogo size={48} />
                </div>

                <h1 className="login-heading">Bienvenido</h1>
                <p className="login-subheading">Tu sistema de productividad te espera</p>

                {error && (
                  <div className="login-error">{error}</div>
                )}

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                  <button
                    type="button"
                    className="login-btn login-btn-outline"
                    onClick={handleGoogleSignIn}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>G</span>
                    Continuar con Google
                  </button>

                  <div className="login-divider">
                    <div className="login-divider-line" />
                    <span className="login-divider-text">O</span>
                    <div className="login-divider-line" />
                  </div>

                  <form onSubmit={handleEmailSubmit} style={{ width: "100%" }}>
                    <div style={{ position: "relative" }}>
                      <input
                        className="login-input"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        style={{ textAlign: "center", paddingLeft: 52, paddingRight: 52 }}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="login-submit-arrow"
                      >
                        <span className="login-arrow-inner">
                          <span className="login-arrow-default">→</span>
                          <span className="login-arrow-hover">→</span>
                        </span>
                      </button>
                    </div>
                  </form>
                </div>

                <p className="login-legal">
                  Al continuar, aceptas los <a href="#">Terminos</a> y la{" "}
                  <a href="#">Politica de privacidad</a>
                </p>

                <button
                  type="button"
                  onClick={() => { setStep("devcode"); setError(""); setDevCodeInput(""); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--text-lo)", marginTop: 8,
                    opacity: 0.5, transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
                >
                  Tengo un codigo de desarrollador
                </button>
              </motion.div>
            )}

            {/* ── Dev Code Step ── */}
            {step === "devcode" && (
              <motion.div
                key="devcode-step"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <h1 className="login-heading">Codigo de desarrollador</h1>
                <p className="login-subheading">Introduce tu codigo para desbloquear Premium</p>

                {error && (
                  <div className="login-error">{error}</div>
                )}

                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
                  <input
                    className="login-input"
                    type="text"
                    placeholder="LUMIO-DEV-XXXXX"
                    value={devCodeInput}
                    onChange={(e) => setDevCodeInput(e.target.value.toUpperCase())}
                    maxLength={30}
                    style={{ textAlign: "center", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
                  />

                  <p style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--text-lo)", textAlign: "center", lineHeight: 1.5,
                  }}>
                    Primero inicia sesion con tu email. Podras canjear el codigo desde tu perfil.
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 24 }}>
                  <button
                    type="button"
                    className="login-btn login-btn-white"
                    onClick={() => { setStep("email"); setError(""); }}
                    style={{ flex: 1 }}
                  >
                    Volver a inicio de sesion
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Code Step ── */}
            {step === "code" && (
              <motion.div
                key="code-step"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <h1 className="login-heading">Te enviamos un codigo</h1>
                <p className="login-subheading">Ingresalo aqui</p>

                {error && (
                  <div className="login-error">{error}</div>
                )}

                <div className="login-code-wrap">
                  <div className="login-code-inner">
                    {code.map((digit, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                          <input
                            ref={(el) => { codeRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(i, e.target.value)}
                            onKeyDown={(e) => handleCodeKeyDown(i, e)}
                            className="login-code-input"
                            style={{ caretColor: "transparent" }}
                          />
                          {!digit && (
                            <div className="login-code-placeholder">0</div>
                          )}
                        </div>
                        {i < 5 && (
                          <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 20, margin: "0 2px" }}>|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    fetch("/api/auth/send-otp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                  }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "var(--font-mono)", fontSize: 12,
                    color: "var(--text-lo)", marginTop: 16,
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-mid)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-lo)")}
                >
                  Reenviar codigo
                </button>

                <div style={{ display: "flex", gap: 10, width: "100%", marginTop: 24 }}>
                  <button
                    type="button"
                    className="login-btn login-btn-white"
                    onClick={handleBack}
                    style={{ flex: "0 0 30%" }}
                  >
                    Atras
                  </button>
                  <button
                    type="button"
                    className={`login-btn ${code.every((d) => d !== "") ? "login-btn-white" : "login-btn-disabled"}`}
                    disabled={!code.every((d) => d !== "")}
                    onClick={() => handleCodeComplete(code.join(""))}
                    style={{ flex: 1 }}
                  >
                    Continuar
                  </button>
                </div>

                <p className="login-legal">
                  Al continuar, aceptas los <a href="#">Terminos</a> y la{" "}
                  <a href="#">Politica de privacidad</a>
                </p>
              </motion.div>
            )}

            {/* ── Success Step ── */}
            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}
              >
                <h1 className="login-heading">Bienvenido</h1>
                <p className="login-subheading">Tu espacio esta listo</p>

                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  style={{ padding: "40px 0" }}
                >
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--accent), rgba(232,230,223,0.7))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="32" height="32" viewBox="0 0 20 20" fill="currentColor" style={{ color: "#090909" }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  style={{ width: "100%" }}
                >
                  <button
                    className="login-btn login-btn-white"
                    onClick={() => { window.location.href = "/dashboard"; }}
                    style={{ width: "100%" }}
                  >
                    Ir al Dashboard
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
