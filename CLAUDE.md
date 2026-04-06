@AGENTS.md

# Project Conventions

## Naming

- **Files and folders**: kebab-case always (`student.service.ts`, `use-students.ts`, `query-client.ts`)
- **Code language**: All code in English — variable names, function names, types, comments, route paths, query keys. No exceptions.
- **User-facing text**: Spanish only. This means JSX strings, labels, placeholders, error messages shown to the user. Everything else is English.
- **Types**: PascalCase (`Student`, `Payment`, `CreateStudentDTO`)
- **Variables/functions**: camelCase (`studentService`, `useStudents`, `getAuthUser`)
- **Query keys**: English constants in `src/lib/query-keys.ts`

## Architecture

- **No RSC**: All pages are `"use client"`. No Server Components, no Server Actions.
- **Service pattern**: One file per entity in `services/`. Uses `genericAuthRequest` + `useAppQuery`/`useAppMutation` from `src/lib/`.
- **Data flow**: Component → Hook (useAppQuery) → genericAuthRequest (Axios) → API Route → Supabase
- **Proxy, not middleware**: Next.js 16 uses `proxy.ts`, not `middleware.ts`
- **Env validation**: All env vars accessed through `src/lib/env.ts` (Zod validated), never `process.env` directly
- **DB management**: Via Supabase MCP, no local ORM

## Forms

- **react-hook-form** + **zod** for all forms
- Zod schemas go in `src/lib/schemas/<entity>.ts`
- Use `@hookform/resolvers/zod` for validation
- Use shadcn/ui components (`Input`, `Label`, `Textarea`, `Button`) inside forms
- Pattern:
  ```tsx
  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
  });
  ```

## Route Groups

- `(public)` — unauthenticated routes (login, landing)
- `(protected)` — authenticated routes (dashboard, CRUD)
