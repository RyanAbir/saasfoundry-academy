# SaaSFoundry Academy — Authoring Content

> How lessons get from a recording session into the app.
> Last updated: 2026-07 · Owner: Lutfur Rahman

---

## The split

`prisma/seed.ts` owns the **products** — the three Course rows plus the All-Access bundle,
their prices and descriptions, read from `src/lib/catalog.ts`. Run it once, and again whenever
prices or product copy change.

`scripts/sync-content.ts` owns **everything inside a course** — modules, lessons, video ids,
durations, notes and free-preview flags — read from the `content/` tree. Run it after every
recording session.

The split matters because the seed deliberately skips a track that already has modules (so it
can't wipe student progress), which meant there was previously no way to update a lesson after
the first seed. The sync script upserts by slug instead, so re-running it is safe and expected.

---

## Layout

```
content/
  full-stack-foundations/         <- must match a Course.slug exactly
    01-web-fundamentals/          <- NN- prefix sets the order; the rest is the slug
      _module.md                  <- the module's title
      01-how-the-web-works.md     <- a lesson
      02-html-and-semantic-structure.md
    02-javascript-and-typescript/
      ...
```

Folder and file names are the stable identity. **Renaming a lesson file changes its slug**,
which changes its URL and orphans its progress rows — rename only if you mean to. Changing the
`NN-` prefix is free and just reorders.

---

## Lesson file

```markdown
---
title: How the web works
video: youtube:dQw4w9WgXcQ
duration: 8:30
preview: true
---

Everything below the second `---` is the lesson notes, rendered as Markdown —
headings, **bold**, links, tables and fenced code blocks all work.

```ts
const greeting = "Hello, SaaSFoundry!";
```
```

| Field | Notes |
|---|---|
| `title` | Shown in the outline, the player, and the dashboard. Falls back to the filename. |
| `video` | `youtube:ID`, `vimeo:ID`, `bunny:libraryId/guid`, a bare id, or a pasted YouTube/Vimeo URL. Leave blank or `TODO` until it's recorded. |
| `duration` | `mm:ss`, `h:mm:ss`, or plain seconds. |
| `preview` | `true` makes the lesson readable without buying — this is your sales demo. |
| `slug` | Optional override; by default the filename (minus the `NN-` prefix) is the slug. |

A lesson with no video id renders the player's "Video coming soon" state, so you can publish
notes ahead of the recording.

---

## Workflow

```bash
npm run content:sync -- --dry-run     # see exactly what would change
npm run content:sync                  # apply it
```

Useful flags: `--course=career-launch` limits the run to one track, and `--prune` deletes
database rows whose files are gone. Prune is opt-in because deleting a lesson also deletes its
progress rows — without the flag you get a warning listing the orphans instead.

Re-running is safe. A lesson keeps its database id across edits, so a student who completed it
stays completed even after you swap the video or rewrite the notes.

---

## Recording checklist per lesson

Record and edit → upload unlisted to YouTube → paste the id or URL into `video:` → set the real
`duration:` → write the notes below the frontmatter → `npm run content:sync -- --dry-run` →
sync → open the lesson on a phone and watch it back.

Set `preview: true` on the one lesson per track that best proves the teaching quality. It does
not have to be lesson one, and it is the only lesson a non-buyer can see.
