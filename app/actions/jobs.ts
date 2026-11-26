"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  createdMessage,
  isStatus,
  nextAppliedAt,
  statusMessage,
} from "@/lib/constants";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getJob } from "@/lib/queries";
import { revalidateTracker } from "@/lib/revalidate";
import { activities, contacts, interviews, jobs } from "@/lib/schema";
import type { ActionState } from "@/lib/types";
import { parseJob } from "@/lib/validators";

export async function createJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseJob(formData);
  if (!parsed.ok) return { error: parsed.error };

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const input = parsed.value;
  db.transaction((tx) => {
    tx.insert(jobs)
      .values({
        id,
        company: input.company,
        title: input.title,
        location: input.location,
        workMode: input.workMode,
        source: input.source,
        url: input.url,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        salaryCurrency: input.salaryCurrency,
        status: input.status,
        appliedAt: nextAppliedAt(null, input.status, now),
        followUpOn: input.followUpOn,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    tx.insert(activities)
      .values({
        id: crypto.randomUUID(),
        jobId: id,
        kind: "created",
        message: createdMessage(input.status),
        createdAt: now,
      })
      .run();
  });
  revalidateTracker(id);
  redirect(`/jobs/${id}`);
}

export async function updateJob(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const current = getJob(id);
  if (!current || !isStatus(current.status)) {
    return { error: "That job is no longer here." };
  }
  const previous = current.status;
  const parsed = parseJob(formData, previous);
  if (!parsed.ok) return { error: parsed.error };

  const now = new Date().toISOString();
  const input = parsed.value;
  const statusChanged = input.status !== previous;
  db.transaction((tx) => {
    tx.update(jobs)
      .set({
        company: input.company,
        title: input.title,
        location: input.location,
        workMode: input.workMode,
        source: input.source,
        url: input.url,
        salaryMin: input.salaryMin,
        salaryMax: input.salaryMax,
        salaryCurrency: input.salaryCurrency,
        status: input.status,
        appliedAt: nextAppliedAt(current.appliedAt, input.status, now),
        followUpOn: input.followUpOn,
        notes: input.notes,
        updatedAt: now,
      })
      .where(eq(jobs.id, id))
      .run();
    if (statusChanged) {
      tx.insert(activities)
        .values({
          id: crypto.randomUUID(),
          jobId: id,
          kind: "status",
          message: statusMessage(previous, input.status),
          createdAt: now,
        })
        .run();
    }
  });
  revalidateTracker(id);
  return { ok: true };
}

export async function setJobStatus(jobId: string, status: string) {
  await requireUser();
  if (!isStatus(status)) return;
  const current = getJob(jobId);
  if (!current || !isStatus(current.status) || current.status === status) return;

  const now = new Date().toISOString();
  const previous = current.status;
  db.transaction((tx) => {
    tx.update(jobs)
      .set({
        status,
        appliedAt: nextAppliedAt(current.appliedAt, status, now),
        updatedAt: now,
      })
      .where(eq(jobs.id, jobId))
      .run();
    tx.insert(activities)
      .values({
        id: crypto.randomUUID(),
        jobId,
        kind: "status",
        message: statusMessage(previous, status),
        createdAt: now,
      })
      .run();
  });
  revalidateTracker(jobId);
}

export async function deleteJob(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const current = getJob(id);
  if (!current) redirect("/jobs");
  db.transaction((tx) => {
    tx.delete(interviews).where(eq(interviews.jobId, id)).run();
    tx.delete(activities).where(eq(activities.jobId, id)).run();
    tx.delete(contacts).where(eq(contacts.jobId, id)).run();
    tx.delete(jobs).where(eq(jobs.id, id)).run();
  });
  revalidateTracker();
  redirect("/jobs");
}
