export const LESSON_SEEK_EVENT = "kcm:lesson-seek"

export type LessonSeekEventDetail = {
  lessonId: string
  seconds: number
}
