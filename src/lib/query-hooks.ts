'use client';

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';

interface UseAppQueryOptions<T> {
  fetcher: () => Promise<T>;
  queryKey: QueryKey;
  enabled?: boolean;
}

export function useAppQuery<T>({ fetcher, queryKey, enabled }: UseAppQueryOptions<T>) {
  return useQuery<T>({
    queryKey,
    queryFn: fetcher,
    enabled,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

interface UseAppMutationOptions<TInput, TOutput> {
  fetcher: (input: TInput) => Promise<TOutput>;
  options?: Omit<UseMutationOptions<TOutput, Error, TInput>, 'mutationFn'>;
}

export function useAppMutation<TInput, TOutput>({
  fetcher,
  options,
}: UseAppMutationOptions<TInput, TOutput>) {
  return useMutation<TOutput, Error, TInput>({
    mutationFn: fetcher,
    ...options,
  });
}
