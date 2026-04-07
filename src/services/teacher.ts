'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Teacher } from '@/types';

export const useTeacher = () =>
  useAppQuery<Teacher>({
    fetcher: async () => {
      return await genericAuthRequest<Teacher>('get', '/api/teacher');
    },
    queryKey: [queryKeys.teacher],
  });

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useAppMutation<Partial<Teacher>, Teacher>({
    fetcher: async (input) => {
      return await genericAuthRequest<Teacher>('patch', '/api/teacher', input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.teacher] });
      },
    },
  });
};
