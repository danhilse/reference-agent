import { type NextAuthOptions } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { env } from "~/env.js";

export const authOptions: NextAuthOptions = {
  providers: [
    OktaProvider({
      clientId: env.OKTA_CLIENT_ID,
      clientSecret: env.OKTA_CLIENT_SECRET,
      issuer: env.OKTA_ISSUER,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  debug: process.env.NODE_ENV === "development",
};