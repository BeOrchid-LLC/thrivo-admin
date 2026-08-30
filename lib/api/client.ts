import { env } from "@/lib/config/env";
import { getApiToken } from "@/lib/api/auth-token";
import type { EndpointKey, EndpointResponse } from "./endpoints";
import { apiErrorFromResponse, networkError } from "./errors";
import { buildPath, finalizeResponse, getConfig, jsonHeaders, type CallOptions } from "./request";

/**
 * Client-side typed fetcher used by interactive components (tables/filters,
 * mutations). Attaches the Clerk Admin session token as a Bearer header on
 * every request. No component fetches directly — go through here.
 */
export async function callApi<K extends EndpointKey>(
  endpoint: K,
  options: CallOptions<K> = {} as CallOptions<K>
): Promise<EndpointResponse<K>> {
  const config = getConfig(endpoint);
  const url = `${env.apiUrl}${env.apiPrefix}${buildPath(config.path, options.params, options.query)}`;

  const headers: Record<string, string> = jsonHeaders(
    options.payload !== undefined,
    options.idempotencyKey
  );
  const token = await getApiToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: config.method,
      headers,
      body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
      signal: options.signal,
    });
  } catch (cause) {
    throw networkError(cause instanceof Error ? cause.message : "Network request failed");
  }

  return finalizeResponse(endpoint, config, response);
}

/** Download a non-JSON endpoint while preserving the same Clerk auth path. */
export async function downloadApi<K extends EndpointKey>(
  endpoint: K,
  options: CallOptions<K> = {} as CallOptions<K>
): Promise<Blob> {
  const config = getConfig(endpoint);
  const url = `${env.apiUrl}${env.apiPrefix}${buildPath(config.path, options.params, options.query)}`;
  const token = await getApiToken();
  const headers: Record<string, string> = { Accept: "text/csv" };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await fetch(url, { method: config.method, headers, signal: options.signal });
    if (!response.ok)
      throw apiErrorFromResponse(response.status, await response.json().catch(() => undefined));
    return response.blob();
  } catch (cause) {
    if (cause instanceof Error && "code" in cause) throw cause;
    throw networkError(cause instanceof Error ? cause.message : "Network request failed");
  }
}
