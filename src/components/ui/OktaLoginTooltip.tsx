"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";

interface OktaLoginTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  anchor: React.RefObject<HTMLElement>;
}

export function OktaLoginTooltip({
  isOpen,
  onClose,
  anchor,
}: OktaLoginTooltipProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Using the next-auth signIn function with the provider name matching what's in the route.ts file
      await signIn("okta", {
        callbackUrl: window.location.origin,
        redirect: true,
      });
      // Since redirect is true, no need to handle success here as the page will redirect
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate with Okta. Please try again.");
      setIsLoading(false);
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  // Calculate position based on anchor element
  const position = anchor.current
    ? {
        top:
          anchor.current.getBoundingClientRect().bottom + window.scrollY + 10,
        right:
          window.innerWidth -
          (anchor.current.getBoundingClientRect().right + window.scrollX),
      }
    : { top: 0, right: 0 };

  return (
    <>
      {/* Backdrop for clicking outside */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Tooltip content */}
      <div
        className="fixed z-50 w-80 rounded-md border bg-popover p-4 text-popover-foreground shadow-md"
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        <div className="flex flex-col space-y-3">
          <h3 className="text-lg font-semibold">Use Real Data</h3>
          <p className="text-sm text-muted-foreground">
            Sign in with your Act-On credentials to access live customer
            reference data.
          </p>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleLogin} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with Okta"
              )}
            </Button>
          </div>

          {/* Custom arrow styling */}
          <div className="absolute -top-2 right-5 h-3 w-3 rotate-45 transform bg-popover" />
        </div>
      </div>
    </>
  );
}
