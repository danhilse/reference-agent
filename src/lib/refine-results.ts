// src/lib/refine-results.ts
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import type { ReferenceResult } from "./types";
import { aiConfig } from "./ai-config";

export interface RefinedReferenceResult extends ReferenceResult {
  highlights?: Array<{ text: string; relevance: string; }>;  // Match the format in ReferenceResult
  revisedConfidence?: number;  // Optional revised confidence score
}

interface RefinementResult {
  id: number;
  revisedConfidence: number;
  highlights: string[];
}

/**
 * Refines search results by re-evaluating relevance and identifying key phrases
 * based on the original search request.
 * 
 * @param originalRequest The user's original unmodified request (not the optimized query)
 * @param results The search results to refine
 * @param limit Maximum number of results to return
 */
export async function refineSearchResults(
  originalRequest: string,
  results: ReferenceResult[],
  limit = 5
): Promise<ReferenceResult[]> {
  try {
    // If no results, return empty array
    if (!results.length) return [];
    
    console.log(`Refining ${results.length} search results with original user request: "${originalRequest}"`);
    
    // Prepare the results for the refinement prompt - use array index as ID
    const referencesForPrompt = results.map((ref, index) => ({
      id: index,
      company: ref.customerName,
      quote: ref.referenceDetail,
      useCase: ref.useCase,
      industry: ref.industry,
      marketSegment: ref.marketSegment,
      currentConfidence: ref.confidence
    }));
    
    // Format the search results as JSON string
    const referencesJson = JSON.stringify(referencesForPrompt, null, 2);
    
    // Create the prompt for refining results
    const prompt = `
You are an expert in analyzing customer references for Act-On Software, a marketing automation platform.
The sales rep's original search request was: "${originalRequest}"

I need you to analyze these search results to:
1. Re-evaluate the confidence score (0-100) for each reference based on how well it truly addresses the original request
2. Identify 1-3 very concise key phrases within each quote that directly address the search request
3. Pay special attention to references that mention complete feature sets matching the request
4. Give higher confidence to references that mention the exact features requested, even if spelling or terminology varies slightly (e.g., "Advance Social" vs "Advanced Social Media")

IMPORTANT: Use the sales rep's original request as the basis for evaluation, not any inferred or optimized version.

Here are the search results you need to analyze:
${referencesJson}

For each reference, provide:
- id: The reference ID from the input
- revisedConfidence: Your refined confidence score (0-100)
- highlights: An array of 0-3 specific text fragments from the quote that best match the search request

CRITICAL GUIDELINES FOR HIGHLIGHTS:
1. Each highlight MUST be an EXACT substring that appears in the quote without any changes
2. Highlights should be VERY CONCISE - ideally 2-5 words focusing on just the key data points
3. For metrics and statistics, extract ONLY the specific measurement (e.g., "45-60% email engagement rates" → "45-60%")
4. For results, focus on the specific outcome, not explanatory text
5. Verify that each highlight string exists in the quote EXACTLY as provided
6. Do not modify the text in any way - not even punctuation or capitalization
7. Choose fragments that best address what the sales rep was actually looking for in their original request
8. When searching for features, prioritize exact feature mentions even with slight terminology differences

Return your analysis as a JSON array in this format:
[
  {
    "id": 0,
    "revisedConfidence": 92,
    "highlights": ["45-60%", "fantastic results"]
  },
  {
    "id": 1,
    "revisedConfidence": 85,
    "highlights": ["10x increase", "$10,000 in annual savings"]
  }
]

Return ONLY a valid JSON array with NO additional text, explanation, or markdown formatting.
`;

    // Call Anthropic API for refinement analysis
    const { text } = await generateText({
      model: anthropic(aiConfig.anthropic.model),
      prompt,
      temperature: 0.1,  // Low temperature for consistent results
      maxTokens: aiConfig.anthropic.maxTokens,
    });
    
    // Parse the response
    try {
      // Log the raw response for debugging (just the first 500 chars)
      console.log("Raw refinement response preview:", text.substring(0, 500) + (text.length > 500 ? "..." : ""));
      
      const refinementResults = JSON.parse(text) as RefinementResult[];
      
      // Map the refinement results back to the original reference objects
      const refinedReferences = results.map((originalRef, idx) => {
        // Look for the refinement result with matching ID
        const refinement = refinementResults.find((r: RefinementResult) => r.id === idx);
        
        if (!refinement) {
          console.log(`No refinement found for reference ${idx} (${originalRef.customerName}), using original`);
          return originalRef;
        }
        
        // Create the refined reference with highlights in the correct format
        return {
          ...originalRef,
          highlights: refinement.highlights ? 
            refinement.highlights.map(text => ({ text, relevance: "high" })) : 
            undefined,
          // Use the revised confidence if available, otherwise keep the original
          confidence: refinement.revisedConfidence || originalRef.confidence
        };
      });
      
      // Log a more concise summary of the final results
      console.log("Refinement summary:", 
        refinedReferences.map(ref => ({
          customerName: ref.customerName,
          confidence: ref.confidence,
          highlights: ref.highlights?.map(h => h.text.substring(0, 30) + (h.text.length > 30 ? "..." : ""))
        }))
      );
      
      // Sort by the (potentially updated) confidence scores and limit results
      return refinedReferences
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, limit);
    } catch (error) {
      console.error("Failed to parse refinement response:", error, "Raw response:", text);
      // Fall back to the original results if parsing fails
      return results.slice(0, limit);
    }
  } catch (error) {
    console.error("Error refining search results:", error);
    // Return the original results if refinement fails
    return results.slice(0, limit);
  }
}