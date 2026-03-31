'use client';

import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from '@/types';

export const usePaymentsByMonth = (month: number, year: number) =>
  useAppQuery<Payment[]>({
    fetcher: async () => {
      return await genericAuthRequest<Payment[]>('get', '/api/payments', { month, year });
    },
    queryKey: [queryKeys.paymentsByMonth, year, month],
  });

export const usePaymentsByStudent = (studentId: string) =>
  useAppQuery<Payment[]>({
    fetcher: async () => {
      return await genericAuthRequest<Payment[]>('get', '/api/payments', { studentId });
    },
    queryKey: [queryKeys.paymentsByStudent, studentId],
    enabled: !!studentId,
  });

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  return useAppMutation<CreatePaymentDTO, Payment>({
    fetcher: async (input) => {
      return await genericAuthRequest<Payment>('post', '/api/payments', input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.payments] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.paymentsByMonth] });
      },
    },
  });
};

export const useUpdatePayment = (id: string) => {
  const queryClient = useQueryClient();
  return useAppMutation<UpdatePaymentDTO, Payment>({
    fetcher: async (input) => {
      return await genericAuthRequest<Payment>('patch', `/api/payments/${id}`, input);
    },
    options: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.payments] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.paymentsByMonth] });
        queryClient.invalidateQueries({ queryKey: [queryKeys.paymentsByStudent] });
      },
    },
  });
};
