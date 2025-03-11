// lib/mock-data.ts
import type { CustomerReference, ReferenceFilter, ReferenceResult } from "./types";
import { customerReferences } from "./data";

/**
 * Generates mock results for demo mode
 * This function needs to respect filters, including company filters
 */
export function generateMockResults(count: number, filters: ReferenceFilter): ReferenceResult[] {
  console.log("Generating mock results with filters:", filters);
  
  // Filter the data based on the provided filters
  let filteredData = customerReferences.filter(ref => ref.approvedForPublicUse);
  console.log(`Starting with ${filteredData.length} approved references for mock data`);
  
  // Apply industry filter if provided
  if (filters.industry && filters.industry.trim() !== '') {
    filteredData = filteredData.filter(
      ref => ref.industry.toLowerCase() === filters.industry.toLowerCase()
    );
    console.log(`After industry filter (${filters.industry}): ${filteredData.length} references for mock data`);
  }
  
  // Apply market segment filter if provided
  if (filters.marketSegment && filters.marketSegment.trim() !== '') {
    filteredData = filteredData.filter(
      ref => ref.marketSegment.toLowerCase() === filters.marketSegment.toLowerCase()
    );
    console.log(`After market segment filter (${filters.marketSegment}): ${filteredData.length} references for mock data`);
  }
  
  // Apply use case filter if provided
  if (filters.useCase && filters.useCase.trim() !== '') {
    filteredData = filteredData.filter(
      ref => ref.useCase.toLowerCase() === filters.useCase.toLowerCase()
    );
    console.log(`After use case filter (${filters.useCase}): ${filteredData.length} references for mock data`);
  }
  
  // Apply CRM type filter if provided
  if (filters.crmType && filters.crmType.trim() !== '') {
    filteredData = filteredData.filter(
      ref => ref.crm.toLowerCase() === filters.crmType.toLowerCase()
    );
    console.log(`After CRM type filter (${filters.crmType}): ${filteredData.length} references for mock data`);
  }
  
  // Apply company filter if provided
  if (filters.company && filters.company.trim() !== '') {
    filteredData = filteredData.filter(
      ref => 
        ref.customerName.toLowerCase().includes(filters.company!.toLowerCase()) ||
        ref.accountName.toLowerCase().includes(filters.company!.toLowerCase())
    );
    console.log(`After company filter (${filters.company}): ${filteredData.length} references for mock data`);
    
    // Log the companies that matched
    console.log("Companies that matched the filter:", 
      filteredData.map(ref => ({
        customerName: ref.customerName,
        accountName: ref.accountName
      }))
    );
  }
  
  // Check if we have any matches
  if (filteredData.length === 0) {
    console.log("No references match the filters in mock data, returning generic mock results");
    // If no matches, return generic mock results (ignoring filters)
    return generateGenericMockResults(count);
  }
  
  // Generate mock results from the filtered data
  return filteredData.slice(0, Math.min(count, filteredData.length)).map(ref => ({
    ...ref,
    confidence: Math.floor(Math.random() * 30) + 70 // Random confidence between 70-99
  }));
}

/**
 * Generates generic mock results when no matches are found
 */
function generateGenericMockResults(count: number): ReferenceResult[] {
  console.log("Generating generic mock results without filtering");
  
  // Just take random references from the full dataset
  const availableRefs = customerReferences.filter(ref => ref.approvedForPublicUse);
  const selectedRefs: CustomerReference[] = [];
  
  // Randomly select unique references
  while (selectedRefs.length < count && availableRefs.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableRefs.length);
    const selectedRef = availableRefs[randomIndex];
    if (selectedRef) {
      selectedRefs.push(selectedRef);
      availableRefs.splice(randomIndex, 1);
    }
  }
  
  // Convert to ReferenceResult with random confidence scores
  return selectedRefs.map(ref => ({
    ...ref,
    confidence: Math.floor(Math.random() * 30) + 70 // Random confidence between 70-99
  }));
}