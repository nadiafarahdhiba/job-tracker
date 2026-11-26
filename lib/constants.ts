export const STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "withdrawn",
] as const;

export type JobStatus = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<JobStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const SOURCES = [
  "linkedin",
  "company_site",
  "referral",
  "indeed",
  "other",
] as const;

export type JobSource = (typeof SOURCES)[number];

export const SOURCE_LABELS: Record<JobSource, string> = {
  linkedin: "LinkedIn",
  company_site: "Company site",
  referral: "Referral",
  indeed: "Indeed",
  other: "Other",
};

export const WORK_MODES = ["remote", "hybrid", "onsite"] as const;

export type WorkMode = (typeof WORK_MODES)[number];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const CURRENCIES = ["USD", "EUR", "GBP", "IDR", "SGD", "AUD", "CAD"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const OUTCOMES = ["scheduled", "done", "cancelled"] as const;

export type InterviewOutcome = (typeof OUTCOMES)[number];

export const OUTCOME_LABELS: Record<InterviewOutcome, string> = {
  scheduled: "Scheduled",
  done: "Done",
  cancelled: "Cancelled",
};

export type BoardColumnId =
  | "saved"
  | "applied"
  | "interviewing"
  | "offer"
  | "closed";

export const BOARD_COLUMNS: {
  id: BoardColumnId;
  label: string;
  hint?: string;
  statuses: JobStatus[];
}[] = [
  { id: "saved", label: "Saved", statuses: ["saved"] },
  { id: "applied", label: "Applied", statuses: ["applied"] },
  { id: "interviewing", label: "Interviewing", statuses: ["interviewing"] },
  { id: "offer", label: "Offer", statuses: ["offer"] },
  {
    id: "closed",
    label: "Closed",
    hint: "Dropping a card here marks it rejected",
    statuses: ["rejected", "withdrawn"],
  },
];

const OPEN_STATUSES = new Set<JobStatus>([
  "saved",
  "applied",
  "interviewing",
  "offer",
]);

const STAMPS_APPLICATION = new Set<JobStatus>([
  "applied",
  "interviewing",
  "offer",
  "rejected",
]);

export function isStatus(value: string): value is JobStatus {
  return (STATUSES as readonly string[]).includes(value);
}

export function isSource(value: string): value is JobSource {
  return (SOURCES as readonly string[]).includes(value);
}

export function isWorkMode(value: string): value is WorkMode {
  return (WORK_MODES as readonly string[]).includes(value);
}

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}

export function isOutcome(value: string): value is InterviewOutcome {
  return (OUTCOMES as readonly string[]).includes(value);
}

export function isOpenStatus(status: JobStatus) {
  return OPEN_STATUSES.has(status);
}

export function nextAppliedAt(
  current: string | null,
  status: JobStatus,
  nowIso: string,
) {
  if (current) return current;
  return STAMPS_APPLICATION.has(status) ? nowIso : null;
}

export function statusForColumn(
  columnId: string,
  current: JobStatus,
): JobStatus | null {
  if (
    columnId === "saved" ||
    columnId === "applied" ||
    columnId === "interviewing" ||
    columnId === "offer"
  ) {
    return columnId;
  }
  if (columnId === "closed") {
    return current === "withdrawn" ? "withdrawn" : "rejected";
  }
  return null;
}

export function createdMessage(status: JobStatus) {
  return `Added this job as ${STATUS_LABELS[status]}.`;
}

export function statusMessage(from: JobStatus, to: JobStatus) {
  return `Moved from ${STATUS_LABELS[from]} to ${STATUS_LABELS[to]}.`;
}

export function activityShowsInterview(kind: string, message: string) {
  if (kind !== "created" && kind !== "status") return false;
  return (
    message.includes("to Interviewing") ||
    message.includes("from Interviewing") ||
    message.includes("as Interviewing") ||
    message.includes("to Offer") ||
    message.includes("from Offer") ||
    message.includes("as Offer")
  );
}
