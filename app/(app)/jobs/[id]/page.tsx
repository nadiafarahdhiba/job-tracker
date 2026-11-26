import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteJob, updateJob } from "@/app/actions/jobs";
import { deleteContact } from "@/app/actions/contacts";
import { deleteInterview } from "@/app/actions/interviews";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { ContactForm } from "@/components/contact-form";
import { ExternalLink } from "@/components/external-link";
import { InterviewForm } from "@/components/interview-form";
import { JobForm } from "@/components/job-form";
import { JobStatusControl } from "@/components/job-status-control";
import { OutcomeSelect } from "@/components/outcome-select";
import { PageFallback } from "@/components/page-fallback";
import { cardClass } from "@/components/styles";
import { loadPage } from "@/lib/auth";
import {
  SOURCE_LABELS,
  WORK_MODE_LABELS,
  isSource,
  isStatus,
  isWorkMode,
} from "@/lib/constants";
import { formatMoney, formatWhen } from "@/lib/format";
import { getJobDetail } from "@/lib/queries";

export const metadata = { title: "Job" };

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback label="Loading job…" />}>
      <JobDetail params={params} />
    </Suspense>
  );
}

async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  await loadPage();
  const { id } = await params;
  const detail = getJobDetail(id);
  if (!detail) notFound();

  const { job, contacts, interviews, activities } = detail;
  const status = isStatus(job.status) ? job.status : "saved";
  const nowIso = new Date().toISOString();
  const meta = [
    isSource(job.source) ? SOURCE_LABELS[job.source] : job.source,
    job.location,
    isWorkMode(job.workMode) ? WORK_MODE_LABELS[job.workMode] : job.workMode,
  ]
    .filter(Boolean)
    .join(" · ");
  const salary = formatMoney(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const upcoming = interviews.filter(
    (interview) => interview.outcome === "scheduled" && interview.startsAt >= nowIso,
  );
  const past = interviews.filter(
    (interview) =>
      !(interview.outcome === "scheduled" && interview.startsAt >= nowIso),
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/jobs" className="text-sm font-medium text-pine hover:underline">
          Back to jobs
        </Link>
        <p className="mt-3 text-sm font-medium text-muted">{job.company}</p>
        <h1 className="font-serif text-4xl tracking-tight">{job.title}</h1>
        {meta ? <p className="mt-2 text-sm text-muted">{meta}</p> : null}
        <div className="mt-4">
          <JobStatusControl jobId={job.id} status={status} title={job.title} />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {salary ? <p className="text-sm text-muted">{salary}</p> : null}
          {job.appliedAt ? (
            <p className="text-sm text-muted">Applied {formatWhen(job.appliedAt)}</p>
          ) : null}
          {job.url ? <ExternalLink href={job.url}>Open posting</ExternalLink> : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.8fr)]">
        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="mb-4 font-serif text-2xl">Details</h2>
            <JobForm
              action={updateJob}
              submitLabel="Save changes"
              includeStatus={false}
              initial={{
                id: job.id,
                company: job.company,
                title: job.title,
                location: job.location,
                workMode: job.workMode,
                source: job.source,
                url: job.url,
                salaryMin: job.salaryMin,
                salaryMax: job.salaryMax,
                salaryCurrency: job.salaryCurrency,
                followUpOn: job.followUpOn,
                notes: job.notes,
              }}
            />
          </section>

          <section className={cardClass}>
            <h2 className="mb-4 font-serif text-2xl">Activity</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-muted">No activity yet.</p>
            ) : (
              <ol className="space-y-4 border-l border-line pl-4">
                {activities.map((activity) => (
                  <li key={activity.id}>
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted">{formatWhen(activity.createdAt)}</p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="font-serif text-2xl">Contacts</h2>
            {contacts.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No contacts yet.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {contacts.map((contact) => (
                  <li key={contact.id} className="border-b border-line pb-4 last:border-b-0">
                    <p className="font-semibold">{contact.name}</p>
                    {contact.role ? (
                      <p className="text-sm text-muted">{contact.role}</p>
                    ) : null}
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-pine hover:underline"
                      >
                        {contact.email}
                      </a>
                    ) : null}
                    {contact.phone ? (
                      <p className="text-sm text-muted">{contact.phone}</p>
                    ) : null}
                    {contact.link ? (
                      <div>
                        <ExternalLink href={contact.link}>Profile</ExternalLink>
                      </div>
                    ) : null}
                    {contact.notes ? (
                      <p className="mt-1 text-sm text-muted">{contact.notes}</p>
                    ) : null}
                    <div className="mt-2">
                      <ConfirmSubmit
                        action={deleteContact}
                        fields={{ id: contact.id }}
                        label="Remove"
                        confirmLabel="Remove contact"
                        message={`Remove ${contact.name}?`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <ContactForm key={contacts.length} jobId={job.id} />
          </section>

          <section className={cardClass}>
            <h2 className="font-serif text-2xl">Interviews</h2>
            {interviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No interviews yet.</p>
            ) : (
              <div className="mt-4 space-y-5">
                <InterviewGroup title="Upcoming" items={upcoming} />
                <InterviewGroup title="Past" items={past} />
              </div>
            )}
            <InterviewForm
              key={interviews.length}
              jobId={job.id}
              contacts={contacts.map((contact) => ({
                id: contact.id,
                name: contact.name,
              }))}
            />
          </section>

          <section className={cardClass}>
            <h2 className="font-serif text-2xl">Delete</h2>
            <p className="mt-2 text-sm text-muted">
              This removes the job, its contacts, interviews, and history.
            </p>
            <div className="mt-3">
              <ConfirmSubmit
                action={deleteJob}
                fields={{ id: job.id }}
                label="Delete job"
                confirmLabel="Delete permanently"
                message={`Delete ${job.title} at ${job.company}?`}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InterviewGroup({
  title,
  items,
}: {
  title: string;
  items: {
    id: string;
    round: string;
    startsAt: string;
    meetingUrl: string;
    outcome: string;
    notes: string;
    contactName: string | null;
  }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <ul className="mt-2 space-y-4">
        {items.map((interview) => (
          <li key={interview.id} className="space-y-2">
            <div>
              <p className="font-semibold">{interview.round}</p>
              <p className="text-sm text-muted">{formatWhen(interview.startsAt)}</p>
              {interview.contactName ? (
                <p className="text-sm text-muted">{interview.contactName}</p>
              ) : null}
              {interview.notes ? (
                <p className="text-sm text-muted">{interview.notes}</p>
              ) : null}
              {interview.meetingUrl ? (
                <ExternalLink href={interview.meetingUrl}>Join meeting</ExternalLink>
              ) : null}
            </div>
            <OutcomeSelect
              interviewId={interview.id}
              outcome={interview.outcome}
              label={interview.round}
            />
            <ConfirmSubmit
              action={deleteInterview}
              fields={{ id: interview.id }}
              label="Remove"
              confirmLabel="Remove interview"
              message={`Remove ${interview.round}?`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
