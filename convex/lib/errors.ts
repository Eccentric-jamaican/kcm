import { ConvexError } from "convex/values";

export type AppErrorCode =
  | "course_not_found"
  | "forbidden"
  | "lesson_not_found"
  | "lesson_not_published"
  | "lesson_video_not_ready"
  | "mux_asset_missing"
  | "mux_refresh_failed"
  | "mux_upload_failed"
  | "mux_unavailable"
  | "not_authenticated"
  | "playback_unavailable"
  | "transcript_not_ready"
  | "transcript_unavailable"
  | "user_profile_not_found";

export type AppErrorData = {
  code: AppErrorCode;
  message: string;
  retryable: boolean;
};

export function createAppError(
  code: AppErrorCode,
  message: string,
  options?: { retryable?: boolean },
) {
  return new ConvexError<AppErrorData>({
    code,
    message,
    retryable: options?.retryable ?? false,
  });
}

export function throwAppError(
  code: AppErrorCode,
  message: string,
  options?: { retryable?: boolean },
): never {
  throw createAppError(code, message, options);
}
