import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { requireUser, hasCourseAccess } from "@/lib/auth";
import {
  getCourseWithModules,
  flattenLessons,
  getCompletedLessonIds,
  moduleOfLesson,
} from "@/lib/lms";
import { formatBdt } from "@/lib/catalog";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { VideoEmbed } from "@/components/video-embed";
import { CourseOutline } from "@/components/course-outline";
import { toggleLessonComplete } from "./actions";

export const metadata: Metadata = {
  title: "Lesson",
  robots: { index: false },
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const user = await requireUser();

  const course = await getCourseWithModules(slug);
  if (!course) notFound();
  if (course.isBundle) redirect("/dashboard");

  const lessons = flattenLessons(course);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) notFound();

  const lesson = lessons[index];
  // Access check and completed-lessons fetch run together.
  const [access, completedIds] = await Promise.all([
    hasCourseAccess(user.id, course.id),
    getCompletedLessonIds(user.id, course.id),
  ]);

  // Non-preview lessons need a paid purchase.
  if (!lesson.isPreview && !access) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
        <Lock className="size-14 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold tracking-tight">This lesson is locked</h1>
        <p className="mt-3 text-muted-foreground">
          Enroll in {course.title} to unlock this and every other lesson.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={`/enroll/${course.slug}`}>
            Enroll for {formatBdt(course.priceBdt)}
          </Link>
        </Button>
      </div>
    );
  }

  const isDone = completedIds.has(lesson.id);
  const parentModule = moduleOfLesson(course, lesson.id);
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_300px]">
      <main className="min-w-0">
        <Link
          href={`/learn/${course.slug}`}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {course.title}
        </Link>

        <div className="mt-4">
          <VideoEmbed
            provider={lesson.videoProvider}
            videoId={lesson.videoId}
            title={lesson.title}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {parentModule && (
              <p className="text-xs text-muted-foreground">{parentModule.title}</p>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>
          </div>
          {access ? (
            <form action={toggleLessonComplete}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <input type="hidden" name="completed" value={String(isDone)} />
              <SubmitButton
                variant={isDone ? "outline" : "default"}
                pendingText="Saving…"
              >
                {isDone ? (
                  <>
                    <CheckCircle2 className="size-4 text-brand-3" /> Completed
                  </>
                ) : (
                  "Mark as complete"
                )}
              </SubmitButton>
            </form>
          ) : (
            <Badge variant="secondary">Free preview</Badge>
          )}
        </div>

        {!access && lesson.isPreview && (
          <div className="mt-4 flex flex-col items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              This is a free preview. Enroll to unlock the full track.
            </p>
            <Button asChild size="sm">
              <Link href={`/enroll/${course.slug}`}>
                Enroll for {formatBdt(course.priceBdt)}
              </Link>
            </Button>
          </div>
        )}

        {lesson.content && (
          <article className="lesson-content mt-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {lesson.content}
            </ReactMarkdown>
          </article>
        )}

        {/* Prev / next */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t pt-6">
          {prev ? (
            <Button asChild variant="ghost">
              <Link href={`/learn/${course.slug}/${prev.slug}`}>
                <ArrowLeft className="size-4" /> Previous
              </Link>
            </Button>
          ) : (
            <span />
          )}
          {next ? (
            <Button asChild variant="ghost">
              <Link href={`/learn/${course.slug}/${next.slug}`}>
                Next <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <span />
          )}
        </div>
      </main>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border p-4">
          <CourseOutline
            modules={course.modules}
            completedIds={completedIds}
            courseSlug={course.slug}
            currentLessonId={lesson.id}
          />
        </div>
      </aside>
    </div>
  );
}
