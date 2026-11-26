import { isSource, isStatus } from "./constants";
import type { JobFilters, NormalizedFilters } from "./types";

export function normalizeFilters(input: JobFilters): NormalizedFilters {
  return {
    q: (input.q ?? "").trim(),
    stage: input.stage && isStatus(input.stage) ? input.stage : "all",
    source: input.source && isSource(input.source) ? input.source : "all",
  };
}
