import { env } from "@/lib/config/env";
import type { EndpointKey, EndpointResponse } from "./endpoints";
import { networkError } from "./errors";
import { buildPath, finalizeResponse, getConfig, jsonHeaders, type CallOptions } from "./request";

/**
 * Client-side typed fetcher used by interactive components (tables/filters,
 * mutations). The admin session is an httpOnly cookie, so we send credentials
 * rather than a Bearer token. Throws `ApiError` on failure (idiomatic for
 * TanStack Query). No component fetches directly — go through here.
 */
export async function callApi<K extends EndpointKey>(
  endpoint: K,
  options: CallOptions<K> = {} as CallOptions<K>
): Promise<EndpointResponse<K>> {
  const config = getConfig(endpoint);
  const url = `${env.apiUrl}${env.apiPrefix}${buildPath(config.path, options.params, options.query)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: config.method,
      headers: jsonHeaders(options.payload !== undefined),
      body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
      credentials: "include",
      signal: options.signal,
    });
  } catch (cause) {
    throw networkError(cause instanceof Error ? cause.message : "Network request failed");
  }

  return finalizeResponse(endpoint, config, response);
}
