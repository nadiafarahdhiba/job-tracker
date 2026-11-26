"use client";

import { useState } from "react";

export function ConfirmSubmit({
  action,
  fields,
  label,
  confirmLabel,
  message,
}: {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  label: string;
  confirmLabel: string;
  message: string;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="text-sm font-medium text-danger hover:underline"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
    );
  }

  return (
    <form action={action} className="space-y-2">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <p className="text-sm text-ink">{message}</p>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="text-sm font-semibold text-danger">
          {confirmLabel}
        </button>
        <button
          type="button"
          className="text-sm font-medium text-muted"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
