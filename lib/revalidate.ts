import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateTracker(jobId?: string) {
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/jobs/new");
  revalidatePath("/interviews");
  if (jobId) revalidatePath(`/jobs/${jobId}`);
}
