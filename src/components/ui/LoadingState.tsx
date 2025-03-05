// components/ui/LoadingState.tsx
import { LoadingSpinner } from "~/components/ui/LoadingSpinner";
import { AnimatedLoadingMessage } from "./AnimatedLoadingMessage";

export const LoadingState = () => (
  <div className="space-y-6">
    <div className="mb-4 flex items-center justify-between">
      <div className="loading-skeleton h-6 w-48 rounded" />
      <div className="loading-skeleton h-9 w-24 rounded" />
    </div>

    {/* Reference Quote Card 1 */}
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="loading-skeleton h-5 w-36 rounded" />{" "}
          {/* Company name */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Industry badge */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Market segment badge */}
        </div>
        <div className="loading-skeleton ml-auto h-5 w-24 rounded-full" />{" "}
        {/* Confidence badge */}
      </div>

      {/* Quote content */}
      <div className="border-primary my-3 border-l-4 pl-4">
        <div className="space-y-2">
          <div className="loading-skeleton h-4 w-full rounded" />
          <div className="loading-skeleton h-4 w-11/12 rounded" />
          <div className="loading-skeleton h-4 w-9/12 rounded" />
        </div>
      </div>

      {/* Contact info */}
      <div className="text-muted-foreground mt-3 space-y-2 text-sm">
        <div className="loading-skeleton h-4 w-48 rounded" /> {/* Contact */}
        <div className="loading-skeleton h-4 w-40 rounded" /> {/* Use Case */}
        <div className="loading-skeleton h-4 w-36 rounded" /> {/* CRM */}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* Reference type button */}
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* Slide deck button */}
        <div className="loading-skeleton ml-auto h-8 w-20 rounded" />{" "}
        {/* Copy button */}
      </div>
    </div>

    {/* Reference Quote Card 2 */}
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="loading-skeleton h-5 w-36 rounded" />{" "}
          {/* Company name */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Industry badge */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Market segment badge */}
        </div>
        <div className="loading-skeleton ml-auto h-5 w-24 rounded-full" />{" "}
        {/* Confidence badge */}
      </div>

      {/* Quote content */}
      <div className="border-primary my-3 border-l-4 pl-4">
        <div className="space-y-2">
          <div className="loading-skeleton h-4 w-full rounded" />
          <div className="loading-skeleton h-4 w-11/12 rounded" />
          <div className="loading-skeleton h-4 w-10/12 rounded" />
          <div className="loading-skeleton h-4 w-8/12 rounded" />
        </div>
      </div>

      {/* Contact info */}
      <div className="text-muted-foreground mt-3 space-y-2 text-sm">
        <div className="loading-skeleton h-4 w-44 rounded" /> {/* Contact */}
        <div className="loading-skeleton h-4 w-52 rounded" /> {/* Use Case */}
        <div className="loading-skeleton h-4 w-32 rounded" /> {/* CRM */}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* G2 Review Button */}
        <div className="loading-skeleton ml-auto h-8 w-20 rounded" />{" "}
        {/* Copy button */}
      </div>
    </div>

    {/* Reference Quote Card 3 */}
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="loading-skeleton h-5 w-40 rounded" />{" "}
          {/* Company name */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Industry badge */}
          <div className="loading-skeleton h-5 w-24 rounded-full" />{" "}
          {/* Market segment badge */}
        </div>
        <div className="loading-skeleton ml-auto h-5 w-24 rounded-full" />{" "}
        {/* Confidence badge */}
      </div>

      {/* Quote content */}
      <div className="border-primary my-3 border-l-4 pl-4">
        <div className="space-y-2">
          <div className="loading-skeleton h-4 w-full rounded" />
          <div className="loading-skeleton h-4 w-11/12 rounded" />
          <div className="loading-skeleton h-4 w-9/12 rounded" />
        </div>
      </div>

      {/* Contact info */}
      <div className="text-muted-foreground mt-3 space-y-2 text-sm">
        <div className="loading-skeleton h-4 w-48 rounded" /> {/* Contact */}
        <div className="loading-skeleton h-4 w-36 rounded" /> {/* Use Case */}
        <div className="loading-skeleton h-4 w-32 rounded" /> {/* CRM */}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="loading-skeleton h-8 w-28 rounded" />{" "}
        {/* Testimonial button */}
        <div className="loading-skeleton ml-auto h-8 w-20 rounded" />{" "}
        {/* Copy button */}
      </div>
    </div>

    {/* Loading message at bottom */}
    <div className="flex items-center justify-center gap-3 py-4">
      <LoadingSpinner size="medium" className="text-[var(--primary-base)]" />
      <span className="text-[14px] leading-[20px] text-[var(--text-light)]">
        <AnimatedLoadingMessage />
      </span>
    </div>
  </div>
);
