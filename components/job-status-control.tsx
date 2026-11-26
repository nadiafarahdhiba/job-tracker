"use client";

import { useOptimistic, useTransition } from "react";
import { setJobStatus } from "@/app/actions/jobs";
import {
  STATUSES,
  STATUS_LABELS,
  isStatus,
  type JobStatus,
} from "@/lib/constants";
import { inputClass, labelClass } from "./styles";

export function JobStatusControl({
  jobId,
  status,
  title,
}: {
  jobId: string;
  status: JobStatus;
  title: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(
    status,
    (_current, next: JobStatus) => next,
  );
  const [pending, startTransition] = useTransition();

  return (
    <div className="max-w-xs">
      <label htmlFor="job-stage" className={labelClass}>
        Stage
      </label>
      <select
        id="job-stage"
        className={inputClass}
        value={optimistic}
        disabled={pending}
        aria-label={`Stage for ${title}`}
        onChange={(event) => {
          const next = event.target.value;
          if (!isStatus(next)) return;
          startTransition(async () => {
            setOptimistic(next);
            await setJobStatus(jobId, next);
          });
        }}
      >
        {STATUSES.map((item) => (
          <option key={item} value={item}>
            {STATUS_LABELS[item]}
          </option>
        ))}
      </select>
    </div>
  );
}
