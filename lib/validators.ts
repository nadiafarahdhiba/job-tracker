import {
  isCurrency,
  isOutcome,
  isSource,
  isStatus,
  isWorkMode,
  type JobStatus,
} from "./constants";
import { fromDatetimeLocal } from "./format";
import type { ContactInput, InterviewInput, JobInput } from "./types";

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function field(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function requiredText(
  value: string,
  label: string,
  max: number,
): ParseResult<string> {
  const trimmed = value.trim();
  if (!trimmed) return { ok: false, error: `${label} is required.` };
  if (trimmed.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }
  return { ok: true, value: trimmed };
}

function optionalText(
  value: string,
  label: string,
  max: number,
): ParseResult<string> {
  const trimmed = value.trim();
  if (trimmed.length > max) {
    return { ok: false, error: `${label} must be ${max} characters or fewer.` };
  }
  return { ok: true, value: trimmed };
}

function parseUrl(value: string, label: string): ParseResult<string> {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: "" };
  if (trimmed.length > 500) {
    return { ok: false, error: `${label} must be 500 characters or fewer.` };
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return { ok: false, error: `${label} must start with http:// or https://.` };
    }
    return { ok: true, value: trimmed };
  } catch {
    return { ok: false, error: `${label} must be a valid link.` };
  }
}

function parseSalary(value: string, label: string): ParseResult<number | null> {
  const raw = value.trim().replace(/,/g, "");
  if (!raw) return { ok: true, value: null };
  if (!/^\d+$/.test(raw)) {
    return { ok: false, error: `${label} must be a whole number.` };
  }
  const number = Number(raw);
  if (!Number.isSafeInteger(number)) {
    return { ok: false, error: `${label} is too large.` };
  }
  return { ok: true, value: number };
}

function parseDay(value: string): ParseResult<string | null> {
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { ok: false, error: "Follow-up date is invalid." };
  }
  const [year, month, day] = trimmed.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return { ok: false, error: "Follow-up date is invalid." };
  }
  return { ok: true, value: trimmed };
}

export function parseJob(
  formData: FormData,
  fallbackStatus?: JobStatus,
): ParseResult<JobInput> {
  const company = requiredText(field(formData, "company"), "Company", 120);
  if (!company.ok) return company;
  const title = requiredText(field(formData, "title"), "Title", 160);
  if (!title.ok) return title;
  const location = optionalText(field(formData, "location"), "Location", 120);
  if (!location.ok) return location;

  const workModeValue = field(formData, "workMode").trim() || "remote";
  if (!isWorkMode(workModeValue)) {
    return { ok: false, error: "Choose a work mode." };
  }

  const sourceValue = field(formData, "source").trim() || "company_site";
  if (!isSource(sourceValue)) {
    return { ok: false, error: "Choose a source." };
  }

  const url = parseUrl(field(formData, "url"), "Job link");
  if (!url.ok) return url;

  const salaryMin = parseSalary(field(formData, "salaryMin"), "Minimum salary");
  if (!salaryMin.ok) return salaryMin;
  const salaryMax = parseSalary(field(formData, "salaryMax"), "Maximum salary");
  if (!salaryMax.ok) return salaryMax;
  if (
    salaryMin.value != null &&
    salaryMax.value != null &&
    salaryMin.value > salaryMax.value
  ) {
    return {
      ok: false,
      error: "Salary minimum cannot be higher than the maximum.",
    };
  }

  const currencyValue = field(formData, "salaryCurrency").trim() || "USD";
  if (!isCurrency(currencyValue)) {
    return { ok: false, error: "Choose a currency." };
  }

  const statusValue = field(formData, "status").trim();
  let status: JobStatus;
  if (!statusValue && fallbackStatus) {
    status = fallbackStatus;
  } else if (isStatus(statusValue)) {
    status = statusValue;
  } else {
    return { ok: false, error: "Choose a status." };
  }

  const followUpOn = parseDay(field(formData, "followUpOn"));
  if (!followUpOn.ok) return followUpOn;
  const notes = optionalText(field(formData, "notes"), "Notes", 8000);
  if (!notes.ok) return notes;

  return {
    ok: true,
    value: {
      company: company.value,
      title: title.value,
      location: location.value,
      workMode: workModeValue,
      source: sourceValue,
      url: url.value,
      salaryMin: salaryMin.value,
      salaryMax: salaryMax.value,
      salaryCurrency: currencyValue,
      status,
      followUpOn: followUpOn.value,
      notes: notes.value,
    },
  };
}

export function parseContact(formData: FormData): ParseResult<ContactInput> {
  const jobId = field(formData, "jobId").trim();
  if (!jobId) return { ok: false, error: "Missing job." };
  const name = requiredText(field(formData, "name"), "Name", 120);
  if (!name.ok) return name;
  const role = optionalText(field(formData, "role"), "Role", 120);
  if (!role.ok) return role;
  const emailValue = field(formData, "email").trim();
  if (emailValue.length > 160) {
    return { ok: false, error: "Email must be 160 characters or fewer." };
  }
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    return { ok: false, error: "Enter a valid email, or leave it blank." };
  }
  const phone = optionalText(field(formData, "phone"), "Phone", 40);
  if (!phone.ok) return phone;
  const link = parseUrl(field(formData, "link"), "Contact link");
  if (!link.ok) return link;
  const notes = optionalText(field(formData, "notes"), "Notes", 2000);
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      jobId,
      name: name.value,
      role: role.value,
      email: emailValue,
      phone: phone.value,
      link: link.value,
      notes: notes.value,
    },
  };
}

export function parseInterview(
  formData: FormData,
): ParseResult<InterviewInput> {
  const jobId = field(formData, "jobId").trim();
  if (!jobId) return { ok: false, error: "Missing job." };
  const round = requiredText(field(formData, "round"), "Round", 120);
  if (!round.ok) return round;
  const startsAt = fromDatetimeLocal(field(formData, "startsAt").trim());
  if (!startsAt) {
    return { ok: false, error: "Enter a date and time for the interview." };
  }
  const meetingUrl = parseUrl(field(formData, "meetingUrl"), "Meeting link");
  if (!meetingUrl.ok) return meetingUrl;
  const contactId = field(formData, "contactId").trim() || null;
  const outcomeValue = field(formData, "outcome").trim() || "scheduled";
  if (!isOutcome(outcomeValue)) {
    return { ok: false, error: "Choose an interview outcome." };
  }
  const notes = optionalText(field(formData, "notes"), "Notes", 2000);
  if (!notes.ok) return notes;
  return {
    ok: true,
    value: {
      jobId,
      round: round.value,
      startsAt,
      meetingUrl: meetingUrl.value,
      contactId,
      outcome: outcomeValue,
      notes: notes.value,
    },
  };
}
