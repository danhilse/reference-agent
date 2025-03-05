"use server"

import type { CustomerReference, ReferenceRequest, ReferenceResult } from "./types"
import { customerReferences } from "./data"
import { generateReferencesWithAnthropic, generateReferencesWithOpenAI } from "./ai"

// Demo mode references with pre-calculated confidence scores
const demoReferences: ReferenceResult[] = [
  {
    ...customerReferences[1]!,
    confidence: 95,
  } as ReferenceResult,
  {
    ...customerReferences[3]!,
    confidence: 87,
  } as ReferenceResult,
  {
    ...customerReferences[8]!,
    confidence: 78,
  } as ReferenceResult,
]

// Update the findReferences function to use the specified AI provider
export async function findReferences(request: ReferenceRequest): Promise<ReferenceResult[]> {
  const { description, filters, demoMode, aiProvider = "anthropic" } = request

  try {
    // If demo mode is enabled, return demo references with a small delay
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return demoReferences
    }

    // Validate input
    if (!description || description.trim().length === 0) {
      throw new Error("Please provide a description of what you're looking for")
    }

    // Filter references based on user-selected filters
    let filteredReferences = customerReferences.filter((ref) => ref.approvedForPublicUse)

    if (filters.industry) {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.industry.toLowerCase() === filters.industry!.toLowerCase(),
      )
    }

    if (filters.marketSegment) {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.marketSegment.toLowerCase() === filters.marketSegment!.toLowerCase(),
      )
    }

    if (filters.useCase) {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.useCase.toLowerCase() === filters.useCase!.toLowerCase()
      )
    }

    if (filters.crmType) {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.crm.toLowerCase() === filters.crmType!.toLowerCase()
      )
    }

    // If no references match the filters, return empty array
    if (filteredReferences.length === 0) {
      return []
    }

    // Use the specified AI provider to find relevant references
    try {
      if (aiProvider === "openai") {
        return await generateReferencesWithOpenAI(description, filteredReferences)
      } else {
        return await generateReferencesWithAnthropic(description, filteredReferences)
      }
    } catch (error) {
      console.error(`Error with ${aiProvider}:`, error)
      // Fall back to other provider if one fails
      try {
        if (aiProvider === "openai") {
          console.log("Falling back to Anthropic...")
          return await generateReferencesWithAnthropic(description, filteredReferences)
        } else {
          console.log("Falling back to OpenAI...")
          return await generateReferencesWithOpenAI(description, filteredReferences)
        }
      } catch (fallbackError) {
        console.error("Fallback provider also failed:", fallbackError)
        // If both AI providers fail, fall back to keyword matching
        return fallbackKeywordMatching(description, filteredReferences)
      }
    }
  } catch (error) {
    console.error("Error in findReferences:", error)
    throw error
  }
}

// Fallback function that uses basic keyword matching if both AI APIs fail
function fallbackKeywordMatching(description: string, references: CustomerReference[]): ReferenceResult[] {
  console.log("Using fallback keyword matching")
  const keywords = description.toLowerCase().split(/\s+/).filter(word => word.length > 3)

  const results = references.map((ref) => {
    const refText = `${ref.referenceDetail} ${ref.useCase} ${ref.capability}`.toLowerCase()

    // Count matches and calculate a confidence score
    let matchCount = 0
    keywords.forEach((keyword) => {
      if (refText.includes(keyword)) {
        matchCount++
      }
    })

    // Calculate confidence score
    const confidence = Math.min(Math.round((matchCount / Math.max(keywords.length, 1)) * 100), 98)

    return {
      ...ref,
      confidence: confidence > 0 ? Math.max(confidence, 60) : 0,
    }
  })

  // Return top 5 matches with a confidence > 0
  return results
    .filter((result) => result.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
}