import "server-only";
import { auth } from "@clerk/nextjs/server";
import { env } from "@/lib/config/env";
import type { EndpointKey, EndpointResponse } from "./endpoints";
import { networkError } from "./errors";
import { buildPath, finalizeResponse, getConfig, jsonHeaders, type CallOptions } from "./request";

/**
 * Server-side (RSC) typed fetcher for initial, auth-gated page data. Obtains
 * the Clerk Admin session token via auth() and forwards it as a Bearer header.
 * Results are not cached (per-request). No component fetches directly — go
 * through here in server components only.
 */
export async function callServerApi<K extends EndpointKey>(
  endpoint: K,
  options: CallOptions<K> = {} as CallOptions<K>
): Promise<EndpointResponse<K>> {
  const config = getConfig(endpoint);
  const url = `${env.apiUrl}${env.apiPrefix}${buildPath(config.path, options.params, options.query)}`;

  const { getToken } = await auth();
  const token = await getToken();

  const headers: Record<string, string> = jsonHeaders(options.payload !== undefined);
  if (token) headers.Authorization = `Bearer ${token}`;

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
