import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requireUser, getOwnedCourses } from "@/lib/auth";
import {
  getCourseWithModules,
  flattenLessons,
  getCompletedLessonIds,
  resumeLesson,
} from "@/lib/lms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My Courses",
  robots: { index: false },
};

export default async function DashboardPage() {
  const user = await requireUser();

  // Owned courses and pending purchases are independent — fetch them together
  // instead of one after another.
  const [courses, pending] = await Promise.all([
    getOwnedCourses(user.id),
    prisma.purchase.findMany({
      where: { userId: user.id, status: "pending" },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Build each course card in parallel. Within a card the two remaining
  // queries run together, and progress is derived from data we already have
  // (no extra count round-trips to the database in Mumbai).
  const cards = await Promise.all(
    courses.map(async (course: (typeof courses)[number]) => {
      const [full, completedIds] = await Promise.all([
        getCourseWithModules(course.slug),
        getCompletedLessonIds(user.id, course.id),
      ]);
      const lessons = full ? flattenLessons(full) : [];
      const total = lessons.length;
      const completed = lessons.filter((l) => completedIds.has(l.id)).length;
      const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
      const resume = resumeLesson(lessons, completedIds);
      return {
        slug: course.slug,
        title: course.title,
        percent,
        completed,
        total,
        resumeSlug: resume?.slug ?? null,
      };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back{user.name ? `, ${user.name}` : ""}.
      </p>

      {pending.length > 0 && (
        <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-600 dark:text-amber-400">
          {pending.length === 1 ? "A payment is" : `${pending.length} payments are`}{" "}
          awaiting confirmation. Access unlocks as soon as we verify it.
        </div>
      )}

      {cards.length === 0 ? (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <BookOpen className="size-10 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">No courses yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enroll in a track to start learning.
              </p>
            </div>
            <Button asChild>
              <Link href="/pricing">Browse tracks</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.slug} className="flex flex-col">
              <CardHeader>
                <Badge variant="secondary" className="mb-1 w-fit">
                  {card.percent === 100 ? "Completed" : "Enrolled"}
                </Badge>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent className="mt-auto flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {card.completed}/{card.total} lessons
                    </span>
                    <span>{card.percent}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${card.percent}%` }}
                    />
                  </div>
                </div>
                <Button asChild className="w-full">
                  <Link
                    href={
                      card.resumeSlug
                        ? `/learn/${card.slug}/${card.resumeSlug}`
                        : `/learn/${card.slug}`
                    }
                  >
                    {card.percent === 0 ? "Start" : "Continue"}{" "}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="mt-10 text-xs text-muted-foreground">Signed in as {user.email}.</p>
    </div>
  );
}
