"use server"

import { cookies } from "next/headers"
import { env } from "~/env.js"
import { z } from "zod"
import { createHash, timingSafeEqual } from "crypto"

// Schema for password validation
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
})

// Cookie name for authenticated sessions
const COOKIE_NAME = "auth-demo-disabled"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 week

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
 * Server action to validate password
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
    // Set a signed cookie to remember the valid authentication
    const cookieStore = await cookies()
    
    // Create a secure value for the cookie
    const value = createHash("sha256")
      .update(`${Date.now()}-${env.FULL_PASS}`)
      .digest("hex")
    
    // Set the cookie
    cookieStore.set({
      name: COOKIE_NAME,
      value,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "strict",
    })
  }

  return { 
    success: isValid,
    error: isValid ? null : "Incorrect password"
  }
}

/**
 * Check if demo mode is disabled (user has authenticated)
 */
export async function isDemoDisabled(): Promise<boolean> {
  const cookieStore = await cookies()
  return Boolean(cookieStore.get(COOKIE_NAME))
}