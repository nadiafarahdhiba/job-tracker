"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { insertActivity } from "@/lib/activity";
import { OUTCOME_LABELS, isOutcome } from "@/lib/constants";
import { db } from "@/lib/db";
import { getContact, getInterview, getJob } from "@/lib/queries";
import { revalidateTracker } from "@/lib/revalidate";
import { interviews } from "@/lib/schema";
import type { ActionState } from "@/lib/types";
import { parseInterview } from "@/lib/validators";

export async function createInterview(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseInterview(formData);
  if (!parsed.ok) return { error: parsed.error };
  const input = parsed.value;
  const job = getJob(input.jobId);
  if (!job) return { error: "That job is no longer here." };
  if (input.contactId) {
    const contact = getContact(input.contactId);
    if (!contact || contact.jobId !== input.jobId) {
      return { error: "Choose a contact from this job." };
    }
  }

  const now = new Date().toISOString();
  db.insert(interviews)
    .values({
      id: crypto.randomUUID(),
      jobId: input.jobId,
      contactId: input.contactId,
      round: input.round,
      startsAt: input.startsAt,
      meetingUrl: input.meetingUrl,
      outcome: input.outcome,
      notes: input.notes,
    })
    .run();
  insertActivity(input.jobId, "interview", `Scheduled ${input.round}.`, now);
  revalidateTracker(input.jobId);
  redirect(`/jobs/${input.jobId}`);
}

export async function setInterviewOutcome(
  interviewId: string,
  outcome: string,
) {
  await requireUser();
  if (!isOutcome(outcome)) return;
  const interview = getInterview(interviewId);
  if (!interview || interview.outcome === outcome) return;
  const now = new Date().toISOString();
  db.update(interviews)
    .set({ outcome })
    .where(eq(interviews.id, interviewId))
    .run();
  insertActivity(
    interview.jobId,
    "interview",
    `Marked ${interview.round} as ${OUTCOME_LABELS[outcome]}.`,
    now,
  );
  revalidateTracker(interview.jobId);
}

export async function deleteInterview(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const interview = getInterview(id);
  if (!interview) return;
  const now = new Date().toISOString();
  db.delete(interviews).where(eq(interviews.id, id)).run();
  insertActivity(
    interview.jobId,
    "interview",
    `Removed interview ${interview.round}.`,
    now,
  );
  revalidateTracker(interview.jobId);
  redirect(`/jobs/${interview.jobId}`);
}
