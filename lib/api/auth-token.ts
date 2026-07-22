/**
 * Module-level Clerk token getter. The client-side API layer is not a React
 * hook, so it can't call useAuth() directly. SessionProvider registers the
 * getter once on mount; callApi reads it on every request.
 */
type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter = async () => null;

export function setApiTokenGetter(fn: TokenGetter): void {
  tokenGetter = fn;
}

export async function getApiToken(): Promise<string | null> {
  return tokenGetter();
}
