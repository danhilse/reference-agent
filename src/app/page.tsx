"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReferenceSearch from "~/components/reference-search";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { ModelSelector } from "~/components/ui/ModelSelector";
import type { AIProvider } from "~/lib/types";

// Import the server action
import { validateDemoPassword, isDemoDisabled } from "~/lib/auth-actions";
import { PasswordTooltip } from "~/components/ui/PasswordTooltip";

// TypeScript interface for our password tooltip
interface PasswordSubmitResult {
  success: boolean;
  error: string | null;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  // Demo mode state with default value of true
  const [demoMode, setDemoMode] = useState(true);
  const [aiProvider, setAiProvider] = useState<AIProvider>("anthropic");

  // State for password protection
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Ref for demo toggle
  const demoToggleRef = useRef<HTMLDivElement>(null);

  // Check if the user has already authenticated from a cookie
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const disabled = await isDemoDisabled();
        if (disabled) {
          setDemoMode(false);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    void checkAuth();
  }, []);

  useEffect(() => {
    // Simulate loading for 1.8 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Function to skip the loading animation
  const handleSkip = () => {
    setLoading(false);
  };

  // Handle demo mode toggle
  const handleDemoToggle = (checked: boolean) => {
    if (checked) {
      // Turning demo mode ON doesn't require password
      setDemoMode(true);
    } else {
      // Turning demo mode OFF requires password
      setShowPasswordTooltip(true);
    }
  };

  // Handle password submission with server-side validation
  const handlePasswordSubmit = async (formData: FormData) => {
    setIsAuthenticating(true);
    setPasswordError(null);

    try {
      const result = await validateDemoPassword(formData);

      if (result.success) {
        setDemoMode(false);
        setShowPasswordTooltip(false);
        return true;
      } else {
        setPasswordError(result.error ?? "Authentication failed");
        return false;
      }
    } catch (error) {
      console.error("Error validating password:", error);
      setPasswordError("An unexpected error occurred. Please try again.");
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Show loading state while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--app-background)]">
        <Image
          src="/loading_logo 2.svg"
          alt="Act-On Loading"
          width={200}
          height={200}
          priority
          className="animate-pulse"
        />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-background)]">
      {/* Model selector in top left */}
      <div className="absolute left-4 top-4 z-50 rounded p-2">
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-muted-foreground">AI Model:</Label>
          <ModelSelector
            value={aiProvider}
            onChange={(value) => setAiProvider(value)}
          />
        </div>
      </div>

      {/* Demo mode toggle in top right */}
      <div className="absolute right-4 top-4 z-50 flex items-center space-x-2 rounded p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div ref={demoToggleRef} className="flex items-center space-x-2">
                <Switch
                  id="demo-mode"
                  checked={demoMode}
                  onCheckedChange={handleDemoToggle}
                />
                <Label
                  htmlFor="demo-mode"
                  className="flex items-center text-sm text-muted-foreground"
                >
                  Demo Mode
                  <Info className="ml-1 h-3 w-3" />
                </Label>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Generate realistic reference examples instantly without calling
                the AI API
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Password tooltip */}
        {showPasswordTooltip && (
          <PasswordTooltip
            isOpen={showPasswordTooltip}
            onClose={() => setShowPasswordTooltip(false)}
            onSubmit={handlePasswordSubmit}
            isSubmitting={isAuthenticating}
            error={passwordError}
            anchor={demoToggleRef}
          />
        )}
      </div>

      {loading ? (
        <div
          className="flex cursor-pointer flex-col items-center justify-center"
          onClick={handleSkip}
        >
          <Image
            src="/loading_logo 2.svg"
            alt="Act-On Loading"
            width={500}
            height={500}
            priority
            className="absolute animate-pulse"
          />
        </div>
      ) : (
        <div className="container-acton py-8 transition-opacity duration-500">
          <div className="mb-8 flex flex-col items-center gap-6">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-QeR7XHkv78gXqGGllmqPRBmwwBJUl5.svg"
              alt="Act-On Logo"
              width={150}
              height={55}
              priority
            />
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[var(--text)]">
                Customer Reference Agent
              </h1>
              <p className="mt-1 text-[var(--text-light)]">
                Find customer quotes and references for sales conversations
              </p>
            </div>
          </div>
          <ReferenceSearch demoMode={demoMode} aiProvider={aiProvider} />
        </div>
      )}
    </main>
  );
}
