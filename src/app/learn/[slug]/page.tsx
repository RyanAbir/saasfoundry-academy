import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Lock, PlayCircle } from "lucide-react";

import { requireUser, hasCourseAccess } from "@/lib/auth";
import {
  getCourseWithModules,
  flattenLessons,
  getCompletedLessonIds,
  resumeLesson,
} from "@/lib/lms";
import { formatBdt } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { CourseOutline } from "@/components/course-outline";

export const metadata: Metadata = {
  title: "Learn",
  robots: { index: false },
};

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const course = await getCourseWithModules(slug);
  if (!course) notFound();
  if (course.isBundle) redirect("/dashboard");

  const lessons = flattenLessons(course);
  const preview = lessons.find((l) => l.isPreview);

  // Access check and completed-lessons fetch run together (both need only the
  // course id), instead of one after another.
  const [access, completedIds] = await Promise.all([
    hasCourseAccess(user.id, course.id),
    getCompletedLessonIds(user.id, course.id),
  ]);

  // Locked — no access. Offer a free preview if one exists.
  if (!access) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <Lock className="size-14 text-muted-foreground" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-3 text-muted-foreground">
          You don&apos;t have access to this track yet. Enroll to unlock all{" "}
          {lessons.length} lessons.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href={`/enroll/${course.slug}`}>
              Enroll for {formatBdt(course.priceBdt)}
            </Link>
          </Button>
          {preview && (
            <Button asChild size="lg" variant="outline">
              <Link href={`/learn/${course.slug}/${preview.slug}`}>
                Watch free preview
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Progress derived from data already loaded — no extra count queries.
  const total = lessons.length;
  const completed = lessons.filter((l) => completedIds.has(l.id)).length;
  const progress = {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
  const resume = resumeLesson(lessons, completedIds);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        ← My Courses
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{course.title}</h1>
      <p className="mt-2 text-muted-foreground">{course.subtitle}</p>

      {/* Progress */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {progress.completed} of {progress.total} lessons complete
          </span>
          <span className="font-medium">{progress.percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {resume && (
        <Button asChild size="lg" className="mt-6">
          <Link href={`/learn/${course.slug}/${resume.slug}`}>
            {progress.completed === 0 ? "Start course" : "Continue"}{" "}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      )}

      <div className="mt-10">
        <CourseOutline
          modules={course.modules}
          completedIds={completedIds}
          courseSlug={course.slug}
        />
      </div>

      {lessons.length === 0 && (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <PlayCircle className="size-4" /> Lessons are being added.
        </div>
      )}
    </div>
  );
}
