# Feature: Student Management

## Status: done

## User Stories
- US-01: Register a student with name, contact, and schedule — done (student data; schedule is via lessons feature)
- US-07: Edit student data — done
- US-08: Deactivate a student — done (soft delete via `activo: false`)

## Implemented
- [x] Student list page with link to each student
- [x] New student form (name, contact, notes) with Zod validation
- [x] Student detail/edit page with pre-populated form
- [x] Delete (deactivate) student with confirmation dialog
- [x] API route: GET /api/students (list active students for teacher)
- [x] API route: POST /api/students (create student)
- [x] API route: GET /api/students/[id] (single student)
- [x] API route: PATCH /api/students/[id] (update student)
- [x] API route: DELETE /api/students/[id] (soft delete, sets `activo: false`)
- [x] Service module with TanStack Query hooks (`useStudents`, `useStudent`, `useCreateStudent`, `useUpdateStudent`, `useDeleteStudent`)
- [x] Zod schemas for create/update validation
- [x] TypeScript types and DTOs

## Files
- `src/app/(protected)/students/page.tsx` — Student list page
- `src/app/(protected)/students/new/page.tsx` — New student form
- `src/app/(protected)/students/[id]/page.tsx` — Student detail/edit page
- `src/app/api/students/route.ts` — GET (list) and POST (create)
- `src/app/api/students/[id]/route.ts` — GET, PATCH, DELETE
- `src/services/students.ts` — Service module with TanStack Query hooks
- `src/lib/schemas/student.ts` — Zod schemas (`createStudentSchema`, `updateStudentSchema`)
- `src/types/index.ts` — `Student`, `CreateStudentDTO`, `UpdateStudentDTO`

## Notes
- Students are soft-deleted (set `activo: false`) rather than hard-deleted, so historical data (payments, lessons) is preserved.
- The student form currently captures name, contact, and notes. Schedule/lessons are managed separately via the lessons API.
- No search/filter functionality on the student list yet (mentioned in the UI wireframe as a search bar).
