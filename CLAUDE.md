@AGENTS.md

# Project Conventions

## Naming

- **Files and folders**: kebab-case always (`student.service.ts`, `use-students.ts`, `query-client.ts`)
- **Code language**: All code in English — variable names, function names, types, comments, route paths, query keys. No exceptions.
- **User-facing text**: Spanish only. This means JSX strings, labels, placeholders, error messages shown to the user. Everything else is English.
- **Types**: PascalCase (`Student`, `Payment`, `CreateStudentDTO`)
- **Variables/functions**: camelCase (`studentService`, `useStudents`, `getAuthUser`)
- **Query keys**: English constants (`studentKeys.all`, `paymentKeys.byMonth`)

## Architecture

- **No RSC**: All pages are `"use client"`. No Server Components, no Server Actions.
- **Service Module Pattern**: Each entity gets a folder in `services/` with: `keys.ts`, `<entity>.service.ts`, `use-<entity>.ts`, `index.ts`
- **Data flow**: Component → Hook (TanStack Query) → Service (Axios) → API Route → Supabase
- **Proxy, not middleware**: Next.js 16 uses `proxy.ts`, not `middleware.ts`
- **Env validation**: All env vars accessed through `src/lib/env.ts` (Zod validated), never `process.env` directly
- **DB management**: Via Supabase MCP, no local ORM

## Route Groups

- `(public)` — unauthenticated routes (login, landing)
- `(protected)` — authenticated routes (dashboard, CRUD)
