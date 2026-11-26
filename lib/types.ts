import type {
  InterviewOutcome,
  JobSource,
  JobStatus,
  WorkMode,
} from "./constants";

export type ActionState = { error?: string; ok?: boolean } | null;

export type JobFilters = {
  q?: string;
  stage?: string;
  source?: string;
};

export type NormalizedFilters = {
  q: string;
  stage: JobStatus | "all";
  source: JobSource | "all";
};

export type JobCardData = {
  id: string;
  title: string;
  company: string;
  status: JobStatus;
  sourceLabel: string;
  meta: string;
  salaryLabel: string | null;
  followUpOn: string | null;
  nextInterviewLabel: string | null;
  interviewCount: number;
};

export type JobInput = {
  company: string;
  title: string;
  location: string;
  workMode: WorkMode;
  source: JobSource;
  url: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  status: JobStatus;
  followUpOn: string | null;
  notes: string;
};

export type ContactInput = {
  jobId: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  link: string;
  notes: string;
};

export type InterviewInput = {
  jobId: string;
  round: string;
  startsAt: string;
  meetingUrl: string;
  contactId: string | null;
  outcome: InterviewOutcome;
  notes: string;
};
