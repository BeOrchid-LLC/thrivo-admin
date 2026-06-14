import { successEnvelope } from "@/lib/contracts";
import {
  ENDPOINTS,
  type EndpointConfig,
  type EndpointKey,
  type EndpointPayload,
  type EndpointResponse,
} from "./endpoints";
import { apiErrorFromResponse, parseError } from "./errors";

type QueryValue = string | number | boolean | null | undefined;

export interface CallOptionsBase {
  /** Values substituted into `:name` path segments. */
  params?: Record<string, string | number>;
  /** Appended as a querystring; null/undefined dropped. */
  query?: Record<string, QueryValue>;
  signal?: AbortSignal;
}

/** `payload` is required iff the endpoint declares one. */
export type CallOptions<K extends EndpointKey> =
  EndpointPayload<K> extends undefined
    ? CallOptionsBase & { payload?: undefined }
    : CallOptionsBase & { payload: EndpointPayload<K> };

export function buildPath(
  template: string,
  params: Record<string, string | number> | undefined,
  query: Record<string, QueryValue> | undefined
): string {
  const path = template.replace(/:([A-Za-z0-9_]+)/g, (_m, name: string) => {
    const value = params?.[name];
    if (value === undefined) throw parseError(`Missing path param "${name}" for "${template}"`);
    return encodeURIComponent(String(value));
  });
  if (!query) return path;
  const qs = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return qs ? `${path}?${qs}` : path;
}

export function jsonHeaders(hasPayload: boolean): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (hasPayload) headers["Content-Type"] = "application/json";
  return headers;
}

export function getConfig(endpoint: EndpointKey): EndpointConfig {
  return ENDPOINTS[endpoint];
}

/** Read + validate a fetch Response against the endpoint's contract. */
export async function finalizeResponse<K extends EndpointKey>(
  endpoint: K,
  config: EndpointConfig,
  response: Response
): Promise<EndpointResponse<K>> {
  const text = await response.text();
  let body: unknown;
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      throw parseError("Response was not valid JSON");
    }
  }

  if (!response.ok) {
    throw apiErrorFromResponse(response.status, body);
  }

  const parsed = successEnvelope(config.response).safeParse(body);
  if (!parsed.success) {
    throw parseError(`Response for "${endpoint}" did not match its contract`, parsed.error.issues);
  }
  return parsed.data.data as EndpointResponse<K>;
}
