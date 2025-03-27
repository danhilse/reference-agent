// ReferenceQuote.tsx - Fixed version
import { useState } from "react";
import { Check, Copy, ExternalLink, Info } from "lucide-react";
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
  const [showMetadata, setShowMetadata] = useState(false);

  // Confidence styling for both badge and border
  const getConfidenceStyles = () => {
    if (result.confidence >= 90) {
      return {
        badgeClass: "bg-green-100 text-green-800",
        borderClass: "border-green-400",
      };
    } else if (result.confidence >= 75) {
      return {
        badgeClass: "bg-blue-100 text-blue-800",
        borderClass: "border-blue-400",
      };
    } else {
      return {
        badgeClass: "bg-yellow-100 text-yellow-800",
        borderClass: "border-yellow-400",
      };
    }
  };

  const { badgeClass, borderClass } = getConfidenceStyles();

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

  // Check if there's any metadata to show
  const hasMetadata =
    result.useCase || result.industry || result.crm || result.marketSegment;

  // Function to highlight key phrases in the quote
  const renderHighlightedQuote = () => {
    // Debugging information
    console.log(
      `ReferenceQuote ${index} - customerName: ${result.customerName}`,
    );

    // Extract highlight text strings from the highlight objects
    const highlightTexts = result.highlights?.map((h) => h.text) ?? [];
    console.log(`ReferenceQuote ${index} - highlight texts:`, highlightTexts);

    // If no highlights are available or if they're empty, return the original text
    if (!highlightTexts || highlightTexts.length === 0) {
      console.log(`ReferenceQuote ${index} - No highlights available`);
      return (
        <p className="pl-4 text-lg italic leading-relaxed text-gray-500">
          {result.referenceDetail}
        </p>
      );
    }

    // Check for exact matches in the text
    const exactMatches = highlightTexts.filter((highlight) =>
      result.referenceDetail.includes(highlight),
    );

    console.log(
      `ReferenceQuote ${index} - Found ${exactMatches.length} exact matches out of ${highlightTexts.length} highlights`,
    );

    if (exactMatches.length === 0) {
      console.log(
        `ReferenceQuote ${index} - No exact matches found. Original text:`,
        result.referenceDetail.substring(0, 50) + "...",
      );
      console.log(
        `ReferenceQuote ${index} - First highlight:`,
        highlightTexts[0],
      );
      return (
        <p className="pl-4 text-lg italic leading-relaxed text-gray-500">
          {result.referenceDetail}
        </p>
      );
    }

    // Sort highlights by their position in the text
    const sortedHighlights = [...exactMatches].sort(
      (a, b) =>
        result.referenceDetail.indexOf(a) - result.referenceDetail.indexOf(b),
    );

    // Create segments for highlighting
    let remainingText = result.referenceDetail;
    const segments: { text: string; isHighlight: boolean }[] = [];

    sortedHighlights.forEach((highlight) => {
      const highlightIndex = remainingText.indexOf(highlight);
      if (highlightIndex === -1) return;

      // Add text before the highlight
      if (highlightIndex > 0) {
        segments.push({
          text: remainingText.substring(0, highlightIndex),
          isHighlight: false,
        });
      }

      // Add the highlighted text
      segments.push({
        text: highlight,
        isHighlight: true,
      });

      // Update the remaining text
      remainingText = remainingText.substring(
        highlightIndex + highlight.length,
      );
    });

    // Add any remaining text
    if (remainingText.length > 0) {
      segments.push({
        text: remainingText,
        isHighlight: false,
      });
    }

    console.log(
      `ReferenceQuote ${index} - Created ${segments.length} segments`,
    );

    // Render the segments
    return (
      <p className="pl-4 text-lg italic leading-relaxed text-gray-500">
        {segments.map((segment, i) => (
          <span
            key={i}
            className={segment.isHighlight ? "px-0.5 font-bold text-black" : ""}
          >
            {segment.text}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-white px-8 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Quote Section - Main focus */}
      <div className="px-6 py-6 sm:px-0">
        {/* Compact Metadata Row */}
        <div className="pb-10">
          <div className="flex items-center justify-between border-border pb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text font-semibold">
                {result.customerContact}
              </span>
              {result.accountName &&
                result.accountName !== result.customerName && (
                  <span className="text-text-light text-xs">
                    ({result.accountName})
                  </span>
                )}
              {hasMetadata && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-gray-400 hover:bg-transparent hover:text-gray-600"
                  onClick={() => setShowMetadata(!showMetadata)}
                  aria-label={showMetadata ? "Hide details" : "Show details"}
                >
                  <Info className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "text-xs font-semibold hover:bg-transparent",
                  badgeClass,
                )}
              >
                {result.confidence}% match
              </Badge>
            </div>
          </div>
          {/* Toggleable Metadata Section */}
          {showMetadata && hasMetadata && (
            <div className="mt-0 grid grid-cols-2 gap-x-6 gap-y-2 border-b border-gray-100 pb-4 pl-0 pt-0 text-sm">
              {result.useCase && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Use Case</p>
                  <p className="text-text font-medium">{result.useCase}</p>
                </div>
              )}
              {result.industry && (
                <div>
                  <p className="text-xs uppercase text-gray-500">Industry</p>
                  <p className="text-text font-medium">{result.industry}</p>
                </div>
              )}
              {result.crm && (
                <div>
                  <p className="text-xs uppercase text-gray-500">CRM</p>
                  <p className="text-text font-medium">{result.crm}</p>
                </div>
              )}
              {result.marketSegment && (
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Market Segment
                  </p>
                  <p className="text-text font-medium">
                    {result.marketSegment}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <blockquote className="relative mb-6 p-10 font-semibold text-gray-700">
          <span className="text-primary-base absolute left-1 top-4 text-4xl opacity-20">
            &quot;
          </span>
          {renderHighlightedQuote()}
          <span className="text-primary-base absolute bottom-4 right-1 text-4xl opacity-20">
            &quot;
          </span>
        </blockquote>
      </div>

      {/* Simplified Action Footer */}
      <div className="flex items-center justify-between border-t border-border px-0 py-3">
        <div className="flex gap-3">
          {result.caseStudyLink && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-base hover:text-primary-hover h-8 p-0 text-xs hover:bg-transparent"
              asChild
            >
              <a
                href={result.caseStudyLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3 w-3" />
                {result.referenceType}
              </a>
            </Button>
          )}

          {result.referenceSlideLink && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-base hover:text-primary-hover h-8 p-0 text-xs hover:bg-transparent"
              asChild
            >
              <a
                href={result.referenceSlideLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3 w-3" />
                Slide
              </a>
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary-base hover:text-primary-hover text-xs hover:bg-transparent"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="text-success-base mr-1.5 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
