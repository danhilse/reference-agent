import type { FilterCategory } from "~/components/Filters/FilterChipsInput";

// Filter categories data with brand colors
export const filterData: FilterCategory[] = [
  {
    id: "industry",
    label: "Industry",
    color: "#00babe", // Primary teal
    options: [
      {
        value: "Accounting/Financial Services",
        label: "Accounting/Financial Services",
      },
      { value: "Healthcare", label: "Healthcare" },
      { value: "Technology", label: "Technology" },
      { value: "Manufacturing", label: "Manufacturing" },
      { value: "Education", label: "Education" },
    ],
  },
  {
    id: "marketSegment",
    label: "Market Segment",
    color: "#304A71", // Dark blue
    options: [
      { value: "SMB", label: "SMB" },
      { value: "Mid Market", label: "Mid Market" },
      { value: "Enterprise", label: "Enterprise" },
    ],
  },
  {
    id: "useCase",
    label: "Use Case",
    color: "#69B466", // Success green
    options: [
      { value: "Ease of Use", label: "Ease of Use" },
      { value: "Lead Generation", label: "Lead Generation" },
      { value: "Marketing Automation", label: "Marketing Automation" },
      { value: "Reporting", label: "Reporting" },
      { value: "Email Marketing", label: "Email Marketing" },
    ],
  },
  {
    id: "crmType",
    label: "CRM Type",
    color: "#F25656", // Brand red
    options: [
      { value: "Salesforce", label: "Salesforce" },
      { value: "Microsoft Dynamics", label: "Microsoft Dynamics" },
      { value: "HubSpot", label: "HubSpot" },
      { value: "None", label: "None" },
    ],
  },
];