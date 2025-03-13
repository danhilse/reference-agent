import { generateText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { openai } from "@ai-sdk/openai"
import type { CustomerReference, ReferenceResult } from "./types"
import { env } from "~/env.js"
import { aiConfig } from "./ai-config"

// Extract only the fields needed for matching to reduce token usage
function prepareReferencesForAI(references: CustomerReference[]) {
  return references.map((ref, index) => ({
    id: index, // Use array index as a simple id for matching back
    customerName: ref.customerName,
    industry: ref.industry,
    marketSegment: ref.marketSegment,
    useCase: ref.useCase,
    capability: ref.capability,
    referenceDetail: ref.referenceDetail,
    crm: ref.crm,
  }))
}

// Function to generate references using Anthropic
export async function generateReferencesWithAnthropic(
  description: string,
  references: CustomerReference[],
): Promise<ReferenceResult[]> {
  try {
    // Prepare simplified reference data for AI
    const simplifiedReferences = prepareReferencesForAI(references)
    
    // Format the simplified references as JSON string
    const referencesJson = JSON.stringify(simplifiedReferences, null, 2)

    // Create a more detailed prompt for Anthropic
    const prompt = `
You are an expert sales assistant for Act-On Software, a marketing automation platform.
Your task is to find the most relevant customer references based on this sales rep's request: "${description}".

Available customer references:
${referencesJson}

I need you to:
1. Identify the 3-8 most relevant customer references that best match the sales rep's needs.
2. Assign a confidence score (0-100) to each match, indicating how well it addresses the request.
3. Only include references that are truly relevant to the request.
4. When matching features, prioritize references that mention THE EXACT FEATURE SET, even if there are minor variations in terminology (e.g., "Advance Social" vs "Advanced Social Media").
5. Consider the entire context of the request rather than focusing on individual keywords.

Return your response as a JSON array of objects with these properties:
- id: The reference ID (number)
- confidence: Your confidence score (number between 0-100)

Example output format:
[
  {"id": 2, "confidence": 95},
  {"id": 0, "confidence": 82},
  {"id": 5, "confidence": 78}
]

IMPORTANT: Return ONLY the JSON array with NO additional text, explanation, or markdown formatting.
`;

    // Call Anthropic API using config values
    const { text } = await generateText({
      model: anthropic(aiConfig.anthropic.model),
      prompt,
      temperature: aiConfig.anthropic.temperature,
      maxTokens: aiConfig.anthropic.maxTokens,
    })

    // Parse the response and map back to full reference objects
    try {
      type Match = { id: number; confidence: number }[];
      const parsedMatches = JSON.parse(text) as Match;
      
      // Transform the minimal matches back to full ReferenceResult objects
      const results = parsedMatches.map((match: { id: number; confidence: number }) => ({
        ...references[match.id],
        confidence: match.confidence
      })) as ReferenceResult[]
      
      return results
    } catch (error) {
      console.error("Failed to parse Anthropic response:", error, "Raw response:", text)
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
    // Prepare simplified reference data for AI
    const simplifiedReferences = prepareReferencesForAI(references)
    
    // Format the simplified references as JSON string
    const referencesJson = JSON.stringify(simplifiedReferences, null, 2)

    // Create a more detailed prompt for OpenAI
    const prompt = `
You are an expert sales assistant for Act-On Software, a marketing automation platform.
Your task is to find the most relevant customer references based on this sales rep's request: "${description}".

Available customer references:
${referencesJson}

I need you to:
1. Identify the 3-8 most relevant customer references that best match the sales rep's needs.
2. Assign a confidence score (0-100) to each match, indicating how well it addresses the request.
3. Only include references that are truly relevant to the request.

Return your response as a JSON array of objects with these properties:
- id: The reference ID (number)
- confidence: Your confidence score (number between 0-100)

Example output format:
[
  {"id": 2, "confidence": 95},
  {"id": 0, "confidence": 82},
  {"id": 5, "confidence": 78}
]

IMPORTANT: Return ONLY the JSON array with NO additional text, explanation, or markdown formatting.
`

    // Call OpenAI API using config values
    const { text } = await generateText({
      model: openai(aiConfig.openai.model),
      prompt,
      temperature: aiConfig.openai.temperature,
      maxTokens: aiConfig.openai.maxTokens,
    })

    // Parse the response and map back to full reference objects
    try {
      type Match = { id: number; confidence: number }[];
      const parsedMatches = JSON.parse(text) as Match;
      
      // Transform the minimal matches back to full ReferenceResult objects
      const results = parsedMatches.map((match: { id: number; confidence: number }) => ({
        ...references[match.id],
        confidence: match.confidence
      })) as ReferenceResult[]
      
      return results
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error, "Raw response:", text)
      return []
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    throw error
  }
}