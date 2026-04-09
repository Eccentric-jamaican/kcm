# KCM Maintainer Admin With Antonio-Informed Course Schema

## Summary
Build a role-gated admin experience at `/app/admin` that becomes the source of truth for course content across the platform, while keeping the UI aligned with the current KCM visual language. The course domain will be modeled from the structure observed on Code with Antonio: a public course/workshop shell with an ordered lesson sequence, lesson-level video/content resources, and learner progress state. We will preserve your richer authoring requirement by using a hybrid `course -> optional chapters -> lessons -> resources` schema, where courses can still render as a flat Antonio-style lesson list through a default chapter.

This plan covers:
- server-side maintainer/admin access control
- Convex-backed course and progress schema
- Mux-backed lesson video workflow
- fully wired responsive admin pages
- migration of learner-facing course pages from static data to Convex

## Refined Course Domain
### Why this schema
From inspecting `codewithantonio.com`:
- catalog cards are course-centric
- course detail pages render ordered lessons
- lesson pages are first-class routes
- lessons own video/content resources
- learner progress is tracked per lesson
- the reference does not visibly require a chapter layer

Because you want a curriculum builder with “full control,” the best schema is:
- keep chapters for maintainers
- make chapters optional in runtime behavior
- allow a single implicit/default chapter so KCM can render Antonio-style flat lesson navigation without losing future flexibility

## Public APIs, Interfaces, and Types
### Convex tables
#### `users`
Existing table extended with:
- `role: "student" | "maintainer" | "admin"`
- default new users to `"student"`

Indexes:
- `by_tokenIdentifier`

#### `courses`
Purpose: top-level course shell visible in catalog and detail pages.

Fields:
- `slug: string`
- `title: string`
- `subtitle: string`
- `description: string`
- `body: string`
- `status: "draft" | "published" | "archived"`
- `visibility: "private" | "public" | "unlisted"`
- `coverImageStorageId: Id<"_storage"> | null`
- `coverImageUrl: string | null`
- `coverImageAlt: string | null`
- `githubUrl: string | null`
- `tags: string[]`
- `level: "Beginner" | "Intermediate" | "Advanced" | "All Levels"`
- `estimatedDurationMinutes: number | null`
- `maintainerUserId: Id<"users">`
- `defaultChapterId: Id<"courseChapters"> | null`
- `lessonCount: number`
- `chapterCount: number`
- `publishedAt: number | null`

Indexes:
- `by_slug`
- `by_status`
- `by_visibility_and_status`
- `by_maintainerUserId_and_status`

#### `courseChapters`
Purpose: optional curriculum grouping for authoring and navigation.

Fields:
- `courseId: Id<"courses">`
- `title: string`
- `description: string`
- `position: number`
- `isDefault: boolean`

Indexes:
- `by_courseId_and_position`

Rule:
- every course always has at least one chapter
- if the course is effectively “flat,” that chapter is hidden in learner UI and treated as the default container

#### `courseLessons`
Purpose: first-class lesson pages and ordered curriculum items.

Fields:
- `courseId: Id<"courses">`
- `chapterId: Id<"courseChapters">`
- `slug: string`
- `title: string`
- `description: string`
- `body: string`
- `position: number`
- `state: "draft" | "published"`
- `visibility: "private" | "public" | "unlisted"`
- `githubUrl: string | null`
- `thumbnailTime: number | null`
- `isOptional: boolean`
- `prompt: string | null`
- `tags: string[]`
- `muxUploadId: string | null`
- `muxAssetId: string | null`
- `muxPlaybackId: string | null`
- `muxStatus: "idle" | "uploading" | "processing" | "ready" | "errored"`
- `durationSeconds: number | null`
- `transcriptStatus: "none" | "processing" | "ready" | "errored"`

Indexes:
- `by_courseId_and_position`
- `by_chapterId_and_position`
- `by_courseId_and_slug`

Lesson route shape:
- admin editor references lesson by Convex id
- learner page may use `/app/courses/[courseSlug]/[lessonSlug]` or equivalent nested route
- if KCM keeps current course route structure initially, lesson slug still exists in schema and APIs

#### `lessonResources`
Purpose: ordered child resources attached to lessons.

