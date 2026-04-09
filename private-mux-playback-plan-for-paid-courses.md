# Private Mux Playback Plan For Paid Courses

## Summary
Implement private Mux playback end-to-end for paid courses by switching lesson uploads to signed playback, adding a Convex action that authorizes the current learner and mints short-lived Mux playback JWTs, and replacing the learner lesson page’s plain `<video>` element with Mux Player.

This plan uses the current Convex `courseAccess` table as the access-control source of truth for playback authorization, with an explicit note that this logic will later be extended or replaced when a payment gateway becomes the system that grants/revokes entitlements.

Chosen defaults:
- Entitlement source now: `courseAccess`
- Future note: payment integration will later drive `courseAccess` or supersede its grant flow
- Token issuer: Convex action
- Hardening level for first rollout: signed playback only
- Code style note: add focused comments around the token-minting/auth logic because it is security-sensitive

## Current State
The repo already has most of the Mux ingestion pipeline:
- [`convex/schema.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/schema.ts) stores `muxUploadId`, `muxAssetId`, `muxPlaybackId`, `muxStatus`, and `durationSeconds` on `courseLessons`
- [`convex/adminMux.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/adminMux.ts) creates direct uploads and refreshes assets
- [`convex/http.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/http.ts) handles Mux webhooks
- [`src/app/(platform)/app/admin/components/lesson-editor-form.tsx`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/app/(platform)/app/admin/components/lesson-editor-form.tsx) already lets maintainers upload lesson video files
- [`src/app/(platform)/app/courses/[courseId]/[lessonSlug]/page.tsx`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/app/(platform)/app/courses/%5BcourseId%5D/%5BlessonSlug%5D/page.tsx) currently attempts playback via a plain `<video>` tag using an `.m3u8` URL

Gaps that this plan closes:
- uploads are still created with `public` playback
- there is no signed playback token issuer
- learner course reads only allow `visibility === "public"`
- paid access authorization is not enforced for lesson playback
- lesson playback uses the wrong player primitive for a signed private Mux setup

## Implementation Scope

### 1. Switch lesson uploads from public to signed playback
Update [`convex/adminMux.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/adminMux.ts):
- Change the Mux upload creation body from `playback_policy: ["public"]` to `playback_policy: ["signed"]`
- Keep direct upload flow lesson-based exactly as it is now
- Do not change the maintainer UX shape yet; uploading still happens from the lesson editor
- Keep storing `muxPlaybackId` on the lesson after webhook/refresh completes

Notes:
- No schema change is required for this step
- Existing lessons with old public playback IDs may still exist; the player/token logic must tolerate missing signed assets during transition

### 2. Add Mux signing key configuration
Add new required environment variables for signing playback tokens:
- `MUX_SIGNING_KEY_ID`
- `MUX_SIGNING_PRIVATE_KEY`

Keep existing variables:
- `MUX_TOKEN_ID`
- `MUX_TOKEN_SECRET`
- `MUX_WEBHOOK_SECRET`

Environment handling decisions:
- `MUX_TOKEN_ID` and `MUX_TOKEN_SECRET` remain for server-to-Mux API calls
- `MUX_SIGNING_KEY_ID` and `MUX_SIGNING_PRIVATE_KEY` are used only to mint viewer playback JWTs
- The private signing key must be stored only in server/Convex env, never exposed to the browser

Plan repo/docs touchpoints:
- Add env references to the project README or a local setup section
- Document that the signing private key is returned only once by Mux when a signing key is created, so it must be stored immediately

### 3. Introduce paid-course access authorization helpers
Extend [`convex/lib/auth.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/lib/auth.ts) with new reusable authorization helpers for learner playback.

New helper behavior:
- `requireCoursePlaybackAccess(ctx, courseId)`
- Returns the current viewer and the course if access is allowed
- Allows access when any of these are true:
  - viewer is `admin`
  - viewer is the course maintainer/admin manager for that course
  - viewer has a `courseAccess` row for that course with `accessType` in `owner | staff | student`
- Throws `Forbidden` when authenticated but not entitled
- Throws `Not authenticated` when no identity exists

Implementation detail:
- This helper should query `courseAccess` via `by_userId_and_courseId`
- Keep the logic centralized so both course reads and token issuance use the exact same authorization rule
- Add comments around the decision tree because this is the logic that will later be adapted for billing-driven entitlements

Future-ready note:
- In a later billing rollout, this helper becomes the seam where payment-backed entitlement checks will be added or where `courseAccess` will be synced from billing

### 4. Split public marketing visibility from paid learner access
Refactor [`convex/courses.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/courses.ts) so private paid courses can still be playable by entitled learners.

