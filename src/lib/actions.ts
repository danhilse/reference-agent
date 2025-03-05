"use server"

import type { CustomerReference, ReferenceRequest, ReferenceResult } from "./types"
import { customerReferences } from "./data"
import { generateReferencesWithAnthropic, generateReferencesWithOpenAI } from "./ai"

// Demo mode references with pre-calculated confidence scores
const demoReferences: ReferenceResult[] = [
  {
    ...customerReferences[1], // TechSolutions Inc
    confidence: 95,
  },
  {
    ...customerReferences[3], // EduTech Learning
    confidence: 87,
  },
  {
    ...customerReferences[8], // Healthcare Solutions
    confidence: 78,
  },
]

// Update the findReferences function to use the specified AI provider
export async function findReferences(request: ReferenceRequest): Promise<ReferenceResult[]> {
  const { description, filters, demoMode, aiProvider = "anthropic" } = request

  // If demo mode is enabled, return demo references
  if (demoMode) {
    // Add a small delay to simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return demoReferences
  }

  // Filter references based on user-selected filters
  let filteredReferences = customerReferences.filter((ref) => ref.approvedForPublicUse)

  if (filters.industry) {
    filteredReferences = filteredReferences.filter(
      (ref) => ref.industry.toLowerCase() === filters.industry.toLowerCase(),
    )
  }

  if (filters.marketSegment) {
    filteredReferences = filteredReferences.filter(
      (ref) => ref.marketSegment.toLowerCase() === filters.marketSegment.toLowerCase(),
    )
  }

  if (filters.useCase) {
    filteredReferences = filteredReferences.filter((ref) => ref.useCase.toLowerCase() === filters.useCase.toLowerCase())
  }

  if (filters.crmType) {
    filteredReferences = filteredReferences.filter((ref) => ref.crm.toLowerCase() === filters.crmType.toLowerCase())
  }

  try {
    // Use the specified AI provider
    if (aiProvider === "openai") {
      return await generateReferencesWithOpenAI(description, filteredReferences)
    } else {
      return await generateReferencesWithAnthropic(description, filteredReferences)
    }
  } catch (error) {
    console.error(`Error with ${aiProvider}, falling back to keyword matching:`, error)

    // If the AI API fails, fall back to basic keyword matching
    return fallbackKeywordMatching(description, filteredReferences)
  }
}

// Fallback function that uses basic keyword matching if both AI APIs fail
function fallbackKeywordMatching(description: string, references: CustomerReference[]): ReferenceResult[] {
  const keywords = description.toLowerCase().split(/\s+/)

  const results = references.map((ref) => {
    const refText = `${ref.referenceDetail} ${ref.useCase} ${ref.capability}`.toLowerCase()

    let matchCount = 0
    keywords.forEach((keyword) => {
      if (keyword.length > 3 && refText.includes(keyword)) {
        matchCount++
      }
    })

    const confidence = Math.min(Math.round((matchCount / Math.max(keywords.length, 1)) * 100), 98)

    return {
      ...ref,
      confidence: confidence > 0 ? Math.max(confidence, 60) : 0,
    }
  })

  return results
    .filter((result) => result.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5)
}

