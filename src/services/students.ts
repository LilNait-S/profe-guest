'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Student, CreateStudentDTO, UpdateStudentDTO } from '@/types';

export const useStudents = () =>
  useAppQuery<Student[]>({
    fetcher: async () => {
      return await genericAuthRequest<Student[]>('get', '/api/students');
    },
    queryKey: [queryKeys.students],
  });

export const useStudent = (id: string) =>
  useAppQuery<Student>({
    fetcher: async () => {
      return await genericAuthRequest<Student>('get', `/api/students/${id}`);
    },
    queryKey: [queryKeys.studentDetail, id],
    enabled: !!id,
  });

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useAppMutation<CreateStudentDTO, Student>({
    fetcher: async (input) => {
      return await genericAuthRequest<Student>('post', '/api/students', input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.students] });
      },
    },
  });
};

export const useUpdateStudent = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<UpdateStudentDTO, Student>({
    fetcher: async (input) => {
      return await genericAuthRequest<Student>('patch', `/api/students/${id}`, input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.students] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail, id] });
      },
    },
  });
};

export const useDeleteStudent = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<undefined, { ok: boolean }>({
    fetcher: async () => {
      return await genericAuthRequest<{ ok: boolean }>('delete', `/api/students/${id}`);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.students] });
      },
    },
  });
};
