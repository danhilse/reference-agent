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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { findReferences } from "~/lib/actions";
import type { ReferenceResult } from "~/lib/types";
import { Switch } from "~/components/ui/switch";

export default function ReferenceSearch() {
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("any");
  const [marketSegment, setMarketSegment] = useState("any");
  const [useCase, setUseCase] = useState("any");
  const [crmType, setCrmType] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ReferenceResult[] | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  // Add a new state for demo mode after the other state declarations
  const [demoMode, setDemoMode] = useState(false);
  // Add a new state for AI provider after the other state declarations
  const [aiProvider, setAiProvider] = useState<"anthropic" | "openai">(
    "anthropic",
  );

  // Update the handleSubmit function to pass the demoMode to the server action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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

  const copyToClipboard = (index: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
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

  const copyAllToClipboard = () => {
    navigator.clipboard.writeText(formatResultsForCopy());
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find References</CardTitle>
          <CardDescription>
            Search our customer reference database
          </CardDescription>
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

            {/* Add the demo mode toggle in the form, right after the description textarea */}
            <div className="mt-2 flex items-center space-x-2">
              <Switch
                id="demo-mode"
                checked={demoMode}
                onCheckedChange={setDemoMode}
              />
              <Label
                htmlFor="demo-mode"
                className="text-muted-foreground text-sm"
              >
                Demo Mode (test with sample data)
              </Label>
            </div>

            {/* Add the AI provider selection in the form, right after the demo mode toggle */}
            <div className="mt-4 flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-provider" className="text-sm">
                  AI Provider
                </Label>
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="anthropic"
                    className={`text-sm ${aiProvider === "anthropic" ? "font-medium" : "text-muted-foreground"}`}
                  >
                    Anthropic
                  </Label>
                  <Switch
                    id="ai-provider"
                    checked={aiProvider === "openai"}
                    onCheckedChange={(checked) =>
                      setAiProvider(checked ? "openai" : "anthropic")
                    }
                  />
                  <Label
                    htmlFor="openai"
                    className={`text-sm ${aiProvider === "openai" ? "font-medium" : "text-muted-foreground"}`}
                  >
                    OpenAI
                  </Label>
                </div>
              </div>
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
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger id="industry">
                        <SelectValue placeholder="Any industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any industry</SelectItem>
                        <SelectItem value="Accounting/Financial Services">
                          Accounting/Financial Services
                        </SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Manufacturing">
                          Manufacturing
                        </SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketSegment">Market Segment</Label>
                    <Select
                      value={marketSegment}
                      onValueChange={setMarketSegment}
                    >
                      <SelectTrigger id="marketSegment">
                        <SelectValue placeholder="Any segment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any segment</SelectItem>
                        <SelectItem value="SMB">SMB</SelectItem>
                        <SelectItem value="Mid Market">Mid Market</SelectItem>
                        <SelectItem value="Enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="useCase">Use Case</Label>
                    <Select value={useCase} onValueChange={setUseCase}>
                      <SelectTrigger id="useCase">
                        <SelectValue placeholder="Any use case" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any use case</SelectItem>
                        <SelectItem value="Ease of Use">Ease of Use</SelectItem>
                        <SelectItem value="Lead Generation">
                          Lead Generation
                        </SelectItem>
                        <SelectItem value="Marketing Automation">
                          Marketing Automation
                        </SelectItem>
                        <SelectItem value="Reporting">Reporting</SelectItem>
                        <SelectItem value="Email Marketing">
                          Email Marketing
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crmType">CRM Type</Label>
                    <Select value={crmType} onValueChange={setCrmType}>
                      <SelectTrigger id="crmType">
                        <SelectValue placeholder="Any CRM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any CRM</SelectItem>
                        <SelectItem value="Salesforce">Salesforce</SelectItem>
                        <SelectItem value="Microsoft Dynamics">
                          Microsoft Dynamics
                        </SelectItem>
                        <SelectItem value="HubSpot">HubSpot</SelectItem>
                        <SelectItem value="None">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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

      {results && results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Results</CardTitle>
              <CardDescription>
                Found {results.length} matching references
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAllToClipboard}
              className="flex items-center gap-1"
            >
              {copied === -1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Copy All
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="relative rounded-lg border p-4">
                <div className="absolute right-3 top-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(index, result.referenceDetail)
                    }
                    className="h-8 w-8 p-0"
                  >
                    {copied === index ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="space-y-2 pr-8">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      Quote{" "}
                      <span className="text-muted-foreground text-sm font-normal">
                        ({result.confidence}% match)
                      </span>
                    </h3>
                  </div>
                  <p className="text-sm">{result.referenceDetail}</p>
                  <div className="text-muted-foreground text-sm">
                    <p>
                      <span className="font-medium">Customer:</span>{" "}
                      {result.customerContact}, {result.accountName}
                    </p>
                    {result.industry && (
                      <p>
                        <span className="font-medium">Industry:</span>{" "}
                        {result.industry}
                      </p>
                    )}
                    {result.marketSegment && (
                      <p>
                        <span className="font-medium">Segment:</span>{" "}
                        {result.marketSegment}
                      </p>
                    )}
                    {result.useCase && (
                      <p>
                        <span className="font-medium">Use Case:</span>{" "}
                        {result.useCase}
                      </p>
                    )}
                    {result.caseStudyLink && (
                      <p>
                        <span className="font-medium">Link:</span>{" "}
                        <a
                          href={result.caseStudyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Case Study or G2 Review
                        </a>
                      </p>
                    )}
                    {result.referenceSlideLink && (
                      <p>
                        <span className="font-medium">Slide:</span>{" "}
                        <a
                          href={result.referenceSlideLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Reference Slide
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {results && results.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Results</CardTitle>
            <CardDescription>
              Try different search terms or filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Tip: Use broader terms or fewer filters to get more results</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
