import { Suspense } from "react";
import Link from "next/link";
import { loadPage } from "@/lib/auth";
import { STATUS_LABELS, STATUSES } from "@/lib/constants";
import { formatDay, formatWhen, todayISO } from "@/lib/format";
import { getDashboard } from "@/lib/queries";
import { PageFallback } from "@/components/page-fallback";
import { cardClass } from "@/components/styles";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageFallback label="Loading dashboard…" />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await loadPage();
  const now = new Date();
  const today = todayISO(now);
  const data = getDashboard(now);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted">Where every application stands.</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`/jobs?stage=${status}`}
            className="rounded-2xl border border-line bg-card p-4 shadow-sm hover:border-brass"
          >
            <p className="font-serif text-3xl">{data.counts[status]}</p>
            <p className="text-sm text-muted">{STATUS_LABELS[status]}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className={cardClass}>
          <p className="text-sm text-muted">Applied in the last 30 days</p>
          <p className="mt-2 font-serif text-4xl">{data.appliedLast30}</p>
        </article>
        <article className={cardClass}>
          <p className="text-sm text-muted">Reached an interview or offer</p>
          {data.appliedTotal === 0 ? (
            <p className="mt-3 text-sm text-muted">
              Applied jobs show up here once you move one out of Saved.
            </p>
          ) : (
            <>
              <p className="mt-2 font-serif text-4xl">
                {data.reached}
                <span className="ml-2 font-sans text-base text-muted">
                  of {data.appliedTotal}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">
                Applied jobs that reached an interview or an offer.
              </p>
            </>
          )}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={cardClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl">Interviews this week</h2>
            <Link href="/interviews" className="text-sm font-medium text-pine hover:underline">
              View all
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <p className="text-sm text-muted">No interviews in the next 7 days.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcoming.map((interview) => (
                <li key={interview.id}>
                  <Link href={`/jobs/${interview.jobId}`} className="font-semibold hover:underline">
                    {interview.round}
                  </Link>
                  <p className="text-sm text-muted">
                    {interview.company} · {interview.title}
                  </p>
                  <p className="text-sm text-muted">{formatWhen(interview.startsAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className={cardClass}>
          <h2 className="mb-4 font-serif text-2xl">Follow-ups due</h2>
          {data.followUps.length === 0 ? (
            <p className="text-sm text-muted">
              Nothing due. Set a follow-up date on an open job to see it here.
            </p>
          ) : (
            <ul className="space-y-3">
              {data.followUps.map((job) => (
                <li key={job.id}>
                  <Link href={`/jobs/${job.id}`} className="font-semibold hover:underline">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted">{job.company}</p>
                  <p className="text-sm text-muted">
                    {job.followUpOn < today
                      ? `Overdue ${formatDay(job.followUpOn)}`
                      : "Due today"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
}
