import "server-only";

import { eq } from "drizzle-orm";
import { db } from "./db";
import { activities, jobs } from "./schema";

export function insertActivity(
  jobId: string,
  kind: string,
  message: string,
  now: string,
) {
  db.insert(activities)
    .values({
      id: crypto.randomUUID(),
      jobId,
      kind,
      message,
      createdAt: now,
    })
    .run();
  db.update(jobs).set({ updatedAt: now }).where(eq(jobs.id, jobId)).run();
}
