import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { cn } from "~/lib/utils";
import { useFilters, type FilterCategories } from "~/hooks/useFilters";
import { filterData } from "~/constants/filterData";
import { RotatingPlaceholder } from "./RotatingPlaceholder";

// Types
export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterCategory {
  id: FilterCategories;
  label: string;
  options: FilterOption[];
  color: string;
}

interface FilterChipsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; // Optional prop for static placeholder
  required?: boolean;
  filtersHook: ReturnType<typeof useFilters>;
  onFocus?: () => void; // Prop for handling focus
  onBlur?: () => void; // Prop for handling blur
  collapseFilterButton?: boolean; // Control whether the filter button text collapses
}

const FilterChipsInput: React.FC<FilterChipsInputProps> = ({
  value,
  onChange,
  placeholder: staticPlaceholder = "",
  required = false,
  filtersHook,
  onFocus,
  onBlur,
  collapseFilterButton = false, // Default to false - always show text
}) => {
  const { filters, toggleFilter, removeFilter, hasFilters } = filtersHook;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filterSectionRef = useRef<HTMLDivElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState("auto");
  const [isHoveringFilter, setIsHoveringFilter] = useState(false);
  const [mainPopoverOpen, setMainPopoverOpen] = useState(false);

  // Focus state tracking
  const [isFocused, setIsFocused] = useState(false);
  // Dynamic placeholder from RotatingPlaceholder
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState("");

  // Helper to get display label for a filter value
  const getFilterLabel = (
    filterId: FilterCategories,
    value: string,
  ): string => {
    const category = filterData.find((cat) => cat.id === filterId);
    if (!category) return value;
    const option = category.options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Helper to get filter color
  const getFilterColor = (filterId: FilterCategories): string => {
    const category = filterData.find((cat) => cat.id === filterId);
    return category?.color ?? "#00babe";
  };

  // Custom filter toggle function that also closes the menu
  const handleFilterToggle = (categoryId: FilterCategories, value: string) => {
    toggleFilter(categoryId, value);
    setMainPopoverOpen(false);
  };

  // Handle focus and blur events
  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  // Handle key press events for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift, submit the form
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default (newline)
      setIsFocused(false);

      // Programmatically remove focus from the textarea
      textareaRef.current?.blur();

      // Find the parent form and submit it
      const form = textareaRef.current?.closest("form");
      if (form) {
        form.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
      }
    }
    // If Shift+Enter is pressed, allow default behavior (new line)
  };

  // Handle placeholder changes from RotatingPlaceholder
  const handlePlaceholderChange = (newPlaceholder: string) => {
    setDynamicPlaceholder(newPlaceholder);
  };

  // Auto-resize textarea based on content and filter section height
  useEffect(() => {
    if (textareaRef.current && filterSectionRef.current) {
      // Set to auto height first to get the real scroll height
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const filterHeight = filterSectionRef.current.offsetHeight;

      // Add a minimum height of 100px or use scroll height if larger
      // Plus add padding for the filter section
      const newHeight = `${Math.max(100, scrollHeight)}px`;
      textareaRef.current.style.height = newHeight;
      setTextAreaHeight(newHeight);

      // Update padding-bottom to account for the filter section height
      textareaRef.current.style.paddingBottom = `${filterHeight + 8}px`; // 8px extra padding
    }
  }, [value, filters]); // Re-run when filters change too

  return (
    <div className="relative overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-ring focus:border-transparent">
      {/* Include the RotatingPlaceholder component */}
      <RotatingPlaceholder
        onPlaceholderChange={handlePlaceholderChange}
        inputValue={value}
        isFocused={isFocused}
      />

      {/* Text input section */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="" // Empty because we're using our custom overlay placeholder
        className="w-full resize-none px-3 py-3 text-sm outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        style={{
          minHeight: "100px",
          height: textAreaHeight,
          // paddingBottom will be dynamically set in the useEffect
        }}
        required={required}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {/* Custom placeholder overlay - show when input is empty (regardless of focus) */}
      {value === "" && dynamicPlaceholder && (
        <div
          className="pointer-events-none absolute left-0 top-0 p-3 text-sm"
          style={{ opacity: 0.5 }} // Reduced opacity for placeholder
        >
          {dynamicPlaceholder}
        </div>
      )}

      {/* Filter section - always present */}
      <div
        ref={filterSectionRef}
        className="absolute bottom-0 left-0 right-0 flex min-h-[36px] flex-wrap items-center gap-1.5 bg-muted/20 px-2 py-1.5"
      >
        {/* Filter chips */}
        {Object.entries(filters).map(([categoryId, values]) =>
          // Skip empty categories
          values.length > 0
            ? // Map each value to a chip
              values.map((value) => (
                <div
                  key={`${categoryId}-${value}`}
                  className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: `${getFilterColor(categoryId as FilterCategories)}15`,
                    color: getFilterColor(categoryId as FilterCategories),
                  }}
                >
                  <span className="font-medium">
                    {filterData.find((cat) => cat.id === categoryId)?.label}:{" "}
                    {getFilterLabel(categoryId as FilterCategories, value)}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    style={{
                      color: getFilterColor(categoryId as FilterCategories),
                    }}
                    onClick={() =>
                      removeFilter(categoryId as FilterCategories, value)
                    }
                  >
                    <X className="h-2.5 w-2.5" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </div>
              ))
            : null,
        )}

        {/* Add filter button - always present in filter section */}
        <Popover
          open={mainPopoverOpen}
          onOpenChange={(open) => {
            setMainPopoverOpen(open);
            // Keep the hover effect when popover is open
            if (open) {
              setIsHoveringFilter(true);
            } else {
              // Only reset hover state if not actually hovering
              if (!isHoveringFilter) {
                setIsHoveringFilter(false);
              }
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className={cn(
                "h-6 rounded-full border border-transparent px-1 text-xs text-gray-400 opacity-60 transition-all duration-300 hover:bg-white hover:text-gray-500",
                (isHoveringFilter || mainPopoverOpen) &&
                  "border-gray-300 bg-gray-100 text-gray-500 opacity-100",
                // Always apply right padding when not collapsing or when hovering/open
                (!collapseFilterButton ||
                  isHoveringFilter ||
                  mainPopoverOpen) &&
                  "pr-2",
              )}
              onMouseEnter={() => setIsHoveringFilter(true)}
              onMouseLeave={() => {
                // Only remove hover state if popover is closed
                if (!mainPopoverOpen) {
                  setIsHoveringFilter(false);
                }
              }}
            >
              <Plus
                className={cn(
                  "h-3 w-3 transition-transform duration-200",
                  mainPopoverOpen && "rotate-45",
                )}
              />
              <span
                className={cn(
                  "duration-400 overflow-hidden whitespace-nowrap transition-all",
                  collapseFilterButton
                    ? isHoveringFilter || mainPopoverOpen
                      ? "ml-1 max-w-24 opacity-100"
                      : "w-0 opacity-0"
                    : "ml-1 max-w-24 opacity-100", // Always show when not collapsing
                )}
              >
                Add Filter
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="grid gap-1.5">
              <p className="text-sm font-medium">Filter by</p>
              {filterData.map((category) => (
                <HoverCard key={category.id} openDelay={0} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start font-normal"
                      size="sm"
                      style={{ color: category.color }}
                    >
                      {category.label}
                      {hasFilters(category.id) && (
                        <span
                          className="ml-auto h-2 w-2 rounded-full"
                          style={{ backgroundColor: category.color }}
                        ></span>
                      )}
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    align="start"
                    sideOffset={5}
                    className="w-64 p-2"
                  >
                    <div className="grid gap-1.5">
                      <p className="text-sm font-medium">
                        Select {category.label.toLowerCase()}
                      </p>
                      <div className="grid gap-0.5">
                        {category.options.map((option) => {
                          const isSelected = filters[category.id].includes(
                            option.value,
                          );

                          return (
                            <Button
                              key={option.value}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-left font-normal"
                              style={{
                                color: category.color,
                                backgroundColor: isSelected
                                  ? `${category.color}15`
                                  : undefined,
                              }}
                              onClick={() =>
                                handleFilterToggle(category.id, option.value)
                              }
                            >
                              <span className="mr-auto">{option.label}</span>
                              {isSelected && (
                                <Check className="ml-2 h-4 w-4 flex-shrink-0" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FilterChipsInput;
