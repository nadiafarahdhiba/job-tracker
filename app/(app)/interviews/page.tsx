import { Suspense } from "react";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { OutcomeSelect } from "@/components/outcome-select";
import { PageFallback } from "@/components/page-fallback";
import { cardClass } from "@/components/styles";
import { loadPage } from "@/lib/auth";
import { formatWhen } from "@/lib/format";
import { listInterviews } from "@/lib/queries";

export const metadata = { title: "Interviews" };

export default function InterviewsPage() {
  return (
    <Suspense fallback={<PageFallback label="Loading interviews…" />}>
      <Interviews />
    </Suspense>
  );
}

async function Interviews() {
  await loadPage();
  const { upcoming, past } = listInterviews(new Date());

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-serif text-4xl tracking-tight">Interviews</h1>
        <p className="mt-2 text-muted">Upcoming first, then everything else.</p>
      </header>
      <InterviewSection title="Upcoming" items={upcoming} empty="No upcoming interviews." />
      <InterviewSection title="Past" items={past} empty="No past interviews." />
    </div>
  );
}

function InterviewSection({
  title,
  items,
  empty,
}: {
  title: string;
  empty: string;
  items: {
    id: string;
    jobId: string;
    company: string;
    title: string;
    round: string;
    startsAt: string;
    meetingUrl: string;
    outcome: string;
    notes: string;
  }[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-2xl">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((interview) => (
            <li key={interview.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{interview.round}</p>
                  <Link
                    href={`/jobs/${interview.jobId}`}
                    className="text-sm text-pine hover:underline"
                  >
                    {interview.title} · {interview.company}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{formatWhen(interview.startsAt)}</p>
                  {interview.notes ? (
                    <p className="mt-2 text-sm text-muted">{interview.notes}</p>
                  ) : null}
                  {interview.meetingUrl ? (
                    <div className="mt-2">
                      <ExternalLink href={interview.meetingUrl}>Join meeting</ExternalLink>
                    </div>
                  ) : null}
                </div>
                <div className="w-full sm:w-44">
                  <OutcomeSelect
                    interviewId={interview.id}
                    outcome={interview.outcome}
                    label={interview.round}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
