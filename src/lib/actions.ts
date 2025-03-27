"use server"

import type { CustomerReference, ReferenceRequest, ReferenceResult } from "./types"
import { customerReferences } from "./data"
import { generateReferencesWithAnthropic, generateReferencesWithOpenAI, generateReferencesWithGemini } from "./ai"
import { generateMockResults } from "./mock-data"
import { interpretRequest } from "./interpreter"
import { refineSearchResults } from "./refine-results"
import { isProviderConfigured } from "./ai-config"

// Update the findReferences function to include the refinement step
export async function findReferences(request: ReferenceRequest): Promise<ReferenceResult[]> {
  try {
    // Step 1: First interpret and enhance the request
    const enhancedRequest = await interpretRequest(request)
    
    // Step 2: Extract the enhanced parameters
    const { description, filters, demoMode, aiProvider = "anthropic", optimizedQuery } = enhancedRequest
    
    // Store the original request description for refinement later
    const originalRequest = request.description
    
    console.log("Final request filters for search:", filters)
    console.log("Using optimized query for search:", optimizedQuery)

    // If demo mode is enabled, return mock results with a small delay
    if (demoMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      return generateMockResults(5, filters) // Generate 5 random references that match filters
    }

    // Validate input
    if (!description || description.trim().length === 0) {
      throw new Error("Please provide a description of what you're looking for")
    }

    // Filter references based on user-selected filters
    let filteredReferences = customerReferences.filter((ref) => ref.approvedForPublicUse)
    console.log(`Starting with ${filteredReferences.length} approved references`)

    if (filters.industry && filters.industry.trim() !== '') {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.industry.toLowerCase() === filters.industry.toLowerCase(),
      )
      console.log(`After industry filter (${filters.industry}): ${filteredReferences.length} references`)
    }

    if (filters.marketSegment && filters.marketSegment.trim() !== '') {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.marketSegment.toLowerCase() === filters.marketSegment.toLowerCase(),
      )
      console.log(`After market segment filter (${filters.marketSegment}): ${filteredReferences.length} references`)
    }

    if (filters.useCase && filters.useCase.trim() !== '') {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.useCase.toLowerCase() === filters.useCase.toLowerCase()
      )
      console.log(`After use case filter (${filters.useCase}): ${filteredReferences.length} references`)
    }

    if (filters.crmType && filters.crmType.trim() !== '') {
      filteredReferences = filteredReferences.filter(
        (ref) => ref.crm.toLowerCase() === filters.crmType.toLowerCase()
      )
      console.log(`After CRM type filter (${filters.crmType}): ${filteredReferences.length} references`)
    }
    
    // Filter by company if provided
    if (filters.company && filters.company.trim() !== '') {
      console.log("Filtering by company:", filters.company)
      const beforeCount = filteredReferences.length
      filteredReferences = filteredReferences.filter(
        (ref) => 
          ref.customerName.toLowerCase().includes(filters.company!.toLowerCase()) ||
          ref.accountName.toLowerCase().includes(filters.company!.toLowerCase())
      )
      console.log(`After company filter (${filters.company}): ${filteredReferences.length} references (reduced from ${beforeCount})`)
    }

    // If no references match the filters, return empty array
    if (filteredReferences.length === 0) {
      console.log("No references match the filters, returning empty array")
      return []
    }

    console.log(`Sending ${filteredReferences.length} references to AI for ranking`)
    
    // Use the specified AI provider to find relevant references
    let initialResults: ReferenceResult[] = []
    
    try {
      // Step 3: Get initial matches using the specified AI provider and the OPTIMIZED query
      if (aiProvider === "openai" && isProviderConfigured("openai")) {
        initialResults = await generateReferencesWithOpenAI(optimizedQuery, filteredReferences)
      } else if (aiProvider === "gemini" && isProviderConfigured("gemini")) {
        initialResults = await generateReferencesWithGemini(optimizedQuery, filteredReferences)
      } else {
        initialResults = await generateReferencesWithAnthropic(optimizedQuery, filteredReferences)
      }
      
      // Step 4: Refine the results with a second AI pass if we have results and Anthropic is configured
      // Important: Use the ORIGINAL request for refinement to ensure matching against user's intent
      if (initialResults.length > 0 && isProviderConfigured("anthropic")) {
        console.log("Refining search results to identify key highlights...")
        try {
          const refinedResults = await refineSearchResults(originalRequest, initialResults)
          console.log(`Refined ${refinedResults.length} results with highlights`)
          
          // Debug: Log a minimal summary of each result's highlights
          refinedResults.forEach((result, idx) => {
            console.log(`Result ${idx} (${result.customerName}): ${result.confidence}% confidence, ${result.highlights?.length ?? 0} highlights`)
          })
          
          return refinedResults
        } catch (refineError) {
          console.error("Error during refinement stage:", refineError)
          // If refinement fails, return the initial results
          return initialResults
        }
      }
      
      return initialResults
      
    } catch (error) {
      console.error(`Error with ${aiProvider}:`, error)
      // Fall back to other provider if one fails
      try {
        // Try to fall back to any available provider
        if (aiProvider !== "anthropic" && isProviderConfigured("anthropic")) {
          console.log("Falling back to Anthropic...")
          initialResults = await generateReferencesWithAnthropic(optimizedQuery, filteredReferences)
        } else if (aiProvider !== "openai" && isProviderConfigured("openai")) {
          console.log("Falling back to OpenAI...")
          initialResults = await generateReferencesWithOpenAI(optimizedQuery, filteredReferences)
        } else if (aiProvider !== "gemini" && isProviderConfigured("gemini")) {
          console.log("Falling back to Gemini...")
          initialResults = await generateReferencesWithGemini(optimizedQuery, filteredReferences)
        }
        
        // Try to refine with the fallback results if we have them
        // Again, use the ORIGINAL request for refinement
        if (initialResults.length > 0 && isProviderConfigured("anthropic")) {
          console.log("Refining fallback search results...")
          const refinedResults = await refineSearchResults(originalRequest, initialResults)
          return refinedResults
        }
        
        return initialResults
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
    // Include more reference fields for better matching
    const refText = `${ref.referenceDetail} ${ref.useCase} ${ref.capability} ${ref.customerName}`.toLowerCase()

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