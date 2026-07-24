import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import type { ModuleNode } from "@/lib/lms";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function CourseOutline({
  modules,
  completedIds,
  courseSlug,
  currentLessonId,
}: {
  modules: ModuleNode[];
  completedIds: Set<string>;
  courseSlug: string;
  currentLessonId?: string;
}) {
  return (
    <nav className="flex flex-col gap-6">
      {modules.map((mod, mi) => (
        <div key={mod.id}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Module {mi + 1}: {mod.title}
          </h3>
          <ul className="mt-2 flex flex-col gap-0.5">
            {mod.lessons.map((lesson) => {
              const done = completedIds.has(lesson.id);
              const active = lesson.id === currentLessonId;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/learn/${courseSlug}/${lesson.slug}`}
                    prefetch={false}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                      active
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="size-4 shrink-0 text-brand-3" />
                    ) : (
                      <Circle className="size-4 shrink-0 opacity-40" />
                    )}
                    <span className="flex-1">{lesson.title}</span>
                    {lesson.isPreview && (
                      <Badge variant="secondary" className="text-[10px]">
                        Preview
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
