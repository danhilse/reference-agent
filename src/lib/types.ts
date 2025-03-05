export interface ReferenceFilter {
  industry?: string
  marketSegment?: string
  useCase?: string
  crmType?: string
}

// Update the ReferenceRequest interface to include aiProvider
export interface ReferenceRequest {
  description: string
  filters: ReferenceFilter
  demoMode?: boolean
  aiProvider?: "anthropic" | "openai"
}

export interface CustomerReference {
  customerName: string
  accountName: string
  referenceType: string
  approvedForPublicUse: boolean
  useCase: string
  capability: string
  caseStudyLink: string
  crm: string
  customerContact: string
  referenceDetail: string
  referenceSlideLink: string
  industry: string
  marketSegment: string
  verified: string
}

export interface ReferenceResult extends CustomerReference {
  confidence: number
}

