'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStudent, useUpdateStudent, useDeleteStudent } from '@/services/students';

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: student, isLoading } = useStudent(id);
  const updateStudent = useUpdateStudent(id);
  const deleteStudent = useDeleteStudent(id);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (student) {
      setName(student.name);
      setContact(student.contact ?? '');
      setNotes(student.notes ?? '');
    }
  }, [student]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-500">Alumno no encontrado</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudent.mutate(
      { name, contact: contact || undefined, notes: notes || undefined },
      { onSuccess: () => router.push('/students') },
    );
  };

  const handleDelete = () => {
    if (confirm('¿Dar de baja a este alumno?')) {
      deleteStudent.mutate(undefined, {
        onSuccess: () => router.push('/students'),
      });
    }
  };

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Editar alumno</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Contacto
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={updateStudent.isPending}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {updateStudent.isPending ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <button
        onClick={handleDelete}
        className="mt-4 w-full rounded-lg border border-red-300 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Dar de baja
      </button>
    </div>
  );
}
