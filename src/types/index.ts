// --- Entities ---

export interface Teacher {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  teacher_id: string;
  name: string;
  contact: string | null;
  notes: string | null;
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
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  month: number; // 1-12
  year: number;
  amount: number;
  paid: boolean;
  paid_date: string | null;
  created_at: string;
}

// --- DTOs ---

export type CreateStudentDTO = Pick<Student, 'name'> &
  Partial<Pick<Student, 'contact' | 'notes'>>;

export type UpdateStudentDTO = Partial<
  Pick<Student, 'name' | 'contact' | 'notes' | 'active'>
>;

export type CreateLessonDTO = Pick<
  Lesson,
  'student_id' | 'day_of_week' | 'start_time' | 'end_time'
> &
  Partial<Pick<Lesson, 'recurring' | 'date'>>;

export type UpdateLessonDTO = Partial<
  Pick<Lesson, 'day_of_week' | 'start_time' | 'end_time' | 'recurring' | 'date'>
>;

export type CreatePaymentDTO = Pick<Payment, 'student_id' | 'month' | 'year' | 'amount'>;

export type UpdatePaymentDTO = Partial<Pick<Payment, 'paid' | 'paid_date' | 'amount'>>;
