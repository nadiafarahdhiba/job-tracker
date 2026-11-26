"use client";

import { useActionState } from "react";
import { createContact } from "@/app/actions/contacts";
import { inputClass, labelClass, primaryButtonClass } from "./styles";

export function ContactForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(createContact, null);

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-line pt-4">
      <input type="hidden" name="jobId" value={jobId} />
      {state?.error ? (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          Name
        </label>
        <input id="contact-name" name="name" required maxLength={120} className={inputClass} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-role" className={labelClass}>
            Role
          </label>
          <input id="contact-role" name="role" maxLength={120} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            Phone
          </label>
          <input id="contact-phone" name="phone" maxLength={40} className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact-link" className={labelClass}>
            Link
          </label>
          <input
            id="contact-link"
            name="link"
            type="url"
            placeholder="https://"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-notes" className={labelClass}>
          Notes
        </label>
        <textarea id="contact-notes" name="notes" rows={2} maxLength={2000} className={inputClass} />
      </div>
      <button type="submit" className={primaryButtonClass} disabled={pending}>
        {pending ? "Adding…" : "Add contact"}
      </button>
    </form>
  );
}
