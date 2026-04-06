'use client';

import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStudents } from '@/services/students';

export default function StudentsPage() {
  const { data: students, isLoading } = useStudents();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Alumnos</h1>
        <Link href="/students/new" className={buttonVariants()}>
          + Nuevo
        </Link>
      </div>

      {!students?.length ? (
        <p className="text-center text-gray-500">
          No hay alumnos registrados.
        </p>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <Link key={student.id} href={`/students/${student.id}`}>
              <Card className="hover:bg-gray-50">
                <CardContent>
                  <p className="font-medium">{student.name}</p>
                  {student.contact && (
                    <p className="text-sm text-gray-500">{student.contact}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
