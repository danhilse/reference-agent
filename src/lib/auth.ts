import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { cookies } from "next/headers";

const DEMO_DISABLED_COOKIE = "auth-demo-disabled";

/**
 * Helper to get the server session
 */
export const getAuthSession = async () => {
  return await getServerSession(authOptions);
};

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