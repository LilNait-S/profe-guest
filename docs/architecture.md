# Arquitectura: ProfeGest MVP

## Vista general

```
┌──────────────────────────────────────────────────────────┐
│                        Vercel                             │
│                                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │   Client (Browser)     │  │   API Routes (Server)  │ │
│  │                        │  │                        │ │
│  │  Pages ("use client")  │  │  /api/alumnos          │ │
│  │  TanStack Query cache  │──│  /api/clases           │ │
│  │  Services (axios)      │  │  /api/pagos            │ │
│  │  shadcn/ui components  │  │  /api/auth/callback    │ │
│  └────────────────────────┘  └───────────┬────────────┘ │
└──────────────────────────────────────────┼──────────────┘
                                           │ Supabase SDK
┌──────────────────────────────────────────┼──────────────┐
│                     Supabase                             │
│  ┌───────────┐  ┌────────────────────────┴───────────┐  │
│  │   Auth    │  │           PostgreSQL                │  │
│  │  (Google  │  │  (datos + RLS + migrations)         │  │
│  │   OAuth)  │  │                                     │  │
│  └───────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Principios

1. **Client-first**: Todas las páginas son `"use client"`. Sin Server Components. La UI es una SPA con routing de Next.js.
2. **Service Module Pattern**: La lógica de datos vive en services (`alumno.service.ts`), no en componentes. Los componentes consumen hooks de TanStack Query.
3. **API Routes como backend**: Toda comunicación con Supabase pasa por API Routes. El cliente nunca habla directo con la DB.
4. **TanStack Query como capa de estado**: No hay estado global para datos del servidor. TanStack Query maneja cache, loading, error, refetch y optimistic updates.
5. **Mobile-first**: Diseño responsive, pero la prioridad es la experiencia en celular.

## Capas de la aplicación

```
┌─────────────────────────────────────────┐
│              Componentes UI              │  Presentación
│         (pages + components)             │  Solo renderizan, no fetchean directo
├─────────────────────────────────────────┤
│           TanStack Query Hooks           │  Estado del servidor
│     (useAlumnos, useCreateAlumno...)     │  Cache, loading, error, invalidation
├─────────────────────────────────────────┤
│            Service Modules               │  Acceso a datos (client)
│  (alumnoService.getAll, .create...)      │  Axios calls a /api/*
├─────────────────────────────────────────┤
│          Next.js API Routes              │  Backend
│   (validación, auth, Supabase SDK)       │  Hablan con Supabase server-side
├─────────────────────────────────────────┤
│        Supabase (PostgreSQL + Auth)      │  Persistencia
└─────────────────────────────────────────┘
```

## Flujo de autenticación

```
Usuario -> "Login con Google" -> Supabase Auth -> redirect callback
  -> /api/auth/callback (intercambia code por sesión)
  -> Proxy Next.js verifica sesión -> Dashboard
```

- Supabase Auth maneja tokens y refresh
- Axios interceptor adjunta el token en cada request
- Proxy de Next.js (`proxy.ts`) protege rutas del dashboard
- Sin sesión = redirect a login

## Flujo de datos (ejemplo: marcar pago)

```
1. Profesora toca "Marcar pagado" en UI
2. Componente llama hook: useMarcarPagado().mutate(pagoId)
3. Hook usa TanStack Query mutation → pagoService.marcarPagado(pagoId)
4. Service hace axios.patch('/api/pagos/{id}', { pagado: true })
5. API Route valida auth, ejecuta UPDATE via Supabase SDK + RLS
6. Mutation exitosa → invalidateQueries(['pagos']) → UI se actualiza
```

## Axios config

```ts
// lib/axios.ts
import axios from 'axios';
import { supabaseClient } from './supabase/client';

export const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});
```

## Páginas principales

| Ruta | Descripción | Rendering |
|------|-------------|-----------|
| `/login` | Login con Google | Client |
| `/` | Dashboard - vista semanal del calendario | Client |
| `/alumnos` | Lista de alumnos activos | Client |
| `/alumnos/nuevo` | Formulario alta alumno | Client |
| `/alumnos/[id]` | Detalle y edición de alumno | Client |
| `/pagos` | Vista de pagos del mes actual | Client |
| `/pagos/[alumnoId]` | Historial de pagos de un alumno | Client |

## API Routes

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/alumnos` | GET, POST | Listar y crear alumnos |
| `/api/alumnos/[id]` | GET, PATCH, DELETE | Detalle, editar, dar de baja |
| `/api/clases` | GET, POST | Listar y crear clases |
| `/api/clases/[id]` | PATCH, DELETE | Editar, eliminar clase |
| `/api/pagos` | GET, POST | Listar pagos del mes, crear registro |
| `/api/pagos/[id]` | PATCH | Marcar pagado/pendiente |
| `/api/auth/callback` | GET | OAuth callback de Supabase |
