import { errorEnvelope } from "@/lib/contracts";

/** Canonical client-side error codes; feature code branches on `code` for UX. */
export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "NETWORK"
  | "TIMEOUT"
  | "PARSE_ERROR"
  | "UNKNOWN";

const statusToCode = (status: number): ApiErrorCode => {
  switch (true) {
    case status === 401:
      return "UNAUTHENTICATED";
    case status === 403:
      return "FORBIDDEN";
    case status === 404:
      return "NOT_FOUND";
    case status === 409:
      return "CONFLICT";
    case status === 422:
      return "VALIDATION";
    case status === 429:
      return "RATE_LIMITED";
    case status >= 500:
      return "SERVER_ERROR";
    default:
      return "UNKNOWN";
  }
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(args: { code: ApiErrorCode; message: string; status: number; details?: unknown }) {
    super(args.message);
    this.name = "ApiError";
    this.code = args.code;
    this.status = args.status;
    this.details = args.details;
  }

  get isAuthError(): boolean {
    return this.code === "UNAUTHENTICATED";
  }
}

const KNOWN_BACKEND_CODES = new Set<string>([
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION",
  "CONFLICT",
  "RATE_LIMITED",
  "SERVER_ERROR",
]);

export function apiErrorFromResponse(status: number, body: unknown): ApiError {
  const parsed = errorEnvelope.safeParse(body);
  if (parsed.success) {
    const { code, message, details } = parsed.data.error;
    const known = KNOWN_BACKEND_CODES.has(code) ? (code as ApiErrorCode) : statusToCode(status);
    return new ApiError({
      code: known,
      message,
      status,
      details: details ?? { backendCode: code },
    });
  }
  return new ApiError({
    code: statusToCode(status),
    message: `Request failed with status ${status}`,
    status,
  });
}

export const networkError = (message = "Network request failed"): ApiError =>
  new ApiError({ code: "NETWORK", message, status: 0 });

export const parseError = (message: string, details?: unknown): ApiError =>
  new ApiError({ code: "PARSE_ERROR", message, status: 0, details });

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;
