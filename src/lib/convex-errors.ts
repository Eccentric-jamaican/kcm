import { ConvexError } from "convex/values"

export type ClientConvexErrorData = {
  code: string
  message: string
  retryable?: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isClientConvexErrorData(value: unknown): value is ClientConvexErrorData {
  if (!isRecord(value)) {
    return false
  }

  const retryable = value.retryable
  return (
    typeof value.code === "string" &&
    typeof value.message === "string" &&
    (retryable === undefined || typeof retryable === "boolean")
  )
}

export function getConvexErrorData(error: unknown): ClientConvexErrorData | null {
  if (error instanceof ConvexError && isClientConvexErrorData(error.data)) {
    return error.data
  }

  if (isRecord(error) && "data" in error && isClientConvexErrorData(error.data)) {
    return error.data
  }

  return null
}

export function isConvexErrorCode(error: unknown, code: string) {
  return getConvexErrorData(error)?.code === code
}

function looksLikeTechnicalConvexMessage(message: string) {
  return (
    message.includes("[CONVEX") ||
    message.includes("[Request ID:") ||
    message.includes("Server Error") ||
    message.includes("Uncaught Error:") ||
    message.includes("Called by client") ||
    message.includes("../convex/") ||
    message.startsWith("ConvexError ") ||
    message.includes("\n")
  )
}

export function getConvexErrorMessage(error: unknown, fallback: string) {
  const errorData = getConvexErrorData(error)
  if (errorData?.message.trim()) {
    return errorData.message
  }

  if (error instanceof Error) {
    const message = error.message.trim()
    if (message && !looksLikeTechnicalConvexMessage(message)) {
      return message
    }
  }

  return fallback
}

export function isNotAuthenticatedError(error: unknown) {
  return (
    isConvexErrorCode(error, "not_authenticated") ||
    (error instanceof Error && error.message.includes("Not authenticated"))
  )
}

export function isForbiddenError(error: unknown) {
  return (
    isConvexErrorCode(error, "forbidden") ||
    (error instanceof Error && error.message.includes("Forbidden"))
  )
}
