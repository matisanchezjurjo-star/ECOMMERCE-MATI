import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { ensureOrganizationForUser } from "@/lib/org";
import { authConfig } from "@/auth.config";

const providers: Provider[] = [
  Credentials({
    name: "Email and password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (credentials) => {
      const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : undefined;
      const password = typeof credentials?.password === "string" ? credentials.password : undefined;
      if (!email || !password) return null;

      const user = await db.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) return null;

      return { id: user.id, email: user.email, name: user.name, image: user.image };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  );
}

export const isGoogleAuthEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Credentials-based sign-in bypasses the adapter's user creation, so
  // sessions must be JWT-backed; the adapter still manages OAuth account
  // linkage (Google) and session/verification-token bookkeeping. This full
  // config (adapter + providers) only runs in the Node runtime — never
  // import this file from proxy.ts, which needs the edge-safe authConfig.
  adapter: PrismaAdapter(db) as ReturnType<typeof PrismaAdapter>,
  providers,
  events: {
    async createUser({ user }) {
      // Fires for adapter-created users (Google OAuth sign-up). Credentials
      // sign-up creates the organization itself in the register action.
      if (user.id) await ensureOrganizationForUser(user.id, user.name ?? user.email ?? "My Workspace");
    },
  },
});
