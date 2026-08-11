import { PrismaClient } from "@prisma/client";

import { allProducts, tracks } from "../src/lib/catalog";

// Seeds the PRODUCTS you sell: Course rows (3 tracks + bundle) from the catalog,
// plus a first pass of Modules and Lessons from the catalog outline so a fresh
// database is immediately browsable.
//
// Idempotent: courses upsert by slug, and a track that already has modules is
// skipped so progress isn't wiped. That skip is also why this script is NOT the
// way to edit lessons — once a track is seeded, re-running changes nothing.
//
// Real lesson content (videos, durations, notes, previews) is owned by
// `scripts/sync-content.ts`, which upserts by slug and is safe to re-run:
//
//     npm run content:sync -- --dry-run
//     npm run content:sync
//
// See CONTENT.md. Video IDs seeded here are a PLACEHOLDER (Big Buck Bunny, a
// Creative Commons clip) so the player visibly works before anything is
// recorded.

const prisma = new PrismaClient();

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
        data: {
          courseId: course.id,
          // Matches the module's folder name under content/ — see CONTENT.md.
          slug: slugify(mod.title),
          title: mod.title,
          sortOrder: mi,
        },
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
  console.log("Next: author lessons in content/ and run `npm run content:sync`.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
