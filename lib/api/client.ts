import { env } from "@/lib/config/env";
import { getApiToken } from "@/lib/api/auth-token";
import type { EndpointKey, EndpointResponse } from "./endpoints";
import { networkError } from "./errors";
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

  const headers: Record<string, string> = jsonHeaders(options.payload !== undefined);
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
