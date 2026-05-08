"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";

function DotMatrix() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    const dots: { x: number; y: number; alpha: number; target: number }[] = [];
    const SPACING = 28;
    const BASE_ALPHA = 0.08;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      dots.length = 0;
      for (let x = SPACING; x < canvas.width; x += SPACING) {
        for (let y = SPACING; y < canvas.height; y += SPACING) {
          dots.push({ x, y, alpha: BASE_ALPHA, target: BASE_ALPHA });
        }
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let mx = canvas.width / 2;
    let my = canvas.height / 2;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        const dist = Math.hypot(d.x - mx, d.y - my);
        d.target = dist < 180 ? BASE_ALPHA + (1 - dist / 180) * 0.35 : BASE_ALPHA;
        d.alpha += (d.target - d.alpha) * 0.08;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,230,223,${d.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="login-dots-canvas" />;
}


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [exiting, setExiting] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setExiting(true);
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setExiting(false);
        throw new Error("Error al iniciar sesion");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className={`login-root ${exiting ? "screen-transition" : ""}`}>
      <DotMatrix />
      <div className="login-vignette" />
      <div className="login-vignette-top" />

      <nav className="login-nav">
        <span className="login-nav-logo">lumio</span>
        <div className="login-nav-links">
          <span className="login-nav-link">Producto</span>
          <span className="login-nav-link">Pricing</span>
        </div>
        <button className="login-nav-btn" onClick={handleGoogleSignIn}>
          Entrar con Google
        </button>
      </nav>

      <div className="login-form-wrap">
        <h1 className="login-heading">Bienvenido</h1>
        <p className="login-subheading">
          Tu sistema de productividad te espera
        </p>

        {error && (
          <div
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              background: "rgba(244,67,54,0.15)",
              border: "1px solid rgba(244,67,54,0.3)",
              color: "#EF9A9A",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ width: "100%" }}>
          <div className="login-input-row">
            <input
              className="login-input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="login-btn-row">
            <button
              type="submit"
              className={`login-btn ${loading ? "login-btn-disabled" : "login-btn-white"}`}
              disabled={loading}
            >
              {loading ? "Entrando..." : "Continuar con email"}
            </button>
          </div>

          <div className="login-divider">
            <div className="login-divider-line" />
            <span className="login-divider-text">O</span>
            <div className="login-divider-line" />
          </div>

          <div className="login-btn-row">
            <button
              type="button"
              className="login-btn login-btn-outline"
              onClick={handleGoogleSignIn}
            >
              Continuar con Google
            </button>
          </div>
        </form>

        <p className="login-legal">
          Al continuar, aceptas los <a href="#">Terminos</a> y la{" "}
          <a href="#">Politica de privacidad</a>
        </p>
      </div>
    </div>
  );
}
