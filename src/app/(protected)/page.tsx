'use client';

import { useLessons } from '@/services/lessons';
import { useStudents } from '@/services/students';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DashboardPage() {
  const { data: lessons, isLoading: loadingLessons } = useLessons();
  const { data: students, isLoading: loadingStudents } = useStudents();

  if (loadingLessons || loadingStudents) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const studentMap = new Map(students?.map((s) => [s.id, s]));

  const lessonsByDay = DAYS.map((day, i) => ({
    day,
    lessons: (lessons ?? [])
      .filter((l) => l.day_of_week === i)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  }));

  return (
    <div className="px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">Mi semana</h1>

      <div className="space-y-4">
        {lessonsByDay.map(({ day, lessons }) => (
          <div key={day}>
            <h2 className="mb-2 text-sm font-semibold uppercase text-gray-500">
              {day}
            </h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-gray-400">Sin clases</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson) => {
                  const student = studentMap.get(lesson.student_id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{student?.name ?? 'Alumno'}</p>
                        <p className="text-sm text-gray-500">
                          {lesson.start_time} - {lesson.end_time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
