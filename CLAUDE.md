@AGENTS.md

# Project Conventions

## Naming

- **Files and folders**: kebab-case always (`students.ts`, `calendar-utils.ts`, `theme-toggle.tsx`)
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
- **DB columns**: English names matching TypeScript types. No mappers needed — API routes use column names directly.

## UI & Theming

- **shadcn/ui** components only — never raw HTML for interactive elements
- **CSS tokens only**: Use `text-primary`, `bg-background`, `text-muted-foreground`, `text-destructive`, etc. Never raw Tailwind colors (`text-gray-500`, `bg-blue-600`)
- **CSS color variables**: In `globals.css`, all color variables MUST use complete color functions: `hsl(...)` or `oklch(...)`. Never bare HSL components like `220 14% 96%` — always `hsl(220 14% 96%)`. Tailwind v4 `@theme inline` requires full color values.
- **Dark mode**: Implemented via `next-themes`. ThemeProvider in root layout. ThemeToggle in header + auth pages.
- **Mobile-first**: Design for 360-414px first, enhance with breakpoints
- **Touch targets**: Minimum 44x44px for interactive elements
- **Cursor pointer**: All clickable elements must have `cursor-pointer`. shadcn `<Button>` has it built-in, but raw `<button>`, `<div onClick>`, etc. need it explicitly
- **Date pickers**: Always use `<DatePicker>` from `@/components/ui/date-picker`. Never `<Input type="date">`. DatePicker works with `"YYYY-MM-DD"` strings.
- **Scrollable lists**: Any list that could grow beyond the viewport MUST use `<ScrollArea>` from `@/components/ui/scroll-area`. Never rely on native page scroll for lists inside layouts with fixed headers/footers.

## Forms

- **react-hook-form** + **zod** + **shadcn Field components** for all forms
- Zod schemas go in `src/lib/schemas/<entity>.ts`
- Use `@hookform/resolvers/zod` for validation
- Use shadcn/ui `Field`, `FieldLabel`, `FieldError` components from `@/components/ui/field` to wrap each form field
- Use `Controller` from react-hook-form to connect fields — pass `data-invalid`, `aria-invalid`, and error display via `FieldError`
- Error toasts via `sonner` for server errors, `FieldError` for field validation (never raw `<p className="text-destructive">`)
- Pattern:
  ```tsx
  import { Controller, useForm } from 'react-hook-form';
  import { zodResolver } from '@hookform/resolvers/zod';
  import { Field, FieldLabel, FieldError } from '@/components/ui/field';
  import { Input } from '@/components/ui/input';

  const form = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
  });

  // Each field wrapped in Field + Controller:
  <Controller
    name="name"
    control={form.control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
        <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
        <FieldError errors={[fieldState.error]} />
      </Field>
    )}
  />
  ```

## Route Groups

- `(public)` — unauthenticated routes (login, signup)
- `(protected)` — authenticated routes (dashboard, CRUD)

## Testing

- **Vitest** + **Testing Library** for tests
- Test files: `src/lib/<file>.test.ts` for utils, `src/lib/schemas/<file>.test.ts` for schemas
- Run: `pnpm test` (single run), `pnpm test:watch` (watch mode)
- Every new utility in `src/lib/` and schema in `src/lib/schemas/` must have tests
- Do NOT write tests for React components or pages (only pure logic)

## Verification

Every code change must pass:
```bash
pnpm build    # TypeScript compiles, routes resolve
pnpm test     # Vitest — utils, mappers, schemas
```
