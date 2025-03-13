# Customer Reference Agent

**Close more deals faster by instantly surfacing credible, tailored customer references for your sales conversations.**

An intelligent AI-powered tool that helps sales teams find relevant customer quotes, case studies, and reviews. This tool enables Act-On sales representatives to deliver more credible, personalized, and persuasive pitches by seamlessly integrating the voice of the customer into the sales process.

![Reference Agent Screenshot](public/demo.gif)

## Features

- **AI-Powered Matching**: Intelligently finds the most relevant customer references based on natural language requests
- **Smart Filtering**: Filter by industry, market segment, use case, CRM type, and company
- **Confidence Scoring**: View confidence percentages showing how well each reference matches your request
- **Smart Highlighting**: Automatically highlights the most relevant parts of each quote
- **Intelligent Request Interpretation**: Expands abbreviations and optimizes search queries
- **Multiple AI Models**: Choose between Anthropic or OpenAI for different needs
- **Easy Copying**: Copy individual references or all matches with a single click
- **Demo Mode**: Test functionality instantly without consuming API quota

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/act-on-reference-agent.git
cd act-on-reference-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env to add your API keys

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Usage Guide

### For Sales Team Members

1. **Enter Your Request**: Describe what you're looking for in natural language (e.g., "Find me quotes from healthcare customers about email deliverability")
2. **Apply Filters** (Optional): Click the "Add Filter" button to filter by industry, market segment, use case, or CRM type
3. **View Results**: See matching customer quotes ranked by relevance with key phrases highlighted
4. **Copy References**: Use the "Copy" button on individual quotes or "Copy All" to use in your sales communications
5. **Toggle Demo Mode**: For training or quick testing without consuming API quota

### Reference Format

References follow this template:
```
Quote: [Reference Detail]
Customer Contact: [Customer Contact], Account: [Account Name]
Link to Case Study or G2 Review: [Case Study Link]
Link to Slide: [Reference Slide Link]
```

### Example Reference Data

```json
{
  "customerName": "Good Funding",
  "accountName": "Good Funding",
  "referenceType": "G2 Review Quote",
  "approvedForPublicUse": true,
  "useCase": "Ease of Use",
  "capability": "Reporting",
  "caseStudyLink": "https://www.g2.com/products/act-on/reviews/act-on-review-7413273",
  "crm": "SalesForce",
  "customerContact": "Jenny Alonzo",
  "referenceDetail": "I love how user-friendly the entire platform is! It syncs beautifully with our Salesforce instance, provides all the reporting I need to track downstream KPIs, and whenever I have trouble or need some technical assistance, the Act-On team works with me until we have a resolution. In my 18-year career, I have used many different email platforms that do a lot of \"fancy\" things, but for my business marketing needs, this tool does everything I need it to do without being overly complicated. I recommend it to industry peers all the time.",
  "referenceSlideLink": "",
  "industry": "Accounting/Financial Services",
  "marketSegment": "SMB",
  "verified": "Salesforce"
}
```

## How It Works

1. **Request Enhancement**: The system interprets your request, expanding abbreviations and optimizing search terms
2. **Filtering**: Your query is matched against filtered customer references from approved sources
3. **AI Ranking**: References are scored based on relevance to your request using Claude or GPT
4. **Result Refinement**: A second AI pass identifies key highlights and adjusts confidence scores
5. **Presentation**: Top matches are displayed with highlighted text for easy scanning

## Technology Stack

This project uses the [T3 Stack](https://create.t3.gg/):

- [Next.js](https://nextjs.org) - React framework with server components
- [TypeScript](https://typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - UI component system
- [Vercel AI SDK](https://sdk.vercel.ai/) - AI capabilities integration

### AI Models
- **Anthropic Claude** (default): Excellent for nuanced understanding of customer references
- **OpenAI GPT-4o**: Alternative model with different strengths

## Environment Variables

Create a `.env` file with the following variables:

```
# AI API Keys (at least one is required)
ANTHROPIC_API_KEY=your_anthropic_api_key
OPENAI_API_KEY=your_openai_api_key
```

## Success Criteria

- Regular usage by the sales team (target: 5+ uses per week per rep)
- Positive feedback on relevance of responses and ease of use
- Measurable impact on sales conversations and outcomes
- Increased integration of customer voice in sales presentations

## License

[MIT](LICENSE)