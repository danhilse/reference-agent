import { useState } from "react";

// Define filter types
export type FilterCategories =
  | "industry"
  | "marketSegment"
  | "useCase"
  | "crmType";
export type Filters = Record<FilterCategories, string[]>;

// Custom hook to manage all filter state and operations
export function useFilters() {
  // Initialize filter state
  const [filters, setFilters] = useState<Filters>({
    industry: [],
    marketSegment: [],
    useCase: [],
    crmType: [],
  });

  // Add a filter value
  const addFilter = (category: FilterCategories, value: string) => {
    if (!value) return;

    setFilters((prev) => {
      // Only add if not already present
      if (prev[category].includes(value)) return prev;

      return {
        ...prev,
        [category]: [...prev[category], value],
      };
    });
  };

  // Remove a filter value
  const removeFilter = (category: FilterCategories, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((v) => v !== value),
    }));
  };

  // Toggle a filter value
  const toggleFilter = (category: FilterCategories, value: string) => {
    setFilters((prev) => {
      const isSelected = prev[category].includes(value);

      if (isSelected) {
        return {
          ...prev,
          [category]: prev[category].filter((v) => v !== value),
        };
      } else {
        return {
          ...prev,
          [category]: [...prev[category], value],
        };
      }
    });
  };

  // Clear all filters in a category
  const clearCategoryFilters = (category: FilterCategories) => {
    setFilters((prev) => ({
      ...prev,
      [category]: [],
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      industry: [],
      marketSegment: [],
      useCase: [],
      crmType: [],
    });
  };

  // Check if a category has any active filters
  const hasFilters = (category: FilterCategories): boolean => {
    return filters[category].length > 0;
  };

  // Get filter values for API requests
  const getFilterValues = () => {
    return {
      industry: filters.industry.join(","),
      marketSegment: filters.marketSegment.join(","),
      useCase: filters.useCase.join(","),
      crmType: filters.crmType.join(","),
    };
  };

  return {
    filters,
    addFilter,
    removeFilter,
    toggleFilter,
    clearCategoryFilters,
    clearAllFilters,
    hasFilters,
    getFilterValues,
  };
}
