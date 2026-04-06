'use client';

import { useState, useCallback } from 'react';
import { addMonths, subMonths } from 'date-fns';
import { useLessons } from '@/services/lessons';
import { useStudents } from '@/services/students';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { DaySheet } from '@/components/calendar/day-sheet';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: lessons = [], isLoading: loadingLessons } = useLessons();
  const { data: students = [], isLoading: loadingStudents } = useStudents();

  const handlePrevMonth = useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    [],
  );
  const handleNextMonth = useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    [],
  );
  const handleDayClick = useCallback((date: Date) => setSelectedDay(date), []);
  const handleSheetClose = useCallback(() => setSelectedDay(null), []);

  if (loadingLessons || loadingStudents) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <MonthCalendar
        lessons={lessons}
        students={students}
        currentMonth={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onDayClick={handleDayClick}
      />

      <DaySheet
        date={selectedDay}
        lessons={lessons}
        students={students}
        onClose={handleSheetClose}
        onLessonCreated={handleSheetClose}
        onLessonDeleted={handleSheetClose}
      />
    </div>
  );
}
