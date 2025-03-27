import { env } from "~/env.js"

// AI configuration settings
export const aiConfig = {
  anthropic: {
    apiKey: env.ANTHROPIC_API_KEY,
    model: "claude-3-7-sonnet-latest",
    maxTokens: 1000,
    temperature: 0.2,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: "gpt-4o",
    maxTokens: 1000,
    temperature: 0.2,
  },
  gemini: {
    apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    model: "gemini-2.5-pro-latest",
    maxTokens: 1000,
    temperature: 0.2,
  },
  defaults: {
    provider: "anthropic" as "anthropic" | "openai" | "gemini",
    resultsLimit: 5,
  }
}

// Convenience function to check if an API is configured
export function isProviderConfigured(provider: "anthropic" | "openai" | "gemini"): boolean {
  if (provider === "anthropic") {
    return Boolean(env.ANTHROPIC_API_KEY)
  } else if (provider === "openai") {
    return Boolean(env.OPENAI_API_KEY)
  } else if (provider === "gemini") {
    return Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY)
  }
  return false
}