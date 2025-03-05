import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import type { CustomerReference, ReferenceResult } from "./types"

// Function to generate references using Anthropic
export async function generateReferencesWithAnthropic(
  description: string,
  references: CustomerReference[],
): Promise<ReferenceResult[]> {
  try {
    // Format the references as JSON string
    const referencesJson = JSON.stringify(references, null, 2)

    // Create the prompt for Anthropic
    const prompt = `
Find the most relevant customer references based on this description: "${description}".

Available customer references:
${referencesJson}

Return only the most relevant 3-5 references as a valid JSON array. Each object in the array should have all the properties from the original reference plus a "confidence" field with a number between 0-100 indicating how well it matches the request.

Only include references where "approvedForPublicUse" is true.

If no suitable matches are found, return an empty array.
`

    // Call Anthropic API
    const { text } = await generateText({
      model: anthropic("claude-3-haiku-20240307"),
      prompt,
      temperature: 0.2,
      maxTokens: 4000,
    })

    // Parse the response
    try {
      const parsedResults = JSON.parse(text) as ReferenceResult[]
      return parsedResults
    } catch (error) {
      console.error("Failed to parse Anthropic response:", error)
      return []
    }
  } catch (error) {
    console.error("Error calling Anthropic:", error)
    throw error
  }
}

// Function to generate references using OpenAI
export async function generateReferencesWithOpenAI(
  description: string,
  references: CustomerReference[],
): Promise<ReferenceResult[]> {
  try {
    // Format the references as JSON string
    const referencesJson = JSON.stringify(references, null, 2)

    // Create the prompt for OpenAI
    const prompt = `
Find the most relevant customer references based on this description: "${description}".

Available customer references:
${referencesJson}

Return only the most relevant 3-5 references as a valid JSON array. Each object in the array should have all the properties from the original reference plus a "confidence" field with a number between 0-100 indicating how well it matches the request.

Only include references where "approvedForPublicUse" is true.

If no suitable matches are found, return an empty array.
`

    // Call OpenAI API
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.2,
      maxTokens: 4000,
    })

    // Parse the response
    try {
      const parsedResults = JSON.parse(text) as ReferenceResult[]
      return parsedResults
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error)
      return []
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    throw error
  }
}

