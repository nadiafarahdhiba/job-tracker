"use client";

import Link from "next/link";
import { useEffect, useState, useTransition, useOptimistic } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { setJobStatus } from "@/app/actions/jobs";
import {
  BOARD_COLUMNS,
  STATUS_LABELS,
  isOpenStatus,
  isStatus,
  statusForColumn,
  type BoardColumnId,
  type JobStatus,
} from "@/lib/constants";
import { followUpText } from "@/lib/format";
import type { JobCardData } from "@/lib/types";
import { inputClass } from "./styles";

function applyMove(
  current: JobCardData[],
  next: { id: string; status: JobStatus },
) {
  return current.map((job) =>
    job.id === next.id ? { ...job, status: next.status } : job,
  );
}

function StatusSelect({
  job,
  pending,
  onMove,
}: {
  job: JobCardData;
  pending: boolean;
  onMove: (jobId: string, status: JobStatus) => void;
}) {
  return (
    <select
      aria-label={`Status for ${job.title}`}
      className={inputClass}
      value={job.status}
      disabled={pending}
      onPointerDown={(event) => event.stopPropagation()}
      onChange={(event) => {
        if (isStatus(event.target.value)) onMove(job.id, event.target.value);
      }}
    >
      {Object.entries(STATUS_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="5" cy="4" r="1.15" fill="currentColor" />
      <circle cx="11" cy="4" r="1.15" fill="currentColor" />
      <circle cx="5" cy="8" r="1.15" fill="currentColor" />
      <circle cx="11" cy="8" r="1.15" fill="currentColor" />
      <circle cx="5" cy="12" r="1.15" fill="currentColor" />
      <circle cx="11" cy="12" r="1.15" fill="currentColor" />
    </svg>
  );
}

function JobCard({
  job,
  today,
  pending,
  onMove,
  dragHandle,
}: {
  job: JobCardData;
  today: string;
  pending: boolean;
  onMove: (jobId: string, status: JobStatus) => void;
  dragHandle?: React.ReactNode;
}) {
  const closed = job.status === "rejected" || job.status === "withdrawn";
  const due = Boolean(
    job.followUpOn && job.followUpOn <= today && isOpenStatus(job.status),
  );

  return (
    <article
      data-status={job.status}
      className="job-card rounded-xl border border-line bg-card p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link
            href={`/jobs/${job.id}`}
            className="font-semibold text-ink hover:underline"
          >
            {job.title}
          </Link>
          <p className="truncate text-sm text-muted">{job.company}</p>
        </div>
        {dragHandle}
      </div>
      {job.meta ? <p className="mt-2 text-sm text-muted">{job.meta}</p> : null}
      {job.salaryLabel ? (
        <p className="mt-1 text-sm text-muted">{job.salaryLabel}</p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium">
          {job.sourceLabel}
        </span>
        {job.followUpOn ? (
          <span
            className={
              due
                ? "rounded-full bg-brass-soft px-2 py-0.5 text-xs font-medium text-brass-ink"
                : "rounded-full bg-paper px-2 py-0.5 text-xs font-medium"
            }
          >
            {followUpText(job.followUpOn, today)}
          </span>
        ) : null}
        {job.nextInterviewLabel ? (
          <span className="rounded-full bg-pine-soft px-2 py-0.5 text-xs font-medium text-pine">
            {job.nextInterviewLabel}
          </span>
        ) : job.interviewCount > 0 ? (
          <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-medium">
            {job.interviewCount === 1
              ? "1 interview"
              : `${job.interviewCount} interviews`}
          </span>
        ) : null}
        {closed ? (
          <span className="rounded-full bg-paper px-2 py-0.5 text-xs font-semibold">
            {STATUS_LABELS[job.status]}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <StatusSelect job={job} pending={pending} onMove={onMove} />
      </div>
    </article>
  );
}

function BoardCard({
  job,
  today,
  pending,
  onMove,
}: {
  job: JobCardData;
  today: string;
  pending: boolean;
  onMove: (jobId: string, status: JobStatus) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
    disabled: pending,
  });

  return (
    <div ref={setNodeRef} className={isDragging ? "opacity-40" : undefined}>
      <JobCard
        job={job}
        today={today}
        pending={pending}
        onMove={onMove}
        dragHandle={
          <button
            type="button"
            className="cursor-grab rounded-md p-1 text-muted active:cursor-grabbing"
            aria-label={`Drag ${job.title}`}
            {...listeners}
            {...attributes}
          >
            <GripIcon />
          </button>
        }
      />
    </div>
  );
}

function ColumnShell({
  label,
  hint,
  count,
  over = false,
  dropRef,
  children,
}: {
  label: string;
  hint?: string;
  count: number;
  over?: boolean;
  dropRef?: (element: HTMLElement | null) => void;
  children: React.ReactNode;
}) {
  return (
    <section
      ref={dropRef}
      className={`flex min-h-64 min-w-[220px] flex-1 flex-col rounded-2xl border bg-white/60 ${
        over ? "border-brass" : "border-line"
      }`}
    >
      <header className="px-3 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-xl">{label}</h2>
          <span className="text-sm text-muted">{count}</span>
        </div>
        {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      </header>
      <div className="flex flex-1 flex-col gap-3 p-3">
        {children}
        {count === 0 ? (
          <p className="py-8 text-center text-sm text-muted">Nothing here</p>
        ) : null}
      </div>
    </section>
  );
}

function Column({
  id,
  label,
  hint,
  jobs,
  today,
  pending,
  onMove,
}: {
  id: BoardColumnId;
  label: string;
  hint?: string;
  jobs: JobCardData[];
  today: string;
  pending: boolean;
  onMove: (jobId: string, status: JobStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <ColumnShell label={label} hint={hint} count={jobs.length} over={isOver} dropRef={setNodeRef}>
      {jobs.map((job) => (
        <BoardCard
          key={job.id}
          job={job}
          today={today}
          pending={pending}
          onMove={onMove}
        />
      ))}
    </ColumnShell>
  );
}

function JobBoard({
  jobs,
  today,
  pending,
  onMove,
}: {
  jobs: JobCardData[];
  today: string;
  pending: boolean;
  onMove: (jobId: string, status: JobStatus) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const [mounted, setMounted] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeJob = jobs.find((job) => job.id === activeId) ?? null;

  useEffect(() => {
    // dnd-kit writes browser-only ids onto the cards. Mount it after hydration
    // so those ids are not compared with the server HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    if (!event.over) return;
    const job = jobs.find((item) => item.id === String(event.active.id));
    if (!job) return;
    const next = statusForColumn(String(event.over.id), job.status);
    if (!next || next === job.status) return;
    onMove(job.id, next);
  }

  if (!mounted) {
    return (
      <div className="hidden lg:block">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
          {BOARD_COLUMNS.map((column) => {
            const columnJobs = jobs.filter((job) =>
              column.statuses.includes(job.status),
            );
            return (
              <ColumnShell
                key={column.id}
                label={column.label}
                hint={column.hint}
                count={columnJobs.length}
              >
                {columnJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    today={today}
                    pending={pending}
                    onMove={onMove}
                  />
                ))}
              </ColumnShell>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block">
      <DndContext
        sensors={sensors}
        onDragStart={(event) => setActiveId(String(event.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
          {BOARD_COLUMNS.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              label={column.label}
              hint={column.hint}
              today={today}
              pending={pending}
              onMove={onMove}
              jobs={jobs.filter((job) => column.statuses.includes(job.status))}
            />
          ))}
        </div>
        <DragOverlay>
          {activeJob ? (
            <div className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold shadow-lg">
              {activeJob.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export function JobsView({
  jobs,
  today,
}: {
  jobs: JobCardData[];
  today: string;
}) {
  const [optimisticJobs, addOptimistic] = useOptimistic(jobs, applyMove);
  const [pending, startTransition] = useTransition();

  function move(jobId: string, status: JobStatus) {
    startTransition(async () => {
      addOptimistic({ id: jobId, status });
      await setJobStatus(jobId, status);
    });
  }

  return (
    <>
      <div className="space-y-8 lg:hidden">
        {BOARD_COLUMNS.map((column) => {
          const items = optimisticJobs.filter((job) =>
            column.statuses.includes(job.status),
          );
          if (items.length === 0) return null;
          return (
            <section key={column.id} className="space-y-3">
              <h2 className="font-serif text-2xl">{column.label}</h2>
              <ul className="space-y-3">
                {items.map((job) => (
                  <li key={job.id}>
                    <JobCard
                      job={job}
                      today={today}
                      pending={pending}
                      onMove={move}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <JobBoard
        jobs={optimisticJobs}
        today={today}
        pending={pending}
        onMove={move}
      />
    </>
  );
}
