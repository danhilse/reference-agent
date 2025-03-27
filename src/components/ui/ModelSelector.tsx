import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Info } from "lucide-react";
import { Label } from "~/components/ui/label";

type AIProvider = "anthropic" | "openai" | "gemini";

interface ModelSelectorProps {
  value: AIProvider;
  onChange: (value: AIProvider) => void;
  disabled?: boolean;
}

export function ModelSelector({
  value,
  onChange,
  disabled = false,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as AIProvider)}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Model" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="anthropic">Claude 3.7 Sonnet</SelectItem>
          <SelectItem value="gemini">Gemini 2.5 Pro</SelectItem>
          <SelectItem value="openai">GPT-4o</SelectItem>
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Select which AI model to use for finding reference matches.
              Different models may return different results.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
