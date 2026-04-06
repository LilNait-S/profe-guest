# Feature: Authentication

## Status: done

## User Stories
- US-10: Sign up and log in with email and password — done

## Implemented
- [x] Login page with email/password form
- [x] Signup page with name + email/password form
- [x] Logout button in protected layout header
- [x] Route protection via `proxy.ts` (redirects unauthenticated users to `/login`)
- [x] OAuth callback route (exchanges code for session)
- [x] Zod validation schemas for login and signup forms
- [x] Supabase Auth integration (`signInWithPassword`, `signUp`, `signOut`)
- [x] Axios interceptor attaches Bearer token to all API requests
- [x] Server-side auth helper (`getAuthUser`, `getSupabaseForUser`) for API routes

## Files
- `src/app/(public)/login/page.tsx` — Login page with email/password form
- `src/app/(public)/signup/page.tsx` — Signup page with name + email/password form
- `src/app/(protected)/layout.tsx` — Protected layout with logout button
- `src/app/api/auth/callback/route.ts` — OAuth callback handler
- `src/proxy.ts` — Route protection (public: `/login`, `/signup`; everything else requires session)
- `src/lib/auth.ts` — Server-side auth utilities (`getAuthUser`, `getSupabaseForUser`, `unauthorized`)
- `src/lib/schemas/auth.ts` — Zod schemas for `loginSchema` and `signupSchema`
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/lib/api-client.ts` — Axios instance with auth token interceptor

## Notes
- Auth uses Supabase email/password (not Google OAuth). The architecture doc and PRD have been updated to reflect this.
- The proxy pattern replaces the traditional Next.js middleware approach (Next.js 16 change).
- The OAuth callback route still exists for potential future use but is not actively used in the login/signup flow.
