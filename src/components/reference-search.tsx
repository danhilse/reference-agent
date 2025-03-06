"use client";

import { useState, useRef, useEffect } from "react";
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

interface ReferenceSearchProps {
  demoMode: boolean;
  aiProvider: "anthropic" | "openai";
}

export default function ImprovedReferenceSearch({
  demoMode,
  aiProvider,
}: ReferenceSearchProps) {
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
      // Add a minimum delay for better UX with staggered loading
      const filterValues = filtersHook.getFilterValues();

      // Use Promise.all to run both the delay and the API call in parallel
      const [references] = await Promise.all([
        findReferences({
          description,
          filters: filterValues,
          demoMode,
          aiProvider,
        }),
        // Minimum display time for loading state to allow staggered animation to show
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

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
    <div className="container mx-auto transition-all duration-500 ease-in-out">
      {/* Main layout container - transitions from centered to side-by-side */}
      <div
        className={`mx-auto flex gap-6 ${hasSearched ? "lg:mx-0 lg:flex-row lg:items-start" : "flex-col items-center"} transition-all duration-500 ease-in-out`}
      >
        {/* Query Card - becomes sticky when results are shown but maintains width */}
        <div
          className={` ${
            hasSearched ? "lg:sticky lg:top-6" : ""
          } w-full min-w-[380px] max-w-[440px] transition-all duration-500 ease-in-out`}
        >
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
        </div>

        {/* Results container with smooth size transitions */}
        <div
          className={` ${
            hasSearched
              ? "min-h-0 flex-1 opacity-100 transition-all duration-700 ease-in-out"
              : "h-0 w-0 overflow-hidden opacity-0"
          } transition-all duration-700 ease-in-out`}
        >
          <Card className="h-full transition-all duration-500 ease-in-out">
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
                <div className="animate-fadeIn space-y-4">
                  {results.map((result, index) => (
                    <ReferenceQuote key={index} result={result} index={index} />
                  ))}
                </div>
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
        </div>
      </div>
    </div>
  );
}
