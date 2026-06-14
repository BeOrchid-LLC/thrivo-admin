// Client-safe barrel. `callServerApi` is intentionally NOT re-exported here —
// import it directly from "@/lib/api/server" in Server Components only.
export { callApi } from "./client";
export type { CallOptions } from "./request";
export {
  ENDPOINTS,
  type EndpointConfig,
  type EndpointKey,
  type EndpointPayload,
  type EndpointResponse,
  type HttpMethod,
} from "./endpoints";
export {
  ApiError,
  isApiError,
  apiErrorFromResponse,
  networkError,
  parseError,
  type ApiErrorCode,
} from "./errors";
export { queryKeys, type ListParams } from "./query-keys";
