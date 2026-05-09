import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/src/lib/prisma";
import { consumeVerifyToken } from "@/src/lib/otp";
import authConfig from "@/src/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers.filter(
      (p) => (p as { id?: string }).id !== "credentials" && (p as { name?: string }).name !== "Email"
    ),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const token = credentials?.token as string | undefined;
        if (!email || !token) return null;

        const valid = await consumeVerifyToken(email, token);
        if (!valid) return null;

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
