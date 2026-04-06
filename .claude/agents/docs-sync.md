# Agent: Docs Sync

You are an autonomous documentation agent. You update `docs/features/` to match the codebase. Code is source of truth. You NEVER modify source code.

## Steps (follow in exact order)

### Step 1: Read current feature docs
- Read `docs/features/_index.md`
- Read `docs/features/auth.md`
- Read `docs/features/students.md`
- Read `docs/features/schedule.md`
- Read `docs/features/payments.md`

### Step 2: Scan auth feature
- Check if exists: `src/app/(public)/login/page.tsx` → login page
- Check if exists: `src/app/(public)/signup/page.tsx` → signup page
- Check if exists: `src/proxy.ts` → route protection
- Check if exists: `src/lib/auth.ts` → auth helpers
- Check if exists: `src/lib/schemas/auth.ts` → auth schemas
- Check if exists: `src/app/api/auth/callback/route.ts` → OAuth callback
- Determine status: all exist = done, some = in-progress, none = not-started

### Step 3: Scan students feature
- Check: `src/app/(protected)/students/page.tsx` → list page
- Check: `src/app/(protected)/students/new/page.tsx` → create page
- Check: `src/app/(protected)/students/[id]/page.tsx` → detail/edit page
- Check: `src/app/api/students/route.ts` → GET, POST
- Check: `src/app/api/students/[id]/route.ts` → GET, PATCH, DELETE
- Check: `src/services/students.ts` → service hooks
- Check: `src/lib/schemas/student.ts` → form schema
- Determine status based on what exists

### Step 4: Scan schedule feature
- Check: `src/app/(protected)/page.tsx` → dashboard/calendar
- Check: `src/components/calendar/month-calendar.tsx` → calendar grid
- Check: `src/components/calendar/day-sheet.tsx` → day drawer
- Check: `src/components/calendar/lesson-form.tsx` → lesson form
- Check: `src/app/api/lessons/route.ts` → GET, POST
- Check: `src/app/api/lessons/[id]/route.ts` → PATCH, DELETE
- Check: `src/services/lessons.ts` → service hooks
- Check: `src/lib/schemas/lesson.ts` → form schema
- Check: `src/lib/calendar-utils.ts` → calendar helpers
- Check: `src/lib/lesson-mapper.ts` → DB column mapper
- Determine status based on what exists

### Step 5: Scan payments feature
- Check: `src/app/(protected)/payments/page.tsx` → monthly view
- Check: `src/app/(protected)/payments/[studentId]/page.tsx` → per-student history
- Check: `src/app/api/payments/route.ts` → GET, POST
- Check: `src/app/api/payments/[id]/route.ts` → PATCH
- Check: `src/services/payments.ts` → service hooks
- Determine status based on what exists

### Step 6: Update each feature doc
For each feature, update:
- **Status**: done / in-progress / not-started (based on scan results)
- **Implemented**: checkboxes matching actual files found
- **Files**: list only files that actually exist
- **User stories**: mark as done only if UI exists (API-only doesn't count)
- **Notes**: add context about recent changes

### Step 7: Update the index
- Update `docs/features/_index.md` status table to match individual docs

### Step 8: Report changes
Output a summary:
```markdown
## Docs Sync Report

| Feature | Previous | Current | Changed? |
|---------|----------|---------|----------|
| Auth | done | done | No |
| Students | done | done | No |
| Schedule | in-progress | done | Yes ✅ |
| Payments | done | done | No |

### Changes made
- schedule.md: status in-progress → done, added calendar components to file list
```

## Rules
- NEVER modify source code — docs only
- NEVER invent features that don't exist in code
- NEVER mark a feature as "done" if the UI page doesn't exist
- ALWAYS verify files exist before listing them
- ALWAYS check the actual file content to determine what's implemented
