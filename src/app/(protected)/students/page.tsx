'use client';

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { MoreVertical, Pencil, UserX, Phone, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useStudents, useDeleteStudent } from '@/services/students';
import { AddStudentSheet } from '@/components/calendar/add-student-sheet';
import { EditStudentSheet } from '@/components/students/edit-student-sheet';
import type { Student } from '@/types';

function StudentActionMenu({
  student,
  onEdit,
}: {
  student: Student;
  onEdit: () => void;
}) {
  const deleteStudent = useDeleteStudent(student.id);

  const handleDelete = () => {
    if (!confirm(`¿Dar de baja a ${student.name}?`)) return;
    deleteStudent.mutate(undefined, {
      onSuccess: () => toast.success('Alumno dado de baja'),
      onError: () => toast.error('No se pudo dar de baja'),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Opciones"
          />
        }
      >
        <MoreVertical className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleDelete}>
          <UserX />
          Dar de baja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function StudentsPage() {
  const { data: students, isLoading } = useStudents();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!students) return [];
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q),
    );
  }, [students, search]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="animate-pulse text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Alumnos</h1>
        <AddStudentSheet
          trigger={<Button>+ Nuevo</Button>}
        />
      </div>

      {students && students.length > 0 && (
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9 text-sm"
          />
        </div>
      )}

      {!students?.length ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Users className="size-10" />
          <p className="text-sm">No hay alumnos registrados.</p>
          <AddStudentSheet
            trigger={
              <Button variant="outline" size="sm">
                Agregar tu primer alumno
              </Button>
            }
          />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No se encontraron alumnos
          </p>
        ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/50"
              role="button"
              tabIndex={0}
              onClick={() => setEditingStudent(student)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setEditingStudent(student);
              }}
            >
              {/* Avatar placeholder */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {student.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                <span className="text-sm font-medium text-foreground">
                  {student.name}
                </span>
                <div className="flex items-center gap-2">
                  {student.monthly_rate > 0 && (
                    <Badge variant="secondary" className="text-[11px] px-1.5 py-0">
                      S/{student.monthly_rate}/mes
                    </Badge>
                  )}
                  {student.phone && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3" />
                      {student.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions — stop propagation so menu doesn't trigger row click */}
              <div onClick={(e) => e.stopPropagation()}>
                <StudentActionMenu
                  student={student}
                  onEdit={() => setEditingStudent(student)}
                />
              </div>
            </div>
          ))}
        </div>
        )}
        </ScrollArea>
      )}

      <EditStudentSheet
        student={editingStudent}
        onOpenChange={(open) => {
          if (!open) setEditingStudent(null);
        }}
      />
    </div>
  );
}