Decision-complete behavior:
- `listPublished` remains catalog-focused and continues listing only `visibility === "public"` and `status === "published"`
- `getPublishedCourseBySlug` is replaced or complemented with an access-aware query for learner use
- `getPublishedLessonBySlug` is replaced or complemented with an access-aware query for learner use

Recommended API changes:
- Add `courses.getCourseBySlugForViewer`
- Add `courses.getLessonBySlugForViewer`

Behavior for these new queries:
- Load the course by slug
- Require `status === "published"`
- If `visibility === "public"`, allow normal access
- If `visibility === "private"` or `visibility === "unlisted"`, require `requireCoursePlaybackAccess`
- Return `null` only when the course or lesson truly does not exist or is unpublished
- Throw `Forbidden` for authenticated users without access
- Throw auth errors for unauthenticated users trying to access private/unlisted paid content

Reason for this shape:
- It avoids overloading “published” with “public”
- It keeps public catalog queries simple
- It creates a clear viewer-aware read path for paid lessons

### 5. Add a Convex action to mint signed Mux playback tokens
Create a new `"use node"` Convex file, preferably:
- [`convex/videoPlayback.ts`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/convex/videoPlayback.ts)

Add public action:
- `videoPlayback.getSignedPlaybackToken`

Arguments:
- `lessonId: Id<"courseLessons">`

Return shape:
- `playbackId: string`
- `playbackToken: string`
- `thumbnailToken?: string | null`
- `expiresAt: number`

Action behavior:
1. Read the lesson via a query or direct helper lookup
2. Verify lesson exists and has `muxPlaybackId`
3. Verify lesson belongs to a published course
4. Call `requireCoursePlaybackAccess` on the lesson’s `courseId`
5. Load signing env vars
6. Mint a short-lived JWT for the playback ID using RS256
7. Return the token and metadata needed by the client/player

Token defaults:
- `sub`: lesson `muxPlaybackId`
- `aud`: video playback audience expected by Mux
- `kid`: `MUX_SIGNING_KEY_ID`
- `exp`: current time + 10 minutes
- Keep TTL short and renewable through page refresh/reload

Important implementation note:
- Add code comments in this action explaining:
  - why this must stay server-only
  - why authorization happens before token minting
  - how the JWT claims map to Mux signed playback expectations

### 6. Add a thin player-facing query or server fetch boundary
Because lesson pages are server-rendered, define a clean boundary for fetching both lesson content and playback credentials.

Recommended shape:
- Server page fetches lesson/course data through the new viewer-aware lesson query
- A client player component requests the signed playback token on mount via Convex action

New UI component:
- [`src/components/video/private-mux-player.tsx`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/components/video/private-mux-player.tsx)

Props:
- `lessonId: string`
- `playbackId: string`
- `posterUrl?: string | null`
- `thumbnailTime?: number | null`

Client behavior:
- On mount, call `api.videoPlayback.getSignedPlaybackToken`
- Render loading, forbidden, and error states clearly
- Pass `playbackId` and `tokens` into the Mux player component
- Optionally re-request token if playback is retried after expiry

### 7. Replace plain `<video>` playback with Mux Player
Install:
- `@mux/mux-player-react`

Update [`src/app/(platform)/app/courses/[courseId]/[lessonSlug]/page.tsx`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/app/(platform)/app/courses/%5BcourseId%5D/%5BlessonSlug%5D/page.tsx):
- Remove the plain `<video src="...m3u8">` path for Mux lessons
- Keep fallback UI when no lesson video exists
- Render the new `PrivateMuxPlayer` when `data.lesson.muxPlaybackId` is present

Player decisions:
- Use Mux Player React for all Mux-backed lesson playback
- Keep `poster` derived from the course cover image initially
- Do not implement autoplay or advanced analytics customization in this rollout
- Do not yet add signed thumbnail tokens unless required by the specific poster strategy

### 8. Keep admin upload UX simple but make states clearer
Update [`src/app/(platform)/app/admin/components/lesson-editor-form.tsx`](/C:/Users/ADDIS%20ELLIS/source/repos/next/kcm/src/app/(platform)/app/admin/components/lesson-editor-form.tsx) only as needed for clarity.

Planned improvements:
- Keep current file input flow
- Update helper text to explicitly say uploads are private and lesson access is controlled by enrollment
- Keep `Refresh Mux` for now
- Show more actionable statuses:
  - `idle`
  - `uploading`
  - `processing`
  - `ready`
  - `errored`

Out of scope for this rollout:
- drag-and-drop uploader
- progress bar from Mux uploader events
- transcript generation UX
- automatic thumbnail selection UX

### 9. Preserve and document transition behavior for existing lessons
Because some lessons may already have public playback IDs:
- Existing public assets should keep working until re-uploaded or migrated
- The player component should gracefully handle:
  - signed playback IDs with token flow
  - no playback ID
- Do not attempt a mass Mux asset migration in this rollout

