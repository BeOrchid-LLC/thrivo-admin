import "server-only";
import { cookies } from "next/headers";
import { env } from "@/lib/config/env";
import type { EndpointKey, EndpointResponse } from "./endpoints";
import { networkError } from "./errors";
import { buildPath, finalizeResponse, getConfig, jsonHeaders, type CallOptions } from "./request";

/**
 * Server-side (RSC) typed fetcher for initial, auth-gated page data. Forwards
 * the httpOnly session cookie to the backend so no API token is ever exposed to
 * client JS (ADMIN_ARCHITECTURE §4–5). Results are not cached (per-request).
 */
export async function callServerApi<K extends EndpointKey>(
  endpoint: K,
  options: CallOptions<K> = {} as CallOptions<K>
): Promise<EndpointResponse<K>> {
  const config = getConfig(endpoint);
  const url = `${env.apiUrl}${env.apiPrefix}${buildPath(config.path, options.params, options.query)}`;

  const cookieHeader = (await cookies()).toString();
  const headers = jsonHeaders(options.payload !== undefined);
  if (cookieHeader) headers.Cookie = cookieHeader;

  let response: Response;
  try {
    response = await fetch(url, {
      method: config.method,
      headers,
      body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
      cache: "no-store",
      signal: options.signal,
    });
  } catch (cause) {
    throw networkError(cause instanceof Error ? cause.message : "Network request failed");
  }

  return finalizeResponse(endpoint, config, response);
}
