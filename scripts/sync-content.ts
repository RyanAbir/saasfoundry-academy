import fs from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";

/**
 * Content sync — the authoring pipeline for lessons.
 *
 * `prisma/seed.ts` creates the Course rows (the products you sell). This script
 * owns everything below them: modules, lessons, video ids, durations, notes and
 * free-preview flags, read from the `content/` tree.
 *
 * Why it exists: the seed deliberately skips any track that already has modules,
 * so once a track was seeded there was no way to update a lesson's video or notes
 * without editing the database by hand. This script upserts by slug instead, so
 * you can re-run it after every recording session.
 *
 * It never touches Progress. Re-running is safe: a lesson keeps its id, so a
 * student's completed-lesson rows survive edits to its title, video or notes.
 *
 *   npm run content:sync                  apply changes
 *   npm run content:sync -- --dry-run     show what would change, touch nothing
 *   npm run content:sync -- --course=career-launch    limit to one track
 *   npm run content:sync -- --prune       ALSO delete DB rows no longer in content
 *
 * Layout:
 *
 *   content/
 *     full-stack-foundations/          <- must match a Course.slug
 *       01-web-fundamentals/           <- NN- prefix sets order, rest is the slug
 *         _module.md                   <- frontmatter: title
 *         01-how-the-web-works.md      <- a lesson
 *
 * Lesson frontmatter:
 *
 *   ---
 *   title: How the web works
 *   video: youtube:dQw4w9WgXcQ      # or a full URL, or vimeo:/bunny: prefixed
 *   duration: 8:30                   # mm:ss, h:mm:ss, or plain seconds
 *   preview: true                    # free preview — visible without buying
 *   ---
 *   Markdown notes go here.
 */

const prisma = new PrismaClient();

const CONTENT_DIR = path.join(process.cwd(), "content");

type Provider = "youtube" | "vimeo" | "bunny";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const PRUNE = args.includes("--prune");
const ONLY_COURSE = args
  .find((a) => a.startsWith("--course="))
  ?.slice("--course=".length);

// ---------- parsing helpers ----------

interface Frontmatter {
  [key: string]: string;
}

/**
 * Minimal `key: value` frontmatter reader. Deliberately not YAML — this keeps
 * the project dependency-free, and lesson metadata is all flat scalars.
 */
function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/^﻿/, "");
  if (!text.startsWith("---")) return { data: {}, body: text };

  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: text };

  const head = text.slice(3, end);
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const data: Frontmatter = {};

  for (const line of head.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    let value = trimmed.slice(sep + 1).trim();
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (quoted && value.length > 1) value = value.slice(1, -1);
    data[key] = value;
  }

  return { data, body };
}

/**
 * Accepts `youtube:ID`, `vimeo:ID`, `bunny:libraryId/guid`, a bare id, or a
 * full YouTube/Vimeo URL pasted straight from the browser. Blank or `TODO`
 * means "not recorded yet" — the player shows its "Video coming soon" state.
 */
function parseVideo(value: string | undefined): {
  provider: Provider;
  videoId: string | null;
} {
  const raw = (value ?? "").trim();
  if (!raw || raw.toUpperCase() === "TODO") {
    return { provider: "youtube", videoId: null };
  }

  const youtubeUrl = raw.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  if (youtubeUrl) return { provider: "youtube", videoId: youtubeUrl[1] };

  const vimeoUrl = raw.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoUrl) return { provider: "vimeo", videoId: vimeoUrl[1] };

  const prefixed = raw.match(/^(youtube|vimeo|bunny)\s*:\s*(.+)$/i);
  if (prefixed) {
    return {
      provider: prefixed[1].toLowerCase() as Provider,
      videoId: prefixed[2].trim(),
    };
  }

  return { provider: "youtube", videoId: raw };
}

