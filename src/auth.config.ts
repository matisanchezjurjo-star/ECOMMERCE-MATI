import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config — no adapter, no bcrypt, no
 * providers. `proxy.ts` runs in the Edge runtime on every request and only
 * needs to verify/decode the JWT session cookie; it must never pull in
 * Node-only dependencies (Prisma's `pg` driver, bcryptjs) or the whole
 * bundle hangs/fails to compile for that runtime. The full config with
 * providers and the database adapter lives in `auth.ts`, which only runs in
 * the Node runtime (route handlers, server actions).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
