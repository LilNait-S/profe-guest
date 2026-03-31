# Skill: /init-project — Scaffold de proyecto desde docs

## Descripción
Lee la documentación existente en `docs/` y genera la estructura completa del proyecto: instala dependencias, crea archivos base, configura el stack, y deja todo listo para empezar a implementar features.

## Uso
```
/init-project          — Scaffold completo desde los docs
/init-project dry-run  — Muestra qué haría sin crear nada
```

## Prerequisitos
Requiere que existan estos docs en `docs/`:
- `tech-stack.md` — Define framework, dependencias, estructura de carpetas
- `data-model.md` — Define las tablas y relaciones
- `architecture.md` — Define capas, API routes, services, hooks

Si falta alguno, avisar al usuario y sugerir `/docs` para generarlos.

## Instrucciones

### Paso 1: Leer y parsear los docs
1. Leer `docs/tech-stack.md` → extraer: framework, dependencias, estructura de carpetas, package manager
2. Leer `docs/data-model.md` → extraer: tablas, campos, tipos, relaciones, constraints, RLS policies, índices
3. Leer `docs/architecture.md` → extraer: API routes, services, hooks, flujo de auth, providers

Si el argumento es `dry-run`, mostrar un resumen de lo que se generaría y salir.

### Paso 2: Inicializar el proyecto
1. Ejecutar `pnpm create next-app` con las opciones correctas (TypeScript, Tailwind, App Router, src/, no Turbopack por estabilidad)
2. Si el directorio ya tiene `package.json`, NO sobreescribir — avisar y preguntar si continuar

### Paso 3: Instalar dependencias
Instalar las dependencias del `tech-stack.md`:

```bash
# Core
pnpm add axios @tanstack/react-query

# Supabase
pnpm add @supabase/supabase-js @supabase/ssr

# ORM
pnpm add drizzle-orm
pnpm add -D drizzle-kit

# UI (shadcn se instala via CLI)
pnpm dlx shadcn@latest init

# Utilidades
pnpm add date-fns
```

### Paso 4: Crear estructura de carpetas
Crear los directorios vacíos que aún no existen según `tech-stack.md`:

```
src/
├── services/
├── hooks/
├── types/
├── lib/supabase/
├── db/migrations/
├── components/providers/
└── app/api/auth/callback/
```

### Paso 5: Generar archivos base

#### 5a. Configuración Axios (`src/lib/axios.ts`)
Crear instancia de axios con:
- baseURL vacío (mismo origin)
- Content-Type JSON
- Interceptor de request que adjunta Bearer token de Supabase Auth

#### 5b. Supabase clients
- `src/lib/supabase/client.ts` — Cliente para browser (createBrowserClient)
- `src/lib/supabase/server.ts` — Cliente para API Routes (createServerClient con cookies)

#### 5c. TanStack Query config (`src/lib/query-client.ts`)
- QueryClient con defaults razonables (staleTime: 1 min, retry: 1)

#### 5d. Providers (`src/components/providers/query-provider.tsx`)
- QueryClientProvider wrapper como client component

#### 5e. Types (`src/types/index.ts`)
Derivar de `data-model.md`:
- Interfaces TypeScript para cada tabla (entity types)
- DTOs para create/update (omitir id, created_at, etc.)

#### 5f. Drizzle schema (`src/db/schema.ts`)
Derivar de `data-model.md`:
- Una tabla Drizzle por entidad
- Relaciones con `relations()`
- Tipos, constraints, defaults según el doc

#### 5g. Service modules (`src/services/*.service.ts`)
Derivar de `architecture.md`. Un archivo por entidad con:
- Objeto exportado con métodos CRUD
- Cada método usa `api` (axios) para llamar al API Route correspondiente
- Tipado con los types generados en 5e

#### 5h. TanStack Query hooks (`src/hooks/use-*.ts`)
Un archivo por entidad con:
- `useQuery` hook para reads (list, getById)
- `useMutation` hooks para writes (create, update, delete)
- `invalidateQueries` en `onSuccess` de mutations

#### 5i. API Routes (`src/app/api/**/route.ts`)
Derivar de `architecture.md`. Para cada endpoint:
- Crear el archivo `route.ts` con los handlers (GET, POST, PATCH, DELETE)
- Cada handler: valida auth (Bearer token), ejecuta query via Drizzle, retorna JSON
- Usar el Supabase server client para verificar el token
- Implementar el CRUD básico con Drizzle

#### 5j. Páginas stub (`src/app/(dashboard)/**/page.tsx`)
Crear las páginas como "use client" con:
- Imports de los hooks correspondientes
- Estructura básica con loading/error states
- Componente placeholder con TODO comments indicando qué UI va ahí

#### 5k. Layout y middleware
- `src/app/(dashboard)/layout.tsx` — Layout con nav inferior + QueryProvider
- `src/middleware.ts` — Protección de rutas (redirect a /login si no hay sesión)
- `src/app/(auth)/login/page.tsx` — Página de login con botón de Google

#### 5l. Env template (`.env.local.example`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

### Paso 6: Configurar shadcn/ui
Inicializar shadcn y agregar componentes base que se necesitan:
```bash
pnpm dlx shadcn@latest add button card input label separator badge
```

### Paso 7: Verificación final
1. Ejecutar `pnpm build` para verificar que compila
2. Si hay errores de tipo, corregirlos
3. Mostrar resumen de lo generado:
   - Número de archivos creados
   - Lista de endpoints disponibles
   - Próximos pasos sugeridos (configurar Supabase, crear DB, implementar UI)

## Notas
- NO sobreescribir archivos que ya existen (preguntar al usuario)
- Todos los archivos generados deben compilar sin errores
- Usar convenciones de naming del proyecto:
  - Services: `nombre.service.ts`
  - Hooks: `use-nombre.ts`
  - Types: PascalCase para interfaces
- Los API Routes deben tener manejo de errores básico (try/catch, status codes correctos)
- El código generado es funcional — no son stubs vacíos. El CRUD básico debe funcionar end-to-end una vez que se configure Supabase.
