import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { ReferenceResult } from "~/lib/types";
import { cn } from "~/lib/utils";

interface ReferenceQuoteProps {
  result: ReferenceResult;
  index: number;
}

export function ReferenceQuote({ result, index }: ReferenceQuoteProps) {
  const [copied, setCopied] = useState(false);

  const confidenceColor =
    result.confidence >= 90
      ? "bg-green-100 text-green-800"
      : result.confidence >= 75
        ? "bg-blue-100 text-blue-800"
        : "bg-yellow-100 text-yellow-800";

  const formatForCopy = () => {
    return (
      `Quote: ${result.referenceDetail}\n` +
      `Customer Contact: ${result.customerContact}, Account: ${result.accountName}\n` +
      `Link to Case Study or G2 Review: ${result.caseStudyLink}\n` +
      `Link to Slide: ${result.referenceSlideLink || "None"}`
    );
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(formatForCopy());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{result.customerName}</h3>
          <Badge variant="outline">{result.industry}</Badge>
          <Badge variant="outline">{result.marketSegment}</Badge>
        </div>
        <Badge className={cn("ml-auto", confidenceColor)}>
          {result.confidence}% match
        </Badge>
      </div>

      <blockquote className="my-3 border-l-4 border-primary pl-4 italic text-gray-700">
        "{result.referenceDetail}"
      </blockquote>

      <div className="mt-3 text-sm text-muted-foreground">
        <p>
          <span className="font-semibold">Contact:</span>{" "}
          {result.customerContact}
        </p>
        <p>
          <span className="font-semibold">Use Case:</span> {result.useCase}
        </p>
        <p>
          <span className="font-semibold">CRM:</span> {result.crm}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        {result.caseStudyLink && (
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a
              href={result.caseStudyLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              {result.referenceType}
            </a>
          </Button>
        )}

        {result.referenceSlideLink && (
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <a
              href={result.referenceSlideLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Slide Deck
            </a>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-0 border-none bg-transparent p-0 text-xs opacity-50 hover:opacity-100"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
