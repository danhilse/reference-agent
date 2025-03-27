"use server"

import { cookies } from "next/headers"
import { env } from "~/env.js"
import { z } from "zod"
import { createHash, timingSafeEqual } from "crypto"
import { getAuthSession } from "./auth"

// Cookie name for authenticated sessions
const DEMO_DISABLED_COOKIE = "auth-demo-disabled"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 week

/**
 * Check if demo mode is disabled (user has authenticated)
 * This checks both legacy password authentication and Okta authentication
 */
export async function isDemoDisabled(): Promise<boolean> {
  const cookieStore = cookies()
  const hasCookie = Boolean(cookieStore.get(DEMO_DISABLED_COOKIE))
  
  // If we have a cookie, return true immediately
  if (hasCookie) {
    return true
  }
  
  // Otherwise check if we have an active session
  const session = await getAuthSession()
  return Boolean(session?.user)
}

/**
 * Set the demo disabled cookie
 * This is used for compatibility with the old system during transition
 */
export async function setDemoDisabledCookie(): Promise<void> {
  const cookieStore = cookies()
  
  // Create a secure value for the cookie
  const value = createHash("sha256")
    .update(`${Date.now()}-authenticated`)
    .digest("hex")
  
  // Set the cookie
  cookieStore.set({
    name: DEMO_DISABLED_COOKIE,
    value,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "strict",
  })
}

/**
 * Clear the demo disabled cookie
 * Used when logging out
 */
export async function clearDemoDisabledCookie(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(DEMO_DISABLED_COOKIE)
}

// Legacy password validation for backwards compatibility during transition
// ------ This section can be removed once fully migrated to Okta ------

// Schema for password validation
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

/**
 * Creates a hash of the provided password for secure comparison
 */
function hashPassword(password: string): Buffer {
  return createHash("sha256").update(password).digest()
}

/**
 * Validates the provided password against the environment variable
 * Uses timing-safe comparison to prevent timing attacks
 */
function validatePasswordSecurely(password: string): boolean {
  try {
    // Create hash of the provided password
    const providedHash = hashPassword(password)
    // Create hash of the actual password from environment
    const actualHash = hashPassword(env.FULL_PASS)
    
    // Use timing-safe comparison to prevent timing attacks
    return timingSafeEqual(providedHash, actualHash)
  } catch (error) {
    console.error("Error validating password:", error)
    return false
  }
}

/**
 * Legacy server action to validate password
 * Returns whether the password is correct and sets a cookie if successful
 */
export async function validateDemoPassword(formData: FormData) {
  const result = passwordSchema.safeParse({
    password: formData.get("password"),
  })

  if (!result.success) {
    return { 
      success: false, 
      error: "Invalid input" 
    }
  }

  // Validate the password
  const isValid = validatePasswordSecurely(result.data.password)

  if (isValid) {
    await setDemoDisabledCookie()
  }

  return { 
    success: isValid,
    error: isValid ? null : "Incorrect password"
  }
}