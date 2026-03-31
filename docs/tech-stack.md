# Tech Stack: ProfeGest MVP

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
| **Auth** | Supabase Auth (Google OAuth) | Login con Google sin config compleja (US-10) |
| **Deploy** | Vercel | Deploy automático desde git, preview branches, free tier |
| **DB client** | Supabase JS SDK | Queries directas via `supabase.from()`. Migraciones via Supabase MCP |

## Patrón: Service Module Pattern

La lógica de acceso a datos se organiza en **módulos de servicio** — un archivo por entidad que expone funciones específicas. Esto separa la lógica de negocio de los componentes y de la capa HTTP.

```
src/
├── services/           # Service modules (client-side, llaman API via axios)
│   ├── alumno.service.ts
│   ├── clase.service.ts
│   └── pago.service.ts
├── app/api/            # API Routes server-side que hablan con Supabase SDK
│   ├── alumnos/route.ts
│   ├── clases/route.ts
│   └── pagos/route.ts
├── hooks/              # TanStack Query hooks (consumen services)
│   ├── use-alumnos.ts
│   ├── use-clases.ts
│   └── use-pagos.ts
```

**Flujo:**
```
Componente → hook (TanStack Query) → service (axios) → API Route → Supabase
```

**Ejemplo:**
```ts
// services/alumno.service.ts
import { api } from '@/lib/axios';
import type { Alumno, CreateAlumnoDTO } from '@/types';

export const alumnoService = {
  getAll: () => api.get<Alumno[]>('/api/alumnos').then(r => r.data),
  getById: (id: string) => api.get<Alumno>(`/api/alumnos/${id}`).then(r => r.data),
  create: (data: CreateAlumnoDTO) => api.post<Alumno>('/api/alumnos', data).then(r => r.data),
  update: (id: string, data: Partial<Alumno>) => api.patch<Alumno>(`/api/alumnos/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/alumnos/${id}`),
};

// hooks/use-alumnos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { alumnoService } from '@/services/alumno.service';

export const useAlumnos = () =>
  useQuery({ queryKey: ['alumnos'], queryFn: alumnoService.getAll });

export const useCreateAlumno = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: alumnoService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alumnos'] }),
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
tailwindcss
shadcn/ui (components cherry-picked)
date-fns (manejo de fechas/horarios)
```

## Estructura del proyecto

```
profe-guest/
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
