import { prisma } from "@/lib/prisma";

// Explicit view types for the course tree. Defining these (rather than relying
// on Prisma's generated payload types) keeps type-checking stable and gives the
// UI a clear contract. The Prisma query result is structurally compatible.
export interface LessonNode {
  id: string;
  title: string;
  slug: string;
  videoProvider: string;
  videoId: string | null;
  durationSec: number;
  content: string | null;
  isPreview: boolean;
  sortOrder: number;
}

export interface ModuleNode {
  id: string;
  title: string;
  sortOrder: number;
  lessons: LessonNode[];
}

export interface CourseNode {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  priceBdt: number;
  isBundle: boolean;
  modules: ModuleNode[];
}

/** A course with its modules and lessons, ordered for display. */
export async function getCourseWithModules(slug: string): Promise<CourseNode | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      modules: {
        orderBy: { sortOrder: "asc" },
        include: { lessons: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  return course;
}

/** All lessons across the course, in play order. */
export function flattenLessons(course: CourseNode): LessonNode[] {
  return course.modules.flatMap((m) => m.lessons);
}

/** The module that contains a given lesson (for breadcrumbs). */
export function moduleOfLesson(
  course: CourseNode,
  lessonId: string
): ModuleNode | undefined {
  return course.modules.find((m) => m.lessons.some((l) => l.id === lessonId));
}

/** Set of completed lesson ids for a user within a course. */
export async function getCompletedLessonIds(
  userId: string,
  courseId: string
): Promise<Set<string>> {
  const rows = await prisma.progress.findMany({
    where: { userId, completed: true, lesson: { module: { courseId } } },
    select: { lessonId: true },
  });
  return new Set(rows.map((r: { lessonId: string }) => r.lessonId));
}

/** Completed / total / percent for a course's lessons. */
export async function getCourseProgress(userId: string, courseId: string) {
  const total = await prisma.lesson.count({ where: { module: { courseId } } });
  const completed = await prisma.progress.count({
    where: { userId, completed: true, lesson: { module: { courseId } } },
  });
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

/** The lesson to resume on: first not-yet-completed, else the first lesson. */
export function resumeLesson(
  lessons: LessonNode[],
  completed: Set<string>
): LessonNode | undefined {
  return lessons.find((l) => !completed.has(l.id)) ?? lessons[0];
}
