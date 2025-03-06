// components/ui/StaggeredLoadingState.tsx
import { useState, useEffect } from "react";
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { AnimatedLoadingMessage } from "./AnimatedLoadingMessage";

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
      className={`rounded-lg border bg-card p-4 shadow-sm transition-all ${skipAnimation ? "" : "duration-500 ease-in-out"} ${visible ? "max-h-[400px] opacity-100" : "max-h-0 overflow-hidden opacity-0"} `}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="loading-skeleton h-5 w-36 rounded" />{" "}
          {/* Company name */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Industry badge */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Market segment badge */}
        </div>
        <div className="loading-skeleton ml-auto h-5 w-24 rounded-full" />{" "}
        {/* Confidence badge */}
      </div>

      {/* Quote content */}
      <div className="my-3 border-l-4 border-primary pl-4">
        <div className="space-y-2">
          <div className="loading-skeleton h-4 w-full rounded" />
          <div className="loading-skeleton h-4 w-11/12 rounded" />
          <div className="loading-skeleton h-4 w-9/12 rounded" />
        </div>
      </div>

      {/* Contact info */}
      <div className="mt-3 space-y-2 text-sm text-muted-foreground">
        <div className="loading-skeleton h-4 w-48 rounded" /> {/* Contact */}
        <div className="loading-skeleton h-4 w-40 rounded" /> {/* Use Case */}
        <div className="loading-skeleton h-4 w-36 rounded" /> {/* CRM */}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* Reference type button */}
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* Slide deck button */}
        <div className="loading-skeleton ml-auto h-8 w-20 rounded" />{" "}
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
      <div className="mb-4 flex items-center justify-between">
        <div className="loading-skeleton h-6 w-48 rounded" />
        <div className="loading-skeleton h-9 w-24 rounded" />
      </div>

      {/* Staggered loading quotes */}
      <LoadingQuote delay={200} skipAnimation={previouslyLoaded} />
      <LoadingQuote delay={600} skipAnimation={previouslyLoaded} />
      <LoadingQuote delay={1000} skipAnimation={previouslyLoaded} />

      {/* Loading message at bottom */}
      <div
        className={`flex items-center justify-center gap-3 py-4 transition-opacity ${previouslyLoaded ? "" : "duration-500"} ${showMessage ? "opacity-100" : "opacity-0"} `}
      >
        <LoadingSpinner size="medium" className="text-[var(--primary-base)]" />
        <span className="text-[14px] leading-[20px] text-[var(--text-light)]">
          <AnimatedLoadingMessage />
        </span>
      </div>
    </div>
  );
};
