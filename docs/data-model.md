# Data Model: ProfeGest MVP

> Tables, RLS, and migrations are managed via **Supabase MCP** (no local ORM).

## Entity Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   teacher     │       │   student    │       │   payment    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (uuid)    │──┐    │ id (uuid)    │──┐    │ id (uuid)    │
│ email        │  │    │ teacher_id   │  │    │ student_id   │
│ name         │  │    │ name         │  │    │ month        │
│ avatar_url   │  │    │ phone        │  │    │ year         │
│ created_at   │  └───>│ email        │  └───>│ amount       │
└──────────────┘       │ notes        │       │ paid         │
                       │ active       │       │ paid_date    │
                       │ created_at   │       │ created_at   │
                       └──────┬───────┘       └──────────────┘
                              │
                       ┌──────┴───────┐       ┌────────────────┐
                       │    lesson    │       │lesson_exception│
                       ├──────────────┤       ├────────────────┤
                       │ id (uuid)    │──────>│ id (uuid)      │
                       │ student_id   │       │ lesson_id (FK) │
                       │ day_of_week  │       │ exception_date │
                       │ start_time   │       │ type           │
                       │ end_time     │       │ reason         │
                       │ recurring    │       │ created_at     │
                       │ date         │       └────────────────┘
                       │ start_date   │
                       │ end_date     │
                       │ schedule_group_id │
                       │ created_at   │
                       └──────────────┘
```

## Tables

### `teacher`
The app user. Mapped 1:1 with Supabase Auth.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, from `auth.users.id` |
| email | text | NOT NULL, unique |
| name | text | NOT NULL |
| avatar_url | text | Nullable |
| created_at | timestamptz | Default now() |

### `student`
Each student belonging to a teacher.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| teacher_id | uuid | FK -> teacher.id, NOT NULL |
| name | text | NOT NULL |
| phone | text | Nullable. Phone number |
| email | text | Nullable. Email address |
| notes | text | Free-form additional info |
| active | boolean | Default true. False = soft-deleted |
| created_at | timestamptz | Default now() |

### `lesson`
Recurring or one-off class schedule. A student can have multiple lessons per week.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| student_id | uuid | FK -> student.id, NOT NULL |
| day_of_week | smallint | 0=Monday, 6=Sunday |
| start_time | time | e.g. '14:00' |
| end_time | time | e.g. '15:00' |
| recurring | boolean | Default true |
| date | date | Nullable. Specific date for one-off lessons |
| start_date | date | Nullable. When recurrence begins |
| end_date | date | Nullable. When recurrence ends. NULL = permanent |
| schedule_group_id | uuid | Nullable. Links multi-day lessons (Mon+Wed share same group) |
| created_at | timestamptz | Default now() |

**Multi-day schedules:** "Mon and Wed 14:00-15:00" = 2 rows with same `schedule_group_id`.

### `lesson_exception`
Cancellations or modifications to individual occurrences of recurring lessons.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| lesson_id | uuid | FK -> lesson.id ON DELETE CASCADE |
| exception_date | date | NOT NULL. The specific date cancelled |
| type | text | Default 'cancelled'. Only 'cancelled' in MVP |
| reason | text | Nullable. Optional note |
| created_at | timestamptz | Default now() |

**Constraint:** UNIQUE(lesson_id, exception_date) — one exception per lesson per date.

### `payment`
Monthly payment record per student.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| student_id | uuid | FK -> student.id, NOT NULL |
| month | smallint | 1-12 |
| year | smallint | e.g. 2026 |
| amount | numeric(10,2) | Expected amount |
| paid | boolean | Default false |
| paid_date | date | Nullable, set when marking as paid |
| created_at | timestamptz | Default now() |

**Constraint:** UNIQUE(student_id, month, year) — one payment record per student per month.

## Row Level Security (RLS)

All tables use RLS so each teacher only sees their own data:

```sql
CREATE POLICY "teacher_owns_record" ON teacher FOR ALL
  USING (id = auth.uid());

CREATE POLICY "teacher_owns_students" ON student FOR ALL
  USING (teacher_id = auth.uid());

CREATE POLICY "teacher_owns_lessons" ON lesson FOR ALL
  USING (student_id IN (
    SELECT id FROM student WHERE teacher_id = auth.uid()
  ));

CREATE POLICY "teacher_owns_lesson_exceptions" ON lesson_exception FOR ALL
  USING (lesson_id IN (
    SELECT l.id FROM lesson l
    JOIN student s ON l.student_id = s.id
    WHERE s.teacher_id = auth.uid()
  ));

CREATE POLICY "teacher_owns_payments" ON payment FOR ALL
  USING (student_id IN (
    SELECT id FROM student WHERE teacher_id = auth.uid()
  ));
```

## Indexes

```sql
CREATE INDEX idx_student_teacher ON student(teacher_id) WHERE active = true;
CREATE INDEX idx_lesson_student ON lesson(student_id);
CREATE INDEX idx_lesson_day ON lesson(day_of_week);
CREATE INDEX idx_lesson_schedule_group ON lesson(schedule_group_id) WHERE schedule_group_id IS NOT NULL;
CREATE INDEX idx_lesson_exception_lesson_date ON lesson_exception(lesson_id, exception_date);
CREATE INDEX idx_payment_student_period ON payment(student_id, year, month);
CREATE INDEX idx_payment_pending ON payment(student_id) WHERE paid = false;
```
