"use client";

import { useActionState } from "react";
import { createInterview } from "@/app/actions/interviews";
import { OUTCOMES, OUTCOME_LABELS } from "@/lib/constants";
import { inputClass, labelClass, primaryButtonClass } from "./styles";

export function InterviewForm({
  jobId,
  contacts,
}: {
  jobId: string;
  contacts: { id: string; name: string }[];
}) {
  const [state, action, pending] = useActionState(createInterview, null);

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-line pt-4">
      <input type="hidden" name="jobId" value={jobId} />
      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="interview-round" className={labelClass}>
            Round
          </label>
          <input
            id="interview-round"
            name="round"
            required
            maxLength={120}
            placeholder="Phone screen"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="interview-starts" className={labelClass}>
            When
          </label>
          <input
            id="interview-starts"
            name="startsAt"
            type="datetime-local"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="interview-url" className={labelClass}>
            Meeting link
          </label>
          <input
            id="interview-url"
            name="meetingUrl"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="interview-contact" className={labelClass}>
            Contact
          </label>
          <select id="interview-contact" name="contactId" defaultValue="" className={inputClass}>
            <option value="">No contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="interview-outcome" className={labelClass}>
            Outcome
          </label>
          <select
            id="interview-outcome"
            name="outcome"
            defaultValue="scheduled"
            className={inputClass}
          >
            {OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {OUTCOME_LABELS[outcome]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="interview-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="interview-notes"
          name="notes"
          rows={2}
          maxLength={2000}
          className={inputClass}
        />
      </div>
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Adding…" : "Add interview"}
      </button>
    </form>
  );
}
