"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ReferenceSearch from "~/components/reference-search";
import ReferenceSearchRedesigned from "~/components/ReferenceSearchRedesigned";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export default function Home() {
  const [loading, setLoading] = useState(true);
  // Demo mode state with default value of true
  const [demoMode, setDemoMode] = useState(true);
  const [aiProvider, setAiProvider] = useState<"anthropic" | "openai">(
    "anthropic",
  );

  useEffect(() => {
    // Simulate loading for 3 seconds
    const loadingTimer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Function to skip the loading animation
  const handleSkip = () => {
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--app-background)]">
      {/* Fixed position demo mode toggle */}
      <div className="absolute right-4 top-4 z-50 flex items-center space-x-2 rounded p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-2">
                <Switch
                  id="demo-mode"
                  checked={demoMode}
                  onCheckedChange={setDemoMode}
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
      </div>

      {loading ? (
        <div
          className="flex cursor-pointer flex-col items-center justify-center"
          onClick={handleSkip}
        >
          {/* <Image
            src="/loading_logo.svg"
            alt="Act-On Loading"
            width={500}
            height={500}
            priority
            className="absolute animate-pulse"
          /> */}
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
          {/* <ReferenceSearchRedesigned /> */}
        </div>
      )}
    </main>
  );
}
