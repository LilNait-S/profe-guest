# Feature: Payment Tracking

## Status: done

## User Stories
- US-04: Mark a student as paid for the month — done
- US-05: See at a glance who hasn't paid — done (pending section at top)
- US-09: View payment history for a student — done

## Implemented
- [x] Monthly payments page with pending/paid sections
- [x] Month navigation (previous/next month arrows)
- [x] "Mark paid" button on pending payments (sets `paid: true` and `paid_date` to today)
- [x] Payment history page per student (sorted by year/month descending)
- [x] API route: GET /api/payments (filter by month/year or studentId)
- [x] API route: POST /api/payments (create payment record)
- [x] API route: PATCH /api/payments/[id] (mark paid/unpaid, update amount)
- [x] Service module with TanStack Query hooks (`usePaymentsByMonth`, `usePaymentsByStudent`, `useCreatePayment`, `useUpdatePayment`)
- [x] TypeScript types and DTOs

## Files
- `src/app/(protected)/payments/page.tsx` — Monthly payment view with pending/paid sections
- `src/app/(protected)/payments/[studentId]/page.tsx` — Payment history for a student
- `src/app/api/payments/route.ts` — GET (list with filters) and POST (create)
- `src/app/api/payments/[id]/route.ts` — PATCH (mark paid/unpaid)
- `src/services/payments.ts` — Service module with TanStack Query hooks
- `src/types/index.ts` — `Payment`, `CreatePaymentDTO`, `UpdatePaymentDTO`
- `src/lib/query-keys.ts` — Query keys for payments

## Notes
- Payments are scoped to the teacher's students via a join query (fetches teacher's student IDs first, then filters payments).
- The "mark paid" action automatically sets `paid_date` to today's date on the server side.
- There is no UI to create payment records manually yet. The API and hook (`useCreatePayment`) exist but no form is wired up. Payment records presumably need to be seeded or created via another mechanism.
- Amount is displayed but there is no UI to set the student's monthly rate. This would tie into the student form or a separate settings flow.
