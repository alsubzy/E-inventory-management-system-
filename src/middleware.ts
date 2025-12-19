import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/forgot-password(.*)",
  "/reset-password(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // If the user is signed in and trying to access a public auth route,
  // redirect them to the dashboard.
  if (userId && isPublicRoute(request)) {
    // Only redirect if it's one of the main auth pages, not a webhook
    const url = new URL(request.url);
    if (["/login", "/signup", "/forgot-password", "/reset-password"].some(path => url.pathname.startsWith(path))) {
      return Response.redirect(new URL("/dashboard", request.url));
    }
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

