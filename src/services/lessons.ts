'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Lesson, CreateLessonDTO, UpdateLessonDTO } from '@/types';

export const useLessons = () =>
  useAppQuery<Lesson[]>({
    fetcher: async () => {
      return await genericAuthRequest<Lesson[]>('get', '/api/lessons');
    },
    queryKey: [queryKeys.lessons],
  });

export const useLessonsByStudent = (studentId: string) =>
  useAppQuery<Lesson[]>({
    fetcher: async () => {
      return await genericAuthRequest<Lesson[]>('get', '/api/lessons', { studentId });
    },
    queryKey: [queryKeys.lessonsByStudent, studentId],
    enabled: !!studentId,
  });

export const useCreateLesson = () => {
  const queryClient = useQueryClient();
  return useAppMutation<CreateLessonDTO, Lesson>({
    fetcher: async (input) => {
      return await genericAuthRequest<Lesson>('post', '/api/lessons', input);
    },
    options: {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
        queryClient.invalidateQueries({
          queryKey: [queryKeys.lessonsByStudent, variables.student_id],
        });
      },
    },
  });
};

export const useUpdateLesson = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<UpdateLessonDTO, Lesson>({
    fetcher: async (input) => {
      return await genericAuthRequest<Lesson>('patch', `/api/lessons/${id}`, input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
      },
    },
  });
};

export const useDeleteLesson = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<undefined, { ok: boolean }>({
    fetcher: async () => {
      return await genericAuthRequest<{ ok: boolean }>('delete', `/api/lessons/${id}`);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
      },
    },
  });
};
