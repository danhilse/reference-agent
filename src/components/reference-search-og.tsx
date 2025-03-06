"use client";

import { useState, useRef } from "react";
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
import { findReferences } from "~/lib/actions";
import type { ReferenceResult } from "~/lib/types";
import { Switch } from "~/components/ui/switch";
import { ReferenceQuote } from "~/components/ReferenceQuote";
import { LoadingState } from "~/components/ui/LoadingState";
import { RotatingPlaceholder } from "~/components/Filters/RotatingPlaceholder";
import FilterChipsInput from "~/components/Filters/FilterChipsInput";
import { useFilters } from "~/hooks/useFilters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function ImprovedReferenceSearch() {
  // State for query input
  const [description, setDescription] = useState("");

  // Track input focus state
  const [isFocused, setIsFocused] = useState(false);

  // Use our custom filter hook
  const filtersHook = useFilters();

  // State for the placeholder text
  const [placeholder, setPlaceholder] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReferenceResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Feature toggles
  const [demoMode, setDemoMode] = useState(false);
  const [aiProvider, setAiProvider] = useState<"anthropic" | "openai">(
    "anthropic",
  );

  // Handle placeholder updates
  const handlePlaceholderChange = (newPlaceholder: string) => {
    setPlaceholder(newPlaceholder);
  };

  // Focus handlers for the input
  const handleInputFocus = () => {
    setIsFocused(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    setResults(null);

    try {
      const filterValues = filtersHook.getFilterValues();
      const references = await findReferences({
        description,
        filters: filterValues,
        demoMode,
        aiProvider,
      });

      setResults(references);
    } catch (error) {
      console.error("Error finding references:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatResultsForCopy = () => {
    if (!results) return "";

    return results
      .map(
        (result) =>
          `Quote: ${result.referenceDetail}\n` +
          `Customer Contact: ${result.customerContact}, Account: ${result.accountName}\n` +
          `Link to Case Study or G2 Review: ${result.caseStudyLink}\n` +
          `Link to Slide: ${result.referenceSlideLink || "N/A"}\n\n`,
      )
      .join("");
  };

  const copyAllToClipboard = async () => {
    await navigator.clipboard.writeText(formatResultsForCopy());
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="mx-auto w-full min-w-[620px] max-w-[820px] space-y-6 transition-all duration-300 ease-in-out">
      {/* Pass the required props to RotatingPlaceholder */}
      <RotatingPlaceholder
        onPlaceholderChange={handlePlaceholderChange}
        inputValue={description}
        isFocused={isFocused}
      />

      <Card>
        <CardHeader className="ml-1">
          <CardTitle>Find References</CardTitle>
          <CardDescription>
            Search our customer reference database
          </CardDescription>
          {/* Demo mode toggle with tooltip */}
          <div className="absolute right-4 top-4 flex items-center space-x-2">
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
                  <p>
                    Generate realistic reference examples instantly without
                    calling the AI API
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="ml-1">
                What are you looking for?
              </Label>

              <div className="relative">
                {/* Use our FilterChipsInput component */}
                <FilterChipsInput
                  value={description}
                  onChange={setDescription}
                  placeholder="" // Empty real placeholder since we're using our custom one
                  filtersHook={filtersHook}
                  required={!demoMode}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />

                {/* Custom placeholder overlay with reduced opacity */}
                {description === "" && !isFocused && placeholder && (
                  <div
                    className="pointer-events-none absolute left-0 top-0 p-3 text-sm"
                    style={{ opacity: 0.6 }} // Reduced opacity for placeholder
                  >
                    {placeholder}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding references...
                </>
              ) : (
                "Find References"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Show results container whenever a search has been initiated */}
      {hasSearched && (
        <Card className="transition-opacity duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Searching for references..."
                  : results && results.length > 0
                    ? `Found ${results.length} matching references${
                        demoMode ? " (Demo Mode)" : ""
                      }`
                    : "No matching references found"}
              </CardDescription>
            </div>
            {results && results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={copyAllToClipboard}
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
          <CardContent className="space-y-4">
            {isLoading ? (
              <LoadingState />
            ) : results && results.length > 0 ? (
              results.map((result, index) => (
                <ReferenceQuote key={index} result={result} index={index} />
              ))
            ) : (
              <div className="py-6 text-center">
                <p className="mb-2 text-muted-foreground">
                  No references found that match your criteria
                </p>
                <p className="text-sm">
                  Try different search terms or fewer filters to get more
                  results
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