/** `8:30` → 510, `1:02:00` → 3720, `480` → 480. */
function parseDuration(value: string | undefined): number {
  const raw = (value ?? "").trim();
  if (!raw) return 0;
  if (/^\d+$/.test(raw)) return Number(raw);

  const parts = raw.split(":").map((p) => Number(p.trim()));
  if (parts.some((n) => !Number.isFinite(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function parseBool(value: string | undefined): boolean {
  return ["true", "yes", "1"].includes((value ?? "").trim().toLowerCase());
}

/** `03-css-layout` → { order: 3, slug: "css-layout" }. */
function splitOrderedName(name: string, fallbackOrder: number) {
  const match = name.match(/^(\d+)[-_.](.+)$/);
  if (match) return { order: Number(match[1]), slug: match[2] };
  return { order: fallbackOrder, slug: name };
}

function titleFromSlug(slug: string): string {
  const words = slug.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

// ---------- reading the content tree ----------

interface LessonFile {
  slug: string;
  sortOrder: number;
  title: string;
  provider: Provider;
  videoId: string | null;
  durationSec: number;
  isPreview: boolean;
  content: string;
  file: string;
}

interface ModuleDir {
  slug: string;
  sortOrder: number;
  title: string;
  lessons: LessonFile[];
}

function readModule(courseDir: string, dirName: string, index: number): ModuleDir {
  const { order, slug } = splitOrderedName(dirName, index);
  const dir = path.join(courseDir, dirName);

  let title = titleFromSlug(slug);
  const moduleFile = path.join(dir, "_module.md");
  if (fs.existsSync(moduleFile)) {
    const { data } = parseFrontmatter(fs.readFileSync(moduleFile, "utf8"));
    if (data.title) title = data.title;
  }

  const lessons = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((fileName, i): LessonFile => {
      const base = fileName.replace(/\.md$/, "");
      const { order: lessonOrder, slug: lessonSlug } = splitOrderedName(base, i);
      const raw = fs.readFileSync(path.join(dir, fileName), "utf8");
      const { data, body } = parseFrontmatter(raw);
      const video = parseVideo(data.video);

      return {
        slug: data.slug || lessonSlug,
        sortOrder: lessonOrder,
        title: data.title || titleFromSlug(lessonSlug),
        provider: video.provider,
        videoId: video.videoId,
        durationSec: parseDuration(data.duration),
        isPreview: parseBool(data.preview),
        content: body.trim(),
        file: path.join(dirName, fileName),
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return { slug, sortOrder: order, title, lessons };
}

function readCourse(courseSlug: string): ModuleDir[] {
  const courseDir = path.join(CONTENT_DIR, courseSlug);
  return fs
    .readdirSync(courseDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .map((name, i) => readModule(courseDir, name, i))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// ---------- syncing ----------

/** The module fields the sync actually reads — kept narrow so the script
 *  doesn't depend on Prisma's include-payload typing. */
interface ModuleRow {
  id: string;
  slug: string | null;
  title: string;
  sortOrder: number;
}

const stats = {
  modulesCreated: 0,
  modulesUpdated: 0,
  lessonsCreated: 0,
  lessonsUpdated: 0,
  lessonsUnchanged: 0,
  missingVideo: 0,
  pruned: 0,
};

const warnings: string[] = [];

async function syncCourse(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: { modules: { include: { lessons: true } } },
  });

  if (!course) {
    warnings.push(
      `content/${courseSlug} has no matching Course row — run \`npm run db:seed\` first, or rename the folder to match a course slug.`
    );
    return;
  }

  const modules = readCourse(courseSlug);
  console.log(`\n${course.title}  (${courseSlug})`);

  const seenModuleIds = new Set<string>();

  for (const mod of modules) {
    // Match on slug first. Modules seeded before slugs existed have none, so
    // fall back to the title and backfill the slug — that keeps existing
    // lesson ids (and therefore student progress) intact.
    let row: ModuleRow | undefined =
      course.modules.find((m) => m.slug === mod.slug) ??
      course.modules.find((m) => !m.slug && m.title === mod.title);

    if (!row) {
      if (!DRY_RUN) {
        row = await prisma.module.create({
          data: {
            courseId: course.id,
            slug: mod.slug,
            title: mod.title,
            sortOrder: mod.sortOrder,
          },
        });
      }
      stats.modulesCreated++;
      console.log(`  + module  ${mod.slug}`);
    } else {
      const changed =
        row.slug !== mod.slug ||
        row.title !== mod.title ||
        row.sortOrder !== mod.sortOrder;
      if (changed) {
        if (!DRY_RUN) {
          await prisma.module.update({
            where: { id: row.id },
            data: { slug: mod.slug, title: mod.title, sortOrder: mod.sortOrder },
          });
        }
        stats.modulesUpdated++;
        console.log(`  ~ module  ${mod.slug}`);
      }
    }

    if (row) seenModuleIds.add(row.id);
    if (!row && DRY_RUN) {
      // Nothing was created, so its lessons would all be new.
      stats.lessonsCreated += mod.lessons.length;
      for (const lesson of mod.lessons) {
        console.log(`    + lesson ${lesson.slug}`);
        if (!lesson.videoId) stats.missingVideo++;
      }
      continue;
    }
    if (!row) continue;

    const existingLessons = await prisma.lesson.findMany({
      where: { moduleId: row.id },
    });
    const seenLessonSlugs = new Set<string>();

    for (const lesson of mod.lessons) {
      seenLessonSlugs.add(lesson.slug);
      if (!lesson.videoId) stats.missingVideo++;

      const existing = existingLessons.find((l) => l.slug === lesson.slug);
      const data = {
        title: lesson.title,
        videoProvider: lesson.provider,
        videoId: lesson.videoId,
        durationSec: lesson.durationSec,
        content: lesson.content,
        isPreview: lesson.isPreview,
        sortOrder: lesson.sortOrder,
      };

      if (!existing) {
        if (!DRY_RUN) {
          await prisma.lesson.create({
            data: { moduleId: row.id, slug: lesson.slug, ...data },
          });
        }
        stats.lessonsCreated++;
        console.log(`    + lesson ${lesson.slug}`);
        continue;
      }

      const changed =
        existing.title !== data.title ||
        existing.videoProvider !== data.videoProvider ||
        existing.videoId !== data.videoId ||
        existing.durationSec !== data.durationSec ||
        (existing.content ?? "") !== data.content ||
        existing.isPreview !== data.isPreview ||
        existing.sortOrder !== data.sortOrder;

      if (!changed) {
        stats.lessonsUnchanged++;
        continue;
      }

      if (!DRY_RUN) {
        await prisma.lesson.update({ where: { id: existing.id }, data });
      }
      stats.lessonsUpdated++;
      console.log(`    ~ lesson ${lesson.slug}`);
    }

    // Lessons in the database that no longer exist on disk.
    const orphanLessons = existingLessons.filter(
      (l) => !seenLessonSlugs.has(l.slug)
    );
    for (const orphan of orphanLessons) {
      if (PRUNE) {
        if (!DRY_RUN) {
          await prisma.lesson.delete({ where: { id: orphan.id } });
        }
        stats.pruned++;
        console.log(`    - lesson ${orphan.slug} (pruned)`);
      } else {
        warnings.push(
          `${courseSlug}/${mod.slug}/${orphan.slug} exists in the database but not in content/ — re-run with --prune to delete it (this also deletes its progress rows).`
        );
      }
    }
  }

  const orphanModules = course.modules.filter((m) => !seenModuleIds.has(m.id));
  for (const orphan of orphanModules) {
    if (PRUNE) {
      if (!DRY_RUN) await prisma.module.delete({ where: { id: orphan.id } });
      stats.pruned++;
      console.log(`  - module  ${orphan.slug ?? orphan.title} (pruned)`);
    } else {
      warnings.push(
        `${courseSlug}/${orphan.slug ?? orphan.title} exists in the database but not in content/ — re-run with --prune to delete it and its lessons.`
      );
    }
  }
}

async function main() {
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error(
      `No content/ directory found at ${CONTENT_DIR}. See CONTENT.md for the expected layout.`
    );
    process.exit(1);
  }

  if (DRY_RUN) console.log("DRY RUN — nothing will be written.\n");

  const courseSlugs = fs
    .readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((slug) => !ONLY_COURSE || slug === ONLY_COURSE)
    .sort();

  if (courseSlugs.length === 0) {
    console.error(
      ONLY_COURSE
        ? `No content/${ONLY_COURSE} directory.`
        : "content/ has no course directories yet."
    );
    process.exit(1);
  }

  for (const slug of courseSlugs) await syncCourse(slug);

  console.log("\n─────────────────────────────");
  console.log(
    `modules  ${stats.modulesCreated} created, ${stats.modulesUpdated} updated`
  );
  console.log(
    `lessons  ${stats.lessonsCreated} created, ${stats.lessonsUpdated} updated, ${stats.lessonsUnchanged} unchanged`
  );
  if (stats.pruned) console.log(`pruned   ${stats.pruned} rows deleted`);
  if (stats.missingVideo) {
    console.log(
      `\n${stats.missingVideo} lesson(s) still have no video id — they render as "Video coming soon".`
    );
  }
  if (warnings.length) {
    console.log("\nWarnings:");
    for (const w of warnings) console.log(`  ! ${w}`);
  }
  if (DRY_RUN) console.log("\nDry run — no changes were written.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
