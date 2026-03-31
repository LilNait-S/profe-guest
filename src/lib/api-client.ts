'use client';

import axios from 'axios';
import { getSupabaseClient } from './supabase/client';

const client = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await getSupabaseClient().auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export async function genericAuthRequest<T>(
  method: HttpMethod,
  url: string,
  data?: unknown,
): Promise<T> {
  const config = method === 'get' ? { params: data } : undefined;
  const body = method === 'get' ? undefined : data;

  const response = await client.request<T>({
    method,
    url,
    data: body,
    ...config,
  });

  return response.data;
}
