export function getClerkErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  const candidate = error as { longMessage?: unknown; message?: unknown };
  if (typeof candidate.longMessage === "string" && candidate.longMessage) {
    return candidate.longMessage;
  }

  return typeof candidate.message === "string" && candidate.message ? candidate.message : null;
}

export function getClerkErrorsMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;

  const candidate = errors as {
    global?: { longMessage?: string; message?: string } | null;
    fields?: Record<string, { longMessage?: string; message?: string } | null>;
  };

  return (
    getClerkErrorMessage(candidate.global) ||
    Object.values(candidate.fields ?? {})
      .map(getClerkErrorMessage)
      .find(Boolean) ||
    null
  );
}

export function getErrorMessage(error: unknown, errors?: unknown): string {
  return (
    getClerkErrorMessage(error) ||
    getClerkErrorsMessage(errors) ||
    "We could not complete that request. Please check your details and try again."
  );
}
