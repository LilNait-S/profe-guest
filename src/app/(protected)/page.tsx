'use client';

import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths, addWeeks, subWeeks, startOfMonth, endOfMonth, format } from 'date-fns';
import { useLessons, useLessonExceptions } from '@/services/lessons';
import { useAttendance } from '@/services/attendance';
import { useStudents } from '@/services/students';
import { usePaymentsByMonth } from '@/services/payments';
import { MonthCalendar } from '@/components/calendar/month-calendar';
import { WeekCalendar } from '@/components/calendar/week-calendar';
import { YearCalendar } from '@/components/calendar/year-calendar';
import { ViewSwitcher, type CalendarView } from '@/components/calendar/view-switcher';
import { DaySheet } from '@/components/calendar/day-sheet';
import { TodaySummary } from '@/components/calendar/today-summary';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
    setCurrentDate(new Date());
  }, []);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const currentYear = currentDate.getFullYear();

  // Date range for exception fetching (padded for adjacent days)
  const { from, to } = useMemo(() => {
    const paddedStart = subMonths(startOfMonth(currentDate), 1);
    const paddedEnd = addMonths(endOfMonth(currentDate), 1);
    return {
      from: format(paddedStart, 'yyyy-MM-dd'),
      to: format(paddedEnd, 'yyyy-MM-dd'),
    };
  }, [currentDate]);

  const { data: lessons = [], isLoading: loadingLessons } = useLessons();
  const { data: students = [], isLoading: loadingStudents } = useStudents();
  const { data: exceptions = [] } = useLessonExceptions(from, to);
  const { data: attendance = [] } = useAttendance(from, to);
  const { data: payments = [] } = usePaymentsByMonth(
    currentDate.getMonth() + 1,
    currentDate.getFullYear(),
  );

  // Navigation handlers
  const handlePrevMonth = useCallback(() => setCurrentDate((d) => subMonths(d, 1)), []);
  const handleNextMonth = useCallback(() => setCurrentDate((d) => addMonths(d, 1)), []);
  const handlePrevWeek = useCallback(() => setCurrentDate((d) => subWeeks(d, 1)), []);
  const handleNextWeek = useCallback(() => setCurrentDate((d) => addWeeks(d, 1)), []);
  const handlePrevYear = useCallback(() => setCurrentDate((d) => new Date(d.getFullYear() - 1, d.getMonth(), 1)), []);
  const handleNextYear = useCallback(() => setCurrentDate((d) => new Date(d.getFullYear() + 1, d.getMonth(), 1)), []);

  const handleDayClick = useCallback((date: Date) => setSelectedDay(date), []);
  const handleSheetClose = useCallback(() => setSelectedDay(null), []);

  const handleMonthClick = useCallback((month: Date) => {
    setCurrentDate(month);
    setView('month');
  }, []);

  if (loadingLessons || loadingStudents) {
    return (
      <div className="px-4 py-4">
        <Skeleton className="mb-3 h-9 w-full rounded-lg" />
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="size-10" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="size-10" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`h-${i}`} className="h-4" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-3">
        <ViewSwitcher view={view} onViewChange={handleViewChange} />
      </div>

      {view === 'week' && (
        <WeekCalendar
          lessons={lessons}
          exceptions={exceptions}
          attendance={attendance}
          students={students}
          payments={payments}
          currentDate={currentDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onDayClick={handleDayClick}
        />
      )}

      {view === 'month' && (
        <MonthCalendar
          lessons={lessons}
          exceptions={exceptions}
          students={students}
          currentMonth={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDayClick={handleDayClick}
        />
      )}

      {view === 'year' && (
        <YearCalendar
          currentYear={currentYear}
          lessons={lessons}
          exceptions={exceptions}
          onMonthClick={handleMonthClick}
          onPrevYear={handlePrevYear}
          onNextYear={handleNextYear}
        />
      )}

      {view === 'month' && (
        <TodaySummary
          lessons={lessons}
          exceptions={exceptions}
          students={students}
          onDayClick={handleDayClick}
        />
      )}

      {view !== 'year' && (
        <DaySheet
          date={selectedDay}
          lessons={lessons}
          exceptions={exceptions}
          attendance={attendance}
          students={students}
          payments={payments}
          formOnly={view === 'week'}
          onClose={handleSheetClose}
          onLessonCreated={handleSheetClose}
          onLessonDeleted={handleSheetClose}
        />
      )}
    </div>
  );
}
