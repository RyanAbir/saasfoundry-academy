"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Only allow same-site relative redirects (guard against open redirects).
function safeNext(value: string): string {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/dashboard"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  await getCurrentUser(); // ensure the app User row exists + linked
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo: `${appUrl}/auth/callback` },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    // Email confirmation is off → user is signed in immediately.
    await getCurrentUser();
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  // Confirmation email sent — ask them to verify.
  redirect("/login?message=check-email");
}

export async function loginWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${appUrl}/auth/callback` },
  });
  if (error || !data.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Google sign-in is not available.")}`
    );
  }
  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
