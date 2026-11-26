import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-line bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <span className="h-3 w-3 rounded-[3px] bg-brass" aria-hidden />
          <p className="font-serif text-3xl">Job Tracker</p>
        </div>
        <p className="mb-6 text-sm text-muted">
          One password for your applications, from any source.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