Fields:
- `lessonId: Id<"courseLessons">`
- `type: "video" | "file" | "link"`
- `title: string`
- `position: number`
- `storageId: Id<"_storage"> | null`
- `url: string | null`
- `mimeType: string | null`
- `fileSize: number | null`
- `metadata: { thumbnailTime?: number; label?: string; notes?: string }`

Indexes:
- `by_lessonId_and_position`

Important modeling choice:
- lesson video is stored as a `lessonResources` row of type `video`
- denormalized Mux playback fields stay on `courseLessons` for fast nav/player access
- other downloadable/linked attachments remain in `lessonResources`

#### `courseAccess`
Purpose: membership or entitlement to a course.

Fields:
- `courseId: Id<"courses">`
- `userId: Id<"users">`
- `accessType: "owner" | "staff" | "student"`
- `grantedAt: number`

Indexes:
- `by_userId_and_courseId`
- `by_courseId_and_accessType`

Use:
- `admin` bypasses this
- `maintainer` usually gets `owner` or `staff`
- students can later be attached here without changing course schema

#### `lessonProgress`
Purpose: Antonio-style completion and playback state.

Fields:
- `lessonId: Id<"courseLessons">`
- `courseId: Id<"courses">`
- `userId: Id<"users">`
- `completed: boolean`
- `completedAt: number | null`
- `lastWatchedAt: number | null`
- `playheadSeconds: number | null`

Indexes:
- `by_userId_and_courseId`
- `by_userId_and_lessonId`
- `by_courseId_and_userId`

## Convex Functions
### Authorization helpers
Implement shared helpers that:
- resolve current user from `identity.tokenIdentifier`
- enforce `admin` global access
- enforce `maintainer` access only for assigned courses
- never take user ids as authorization args

### Public queries
- `users.viewer`
- `admin.getViewer`
- `admin.getDashboardStats`
- `admin.listCourses`
- `admin.getCourseEditor`
- `admin.getLessonEditor`
- `courses.listPublished`
- `courses.getPublishedCourseBySlug`
- `courses.getPublishedLessonBySlug`
- `courses.getCourseNavigation`
- `progress.getCourseProgress`

### Public mutations
- `admin.createCourse`
- `admin.updateCourse`
- `admin.deleteCourse`
- `admin.publishCourse`
- `admin.unpublishCourse`
- `admin.archiveCourse`
- `admin.createChapter`
- `admin.updateChapter`
- `admin.deleteChapter`
- `admin.reorderChapters`
- `admin.createLesson`
- `admin.updateLesson`
- `admin.deleteLesson`
- `admin.reorderLessons`
- `admin.createLessonResource`
- `admin.updateLessonResource`
- `admin.deleteLessonResource`
- `admin.reorderLessonResources`
- `admin.generateCoverUploadUrl`
- `admin.generateResourceUploadUrl`
- `progress.markLessonComplete`
- `progress.saveLessonPlayback`

### Node actions
Separate `"use node"` file:
- `admin.createMuxDirectUpload`
- `admin.refreshMuxAsset`
- optional `admin.generateMuxPlaybackArtifacts` if needed

### HTTP endpoint
`convex/http.ts`:
- receive Mux webhooks
- verify signature
- update lesson `muxStatus`, `muxAssetId`, `muxPlaybackId`, `durationSeconds`, `transcriptStatus`

## Next.js Route Plan
### Guarding
Use server-side guards in admin layouts/pages:
- unauthenticated: `unauthorized()`
- authenticated but not maintainer/admin: `forbidden()`

Add:
- `src/app/unauthorized.tsx`
- `src/app/forbidden.tsx`

Use Clerk server auth plus `fetchQuery` from `convex/nextjs` with a Clerk Convex token to avoid the current client-only loading bottleneck.

### Admin routes
- `/app/admin`
- `/app/admin/courses`
- `/app/admin/courses/new`
- `/app/admin/courses/[courseId]`
- `/app/admin/courses/[courseId]/curriculum`
- `/app/admin/courses/[courseId]/lessons/[lessonId]`
- `/app/admin/courses/[courseId]/resources`
- `/app/admin/courses/[courseId]/preview`

