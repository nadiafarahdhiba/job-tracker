import Link from "next/link";
import { SOURCES, SOURCE_LABELS, STATUSES, STATUS_LABELS } from "@/lib/constants";
import type { NormalizedFilters } from "@/lib/types";
import { inputClass, primaryButtonClass, secondaryButtonClass } from "./styles";

export function FilterForm({ filters }: { filters: NormalizedFilters }) {
  return (
    <form
      action="/jobs"
      className="grid gap-3 rounded-2xl border border-line bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto] md:items-end"
    >
      <div>
        <label htmlFor="q" className="mb-1 block text-sm font-medium">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={filters.q}
          placeholder="Company, title, or notes"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="stage" className="mb-1 block text-sm font-medium">
          Stage
        </label>
        <select
          id="stage"
          name="stage"
          defaultValue={filters.stage}
          className={inputClass}
        >
          <option value="all">All stages</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="source" className="mb-1 block text-sm font-medium">
          Source
        </label>
        <select
          id="source"
          name="source"
          defaultValue={filters.source}
          className={inputClass}
        >
          <option value="all">All sources</option>
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {SOURCE_LABELS[source]}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="submit" className={primaryButtonClass}>
          Apply
        </button>
        {filters.q || filters.stage !== "all" || filters.source !== "all" ? (
          <Link href="/jobs" className={secondaryButtonClass}>
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
