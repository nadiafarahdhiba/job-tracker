import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  company: text("company").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull().default(""),
  workMode: text("work_mode").notNull().default("remote"),
  source: text("source").notNull().default("other"),
  url: text("url").notNull().default(""),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency").notNull().default("USD"),
  status: text("status").notNull().default("saved"),
  appliedAt: text("applied_at"),
  followUpOn: text("follow_up_on"),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const contacts = sqliteTable("contacts", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  link: text("link").notNull().default(""),
  notes: text("notes").notNull().default(""),
});

export const interviews = sqliteTable("interviews", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  contactId: text("contact_id").references(() => contacts.id, {
    onDelete: "set null",
  }),
  round: text("round").notNull(),
  startsAt: text("starts_at").notNull(),
  meetingUrl: text("meeting_url").notNull().default(""),
  outcome: text("outcome").notNull().default("scheduled"),
  notes: text("notes").notNull().default(""),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
});
