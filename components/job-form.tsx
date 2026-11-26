"use client";

import { useActionState } from "react";
import {
  CURRENCIES,
  SOURCES,
  SOURCE_LABELS,
  STATUSES,
  STATUS_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  type JobStatus,
} from "@/lib/constants";
import type { ActionState } from "@/lib/types";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "./styles";

type JobAction = (state: ActionState, formData: FormData) => Promise<ActionState>;

export type JobFormValues = {
  id?: string;
  company?: string;
  title?: string;
  location?: string;
  workMode?: string;
  source?: string;
  url?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  status?: string;
  followUpOn?: string | null;
  notes?: string;
};

export function JobForm({
  action,
  initial,
  submitLabel,
  includeStatus = true,
  cancelHref,
}: {
  action: JobAction;
  initial?: JobFormValues;
  submitLabel: string;
  includeStatus?: boolean;
  cancelHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const values = initial ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="rounded-lg bg-pine-soft px-3 py-2 text-sm text-pine">
          Saved.
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="company" className={labelClass}>
            Company
          </label>
          <input
            id="company"
            name="company"
            required
            maxLength={120}
            defaultValue={values.company ?? ""}
            className={inputClass}
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={160}
            defaultValue={values.title ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            maxLength={120}
            defaultValue={values.location ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="workMode" className={labelClass}>
            Work mode
          </label>
          <select
            id="workMode"
            name="workMode"
            defaultValue={values.workMode ?? "remote"}
            className={inputClass}
          >
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="source" className={labelClass}>
            Source
          </label>
          <select
            id="source"
            name="source"
            defaultValue={values.source ?? "company_site"}
            className={inputClass}
          >
            {SOURCES.map((source) => (
              <option key={source} value={source}>
                {SOURCE_LABELS[source]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Any source counts, including ones outside LinkedIn.
          </p>
        </div>
        <div>
          <label htmlFor="url" className={labelClass}>
            Job link
          </label>
          <input
            id="url"
            name="url"
            type="url"
            inputMode="url"
            placeholder="https://"
            defaultValue={values.url ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="salaryMin" className={labelClass}>
            Minimum salary
          </label>
          <input
            id="salaryMin"
            name="salaryMin"
            inputMode="numeric"
            defaultValue={values.salaryMin ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="salaryMax" className={labelClass}>
            Maximum salary
          </label>
          <input
            id="salaryMax"
            name="salaryMax"
            inputMode="numeric"
            defaultValue={values.salaryMax ?? ""}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="salaryCurrency" className={labelClass}>
            Currency
          </label>
          <select
            id="salaryCurrency"
            name="salaryCurrency"
            defaultValue={values.salaryCurrency ?? "USD"}
            className={inputClass}
          >
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </div>
        {includeStatus ? (
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={values.status ?? "saved"}
              className={inputClass}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status as JobStatus]}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div className={includeStatus ? "sm:col-span-2" : ""}>
          <label htmlFor="followUpOn" className={labelClass}>
            Follow-up date
          </label>
          <input
            id="followUpOn"
            name="followUpOn"
            type="date"
            defaultValue={values.followUpOn ?? ""}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-muted">
            Open jobs due today or earlier show on the dashboard.
          </p>
        </div>
      </div>
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          maxLength={8000}
          defaultValue={values.notes ?? ""}
          className={inputClass}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={primaryButtonClass} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {cancelHref ? (
          <a href={cancelHref} className={secondaryButtonClass}>
            Cancel
          </a>
        ) : null}
      </div>
    </form>
  );
}
