## Patched Plan: Autoplay + Progression + Mux Webhook Reliability (Aligned to Official `@mux/convex` Pattern)

### Summary
We will keep your original product decisions and patch the backend reliability plan to mirror how the official Mux Convex component works.

- Completion stays **manual-only**.
- Autoplay becomes **countdown (5s) + cancel** on lesson end.
- Autoplay preference becomes **server-synced per user**.
- Webhook pipeline follows official pattern:
- Verify with `mux.webhooks.unwrap(...)`.
- Persist event log first.
- Deduplicate by `muxEventId`.
- Upsert by indexed Mux object IDs.
- Then add your requested extension: **retry + dead-letter** for failed projection into your lesson domain.

---

## Public APIs / Interfaces / Types

### New Convex APIs
- `progress.getUserPlaybackPreferences` (query) -> `{ autoplayNextLesson: boolean }`
- `progress.setUserPlaybackPreferences` (mutation) args `{ autoplayNextLesson: boolean }`
- `progress.recordLessonPlaybackHeartbeat` (mutation) args `{ courseId, lessonId, playheadSeconds, durationSeconds }`
- `internal.muxWebhook.ingestMuxWebhook` (internalAction) args `{ rawBody, headers }`
- `internal.muxWebhook.projectMuxEventToLessons` (internalAction or internalMutation) args `{ eventDocId }`
- `internal.muxWebhook.retryFailedProjection` (internalAction) args `{ eventDocId }`

### Frontend changes
- `CourseLessonSidebar` reads/writes autoplay pref from Convex, with local optimistic state.
- `PrivateMuxPlayer` adds ended-countdown-next navigation and playback heartbeat calls.
- `LessonProgressToggle` remains the only completion writer.

---

## Data Model Changes

### New tables (official-style mirror + app projection state)
- `muxAssets`
- Fields: `muxAssetId`, `status`, `playbackIds`, `durationSeconds`, `uploadId`, `raw`, timestamps.
- Indexes: `by_mux_asset_id`, `by_status`, `by_updated_at`.

- `muxUploads`
- Fields: `muxUploadId`, `status`, `assetId`, `uploadUrl`, `raw`, timestamps.
- Indexes: `by_mux_upload_id`, `by_status`, `by_updated_at`.

- `muxEvents`
- Fields: `muxEventId?`, `type`, `objectType?`, `objectId?`, `receivedAtMs`, `verified`, `raw`, `projectionStatus`, `projectionAttempts`, `projectionLastError`, `nextRetryAtMs`, `projectedAtMs?`.
- Indexes: `by_mux_event_id`, `by_type`, `by_object`, `by_received_at`, `by_projection_status_and_next_retry`.

### New app table
- `userPlaybackPreferences`
- Fields: `userId`, `autoplayNextLesson`, `updatedAtMs`.
- Index: `by_userId`.

### Existing table usage
- Keep `courseLessons` as learner-facing source (`muxStatus`, `muxAssetId`, `muxPlaybackId`, `durationSeconds`).
- Projection updates `courseLessons` from mirrored `muxAssets`/`muxUploads`.

---

## Implementation Design

### 1. Autoplay/progression behavior
- Keep completion manual-only.
- On video ended:
- If autoplay off: do nothing.
- If autoplay on and next lesson exists: show 5s countdown with cancel.
- On countdown complete, navigate to next lesson.
- Save preference server-side immediately on toggle and hydrate on page load.

### 2. Playback heartbeat
- Send heartbeat every 10–15s while playing and once on pause/end.
- Update only `playheadSeconds` and `lastWatchedAt`.
- Never alter `completed`.

### 3. Webhook ingest (official pattern)
- `convex/http.ts` route receives POST `/mux/webhook`.
- Pass raw body + headers to `internal.muxWebhook.ingestMuxWebhook`.
- In ingest action:
- Verify signature via `mux.webhooks.unwrap(rawBody, normalizedHeaders)`.
- Write event row first (`muxEvents`).
- If duplicate `muxEventId`, stop (idempotent success).
- Branch by event type:
- `video.asset.*` -> upsert/delete in `muxAssets`.
- `video.upload.*` -> upsert/delete in `muxUploads`.
- Ignore unsupported types safely.

### 4. Projection into lesson domain (your app-specific layer)
- After successful mirror upsert, project event to `courseLessons`:
- Resolve lesson using `muxUploadId` and `muxAssetId` on `courseLessons` (add indexes for these lookups).
- Update lesson mux fields deterministically.
- Update linked `lessonResources` video URL when playback ID changes.
- Projection must be idempotent and safe for repeated execution.

### 5. Retry + dead-letter extension (not in official component, added for your requirement)
- If projection fails, mark event `projectionStatus = failed`, increment attempts, set `nextRetryAtMs` with backoff.
- Cron or scheduled runner retries due events.
- After max attempts, set `projectionStatus = dead_letter` and retain last error.
- Keep raw event preserved for replay/debug.

---

## Testing and Acceptance Criteria

### Progression/autoplay
- Manual completion toggle still works exactly as before.
- Video end with autoplay on shows countdown and cancel.
- Cancel prevents navigation.
- Preference persists across devices for same user.

### Webhook reliability
- Invalid signature returns unauthorized and does not mutate Mux mirror tables.
- Duplicate webhook with same `muxEventId` does not reprocess projection.
- `video.asset.ready` updates mirrored asset and projects to lesson readiness.
- Upload-to-asset linking works through indexed lookup.
- Failed projection retries and eventually dead-letters after max attempts.

### Regression checks
- Existing signed playback token flow continues working.
- Admin upload/refresh flow still updates lesson status.
- Course lesson pages still load and navigate correctly.

---

## Rollout

1. Add schema tables/indexes and generate Convex types.
2. Implement ingest route + mirror upsert pipeline.
3. Implement projection + retry/dead-letter flow.
4. Add autoplay preference query/mutation and sidebar wiring.
5. Add player ended countdown + heartbeat mutation calls.
6. Run staged validation with real Mux test events and duplicate replay tests.

---

## Assumptions and Defaults
- Completion remains manual-only by product choice.
- Autoplay preference is per-user global (not per-course).
- Official component pattern is used as architecture baseline.
- Retry/dead-letter is an app-specific extension on top of official pattern.
- No payment/access-control model changes are included in this patch.
