# Act-On Customer Reference Agent: Developer Documentation

## Project Overview

The Act-On Customer Reference Agent is an AI-powered tool that helps sales representatives find relevant customer quotes, case studies, and reviews tailored to their sales conversations. The system uses natural language processing to match user requests with appropriate customer references, with filtering capabilities to narrow down results.

This documentation provides a comprehensive overview of the system architecture, key components, data flow, and implementation details to help developers understand and maintain the application.

## System Architecture

The Customer Reference Agent is built using the T3 Stack, which includes:

- **Next.js**: React framework with server components
- **TypeScript**: For type safety and improved developer experience
- **Tailwind CSS**: For styling components
- **shadcn/ui**: UI component system
- **Vercel AI SDK**: For AI capabilities integration

### Directory Structure

```
├── src
│   ├── app                   # Next.js app router components
│   ├── components            # React components
│   │   ├── Filters/          # Filter-related components
│   │   ├── ui/               # UI components (shadcn/ui)
│   ├── constants             # Constants and configuration
│   │   ├── abbreviations.ts  # Abbreviation expansions
│   │   ├── entity_list.ts    # Companies, industries, market segments
│   │   ├── filterData.ts     # Filter definitions
│   ├── env.js                # Environment variable validation
│   ├── hooks                 # Custom React hooks
│   ├── lib                   # Core functionality
│   │   ├── actions.ts        # Server actions
│   │   ├── ai-config.ts      # AI configuration
│   │   ├── ai.ts             # AI integration
│   │   ├── data.ts           # Customer reference data
│   │   ├── interpreter.ts    # Request interpretation
│   │   ├── mock-data.ts      # Demo mode data
│   │   ├── refine-results.ts # Results refinement
│   │   ├── types.ts          # TypeScript type definitions
│   │   ├── utils.ts          # Utility functions
│   ├── styles                # Global styles
```

## Core Components

### 1. User Interface

#### Main Components

- **reference-search.tsx**: The main search interface component
- **ReferenceQuote.tsx**: Individual quote display component
- **FilterChipsInput.tsx**: Input field with filter capabilities
- **FilterSelect.tsx**: Component for selecting filters

#### State Management

The application uses React's built-in state management (useState, useEffect) and a custom `useFilters` hook to manage the filter state.

### 2. Data Flow

The typical data flow in the application is:

1. User enters a search query and optionally selects filters
2. The query is processed through the interpreter to expand abbreviations and optimize the search
3. The system filters the reference data based on selected filters
4. The filtered data is sent to an AI model to find the most relevant matches
5. Results are refined in a second AI pass to identify key highlights
6. Relevant references are displayed to the user with confidence scores and highlights

### 3. Server Actions

The application uses Next.js Server Actions for server-side operations:

- **findReferences**: The main action that processes the request and returns relevant references
- **validateDemoPassword**: For authenticating when disabling demo mode
- **isDemoDisabled**: Checks if demo mode is disabled

## AI Integration

The system can use multiple AI providers:

- **Anthropic Claude**: The default model
- **OpenAI**: Alternative model
- **Google Gemini**: Additional model option

The AI integration is handled in the following files:

- **ai-config.ts**: Configuration for AI models
- **ai.ts**: Functions for generating references using different AI providers
- **interpreter.ts**: Uses AI to enhance and interpret user requests
- **refine-results.ts**: Uses AI to refine search results and identify highlights

## Key Features Implementation

### Request Interpretation (interpreter.ts)

The request interpreter enhances user queries by:

1. Expanding abbreviations using a predefined list
2. Using AI to improve clarity and infer filters
3. Optimizing the search query for AI search
4. Falling back to rule-based processing if AI fails

```typescript
export async function interpretRequest(
  request: ReferenceRequest
): Promise<ReferenceRequest & { optimizedQuery: string }> {
  // Expand abbreviations
  const improvedDescription = expandAbbreviations(request.description);
  
  // Use AI to enhance the request
  const enhancedResult = await enhanceRequestWithAI(improvedDescription, request.filters);
  
  // Combine existing filters with inferred filters
  const inferredFilters = { ... };
  
  // Return the improved request
  return {
    ...request,
    description: enhancedResult.improvedDescription || improvedDescription,
    filters: inferredFilters,
    optimizedQuery: enhancedResult.optimizedQuery || improvedDescription,
  };
}
```

### Reference Finding (actions.ts)

The main server action that processes the request and returns relevant references:

1. Interprets and enhances the request
2. Filters references based on user-selected filters
3. Uses the specified AI provider to find relevant references
4. Refines the results with a second AI pass
5. Returns the results to the client

```typescript
export async function findReferences(request: ReferenceRequest): Promise<ReferenceResult[]> {
  // Interpret and enhance the request
  const enhancedRequest = await interpretRequest(request);
  
  // Extract parameters
  const { description, filters, demoMode, aiProvider, optimizedQuery } = enhancedRequest;
  
  // If demo mode, return mock results
  if (demoMode) {
    return generateMockResults(5, filters);
  }
  
  // Filter references based on user filters
  let filteredReferences = customerReferences.filter(/* filtering logic */);
  
  // Use AI to find relevant references
  const initialResults = await generateReferencesWithAI(optimizedQuery, filteredReferences);
  
  // Refine results with a second AI pass
  const refinedResults = await refineSearchResults(description, initialResults);
  
  return refinedResults;
}
```

### Results Refinement (refine-results.ts)

After getting initial results, a second AI pass refines them by:

