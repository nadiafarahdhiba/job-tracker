import { Suspense } from "react";
import Link from "next/link";
import { JobForm } from "@/components/job-form";
import { PageFallback } from "@/components/page-fallback";
import { cardClass } from "@/components/styles";
import { createJob } from "@/app/actions/jobs";
import { loadPage } from "@/lib/auth";

export const metadata = { title: "Add job" };

export default function NewJobPage() {
  return (
    <Suspense fallback={<PageFallback label="Loading form…" />}>
      <NewJob />
    </Suspense>
  );
}

async function NewJob() {
  await loadPage();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/jobs" className="text-sm font-medium text-pine hover:underline">
          Back to jobs
        </Link>
        <h1 className="mt-3 font-serif text-4xl tracking-tight">Add a job</h1>
        <p className="mt-2 text-muted">
          A posting, a referral, or a note from a conversation. The link and
          salary can wait.
        </p>
      </div>
      <div className={cardClass}>
        <JobForm action={createJob} submitLabel="Add job" cancelHref="/jobs" />
      </div>
    </div>
  );
}
