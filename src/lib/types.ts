// src/lib/types.ts

// Define the AI provider type
export type AIProvider = "anthropic" | "openai" | "gemini";

// Filter interface
export interface FilterValues {
  industry: string;
  marketSegment: string;
  useCase: string;
  crmType: string;
  company?: string;
}

// Reference request interface
export interface ReferenceRequest {
  description: string;
  filters: FilterValues;
  demoMode: boolean;
  aiProvider?: AIProvider;
  optimizedQuery?: string;
}

// Customer reference interface
export interface CustomerReference {
  customerName: string;
  accountName: string;
  referenceType: string;
  approvedForPublicUse: boolean;
  useCase: string;
  capability: string;
  caseStudyLink: string;
  crm: string;
  customerContact: string;
  referenceDetail: string;
  referenceSlideLink: string;
  industry: string;
  marketSegment: string;
  verified: string;
}

// Reference result interface with confidence and highlights
export interface ReferenceResult extends CustomerReference {
  confidence: number;
  highlights?: Array<{
    text: string;
    relevance: string;
  }>;
}

// Enhanced reference request interface
export interface EnhancedReferenceRequest extends ReferenceRequest {
  optimizedQuery: string;
}