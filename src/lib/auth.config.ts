import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const providers: NextAuthConfig["providers"] = [];

// Google OAuth — solo si las credenciales están configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "placeholder") {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

// Credentials provider (authorize se maneja en auth.ts con Prisma)
providers.push(
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
    },
    // authorize vacío aquí — se sobreescribe en auth.ts
    async authorize() {
      return null;
    },
  })
);

export default {
  providers,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isAuthRoute =
        pathname.startsWith("/api/auth") || pathname === "/login";
      const isPublicRoute = pathname === "/";
      // Allow static PWA files without auth
      const isStaticFile =
        pathname === "/manifest.json" ||
        pathname === "/sw.js" ||
        pathname === "/apple-touch-icon.svg" ||
        pathname.startsWith("/icon-") ||
        pathname.startsWith("/api/auth/");

      if (isAuthRoute || isPublicRoute || isStaticFile) return true;

      if (!isLoggedIn) return false;

      return true;
    },
  },
} satisfies NextAuthConfig;
