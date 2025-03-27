import { NextAuthOptions, getServerSession } from "next-auth";
import OktaProvider from "next-auth/providers/okta";
import { env } from "~/env.js";
import { cookies } from "next/headers";

const DEMO_DISABLED_COOKIE = "auth-demo-disabled";

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  providers: [
    OktaProvider({
      clientId: env.OKTA_CLIENT_ID,
      clientSecret: env.OKTA_CLIENT_SECRET,
      issuer: env.OKTA_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the Okta access token and user info to the token
      if (account && profile) {
        token.accessToken = account.access_token;
        token.id = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      
      // Set the demo mode cookie when authenticated
      const cookieStore = cookies();
      cookieStore.set({
        name: DEMO_DISABLED_COOKIE,
        value: "true",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
        sameSite: "strict",
      });
      
      return session;
    },
  },
  pages: {
    signIn: '/', // We'll handle the sign-in within our tooltip
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};

/**
 * Helper to get the server session
 */
export const getAuthSession = () => getServerSession(authOptions);

/**
 * Check if the user is authenticated (demo mode disabled)
 */
export async function isDemoDisabled(): Promise<boolean> {
  const cookieStore = cookies();
  
  // First check if the user has the demo disabled cookie
  if (cookieStore.get(DEMO_DISABLED_COOKIE)) {
    return true;
  }
  
  // Then check if the user is authenticated with NextAuth
  const session = await getAuthSession();
  return !!session?.user;
}