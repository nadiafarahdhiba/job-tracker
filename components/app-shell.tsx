"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/interviews", label: "Interviews" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:mt-4 lg:block lg:flex-1 lg:space-y-1 lg:overflow-visible lg:px-3">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "block whitespace-nowrap rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white"
                : "block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-sidebar-muted hover:bg-white/5 hover:text-white"
            }
          >
            {link.label}
          </Link>
        );
      })}
      <LogoutButton className="lg:hidden" />
    </nav>
  );
}

function LogoutButton({ className }: { className: string }) {
  return (
    <form action={logout} className={className}>
      <button
        type="submit"
        className="whitespace-nowrap rounded-full px-3 py-2 text-sm text-sidebar-muted hover:text-white lg:px-0"
      >
        Log out
      </button>
    </form>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="bg-sidebar text-paper lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="px-5 py-4 lg:px-6 lg:pt-8">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-[3px] bg-brass" aria-hidden />
            <p className="font-serif text-2xl leading-none">Job Tracker</p>
          </div>
          <p className="mt-2 text-sm text-sidebar-muted">Every application, one place</p>
        </div>
        <Suspense
          fallback={
            <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:mt-4 lg:block lg:flex-1 lg:space-y-1">
              {links.map((link) => (
                <span
                  key={link.href}
                  className="block whitespace-nowrap rounded-full px-3 py-2 text-sm text-sidebar-muted"
                >
                  {link.label}
                </span>
              ))}
            </nav>
          }
        >
          <AppNav />
        </Suspense>
        <LogoutButton className="hidden px-6 pb-6 lg:block" />
      </aside>
      <div className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
    </div>
  );
}
