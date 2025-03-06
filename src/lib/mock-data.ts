import { customerReferences } from "./data";
import type { CustomerReference, ReferenceResult } from "./types";

/**
 * Generates mock reference results by selecting random customer references
 * and adding confidence scores to them.
 * 
 * @param count Number of mock results to generate
 * @param filters Optional filters to apply to the data selection
 * @returns Array of ReferenceResult objects with confidence scores
 */
export function generateMockResults(
  count: number = 3,
  filters: {
    industry?: string;
    marketSegment?: string;
    useCase?: string;
    crmType?: string;
  } = {}
): ReferenceResult[] {
  // First filter the data based on any provided filters
  let filteredReferences = [...customerReferences];
  
  if (filters.industry) {
    filteredReferences = filteredReferences.filter(
      ref => ref.industry === filters.industry
    );
  }
  
  if (filters.marketSegment) {
    filteredReferences = filteredReferences.filter(
      ref => ref.marketSegment === filters.marketSegment
    );
  }
  
  if (filters.useCase) {
    filteredReferences = filteredReferences.filter(
      ref => ref.useCase === filters.useCase
    );
  }
  
  if (filters.crmType) {
    filteredReferences = filteredReferences.filter(
      ref => ref.crm === filters.crmType
    );
  }
  
  // If no matches after filtering, fall back to the full dataset
  if (filteredReferences.length === 0) {
    filteredReferences = [...customerReferences];
  }

  // Select random references up to the count requested
  const selected: CustomerReference[] = [];
  const maxResults = Math.min(count, filteredReferences.length);
  
  // Shuffle and select
  for (let i = 0; i < maxResults; i++) {
    const randomIndex = Math.floor(Math.random() * filteredReferences.length);
    selected.push(filteredReferences[randomIndex]);
    // Remove the selected item to avoid duplicates
    filteredReferences.splice(randomIndex, 1);
    
    // If we've used all available references, break
    if (filteredReferences.length === 0) break;
  }
  
  // Convert to ReferenceResult format with confidence scores
  return selected.map(ref => ({
    ...ref,
    // Generate a realistic confidence score - higher if filters were applied
    confidence: Math.floor(
      Object.values(filters).filter(Boolean).length > 0
        ? Math.random() * 15 + 80 // 80-95% if filters applied
        : Math.random() * 30 + 65 // 65-95% otherwise
    )
  }));
}