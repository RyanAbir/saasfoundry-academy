import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { allProducts, tracks } from "../src/lib/catalog";

// Seeds Course rows (3 tracks + bundle) and, for each track, its Modules and
// Lessons from the catalog outline. Idempotent: courses upsert by slug, and a
// track that already has modules is skipped so progress isn't wiped.
//
// Video IDs are a PLACEHOLDER (Big Buck Bunny — a Creative Commons clip) so the
// player visibly works. Swap `videoId` on each Lesson for your real unlisted
// YouTube/Vimeo IDs (or re-point to Bunny) — no schema change needed.

// The engine-less (queryCompiler) client requires a driver adapter everywhere,
// including this Node-run seed script.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEMO_VIDEO_ID = "aqz-KE-bpKQ";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCourses() {
  for (const [i, product] of allProducts.entries()) {
    const data = {
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      level: product.level,
      priceBdt: product.priceBdt,
      oldPriceBdt: product.oldPriceBdt,
      isBundle: product.isBundle,
      published: true,
      sortOrder: i,
    };
    await prisma.course.upsert({
      where: { slug: product.slug },
      create: { slug: product.slug, ...data },
      update: data,
    });
  }
  console.log(`  ✓ ${allProducts.length} courses`);
}

async function seedModulesAndLessons() {
  for (const track of tracks) {
    const course = await prisma.course.findUnique({ where: { slug: track.slug } });
    if (!course) continue;

    const existing = await prisma.module.count({ where: { courseId: course.id } });
    if (existing > 0) {
      console.log(`  · ${track.slug}: modules already seeded — skipping`);
      continue;
    }

    let lessonIndex = 0;
    for (const [mi, mod] of track.modules.entries()) {
      const createdModule = await prisma.module.create({
        data: { courseId: course.id, title: mod.title, sortOrder: mi },
      });

      for (const [li, lessonTitle] of mod.lessons.entries()) {
        await prisma.lesson.create({
          data: {
            moduleId: createdModule.id,
            title: lessonTitle,
            slug: slugify(lessonTitle),
            videoProvider: "youtube",
            videoId: DEMO_VIDEO_ID,
            durationSec: 480,
            content: `## ${lessonTitle}\n\nThese are placeholder lesson notes. Replace with the real content in **Markdown** — text, code blocks, and links all render.\n\n### What you'll learn\n\n- Key idea one\n- Key idea two\n- Key idea three\n\n\`\`\`ts\n// Example code\nconst greeting = "Hello, SaaSFoundry!";\nconsole.log(greeting);\n\`\`\`\n`,
            // First lesson of the whole track is a free preview.
            isPreview: lessonIndex === 0,
            sortOrder: li,
          },
        });
        lessonIndex++;
      }
    }
    console.log(`  ✓ ${track.slug}: ${track.modules.length} modules, ${lessonIndex} lessons`);
  }
}

async function main() {
  await seedCourses();
  await seedModulesAndLessons();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
