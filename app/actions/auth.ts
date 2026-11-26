"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { passwordsMatch, requireUser } from "@/lib/auth";
import { COOKIE_NAME, signSession } from "@/lib/session";

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const expected = process.env.APP_PASSWORD;
  if (!expected || !process.env.AUTH_SECRET) {
    return {
      error: "Add APP_PASSWORD and AUTH_SECRET to .env, then restart the app.",
    };
  }
  if (!password || !passwordsMatch(password, expected)) {
    return { error: "That password is incorrect." };
  }

  const token = await signSession();
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/");
}

export async function logout() {
  await requireUser();
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  redirect("/login");
}
