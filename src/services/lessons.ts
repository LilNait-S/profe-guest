'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type {
  Lesson,
  LessonException,
  CreateScheduleDTO,
  CreateExceptionDTO,
  UpdateLessonDTO,
} from '@/types';

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

export const useLessonExceptions = (from: string, to: string) =>
  useAppQuery<LessonException[]>({
    fetcher: async () => {
      return await genericAuthRequest<LessonException[]>(
        'get',
        '/api/lesson-exceptions',
        { from, to },
      );
    },
    queryKey: [queryKeys.lessonExceptions, from, to],
    enabled: !!from && !!to,
  });

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useAppMutation<CreateScheduleDTO, Lesson[]>({
    fetcher: async (input) => {
      return await genericAuthRequest<Lesson[]>('post', '/api/lessons', input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessonsByStudent] });
      },
    },
  });
};

export const useCreateLesson = useCreateSchedule;

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

export const useCreateException = () => {
  const queryClient = useQueryClient();
  return useAppMutation<CreateExceptionDTO, LessonException>({
    fetcher: async (input) => {
      return await genericAuthRequest<LessonException>(
        'post',
        '/api/lesson-exceptions',
        input,
      );
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessonExceptions] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
      },
    },
  });
};

export const useDeleteException = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<undefined, { ok: boolean }>({
    fetcher: async () => {
      return await genericAuthRequest<{ ok: boolean }>(
        'delete',
        `/api/lesson-exceptions/${id}`,
      );
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessonExceptions] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.lessons] });
      },
    },
  });
};
