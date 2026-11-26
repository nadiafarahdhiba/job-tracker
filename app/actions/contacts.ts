"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { insertActivity } from "@/lib/activity";
import { db } from "@/lib/db";
import { getContact, getJob } from "@/lib/queries";
import { revalidateTracker } from "@/lib/revalidate";
import { contacts } from "@/lib/schema";
import type { ActionState } from "@/lib/types";
import { parseContact } from "@/lib/validators";

export async function createContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = parseContact(formData);
  if (!parsed.ok) return { error: parsed.error };
  const job = getJob(parsed.value.jobId);
  if (!job) return { error: "That job is no longer here." };

  const now = new Date().toISOString();
  db.insert(contacts)
    .values({
      id: crypto.randomUUID(),
      jobId: parsed.value.jobId,
      name: parsed.value.name,
      role: parsed.value.role,
      email: parsed.value.email,
      phone: parsed.value.phone,
      link: parsed.value.link,
      notes: parsed.value.notes,
    })
    .run();
  insertActivity(
    parsed.value.jobId,
    "contact",
    `Added contact ${parsed.value.name}.`,
    now,
  );
  revalidateTracker(parsed.value.jobId);
  redirect(`/jobs/${parsed.value.jobId}`);
}

export async function deleteContact(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const contact = getContact(id);
  if (!contact) return;
  const now = new Date().toISOString();
  db.delete(contacts).where(eq(contacts.id, id)).run();
  insertActivity(contact.jobId, "contact", `Removed contact ${contact.name}.`, now);
  revalidateTracker(contact.jobId);
  redirect(`/jobs/${contact.jobId}`);
}
