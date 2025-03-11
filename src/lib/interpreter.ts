// lib/interpreter.ts
import { abbreviations } from "~/constants/abbreviations";
import { entityList } from "~/constants/entity_list";
import type { ReferenceFilter, ReferenceRequest } from "./types";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { aiConfig } from "./ai-config";

/**
 * Interprets and enhances a reference request by:
 * 1. Expanding abbreviations
 * 2. Using AI to improve clarity and infer filters
 * 3. Falling back to rule-based processing if AI fails
 */
export async function interpretRequest(
  request: ReferenceRequest
): Promise<ReferenceRequest> {
  console.log("Original request:", request);
  
  try {
    // Step 1: Expand abbreviations in the description
    const improvedDescription = expandAbbreviations(request.description);
    console.log("After abbreviation expansion:", improvedDescription);
    
    // Step 2: Use AI to improve the request and infer filters
    const enhancedResult = await enhanceRequestWithAI(improvedDescription);
    
    // Step 3: Combine existing filters with inferred filters from AI
    // User-provided filters take precedence over inferred ones
    const inferredFilters: ReferenceFilter = { 
      industry: request.filters.industry ?? '',
      marketSegment: request.filters.marketSegment ?? '',
      useCase: request.filters.useCase ?? '',
      crmType: request.filters.crmType ?? '',
      company: request.filters.company ?? ''
    };
    
    // Only add inferred industry filter if it wasn't already set by the user
    if (enhancedResult.inferredFilters.industry && !inferredFilters.industry) {
      inferredFilters.industry = enhancedResult.inferredFilters.industry;
    }
    
    // Only add inferred market segment filter if it wasn't already set by the user
    if (enhancedResult.inferredFilters.marketSegment && !inferredFilters.marketSegment) {
      inferredFilters.marketSegment = enhancedResult.inferredFilters.marketSegment;
    }
    
    // Add company filter if it wasn't already set
    if (enhancedResult.inferredFilters.company && !inferredFilters.company) {
      console.log("Setting company filter to:", enhancedResult.inferredFilters.company);
      inferredFilters.company = enhancedResult.inferredFilters.company;
    }
    
    // Step 4: Create the improved request object
    const improvedRequest: ReferenceRequest = {
      ...request,
      description: enhancedResult.improvedDescription || improvedDescription,
      filters: inferredFilters,
    };
    
    console.log("Final company filter value:", inferredFilters.company);
    console.log("Improved request filters:", improvedRequest.filters);
    return improvedRequest;
  } catch (error) {
    console.error("Error in request interpreter:", error);
    // Fall back to basic interpretation if AI enhancement fails
    return basicInterpretation(request);
  }
}

/**
 * Fallback function for basic interpretation without AI
 */
function basicInterpretation(request: ReferenceRequest): ReferenceRequest {
  console.log("Using fallback basic interpretation");
  
  const expandedDescription = expandAbbreviations(request.description);
  const inferredFilters = inferConservativeFilters(expandedDescription, request.filters);
  
  const improvedRequest = {
    ...request,
    description: expandedDescription,
    filters: inferredFilters,
  };
  
  console.log("Basic improved request filters:", improvedRequest.filters);
  console.log("Basic improved request:", improvedRequest);
  return improvedRequest;
}

/**
 * Expands common abbreviations in the description
 */
function expandAbbreviations(description: string): string {
  let expandedDescription = description;
  
  abbreviations.forEach(([abbr, expansion]) => {
    // Create a regex to match the abbreviation as a whole word
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    
    // Replace the abbreviation with its expansion
    expandedDescription = expandedDescription.replace(regex, String(expansion));
  });
  
  return expandedDescription;
}

/**
 * Uses very conservative rule-based matching to infer only industry and market segment filters
 * when they are explicitly mentioned in the description
 */