### Learner routes
Refactor course reads to Convex and move toward:
- `/app/courses`
- `/app/courses/[courseSlug]`
- `/app/courses/[courseSlug]/[lessonSlug]`

If current route compatibility must be preserved during rollout:
- support current course page first
- add lesson pages with redirects or internal mapping later in the same implementation

## UI/UX Plan
### Design direction
Stay visually in-family with the current KCM app:
- bright neutral canvas
- heavy black display type
- restrained mint/green action accents
- soft borders and rounded large panels
- no dark admin detour
- no generic SaaS purple dashboard styling

### Admin shell
- desktop: installed shadcn `sidebar`
- mobile: `Sheet`-based nav
- sticky top action bar
- remove unimplemented nav destinations from primary navigation for this pass

### Dashboard
Real data only:
- total courses
- published vs draft
- total lessons
- lessons with video processing errors
- recently updated courses
- quick actions: create course, continue editing, open curriculum

### Courses list
- search by title/slug/tag
- filter by status
- desktop table + mobile stacked cards
- row actions: edit, curriculum, preview, publish/unpublish, archive

### Course editor
Sections:
- metadata
- visibility/publishing
- cover image
- GitHub/source link
- lesson count and duration summary
- learner preview link

### Curriculum builder
- chapter cards with reorder controls
- lesson rows/cards nested in chapter
- drag/reorder behavior
- hidden “default chapter” support for flat-mode courses
- lesson creation and quick edit

### Lesson editor
Fields:
- title
- slug
- description
- body
- optional flag
- visibility
- source code link
- prompt/notes
- tags
- video upload state
- transcript state
- attachments/resources

### Learner lesson page behavior
Antonio-inspired features:
- video player
- transcript/timestamp content from `body`
- source code link when present
- complete toggle
- next lesson CTA
- sidebar navigation with ordered lesson list
- autoplay preference can be UI-only in v1 unless you want it persisted later

## Migration Plan
### Static data migration
Current `src/app/(platform)/app/components/course-data.ts` becomes migration input.

Migration steps:
1. create courses in Convex from static catalog
2. create one default chapter per course
3. create lessons from `chapterList`
4. map course `imageUrl` to `coverImageUrl`
5. derive `lessonCount` and `chapterCount`
6. switch learner pages to Convex reads
7. remove runtime dependence on static arrays

### Role bootstrap
Because roles are new:
- add one admin bootstrap path via env/config or one-off mutation
- assign the intended maintainer/admin user explicitly after auth sync

## Testing and Acceptance Criteria
### Schema and data
- course creation creates a default chapter automatically
- lessons can exist in explicit or default chapter
- lesson ordering and chapter ordering persist
- published courses are the only ones shown in learner catalog

### Authorization
- student cannot access `/app/admin`
- maintainer can access only owned courses
- admin can access all courses
- non-owner maintainer cannot mutate another maintainer’s course

### Mux
- maintainer can create direct upload
- webhook updates lesson status to `ready`
- ready lesson plays on learner page
- errored uploads surface actionable UI state

### Learner flows
- learner course page renders Convex course metadata
- lesson page resolves by course slug + lesson slug
- complete toggle persists in `lessonProgress`
- next lesson navigation follows `position`

### Responsive validation
Use Chrome MCP for:
- `/app/admin`
- `/app/admin/courses`
- `/app/admin/courses/new`
- `/app/admin/courses/[courseId]/curriculum`
- `/app/admin/courses/[courseSlug]/[lessonSlug]`

Check:
- desktop layout
- tablet layout
- mobile navigation
- no unreachable lesson actions on small screens
- no sideways lock for main admin tasks

### Verification
- run `eslint`
- manually test auth gating
- inspect console/network in Chrome MCP
- verify Mux upload and webhook transitions in dev

## Assumptions and Defaults
- final curriculum shape is hybrid: chapters plus lessons, with a default hidden chapter available
- lesson is the first-class playback unit
- Mux is the only video provider in v1
- lesson video is modeled as a lesson-owned resource, with denormalized playback fields on the lesson
- learner progress is tracked per lesson
- course analytics beyond progress are out of scope for this pass
- admin pages should not ship placeholder destinations
- server-side admin guards replace the current client-only loading dependency