1. Re-evaluating the confidence score based on the original request
2. Identifying key phrases within each quote that directly address the search request
3. Focusing on references that mention complete feature sets matching the request

```typescript
export async function refineSearchResults(
  originalRequest: string,
  results: ReferenceResult[],
  limit = 5
): Promise<RefinedReferenceResult[]> {
  // Prepare results for the refinement prompt
  const referencesForPrompt = results.map(/* mapping logic */);
  
  // Call AI for refinement analysis
  const refinementResults = await callAI(/* prompt */);
  
  // Map refinement results back to original references
  const refinedReferences = results.map(/* mapping logic */);
  
  // Sort by confidence and limit results
  return refinedReferences
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}
```

### Demo Mode (mock-data.ts)

The system includes a demo mode that generates realistic reference examples without calling the AI API:

```typescript
export function generateMockResults(count: number, filters: ReferenceFilter): ReferenceResult[] {
  // Filter the data based on provided filters
  let filteredData = customerReferences.filter(/* filtering logic */);
  
  // If no matches, return generic mock results
  if (filteredData.length === 0) {
    return generateGenericMockResults(count);
  }
  
  // Generate mock results with random confidence scores
  return filteredData.slice(0, count).map(ref => ({
    ...ref,
    confidence: Math.floor(Math.random() * 30) + 70 // Random confidence between 70-99
  }));
}
```

## Data Model

### Customer Reference

The main data structure representing a customer reference:

```typescript
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
```

### Reference Result

The enhanced data structure that includes confidence scores and highlights:

```typescript
export interface ReferenceResult extends CustomerReference {
  confidence: number;
  highlights?: string[];  // Array of key phrases to highlight
}
```

## Authentication

The application includes a simple authentication system for disabling demo mode:

1. The user can toggle demo mode on without authentication
2. Turning demo mode off requires a password
3. When authenticated, a cookie is set to remember the authentication state

```typescript
export async function validateDemoPassword(formData: FormData) {
  // Validate the password securely
  const isValid = validatePasswordSecurely(formData.get("password"));
  
  if (isValid) {
    // Set a secure cookie to remember authentication
    cookieStore.set({
      name: COOKIE_NAME,
      value: /* secure value */,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "strict",
    });
  }
  
  return { success: isValid, error: isValid ? null : "Incorrect password" };
}
```

## Environment Variables

The application requires the following environment variables:

```
# AI API Keys (at least one is required)
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
FULL_PASS=your_password_for_admin_access
```

## Development Workflow

### Starting Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
# Build Next.js project
npm run build

# Start production server
npm run start
```

### Linting and Type Checking

```bash
# Check code with ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Check TypeScript types
npm run typecheck

# Run both lint and type checks
npm run check
```

## Best Practices

### Code Style

- Use TypeScript for all code with strict typing
- Use function components with hooks
- Follow the naming conventions:
  - PascalCase for components and types
  - camelCase for variables, functions, and instances
- Group imports properly:
  - React imports first
  - Library imports second
  - Internal imports last
- Use Tailwind CSS with `className` strings and `clsx`/`tailwind-merge` for conditionals

### Component Structure

- Place related components in the same directory
- Keep components focused on a single responsibility
- Use shadcn/ui components where possible
- Extract reusable logic into custom hooks

### Error Handling

- Use try/catch blocks for error handling
- Provide meaningful error messages and fallbacks
- Log errors to the console for debugging
- Implement graceful fallbacks for AI services

## Performance Considerations

- The application uses client-side state management to minimize server round-trips
- AI operations are performed on the server to protect API keys
- Demo mode provides instant responses without API calls
- The request interpreter optimizes queries to improve AI response quality
- Results are limited to the top 5 matches to improve performance

## Extensibility

### Adding New AI Providers

To add a new AI provider:

1. Add configuration in `ai-config.ts`
2. Create a new function in `ai.ts` for generating references
3. Update the AIProvider type in `types.ts`
4. Add support in the `findReferences` function in `actions.ts`

### Updating Reference Data

The reference data is stored in `data.ts`. To update:

1. Ensure new references follow the `CustomerReference` interface
2. Make sure references have `approvedForPublicUse` set to true if they should be available

### Adding New Filters

To add new filter options:

1. Update the `FilterValues` interface in `types.ts`
2. Add the new filter to `filterData.ts`
3. Update the `useFilters` hook in `useFilters.tsx`
4. Add the filter to the UI in `FilterChipsInput.tsx`

## Troubleshooting

### Common Issues

1. **AI Provider Not Responding**:
   - Check if the API key is correctly set in environment variables
   - Verify the provider is properly configured in `ai-config.ts`
   - The system will attempt to fall back to other providers

2. **No Results Returned**:
   - Check if the filters are too restrictive
   - Verify there are references that match the criteria
   - Check console logs for filtering details

3. **Highlighting Not Working**:
   - Verify the `highlights` array contains exact substrings from the reference
   - Check console logs for highlight debugging information

### Logging

The application includes extensive logging to help with debugging:

- Request interpretation steps are logged
- Filter operations include counts of remaining references
- AI responses are logged (truncated for large responses)
- Error handling includes detailed error messages

## Future Enhancements

As noted in the project brief, potential future enhancements include:

1. **Analytics Integration**: Tracking usage patterns in Google Sheets
2. **Enhanced Query Interpretation**: Better distinguishing between quotes, case studies, and reviews
3. **Salesforce API Integration**: Direct integration with Salesforce
4. **Result Sorting**: Additional sorting options by match percentage