function inferConservativeFilters(
  description: string, 
  existingFilters: ReferenceFilter
): ReferenceFilter {
  const inferredFilters: ReferenceFilter = { 
    industry: existingFilters.industry ?? '',
    marketSegment: existingFilters.marketSegment ?? '',
    useCase: existingFilters.useCase ?? '',
    crmType: existingFilters.crmType ?? '',
    company: existingFilters.company ?? ''
  };
  
  const lowerDescription = description.toLowerCase();
  
  // Check if industries are explicitly mentioned - use whole word matching with industry-specific keywords
  if (!inferredFilters.industry) {
    for (const industry of entityList.industries) {
      // Only match if the word "industry" or "sector" appears near the industry name
      const industryPattern = new RegExp(`\\b${industry.toLowerCase()}\\b.{0,20}\\b(industry|sector)\\b|\\b(industry|sector)\\b.{0,20}\\b${industry.toLowerCase()}\\b`, 'i');
      if (industryPattern.test(lowerDescription)) {
        inferredFilters.industry = industry;
        break; // Only pick the first mentioned industry
      }
    }
  }
  
  // Check if market segments are explicitly mentioned - use whole word matching
  if (!inferredFilters.marketSegment) {
    for (const segment of entityList.marketSegments) {
      const regex = new RegExp(`\\b${segment.toLowerCase()}\\b`, 'i');
      if (regex.test(lowerDescription)) {
        inferredFilters.marketSegment = segment;
        break;
      }
    }
  }
  
  // Check if companies are explicitly mentioned - use whole word matching
  if (!inferredFilters.company) {
    for (const company of entityList.companies) {
      const regex = new RegExp(`\\b${company.toLowerCase().replace(/[.,&]/g, '[ .,&]?')}\\b`, 'i');
      if (regex.test(lowerDescription)) {
        inferredFilters.company = company;
        break;
      }
    }
  }
  
  return inferredFilters;
}

/**
 * Uses AI to enhance the request and infer appropriate filters
 */
interface AIEnhancementResult {
  improvedDescription: string;
  inferredFilters: {
    industry: string | null;
    marketSegment: string | null;
    company: string | null;
  };
}

interface AIResponse {
  improvedDescription: string;
  inferredFilters: {
    industry: string | null;
    marketSegment: string | null;
    company: string | null;
  };
}

async function enhanceRequestWithAI(description: string): Promise<AIEnhancementResult> {
  // Prepare reference data for the AI
  const industries = JSON.stringify(entityList.industries);
  const marketSegments = JSON.stringify(entityList.marketSegments);
  const companies = JSON.stringify(entityList.companies);
  
  const prompt = `
You are an expert interpreter for Act-On Software's reference search system.
I'll provide a user query about finding customer references, and I need you to:

1. Improve the query for clarity (fix typos, expand on vague terms)
2. ONLY identify company names or market segments that are EXPLICITLY mentioned in the query

Original query: "${description}"

Available filters and valid values:
- industry: ${industries}
- marketSegment: ${marketSegments}
- company: ${companies}

IMPORTANT INSTRUCTIONS:
- Be EXTREMELY conservative with applying filters
- DO NOT infer an industry filter based on a company name
- ONLY apply a filter if the query EXPLICITLY mentions an exact industry name, market segment, or company name
- The industry filter should ONLY be applied if an industry is directly mentioned (e.g. "healthcare industry" or "financial services")
- DO NOT apply any filters for use cases or CRM types

Respond with ONLY a JSON object in this exact format:
{
  "improvedDescription": "The improved and clarified request",
  "inferredFilters": {
    "industry": null,
    "marketSegment": null,
    "company": null
  }
}

Replace null with the exact string value from the lists above if a filter should be applied.
Keep as null if no appropriate filter value is found.
`;
  try {
    const { text } = await generateText({
      model: anthropic(aiConfig.anthropic.model),
      prompt,
      temperature: 0.1, // Low temperature for more deterministic responses
      maxTokens: 500,
    });

    const result = JSON.parse(text) as AIResponse;
    console.log("Raw AI interpretation result:", result);
    
    // Validate the filter values
    const validatedResult = {
      improvedDescription: result.improvedDescription,
      inferredFilters: {
        industry: validateFilterValue(result.inferredFilters.industry, entityList.industries),
        marketSegment: validateFilterValue(result.inferredFilters.marketSegment, entityList.marketSegments),
        company: validateFilterValue(result.inferredFilters.company, entityList.companies)
      }
    };
    
    console.log("Validated AI interpretation result:", validatedResult);
    return validatedResult;
  } catch (error) {
    console.error("Error in AI request interpretation:", error);
    throw error;
  }
}

/**
 * Validates that a filter value is in the allowed values list
 * Handles both string and array values safely
 */
function validateFilterValue(value: string | string[] | null, allowedValues: string[]): string | null {
  if (!value) return null;
  
  // If value is an array (handle the bug we saw in logs), choose the first item
  if (Array.isArray(value)) {
    console.log("Received array instead of string for filter value:", value);
    if (value.length === 0) return null;
    const firstValue = value[0];
    if (firstValue === undefined) return null;
    value = firstValue; // Take first value if it's an array
  }
  
  // Check if the value exactly matches one of the allowed values
  if (allowedValues.includes(value)) {
    return value;
  }
  
  // Try to find a case-insensitive match
  const lowerValue = value.toLowerCase();
  const match = allowedValues.find(allowed => allowed.toLowerCase() === lowerValue);
  
  return match ?? null;
}