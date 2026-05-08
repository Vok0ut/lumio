import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import authConfig from "@/src/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Re-declare providers here with full authorize logic that uses Prisma
    ...authConfig.providers.filter(
      (p) => (p as { id?: string }).id !== "credentials" && (p as { name?: string }).name !== "Email"
    ),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        if (!email) return null;

        // Buscar o crear usuario
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, name: email.split("@")[0] },
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
