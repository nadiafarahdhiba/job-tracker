export function PageFallback({ label }: { label: string }) {
  return (
    <p role="status" className="py-10 text-sm text-muted">
      {label}
    </p>
  );
}
