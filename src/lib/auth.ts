import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";

/** The Supabase Auth user for the current session (or null). */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * The app-level User row for the current session. Creates it on first login,
 * and links a pre-auth (manual-purchase) user to the auth account by email —
 * without ever changing a primary key.
 */
export async function getCurrentUser() {
  const authUser = await getAuthUser();
  if (!authUser?.email) return null;

  const email = authUser.email.toLowerCase();
  const authId = authUser.id;
  const name = (authUser.user_metadata?.name as string | undefined) ?? null;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ authId }, { email }] },
  });

  if (existing) {
    if (existing.authId !== authId) {
      // Pre-auth user found by email — attach the auth id now.
      return prisma.user.update({
        where: { id: existing.id },
        data: { authId, name: existing.name ?? name },
      });
    }
    return existing;
  }

  const created = await prisma.user.create({ data: { authId, email, name } });
  // Best-effort welcome email on first sign-in (no-ops if Resend isn't set).
  await sendWelcomeEmail({ to: created.email, name: created.name ?? "there" });
  return created;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

/** Access rule: a paid Purchase for this course, or a paid All-Access bundle. */
export async function hasCourseAccess(
  userId: string,
  courseId: string
): Promise<boolean> {
  const direct = await prisma.purchase.findFirst({
    where: { userId, courseId, status: "paid" },
    select: { id: true },
  });
  if (direct) return true;

  const bundle = await prisma.purchase.findFirst({
    where: { userId, status: "paid", course: { isBundle: true } },
    select: { id: true },
  });
  return Boolean(bundle);
}

/**
 * Courses the user can open: directly-purchased tracks, or every published
 * track if they own the All-Access bundle.
 */
export async function getOwnedCourses(userId: string) {
  const paid = await prisma.purchase.findMany({
    where: { userId, status: "paid" },
    include: { course: true },
    orderBy: { paidAt: "desc" },
  });

  const hasBundle = paid.some(
    (p: (typeof paid)[number]) => p.course.isBundle
  );
  if (hasBundle) {
    return prisma.course.findMany({
      where: { published: true, isBundle: false },
      orderBy: { sortOrder: "asc" },
    });
  }

  const seen = new Set<string>();
  const courses: (typeof paid)[number]["course"][] = [];
  for (const p of paid) {
    if (p.course.isBundle || seen.has(p.course.id)) continue;
    seen.add(p.course.id);
    courses.push(p.course);
  }
  return courses;
}
