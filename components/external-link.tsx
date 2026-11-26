export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  if (!href.startsWith("http://") && !href.startsWith("https://")) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium text-pine hover:underline"
    >
      {children}
    </a>
  );
}
