"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Lock, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface PasswordTooltipProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
  anchor: React.RefObject<HTMLElement>;
}

export function PasswordTooltip({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error = null,
  anchor,
}: PasswordTooltipProps) {
  const [password, setPassword] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: "0px", left: "0px" });

  // Update position whenever the tooltip is opened or window is resized
  useEffect(() => {
    const updatePosition = () => {
      if (!anchor.current || !tooltipRef.current) return;

      const anchorRect = anchor.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      // Center the tooltip under the anchor
      const top = anchorRect.bottom + 10; // 10px below the anchor

      // Position it centered, based on the anchor's position
      const left =
        anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;

      // Make sure the tooltip doesn't go off-screen
      const boundedLeft = Math.max(
        10,
        Math.min(left, window.innerWidth - tooltipRect.width - 10),
      );

      setPosition({
        top: `${top}px`,
        left: `${boundedLeft}px`,
      });
    };

    if (isOpen) {
      // Initial position
      setTimeout(updatePosition, 0);

      // Update position on resize
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [isOpen, anchor]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        anchor.current &&
        !anchor.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, anchor]);

  const handleFormAction = async (formData: FormData) => {
    await onSubmit(formData);
    setPassword("");
  };

  if (!isOpen) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 min-w-[300px] rounded-md border border-border bg-white p-4 shadow-md"
      style={{ top: position.top, right: 29 }}
    >
      <div className="absolute -top-2 right-1/3 h-2 w-2 -translate-x-1/2 rotate-45 border-l border-t border-border bg-white" />

      <form ref={formRef} action={handleFormAction} className="space-y-3">
        <div className="flex items-center space-x-2 text-sm font-medium">
          <Lock className="h-4 w-4 text-primary" />
          <span>Enter password to disable Demo Mode</span>
        </div>

        <Input
          ref={inputRef}
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(error && "border-destructive")}
          placeholder="Password"
          autoFocus
          disabled={isSubmitting}
        />

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                Verifying...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
