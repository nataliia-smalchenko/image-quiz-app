import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          },
        );
        const user = await res.json();
        if (res.ok && user) return user;
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.provider === "google") {
        // synchronize the Google user with our database
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: token.email,
              name: token.name,
              google_id: token.sub,
            }),
          },
        );
        const data = await res.json();
        token.backendId = data.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.backendId as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
