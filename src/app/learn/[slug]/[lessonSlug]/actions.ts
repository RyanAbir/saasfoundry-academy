"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

// Toggle a lesson's completed state for the current user.
export async function toggleLessonComplete(formData: FormData) {
  const user = await requireUser();
  const lessonId = String(formData.get("lessonId") ?? "");
  const courseSlug = String(formData.get("courseSlug") ?? "");
  const isDone = String(formData.get("completed") ?? "") === "true";
  if (!lessonId) return;

  await prisma.progress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: { userId: user.id, lessonId, completed: !isDone },
    update: { completed: !isDone },
  });

  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath("/dashboard");
}