Optional follow-up noted in plan:
- Add an admin-side “recreate as signed asset” workflow later if needed for legacy public assets

## Public APIs / Interfaces / Types

### Convex additions
Add:
- `videoPlayback.getSignedPlaybackToken(action)`
- `requireCoursePlaybackAccess(ctx, courseId)` helper
- `courses.getCourseBySlugForViewer(query)`
- `courses.getLessonBySlugForViewer(query)`

### Convex behavior changes
Change:
- `adminMux.createMuxDirectUpload` to create signed playback assets

### Frontend additions
Add:
- `@mux/mux-player-react`
- `PrivateMuxPlayer` client component

### Frontend call-site changes
Change learner lesson page to:
- use the new viewer-aware lesson query
- render Mux Player instead of plain `<video>` for Mux-backed lessons

### Environment interface additions
Add required env vars:
- `MUX_SIGNING_KEY_ID`
- `MUX_SIGNING_PRIVATE_KEY`

## Data Flow

### Maintainer upload flow
1. Maintainer opens lesson editor
2. Maintainer uploads video file
3. `adminMux.createMuxDirectUpload` creates a Mux direct upload with signed playback policy
4. Browser uploads file directly to Mux
5. Mux processes the asset
6. Webhook updates lesson with `muxAssetId`, `muxPlaybackId`, `muxStatus`, `durationSeconds`
7. Lesson is now ready for private playback

### Learner playback flow
1. Learner opens `/app/courses/[courseSlug]/[lessonSlug]`
2. Server page fetches viewer-aware lesson data
3. Query validates course publication and learner entitlement for private/unlisted content
4. Page renders `PrivateMuxPlayer`
5. `PrivateMuxPlayer` calls `videoPlayback.getSignedPlaybackToken`
6. Convex action verifies entitlement again, signs a short-lived playback token, and returns it
7. Mux Player requests playback with `playbackId + token`
8. Learner watches video

## Security / Auth Rules
- Never expose Mux signing private key to the client
- Never mint playback tokens without checking entitlement first
- Never trust client-provided course or enrollment claims
- Maintain admin/maintainer bypass
- Use `courseAccess` as the current entitlement source
- Keep token TTL short, defaulting to 10 minutes
- Signed playback only for initial rollout; domain/referrer restrictions deferred

## Edge Cases / Failure Modes
- Lesson has no `muxPlaybackId`
  - Show “video not ready yet” UI
- Lesson `muxStatus === "processing"`
  - Show processing message and no player
- Lesson/course is unpublished
  - Return `null`/404 from lesson query
- User is not authenticated and course is private
  - Return auth failure path from query/page
- User is authenticated but not entitled
  - Return forbidden path
- Token minting env vars missing
  - Action throws explicit configuration error
- Mux webhook delayed
  - Admin sees processing state; learner does not get player until playback ID exists
- Legacy public asset exists
  - Continue to tolerate it temporarily, but do not create new public assets

## Testing And Verification

### Unit / logic scenarios
- `requireCoursePlaybackAccess` allows:
  - admin
  - course maintainer
  - `courseAccess.owner`
  - `courseAccess.staff`
  - `courseAccess.student`
- `requireCoursePlaybackAccess` denies:
  - unauthenticated user
  - authenticated unrelated user
- token action fails without lesson, without playback ID, or without env vars
- token action returns token only for entitled users

### Integration scenarios
- Maintainer uploads a new lesson video and Mux webhook marks it `ready`
- Entitled learner can open a private published lesson and receive a playback token
- Non-entitled learner receives forbidden behavior for private lesson
- Public published course behavior remains unchanged in catalog
- Progress tracking still works on lesson pages after player swap

### Manual acceptance scenarios
- Maintainer uploads lesson video in admin UI
- `muxStatus` moves from `uploading` -> `processing` -> `ready`
- Entitled learner can watch the lesson in browser
- Unauthenticated visitor cannot watch a private paid lesson
- Authenticated but unenrolled learner cannot watch a private paid lesson
- Existing public browse/catalog pages still work
- Admin/maintainer can still preview lessons they manage

## Rollout Notes
- First deploy server-side auth/query changes and token issuance
- Then deploy player integration
- Then configure Mux signing env vars in each environment
- Then create/update Mux signing key and webhook in the Mux dashboard
- Re-upload one test lesson to confirm signed playback end-to-end before broad maintainer usage

## Assumptions And Defaults
- `courseAccess` is the current source of truth for paid entitlement
- A future payment gateway will later grant/revoke rows in `courseAccess` or replace this logic
- Signed playback only is sufficient for v1; playback restrictions are deferred
- Convex action is the preferred place for token minting because the course/lesson auth model already lives in Convex
- Existing public Mux assets are tolerated during transition but not part of the long-term target state
