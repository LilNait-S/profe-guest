# Arquitectura: ProfeGest MVP

## Vista general

```
┌──────────────────────────────────────────────────────────┐
│                        Vercel                             │
│                                                          │
│  ┌────────────────────────┐  ┌────────────────────────┐ │
│  │   Client (Browser)     │  │   API Routes (Server)  │ │
│  │                        │  │                        │ │
│  │  Pages ("use client")  │  │  /api/students         │ │
│  │  TanStack Query cache  │──│  /api/lessons          │ │
│  │  Services (axios)      │  │  /api/payments         │ │
│  │  shadcn/ui components  │  │  /api/auth/callback    │ │
│  └────────────────────────┘  └───────────┬────────────┘ │
└──────────────────────────────────────────┼──────────────┘
                                           │ Supabase SDK
┌──────────────────────────────────────────┼──────────────┐
│                     Supabase                             │
│  ┌───────────┐  ┌────────────────────────┴───────────┐  │
│  │   Auth    │  │           PostgreSQL                │  │
│  │  (email/  │  │  (datos + RLS + migrations)         │  │
│  │   pass)   │  │                                     │  │
│  └───────────┘  └────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Principios

1. **Client-first**: Todas las páginas son `"use client"`. Sin Server Components. La UI es una SPA con routing de Next.js.
2. **Service Module Pattern**: La lógica de datos vive en services (`students.ts`, `lessons.ts`, `payments.ts`), no en componentes. Los componentes consumen hooks de TanStack Query.
3. **API Routes como backend**: Toda comunicación con Supabase pasa por API Routes. El cliente nunca habla directo con la DB.
4. **TanStack Query como capa de estado**: No hay estado global para datos del servidor. TanStack Query maneja cache, loading, error, refetch y optimistic updates.
5. **Mobile-first**: Diseño responsive, pero la prioridad es la experiencia en celular.

## Capas de la aplicación

```
┌─────────────────────────────────────────┐
│              Componentes UI              │  Presentación
│         (pages + components)             │  Solo renderizan, no fetchean directo
├─────────────────────────────────────────┤
│        Services (hooks + data access)    │  Estado del servidor
│  (useStudents, useCreateLesson...)       │  Cache, loading, error, invalidation
├─────────────────────────────────────────┤
│          genericAuthRequest              │  HTTP client (Axios)
│        (lib/api-client.ts)               │  Auto-attaches auth token
├─────────────────────────────────────────┤
│          Next.js API Routes              │  Backend
│   (validación, auth, Supabase SDK)       │  Hablan con Supabase server-side
├─────────────────────────────────────────┤
│        Supabase (PostgreSQL + Auth)      │  Persistencia
└─────────────────────────────────────────┘
```

## Flujo de autenticación

```
Usuario -> /login (email + contraseña) -> supabase.auth.signInWithPassword()
  -> Proxy Next.js verifica sesión -> Dashboard

Usuario nuevo -> /signup (nombre + email + contraseña) -> supabase.auth.signUp()
  -> Proxy Next.js verifica sesión -> Dashboard
```

- Supabase Auth maneja tokens y refresh
- Axios interceptor adjunta el token en cada request
- Proxy de Next.js (`proxy.ts`) protege rutas: `/login` y `/signup` son públicas, todo lo demás requiere sesión
- Sin sesión = redirect a /login

## Flujo de datos (ejemplo: marcar pago)

```
1. Profesora toca "Marcar pagado" en UI
2. Componente llama hook: useUpdatePayment(id).mutate({ paid: true })
3. Hook usa useAppMutation → genericAuthRequest('patch', '/api/payments/{id}', data)
4. API Route valida auth, ejecuta UPDATE via Supabase SDK + RLS
5. Mutation exitosa → invalidateQueries([queryKeys.payments]) → UI se actualiza
```

## HTTP Client (`lib/api-client.ts`)

Axios instance with auth interceptor. All services use `genericAuthRequest()` — never raw axios.

```ts
genericAuthRequest<T>(method, url, data?) → Promise<T>
// Auto-attaches Bearer token from Supabase session
// GET: data becomes query params
// POST/PATCH: data becomes request body
```

## Páginas principales

| Ruta | Descripción | Rendering |
|------|-------------|-----------|
| `/login` | Login con email/password | Client |
| `/signup` | Registro con nombre + email + password | Client |
| `/` | Dashboard - calendario mensual | Client |
| `/students` | Lista de alumnos activos | Client |
| `/students/new` | Formulario alta alumno | Client |
| `/students/[id]` | Detalle y edición de alumno | Client |
| `/payments` | Vista de pagos del mes actual | Client |
| `/payments/[studentId]` | Historial de pagos de un alumno | Client |

## API Routes

| Endpoint | Métodos | Descripción |
|----------|---------|-------------|
| `/api/students` | GET, POST | Listar y crear alumnos |
| `/api/students/[id]` | GET, PATCH, DELETE | Detalle, editar, dar de baja |
| `/api/lessons` | GET, POST | Listar y crear clases |
| `/api/lessons/[id]` | PATCH, DELETE | Editar, eliminar clase |
| `/api/payments` | GET, POST | Listar pagos del mes, crear registro |
| `/api/payments/[id]` | PATCH | Marcar pagado/pendiente |
| `/api/auth/callback` | GET | Auth callback de Supabase |
