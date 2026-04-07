# Tech Stack: Schedule App MVP

## Decisiones

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Frontend** | Next.js 16 (App Router) | Routing integrado, deploy trivial en Vercel |
| **Rendering** | Client-side (SPA-like) | Todas las páginas son `"use client"`. Sin Server Components. |
| **Data fetching** | TanStack Query v5 | Cache, refetch, optimistic updates, loading/error states automáticos |
| **HTTP client** | Axios | Interceptors para auth token, manejo de errores centralizado |
| **UI** | Tailwind CSS + shadcn/ui | Componentes accesibles, mobile-first nativo, rápido de iterar |
| **Backend** | Next.js API Routes (`app/api/`) | Endpoints REST que encapsulan la lógica de negocio |
| **Base de datos** | Supabase (PostgreSQL) | Auth incluido, RLS para seguridad, free tier generoso |
| **Auth** | Supabase Auth (email/password) | Registro e inicio de sesión sin deps externas (US-10) |
| **Deploy** | Vercel | Deploy automático desde git, preview branches, free tier |
| **DB client** | Supabase JS SDK | Queries directas via `supabase.from()`. Migraciones via Supabase MCP |

## Patrón: Service Module Pattern

La lógica de acceso a datos se organiza en **módulos de servicio** — un archivo por entidad que expone funciones específicas. Esto separa la lógica de negocio de los componentes y de la capa HTTP.

```
src/
├── services/           # Service modules (hooks + data access in one file per entity)
│   ├── students.ts
│   ├── lessons.ts
│   └── payments.ts
├── app/api/            # API Routes server-side que hablan con Supabase SDK
│   ├── students/route.ts
│   ├── lessons/route.ts
│   └── payments/route.ts
```

**Flujo:**
```
Component → hook (useAppQuery) → genericAuthRequest (Axios) → API Route → Supabase
```

**Ejemplo:**
```ts
// services/students.ts
import { useQueryClient } from '@tanstack/react-query';
import { genericAuthRequest } from '@/lib/api-client';
import { useAppQuery, useAppMutation } from '@/lib/query-hooks';
import { queryKeys } from '@/lib/query-keys';
import type { Student, CreateStudentDTO } from '@/types';

export const useStudents = () =>
  useAppQuery<Student[]>({
    fetcher: async () => {
      return await genericAuthRequest<Student[]>('get', '/api/students');
    },
    queryKey: [queryKeys.students],
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
```

## Dependencias clave

```
next
react
axios
@tanstack/react-query
@supabase/supabase-js
@supabase/ssr
zod (env validation + form schemas)
react-hook-form + @hookform/resolvers (forms with zod validation)
tailwindcss
shadcn/ui (button, card, input, label, separator, badge, textarea)
date-fns (manejo de fechas/horarios)
```

## Estructura del proyecto

```
schedule-app/
├── docs/                       # Documentación del proyecto
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API Routes (backend)
│   │   │   ├── alumnos/
│   │   │   │   ├── route.ts        # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts    # GET, PATCH, DELETE
│   │   │   ├── clases/
│   │   │   │   └── route.ts
│   │   │   ├── pagos/
│   │   │   │   └── route.ts
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts
│   │   ├── (auth)/             # Rutas de login
│   │   │   └── login/page.tsx
│   │   ├── (dashboard)/        # Rutas protegidas (todas "use client")
│   │   │   ├── layout.tsx          # Layout con nav + QueryProvider
│   │   │   ├── page.tsx            # Dashboard / vista semanal
│   │   │   ├── alumnos/
│   │   │   │   ├── page.tsx        # Lista alumnos
│   │   │   │   ├── nuevo/page.tsx  # Form nuevo alumno
│   │   │   │   └── [id]/page.tsx   # Detalle/edición
│   │   │   └── pagos/
│   │   │       ├── page.tsx        # Pagos del mes
│   │   │       └── [alumnoId]/page.tsx
│   │   ├── layout.tsx          # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── providers/          # QueryClientProvider, AuthProvider
│   │   └── ...                 # Componentes del proyecto
│   ├── services/               # Service modules (axios calls)
│   │   ├── alumno.service.ts
│   │   ├── clase.service.ts
│   │   └── pago.service.ts
│   ├── hooks/                  # TanStack Query hooks
│   │   ├── use-alumnos.ts
│   │   ├── use-clases.ts
│   │   └── use-pagos.ts
│   ├── lib/
│   │   ├── axios.ts            # Instancia de axios con interceptors
│   │   ├── supabase/
│   │   │   ├── client.ts       # Cliente browser (para auth)
│   │   │   └── server.ts       # Cliente server (para API Routes)
│   │   ├── query-client.ts     # Config de TanStack Query
│   │   └── utils.ts
│   ├── types/                  # Types compartidos (DTOs, entities)
│   │   └── index.ts
│   └── proxy.ts                # Protección de rutas (antes middleware.ts)
├── public/
├── .env.local                  # SUPABASE_URL, SUPABASE_ANON_KEY
└── package.json
```

## Entorno de desarrollo

- **Node.js** >= 20
- **pnpm** como package manager
- **TypeScript** strict mode
- **ESLint** + Prettier
