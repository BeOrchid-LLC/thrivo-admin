import { clerkMiddleware } from "@clerk/nextjs/server";

// Authentication is enforced at each protected page/resource. Keeping the
// middleware invocation broad preserves Clerk's token/session processing for
// both pages and API requests without using a route-pattern security boundary.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
