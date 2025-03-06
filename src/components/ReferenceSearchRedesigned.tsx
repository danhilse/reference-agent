import { useState, useEffect } from "react";
import { Check, Copy, Loader2, Info } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { ReferenceQuote } from "~/components/ReferenceQuote";
import { LoadingState } from "~/components/ui/LoadingState";
import { RotatingPlaceholder } from "~/components/Filters/RotatingPlaceholder";
import FilterChipsInput from "~/components/Filters/FilterChipsInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function ReferenceSearchRedesigned() {
  // State setup (similar to the original component)
  const [description, setDescription] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  // Mock filtersHook for demonstration
  const filtersHook = {
    getFilterValues: () => ({}),
    filters: [],
    selectedFilters: {},
    setSelectedFilters: () => {},
    clearFilters: () => {},
  };

  // Mock function for demonstration
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          referenceDetail:
            "I love how user-friendly the entire platform is! It syncs beautifully with our Salesforce instance and provides all the reporting I need.",
          customerContact: "Jenny Alonzo",
          accountName: "Good Funding",
          caseStudyLink:
            "https://www.g2.com/products/act-on/reviews/act-on-review-7413273",
          referenceSlideLink: "",
          confidence: 92,
        },
        {
          referenceDetail:
            "Act-On has transformed our marketing workflow. The automation capabilities save us hours each week.",
          customerContact: "Michael Chen",
          accountName: "TechSolutions Inc",
          caseStudyLink: "https://www.act-on.com/customers/techsolutions",
          referenceSlideLink: "https://drive.google.com/file/d/1abc123",
          confidence: 87,
        },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  // Placeholder rotation effect
  useEffect(() => {
    const handlePlaceholderChange = (newPlaceholder) => {
      setPlaceholder(newPlaceholder);
    };

    // Simulate placeholder rotation
    const placeholders = [
      "Looking for customer quotes about email automation...",
      "Find testimonials from enterprise customers in healthcare...",
      "Need references who mentioned Salesforce integration...",
    ];

    let index = 0;
    const interval = setInterval(() => {
      handlePlaceholderChange(placeholders[index]);
      index = (index + 1) % placeholders.length;
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Streamlined header */}
      <div className="mb-8 text-center">
        <img
          src="/api/placeholder/120/40"
          alt="Act-On Logo"
          className="mx-auto mb-4 h-10"
        />
        <h1 className="mb-2 text-2xl font-semibold text-gray-800">
          Customer Reference Agent
        </h1>
      </div>

      {/* Main search card with cleaner layout */}
      <Card className="mb-6 border-0 shadow-md">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search input with floating label design */}
            <div className="relative">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="description"
                  className="mb-2 text-base font-medium text-gray-700"
                >
                  What kind of customer references are you looking for?
                </Label>

                {/* Demo mode toggle with tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="demo-mode"
                          checked={demoMode}
                          onCheckedChange={setDemoMode}
                        />
                        <Label
                          htmlFor="demo-mode"
                          className="flex items-center text-sm text-muted-foreground"
                        >
                          Demo Mode
                          <Info className="ml-1 h-3 w-3" />
                        </Label>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Generate realistic reference examples instantly</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="relative mt-1 rounded-md shadow-sm">
                <textarea
                  id="description"
                  className="block w-full rounded-md border-gray-300 bg-white p-4 text-gray-900 placeholder-gray-400 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  placeholder={placeholder}
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required={!demoMode}
                />
              </div>

              {/* Optional filters area - simplified for demo */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Industry", "Market Segment", "Use Case", "CRM Type"].map(
                  (filter) => (
                    <Button
                      key={filter}
                      variant="outline"
                      size="sm"
                      className="bg-gray-50 hover:bg-gray-100"
                      onClick={(e) => e.preventDefault()}
                    >
                      + {filter}
                    </Button>
                  ),
                )}
              </div>
            </div>

            {/* Search button - more prominent */}
            <Button
              type="submit"
              className="hover:bg-primary-hover w-full bg-primary py-6 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                "Find Customer References"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results section - only shown after search */}
      {hasSearched && (
        <Card className="border-0 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle className="text-lg font-medium text-gray-800">
                {isLoading
                  ? "Searching..."
                  : results
                    ? `${results.length} References Found`
                    : "No Results"}
              </CardTitle>
            </div>

            {results && results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCopiedAll(true);
                  setTimeout(() => setCopiedAll(false), 2000);
                }}
                className="flex items-center gap-1"
              >
                {copiedAll ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                Copy All
              </Button>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="divide-y">
                {results.map((result, index) => (
                  <div key={index} className="p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                          {index + 1}
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-500">
                          {result.confidence}% match
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <blockquote className="mb-3 border-l-4 border-primary pl-4 italic text-gray-700">
                      "{result.referenceDetail}"
                    </blockquote>

                    <div className="text-sm text-gray-600">
                      <p className="font-medium">
                        {result.customerContact}, {result.accountName}
                      </p>
                      <a
                        href={result.caseStudyLink}
                        className="mt-1 inline-block text-primary hover:underline"
                      >
                        View case study
                      </a>
                      {result.referenceSlideLink && (
                        <a
                          href={result.referenceSlideLink}
                          className="ml-4 text-primary hover:underline"
                        >
                          View slide
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <p className="text-lg font-medium text-gray-500">
                  No matching references found
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  Try different search terms or fewer filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// export default ReferenceSearchRedesigned;
