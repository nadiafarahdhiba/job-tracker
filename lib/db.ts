import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function createDatabase() {
  const directory = path.join(process.cwd(), "data");
  fs.mkdirSync(directory, { recursive: true });
  const sqlite = new Database(path.join(directory, "tracker.db"));
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      work_mode TEXT NOT NULL DEFAULT 'remote',
      source TEXT NOT NULL DEFAULT 'other',
      url TEXT NOT NULL DEFAULT '',
      salary_min INTEGER,
      salary_max INTEGER,
      salary_currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'saved',
      applied_at TEXT,
      follow_up_on TEXT,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      link TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
      round TEXT NOT NULL,
      starts_at TEXT NOT NULL,
      meeting_url TEXT NOT NULL DEFAULT '',
      outcome TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_contacts_job ON contacts(job_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_job ON interviews(job_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_starts ON interviews(starts_at);
    CREATE INDEX IF NOT EXISTS idx_activities_job ON activities(job_id);
  `);
  return drizzle(sqlite, { schema });
}

const globalForDb = globalThis as unknown as {
  tracker?: ReturnType<typeof createDatabase>;
};

export const db = globalForDb.tracker ?? createDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.tracker = db;
}
