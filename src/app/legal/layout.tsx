import Link from "next/link";
import { LumioLogo } from "@/src/components/ui/lumio-logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="legal-root">
      <nav className="legal-nav">
        <Link href="/login" className="legal-nav-brand">
          <LumioLogo size={22} />
          <span className="legal-nav-logo">lumio</span>
        </Link>
        <div className="legal-nav-links">
          <Link href="/legal/privacy" className="legal-nav-link">Privacidad</Link>
          <Link href="/legal/terms" className="legal-nav-link">Terminos</Link>
          <Link href="/legal/cookies" className="legal-nav-link">Cookies</Link>
        </div>
      </nav>
      <main className="legal-content">
        {children}
      </main>
      <footer className="legal-footer">
        <p>&copy; {new Date().getFullYear()} Lumio. Todos los derechos reservados.</p>
        <div className="legal-footer-links">
          <Link href="/legal/privacy">Privacidad</Link>
          <Link href="/legal/terms">Terminos</Link>
          <Link href="/legal/cookies">Cookies</Link>
          <Link href="/login">Volver a Lumio</Link>
        </div>
      </footer>
    </div>
  );
}
