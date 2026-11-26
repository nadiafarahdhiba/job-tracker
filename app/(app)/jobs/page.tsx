import { Suspense } from "react";
import Link from "next/link";
import { FilterForm } from "@/components/filter-form";
import { JobsView } from "@/components/jobs-view";
import { PageFallback } from "@/components/page-fallback";
import { primaryButtonClass } from "@/components/styles";
import { loadPage } from "@/lib/auth";
import { normalizeFilters } from "@/lib/filters";
import { todayISO } from "@/lib/format";
import { listJobCards } from "@/lib/queries";
import type { JobFilters } from "@/lib/types";

export const metadata = { title: "Jobs" };

export default function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobFilters>;
}) {
  return (
    <Suspense fallback={<PageFallback label="Loading jobs…" />}>
      <JobsContent searchParams={searchParams} />
    </Suspense>
  );
}

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<JobFilters>;
}) {
  await loadPage();
  const filters = normalizeFilters(await searchParams);
  const now = new Date();
  const result = listJobCards(filters, now);
  const filtering = Boolean(
    filters.q || filters.stage !== "all" || filters.source !== "all",
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Jobs</h1>
          <p className="mt-2 text-muted">Track roles from any source.</p>
        </div>
        <Link href="/jobs/new" className={primaryButtonClass}>
          Add job
        </Link>
      </header>

      {result.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-12 text-center">
          <h2 className="font-serif text-2xl">No jobs yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Add a role from a company site, a referral, a job board, or anywhere
            else. This list is not limited to LinkedIn.
          </p>
          <Link href="/jobs/new" className={`${primaryButtonClass} mt-5`}>
            Add job
          </Link>
        </div>
      ) : (
        <>
          <FilterForm filters={filters} />
          <p className="text-sm text-muted">
            {filtering
              ? `${result.jobs.length} of ${result.total} jobs`
              : `${result.total} ${result.total === 1 ? "job" : "jobs"}`}
          </p>
          {result.jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted">No jobs match these filters.</p>
              <Link href="/jobs" className="mt-3 inline-block text-sm font-semibold text-pine hover:underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <JobsView jobs={result.jobs} today={todayISO(now)} />
          )}
        </>
      )}
    </div>
  );
}
