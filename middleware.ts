import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks/register", 
  "/sign-in",
  "/sign-up",
])

export default clerkMiddleware(async(auth, req : NextRequest)=>{
  try {
    //handle unauthenticated requests
    const {sessionId, userId} : {sessionId : string | null | undefined, userId : string | null | undefined} = await auth();

    if(!userId && !isPublicRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    if(userId) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user.publicMetadata.role as string | undefined;
      const useremail = user.emailAddresses[0].emailAddress
      console.log(useremail)
      console.log("User role : ", role);

      //admin role redirection
      if(role === 'admin' && req.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }

      //prevent non admin users from accessing admin routes
      if(role !== "admin" && req.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      //redirect auth users trying to access public routes
      if(isPublicRoute(req)) {
        return NextResponse.redirect(new URL(role === 'admin' ? "/admin/dashboard" : "/dashboard", req.url))
      }
    }
  } catch (error) {
    console.error("Error in clerk middleware", error);
    return NextResponse.redirect(new URL('/error', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}