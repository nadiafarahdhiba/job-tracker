import "server-only";

import { desc, eq } from "drizzle-orm";
import {
  SOURCE_LABELS,
  WORK_MODE_LABELS,
  activityShowsInterview,
  isOpenStatus,
  isSource,
  isStatus,
  isWorkMode,
  type JobStatus,
} from "./constants";
import { db } from "./db";
import { formatMoney, formatWhen } from "./format";
import { activities, contacts, interviews, jobs } from "./schema";
import type { JobCardData, NormalizedFilters } from "./types";

function jobReachedInterview(
  jobId: string,
  status: JobStatus,
  interviewJobIds: Set<string>,
  activityRows: { jobId: string; kind: string; message: string }[],
) {
  if (status === "interviewing" || status === "offer") return true;
  if (interviewJobIds.has(jobId)) return true;
  return activityRows.some(
    (activity) =>
      activity.jobId === jobId &&
      activityShowsInterview(activity.kind, activity.message),
  );
}

export function listJobCards(filters: NormalizedFilters, now: Date) {
  const jobRows = db.select().from(jobs).orderBy(desc(jobs.updatedAt)).all();
  const interviewRows = db.select().from(interviews).all();
  const nowIso = now.toISOString();
  const interviewMeta = new Map<
    string,
    { count: number; next: string | null }
  >();

  for (const interview of interviewRows) {
    const current = interviewMeta.get(interview.jobId) ?? {
      count: 0,
      next: null,
    };
    current.count += 1;
    if (interview.outcome === "scheduled" && interview.startsAt >= nowIso) {
      if (!current.next || interview.startsAt < current.next) {
        current.next = interview.startsAt;
      }
    }
    interviewMeta.set(interview.jobId, current);
  }

  const query = filters.q.toLowerCase();
  const cards: JobCardData[] = [];

  for (const job of jobRows) {
    const status = isStatus(job.status) ? job.status : "saved";
    if (filters.stage !== "all" && status !== filters.stage) continue;
    if (filters.source !== "all" && job.source !== filters.source) continue;
    if (query) {
      const haystack = `${job.company} ${job.title} ${job.notes}`.toLowerCase();
      if (!haystack.includes(query)) continue;
    }

    const meta = [
      job.location,
      isWorkMode(job.workMode) ? WORK_MODE_LABELS[job.workMode] : job.workMode,
    ]
      .filter(Boolean)
      .join(" · ");
    const extra = interviewMeta.get(job.id);

    cards.push({
      id: job.id,
      title: job.title,
      company: job.company,
      status,
      sourceLabel: isSource(job.source) ? SOURCE_LABELS[job.source] : job.source,
      meta,
      salaryLabel: formatMoney(job.salaryMin, job.salaryMax, job.salaryCurrency),
      followUpOn: job.followUpOn,
      nextInterviewLabel: extra?.next
        ? `Interview ${formatWhen(extra.next)}`
        : null,
      interviewCount: extra?.count ?? 0,
    });
  }

  return { total: jobRows.length, jobs: cards };
}

export function getJob(id: string) {
  return db.select().from(jobs).where(eq(jobs.id, id)).get() ?? null;
}

export function getJobDetail(id: string) {
  const job = getJob(id);
  if (!job) return null;
  const contactRows = db
    .select()
    .from(contacts)
    .where(eq(contacts.jobId, id))
    .all()
    .sort((a, b) => a.name.localeCompare(b.name));
  const names = new Map(contactRows.map((contact) => [contact.id, contact.name]));
  const interviewRows = db
    .select()
    .from(interviews)
    .where(eq(interviews.jobId, id))
    .all()
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((interview) => ({
      ...interview,
      contactName: interview.contactId
        ? (names.get(interview.contactId) ?? null)
        : null,
    }));
  const activityRows = db
    .select()
    .from(activities)
    .where(eq(activities.jobId, id))
    .all()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { job, contacts: contactRows, interviews: interviewRows, activities: activityRows };
}

export function getDashboard(now: Date) {
  const jobRows = db.select().from(jobs).all();
  const interviewRows = db.select().from(interviews).all();
  const activityRows = db.select().from(activities).all();
  const counts = {
    saved: 0,
    applied: 0,
    interviewing: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };
  const interviewJobIds = new Set(interviewRows.map((row) => row.jobId));
  const jobsById = new Map(jobRows.map((job) => [job.id, job]));
  const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  let appliedLast30 = 0;
  let appliedTotal = 0;
  let reached = 0;
  const followUps: {
    id: string;
    company: string;
    title: string;
    followUpOn: string;
  }[] = [];

  for (const job of jobRows) {
    const status = isStatus(job.status) ? job.status : "saved";
    counts[status] += 1;
    if (job.appliedAt) {
      appliedTotal += 1;
      if (job.appliedAt >= cutoff) appliedLast30 += 1;
      if (jobReachedInterview(job.id, status, interviewJobIds, activityRows)) {
        reached += 1;
      }
    }
    if (job.followUpOn && job.followUpOn <= today && isOpenStatus(status)) {
      followUps.push({
        id: job.id,
        company: job.company,
        title: job.title,
        followUpOn: job.followUpOn,
      });
    }
  }

  followUps.sort((a, b) => a.followUpOn.localeCompare(b.followUpOn) || a.company.localeCompare(b.company));

  const upcoming = interviewRows
    .filter(
      (interview) =>
        interview.outcome === "scheduled" &&
        interview.startsAt >= nowIso &&
        interview.startsAt <= soon,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .flatMap((interview) => {
      const job = jobsById.get(interview.jobId);
      if (!job) return [];
      return [
        {
          id: interview.id,
          jobId: job.id,
          company: job.company,
          title: job.title,
          round: interview.round,
          startsAt: interview.startsAt,
        },
      ];
    });

  return { counts, appliedLast30, appliedTotal, reached, followUps, upcoming };
}

export function listInterviews(now: Date) {
  const interviewRows = db.select().from(interviews).all();
  const jobRows = db.select().from(jobs).all();
  const jobsById = new Map(jobRows.map((job) => [job.id, job]));
  const nowIso = now.toISOString();
  const items = interviewRows.flatMap((interview) => {
    const job = jobsById.get(interview.jobId);
    if (!job) return [];
    return [
      {
        ...interview,
        company: job.company,
        title: job.title,
      },
    ];
  });
  const upcoming = items
    .filter((item) => item.outcome === "scheduled" && item.startsAt >= nowIso)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const past = items
    .filter((item) => !(item.outcome === "scheduled" && item.startsAt >= nowIso))
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  return { upcoming, past };
}

export function getContact(id: string) {
  return db.select().from(contacts).where(eq(contacts.id, id)).get() ?? null;
}

export function getInterview(id: string) {
  return db.select().from(interviews).where(eq(interviews.id, id)).get() ?? null;
}
