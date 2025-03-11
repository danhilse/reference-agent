// components/ui/LoadingState.tsx
import { useState, useEffect } from "react";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { AnimatedLoadingMessage } from "./AnimatedLoadingMessage";
import { Info } from "lucide-react";

interface LoadingQuoteProps {
  delay: number;
  skipAnimation: boolean;
}

const LoadingQuote = ({ delay, skipAnimation }: LoadingQuoteProps) => {
  const [visible, setVisible] = useState(skipAnimation);

  useEffect(() => {
    if (skipAnimation) {
      setVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, skipAnimation]);

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all ${
        skipAnimation ? "" : "duration-500 ease-in-out"
      } ${
        visible
          ? "max-h-[600px] opacity-100"
          : "max-h-0 overflow-hidden opacity-0"
      }`}
    >
      {/* Quote Section - Main focus */}
      <div className="p-6">
        {/* Compact Metadata Row */}
        <div className="pb-10">
          <div className="flex items-center justify-between border-border pb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="loading-skeleton h-5 w-36 rounded" />{" "}
              {/* Contact name */}
              <div className="loading-skeleton h-4 w-20 rounded opacity-70" />{" "}
              {/* Account name */}
              <div className="text-gray-400 opacity-70">
                <Info className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
              {/* Confidence badge */}
            </div>
          </div>
        </div>

        {/* Quote Content */}
        <div className="relative mb-6 p-10">
          <div className="text-primary-base absolute -left-1 -top-3 text-4xl opacity-20">
            &ldquo;
          </div>
          <div className="space-y-3 pl-4">
            <div className="loading-skeleton h-5 w-full rounded" />
            <div className="loading-skeleton h-5 w-11/12 rounded" />
            <div className="loading-skeleton h-5 w-full rounded" />
            <div className="loading-skeleton h-5 w-10/12 rounded" />
            <div className="loading-skeleton h-5 w-8/12 rounded" />
          </div>
          <div className="text-primary-base absolute -bottom-3 -right-1 text-4xl opacity-20">
            &rdquo;
          </div>
        </div>
      </div>

      {/* Simplified Action Footer */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <div className="flex gap-3">
          <div className="loading-skeleton h-8 w-24 rounded" />{" "}
          {/* Case study button */}
          <div className="loading-skeleton h-8 w-16 rounded" />{" "}
          {/* Slide button */}
        </div>
        <div className="loading-skeleton h-8 w-20 rounded" />{" "}
        {/* Copy button */}
      </div>
    </div>
  );
};

interface LoadingStateProps {
  previouslyLoaded?: boolean;
}

export const LoadingState = ({
  previouslyLoaded = false,
}: LoadingStateProps) => {
  const [showMessage, setShowMessage] = useState(previouslyLoaded);

  useEffect(() => {
    if (previouslyLoaded) {
      setShowMessage(true);
      return;
    }

    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 1200); // Show message after quotes start appearing

    return () => clearTimeout(timer);
  }, [previouslyLoaded]);

  return (
    <div className="w-full space-y-6 transition-all duration-500">
      {/* <div className="mb-4 flex items-center justify-between">
        <div className="loading-skeleton h-6 w-48 rounded" />
        <div className="loading-skeleton h-9 w-24 rounded" />
      </div> */}

      {/* Staggered loading quotes */}
      <LoadingQuote delay={200} skipAnimation={previouslyLoaded} />
      <LoadingQuote delay={600} skipAnimation={previouslyLoaded} />
      <LoadingQuote delay={1000} skipAnimation={previouslyLoaded} />

      {/* Loading message at bottom */}
      <div
        className={`flex items-center justify-center gap-3 py-4 transition-opacity ${
          previouslyLoaded ? "" : "duration-500"
        } ${showMessage ? "opacity-100" : "opacity-0"}`}
      >
        <LoadingSpinner size="medium" className="text-[var(--primary-base)]" />
        <span className="text-[14px] leading-[20px] text-[var(--text-light)]">
          <AnimatedLoadingMessage />
        </span>
      </div>
    </div>
  );
};
