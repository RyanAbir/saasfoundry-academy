# SaaSFoundry Academy — Data Model

> Entities, relationships, and access rules. Basis for the Prisma schema.
> Last updated: 2026-07 · Owner: Lutfur Rahman

---

## 1. Entities at a glance

```
User ──< Purchase >── Course ──< Module ──< Lesson
  │                      │
  └──< Progress >────────┴──────────────────┘
```

- A **User** buys **Courses** (tracks) via **Purchases**.
- A **Course** has many **Modules**; a **Module** has many **Lessons**.
- **Progress** records which lessons a user has completed.
- Access rule: a user can open a Lesson only if they have a `paid` Purchase for its Course
  (or an All-Access bundle purchase).

---

## 2. Entities & fields

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | Mirrors Supabase Auth user id |
| email | text (unique) | From auth |
| name | text | Optional display name |
| avatarUrl | text | Optional |
| role | enum(`student`,`admin`) | Default `student` |
| createdAt | timestamp | |

> Auth itself is handled by Supabase Auth. This table holds app-level profile + role.

### Course  (a "track")
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| slug | text (unique) | e.g. `full-stack-foundations` |
| title | text | |
| subtitle | text | Short tagline |
| description | text | |
| level | enum(`beginner`,`career`,`builder`) | Maps to the 3 tracks |
| priceBdt | int | Price in BDT (store as integer taka) |
| oldPriceBdt | int | For strike-through display |
| isBundle | bool | True for All-Access |
| coverImageUrl | text | |
| published | bool | Hide drafts |
| sortOrder | int | Display order |
| createdAt | timestamp | |

### Module
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| courseId | uuid (FK → Course) | |
| title | text | |
| sortOrder | int | Order within course |

### Lesson
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| moduleId | uuid (FK → Module) | |
| title | text | |
| slug | text | Unique within course |
| videoProvider | enum(`youtube`,`vimeo`,`bunny`) | Swappable video source |
| videoId | text | Provider-specific id/key |
| durationSec | int | For progress + display |
| content | text | Markdown notes/resources |
| isPreview | bool | Free preview lesson (marketing) |
| sortOrder | int | Order within module |

### Purchase
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| userId | uuid (FK → User) | |
| courseId | uuid (FK → Course) | The track or bundle bought |
| amountBdt | int | Amount charged |
| status | enum(`pending`,`paid`,`failed`,`refunded`) | Set `paid` by IPN webhook |
| provider | enum(`sslcommerz`,`aamarpay`) | Which gateway |
| providerTxnId | text | Gateway transaction id (unique) |
| valId | text | SSLCommerz validation id |
| method | text | bkash / nagad / rocket / card / bank |
| createdAt | timestamp | |
| paidAt | timestamp | Null until confirmed |

### Progress
| Field | Type | Notes |
|---|---|---|
| id | uuid (PK) | |
| userId | uuid (FK → User) | |
| lessonId | uuid (FK → Lesson) | |
| completed | bool | |
| lastPositionSec | int | Resume playback position |
| updatedAt | timestamp | |
| | | **Unique (userId, lessonId)** |

---

## 3. Access-control logic

A user **has access to a Course** if either:
- there is a `Purchase` with `status = paid` for that `courseId`, **or**
- there is a `paid` Purchase for a Course where `isBundle = true` (All-Access unlocks all tracks).

Enforce this **server-side** on every lesson fetch — never rely on hiding UI alone.
`isPreview = true` lessons are viewable by anyone (used on the sales page).

---

## 4. Seeding (v1 has no admin CMS yet)

- Seed the 3 tracks + bundle, their modules and lessons via a Prisma seed script
  (or the Supabase table editor) until an admin panel exists.
- Store video as `(videoProvider, videoId)` so we can start on unlisted YouTube and later
  re-point lessons to Bunny by changing two fields — no schema change.

---

## 5. Future additions (not in v1)

- `Certificate`, `Quiz`/`Question`/`Answer`, `Coupon`, `Review`, `Comment`.
- `Subscription` if we ever move from one-time to recurring.
- Analytics/event tables for completion funnels.
