import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg space-y-4 py-10">
      <h1 className="font-serif text-3xl">That page is not here</h1>
      <Link href="/jobs" className="text-sm font-semibold text-pine hover:underline">
        Back to jobs
      </Link>
    </div>
  );
}
