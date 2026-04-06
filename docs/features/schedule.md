# Feature: Monthly Calendar / Schedule

## Status: done

## User Stories
- US-02: View monthly calendar with all lessons — done
- US-03: Move a lesson to another day/time — in-progress (API ready, edit UI pending)
- US-06: Mobile-friendly usage — done

## Implemented
- [x] Monthly calendar grid (Mon-Sun, full month view)
- [x] Month navigation (previous/next month arrows)
- [x] Today highlighting (primary circle on current date)
- [x] Lesson dots on calendar days (mobile: dots, desktop: compact text)
- [x] Click on day → bottom sheet (drawer) with day details
- [x] Lesson list in day sheet with student name, time, recurring/one-off badge
- [x] Create lesson form (select student, start/end time, recurring toggle)
- [x] Delete lesson with confirmation
- [x] Support for recurring lessons (weekly on day_of_week)
- [x] Support for one-off lessons (specific date)
- [x] API routes: GET, POST /api/lessons with column mapping fix
- [x] API routes: PATCH, DELETE /api/lessons/[id] with column mapping fix
- [x] Service hooks (useLessons, useCreateLesson, useUpdateLesson, useDeleteLesson)
- [x] Zod schema for lesson form validation
- [x] DB migration: added `fecha` column for one-off lessons
- [ ] Edit lesson UI (update day/time via form)
- [ ] Drag-and-drop to move lessons between days

## Files
- `src/app/(protected)/page.tsx` — Dashboard with monthly calendar
- `src/components/calendar/month-calendar.tsx` — Calendar grid component
- `src/components/calendar/day-sheet.tsx` — Day detail bottom drawer
- `src/components/calendar/lesson-form.tsx` — Create lesson form
- `src/lib/calendar-utils.ts` — Calendar grid generation + lesson-day matching
- `src/lib/lesson-mapper.ts` — Spanish DB ↔ English TS column mapping
- `src/lib/schemas/lesson.ts` — Zod validation for lesson form
- `src/app/api/lessons/route.ts` — GET (list) and POST (create)
- `src/app/api/lessons/[id]/route.ts` — PATCH and DELETE
- `src/services/lessons.ts` — Service module with TanStack Query hooks
- `src/types/index.ts` — Lesson, CreateLessonDTO, UpdateLessonDTO

## Notes
- The calendar shows recurring lessons on every matching weekday and one-off lessons on their specific date.
- The data model uses `day_of_week` (0=Mon, 6=Sun) for recurring and `date` (YYYY-MM-DD, nullable) for one-off lessons.
- The lesson mapper (`lesson-mapper.ts`) fixes a previous column name mismatch between Supabase (Spanish) and TypeScript (English).
- Edit/reschedule UI is the main remaining piece — the PATCH API endpoint is ready.
