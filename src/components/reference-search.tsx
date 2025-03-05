"use client";

import type React from "react";

import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Loader2 } from "lucide-react";
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
import { Textarea } from "~/components/ui/textarea";
import { findReferences } from "~/lib/actions";
import type { ReferenceResult } from "~/lib/types";
import { Switch } from "~/components/ui/switch";
import { ReferenceQuote } from "~/components/ReferenceQuote"; // Import the quote component
import { FilterSelect } from "~/components/FilterSelect"; // Import the filter select component

import { LoadingState } from "~/components/ui/LoadingState";

export default function ReferenceSearch() {
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("any");
  const [marketSegment, setMarketSegment] = useState("any");
  const [useCase, setUseCase] = useState("any");
  const [crmType, setCrmType] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReferenceResult[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [aiProvider, setAiProvider] = useState<"anthropic" | "openai">(
    "anthropic",
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);
    setResults(null);

    try {
      const references = await findReferences({
        description,
        filters: {
          industry: industry === "any" ? "" : industry,
          marketSegment: marketSegment === "any" ? "" : marketSegment,
          useCase: useCase === "any" ? "" : useCase,
          crmType: crmType === "any" ? "" : crmType,
        },
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find References</CardTitle>
          <CardDescription>
            Search our customer reference database
          </CardDescription>
          {/* Demo mode toggle */}
          <div className="absolute right-4 top-4 flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={demoMode}
              onCheckedChange={setDemoMode}
            />
            <Label
              htmlFor="demo-mode"
              className="text-muted-foreground text-sm"
            >
              Demo Mode
            </Label>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">What are you looking for?</Label>
              <Textarea
                id="description"
                placeholder="Example: A healthcare customer using marketing automation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                className="flex w-full justify-between"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>Optional Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FilterSelect
                    id="industry"
                    label="Industry"
                    value={industry}
                    onValueChange={setIndustry}
                    placeholder="Any industry"
                    options={[
                      { value: "any", label: "Any industry" },
                      {
                        value: "Accounting/Financial Services",
                        label: "Accounting/Financial Services",
                      },
                      { value: "Healthcare", label: "Healthcare" },
                      { value: "Technology", label: "Technology" },
                      { value: "Manufacturing", label: "Manufacturing" },
                      { value: "Education", label: "Education" },
                    ]}
                  />

                  <FilterSelect
                    id="marketSegment"
                    label="Market Segment"
                    value={marketSegment}
                    onValueChange={setMarketSegment}
                    placeholder="Any segment"
                    options={[
                      { value: "any", label: "Any segment" },
                      { value: "SMB", label: "SMB" },
                      { value: "Mid Market", label: "Mid Market" },
                      { value: "Enterprise", label: "Enterprise" },
                    ]}
                  />

                  <FilterSelect
                    id="useCase"
                    label="Use Case"
                    value={useCase}
                    onValueChange={setUseCase}
                    placeholder="Any use case"
                    options={[
                      { value: "any", label: "Any use case" },
                      { value: "Ease of Use", label: "Ease of Use" },
                      { value: "Lead Generation", label: "Lead Generation" },
                      {
                        value: "Marketing Automation",
                        label: "Marketing Automation",
                      },
                      { value: "Reporting", label: "Reporting" },
                      { value: "Email Marketing", label: "Email Marketing" },
                    ]}
                  />

                  <FilterSelect
                    id="crmType"
                    label="CRM Type"
                    value={crmType}
                    onValueChange={setCrmType}
                    placeholder="Any CRM"
                    options={[
                      { value: "any", label: "Any CRM" },
                      { value: "Salesforce", label: "Salesforce" },
                      {
                        value: "Microsoft Dynamics",
                        label: "Microsoft Dynamics",
                      },
                      { value: "HubSpot", label: "HubSpot" },
                      { value: "None", label: "None" },
                    ]}
                  />
                </div>
              )}
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                {isLoading
                  ? "Searching for references..."
                  : results && results.length > 0
                    ? `Found ${results.length} matching references`
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
                <p className="text-muted-foreground mb-2">
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
