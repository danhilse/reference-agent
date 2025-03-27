"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverArrow } from "~/components/ui/popover";
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
      await signIn("okta", { callbackUrl: window.location.href });
      // The page will redirect to Okta, no need to handle success here
    } catch (err) {
      console.error("Authentication error:", err);
      setError("Failed to authenticate with Okta. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <PopoverContent
        align="end"
        className="w-80 p-4"
        alignOffset={-10}
        side="bottom"
        sideOffset={10}
        // This is how we position relative to the ref
        anchorRef={anchor}
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

          <PopoverArrow className="fill-background" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
