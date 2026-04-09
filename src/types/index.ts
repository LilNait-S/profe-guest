// --- Entities ---

export interface PaymentMethod {
  name: string;
  surcharge: number;
}

export interface Subject {
  name: string;
  color: string;
}

export interface Teacher {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  payment_methods: PaymentMethod[];
  subjects: Subject[];
  created_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  monthly_rate: number;
  active: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  student_id: string;
  day_of_week: number; // 0=monday, 6=sunday
  start_time: string; // "HH:mm"
  end_time: string;
  recurring: boolean;
  date: string | null; // "YYYY-MM-DD" for one-off, null for recurring
  start_date: string | null; // "YYYY-MM-DD" when recurrence begins
  end_date: string | null; // "YYYY-MM-DD" when recurrence ends, null = permanent
  schedule_group_id: string | null; // links multi-day lessons (Mon+Wed share same group)
  subject: string | null;
  created_at: string;
}

export interface LessonException {
  id: string;
  lesson_id: string;
  exception_date: string; // "YYYY-MM-DD"
  type: 'cancelled';
  reason: string | null;
  created_at: string;
}

export type AttendanceStatus = 'attended' | 'absent';

export interface Attendance {
  id: string;
  lesson_id: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  created_at: string;
}

/** Lesson with exception and attendance info for a specific day */
export interface LessonForDay extends Lesson {
  exception: LessonException | null;
  cancelled: boolean;
  attendance: Attendance | null;
}

export interface Payment {
  id: string;
  student_id: string;
  month: number; // 1-12
  year: number;
  amount: number;
  paid: boolean;
  paid_date: string | null;
  payment_method: string | null;
  created_at: string;
}

// --- DTOs ---

export type CreateStudentDTO = Pick<Student, 'name'> &
  Partial<Pick<Student, 'phone' | 'email' | 'notes' | 'monthly_rate'>>;

export type UpdateStudentDTO = Partial<
  Pick<Student, 'name' | 'phone' | 'email' | 'notes' | 'monthly_rate' | 'active'>
>;

export interface CreateScheduleDTO {
  student_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  recurring: boolean;
  start_date?: string | null;
  end_date?: string | null;
  date?: string | null;
  dates?: string[];
  subject?: string | null;
}

export type UpdateLessonDTO = Partial<
  Pick<Lesson, 'student_id' | 'day_of_week' | 'start_time' | 'end_time' | 'recurring' | 'date' | 'start_date' | 'end_date'>
>;

export interface CreateExceptionDTO {
  lesson_id: string;
  exception_date: string;
  type?: 'cancelled';
  reason?: string;
}

export interface UpsertAttendanceDTO {
  lesson_id: string;
  date: string;
  status: AttendanceStatus | null;
}

export type CreatePaymentDTO = Pick<Payment, 'student_id' | 'month' | 'year' | 'amount'> &
  Partial<Pick<Payment, 'payment_method'>>;

export type UpdatePaymentDTO = Partial<Pick<Payment, 'paid' | 'paid_date' | 'amount'>>;
