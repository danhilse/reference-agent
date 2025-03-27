"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ReferenceSearch from "~/components/reference-search";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Info, LogOut } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { LoginButton } from "~/components/ui/LoginButton";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [aiProvider, setAiProvider] = useState<"anthropic" | "openai">(
    "anthropic",
  );
  const [demoMode, setDemoMode] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Get session from NextAuth
  const { data: session, status } = useSession();
  const isAuthenticated = !!session?.user;
  const isLoading = status === "loading";

  // Effect to set demo mode based on authentication
  useEffect(() => {
    if (isAuthenticated) {
      setDemoMode(false);
    }
  }, [isAuthenticated]);

  // Initial loading animation
  useEffect(() => {
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
      // Turning demo mode ON doesn't require authentication
      setDemoMode(true);
    } else {
      // Turning demo mode OFF requires authentication
      setShowLoginDialog(true);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: window.location.origin });
    setDemoMode(true);
  };

  // Show loading state while checking auth status
  if (loading || isLoading) {
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
      {/* Fixed position demo mode toggle and user status */}
      <div className="absolute right-4 top-4 z-50 flex items-center space-x-4 rounded p-2">
        {/* Show logout button if authenticated */}
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-sm"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </Button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
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
                {demoMode
                  ? "Currently showing example data. Toggle off and sign in to access real customer references."
                  : "Using authenticated data. Toggle on to use example data instead."}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Login Dialog */}
        <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sign in to Act-On</DialogTitle>
              <DialogDescription>
                Use your Act-On credentials to access customer reference data.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <LoginButton onClose={() => setShowLoginDialog(false)} />
            </div>
          </DialogContent>
        </Dialog>
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
                {!demoMode && (
                  <span className="ml-1 font-semibold text-[var(--primary-base)]">
                    (Authenticated)
                  </span>
                )}
              </p>
            </div>
          </div>
          <ReferenceSearch demoMode={demoMode} aiProvider={aiProvider} />
        </div>
      )}
    </main>
  );
}
