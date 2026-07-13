import pkg from "../package.json";

/** Name of the backend-issued httpOnly admin session cookie. Must match ADMIN_COOKIE in thrivo-backend/src/admin/session.service.ts. */
export const SESSION_COOKIE = "admin_session";

/** Default number of rows per page across all admin tables. */
export const DEFAULT_PAGE_SIZE = 12;

/** "v1.0" — major.minor from package.json, shown in the Overview page header. */
export const APP_VERSION = `v${pkg.version.split(".").slice(0, 2).join(".")}`;
