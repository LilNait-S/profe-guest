'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Attendance, UpsertAttendanceDTO } from '@/types';

export const useAttendance = (from: string, to: string) =>
  useAppQuery<Attendance[]>({
    fetcher: async () => {
      return await genericAuthRequest<Attendance[]>('get', '/api/attendance', { from, to });
    },
    queryKey: [queryKeys.attendance, from, to],
    enabled: !!from && !!to,
  });

export const useUpsertAttendance = () => {
  const queryClient = useQueryClient();
  return useAppMutation<UpsertAttendanceDTO, Attendance | { ok: boolean }>({
    fetcher: async (input) => {
      return await genericAuthRequest<Attendance | { ok: boolean }>(
        'post',
        '/api/attendance',
        input,
      );
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.attendance] });
      },
    },
  });
};
