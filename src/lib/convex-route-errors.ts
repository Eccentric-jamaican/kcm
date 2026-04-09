export function isNotAuthenticatedError(error: unknown) {
  return error instanceof Error && error.message.includes("Not authenticated")
}

export function isForbiddenError(error: unknown) {
  return error instanceof Error && error.message.includes("Forbidden")
}
