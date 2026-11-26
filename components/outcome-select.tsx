"use client";

import { useOptimistic, useTransition } from "react";
import { setInterviewOutcome } from "@/app/actions/interviews";
import {
  OUTCOMES,
  OUTCOME_LABELS,
  isOutcome,
  type InterviewOutcome,
} from "@/lib/constants";
import { inputClass } from "./styles";

export function OutcomeSelect({
  interviewId,
  outcome,
  label,
}: {
  interviewId: string;
  outcome: string;
  label: string;
}) {
  const current = isOutcome(outcome) ? outcome : "scheduled";
  const [optimistic, setOptimistic] = useOptimistic(
    current,
    (_state, next: InterviewOutcome) => next,
  );
  const [pending, startTransition] = useTransition();

  return (
    <select
      aria-label={`Outcome for ${label}`}
      className={inputClass}
      value={optimistic}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value;
        if (!isOutcome(next)) return;
        startTransition(async () => {
          setOptimistic(next as InterviewOutcome);
          await setInterviewOutcome(interviewId, next);
        });
      }}
    >
      {OUTCOMES.map((item) => (
        <option key={item} value={item}>
          {OUTCOME_LABELS[item]}
        </option>
      ))}
    </select>
  );
}
