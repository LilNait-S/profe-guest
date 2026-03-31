# Skill: /docs — Generar documentación de MVP

## Descripción
Genera la documentación completa de un proyecto MVP a partir de un archivo `problem.md`. Crea los docs faltantes de forma interactiva, preguntando decisiones clave al usuario.

## Uso
```
/docs              — Genera todos los docs faltantes
/docs check        — Muestra qué docs existen y cuáles faltan
/docs <nombre>     — Genera solo un doc específico (prd, tech-stack, data-model, architecture, ui-flows)
```

## Instrucciones

### Paso 1: Verificar prerequisitos
1. Buscar `docs/problem.md` o `problem.md` en la raíz del proyecto
2. Si no existe, pedir al usuario que lo cree primero con la estructura:
   - El Problema
   - Usuario Objetivo
   - La Solución
   - Funcionalidades Clave del MVP
   - Fuera del Alcance
   - Criterio de Éxito

### Paso 2: Evaluar estado actual
Verificar qué docs ya existen en `docs/`:
- `problem.md` — Definición del problema y alcance
- `prd.md` — Product Requirements Document con user stories
- `tech-stack.md` — Decisiones técnicas (framework, DB, hosting)
- `data-model.md` — Esquema de base de datos
- `architecture.md` — Arquitectura de alto nivel
- `ui-flows.md` — Flujos de pantalla y wireframes ASCII

Si el argumento es `check`, mostrar el estado y salir.

### Paso 3: Generar docs faltantes (en orden)

#### 3a. PRD (`prd.md`)
Derivar del problem.md:
- Resumen ejecutivo
- Perfil de usuario con pain points
- User stories con prioridades (P0, P1, P2) en formato tabla
- Flujo principal (diagrama ASCII)
- Requisitos no funcionales
- Criterio de éxito y métricas proxy

#### 3b. Tech Stack (`tech-stack.md`)
**PREGUNTAR al usuario** con AskUserQuestion (4 preguntas):
1. Frontend framework (Next.js / Astro+React / Nuxt / Other)
2. Base de datos (Supabase / Firebase / PlanetScale / Other)
3. Deploy (Vercel / Cloudflare / Railway / Other)
4. Estilos (Tailwind+shadcn / Tailwind solo / CSS Modules / Other)

Con las respuestas, generar:
- Tabla de decisiones con justificación
- Lista de dependencias clave
- Estructura del proyecto
- Entorno de desarrollo

#### 3c. Data Model (`data-model.md`)
Derivar del PRD y tech stack:
- Diagrama de entidades (ASCII)
- Tablas con campos, tipos y notas
- Relaciones y constraints
- Políticas de seguridad (RLS si aplica)
- Índices sugeridos

#### 3d. Architecture (`architecture.md`)
Derivar del tech stack:
- Diagrama de arquitectura (ASCII)
- Principios de diseño
- Flujo de autenticación
- Flujo de datos ejemplo
- Tabla de rutas/páginas

#### 3e. UI Flows (`ui-flows.md`)
Derivar del PRD:
- Wireframes ASCII de cada pantalla principal
- Interacciones clave por pantalla
- Mapa de navegación
- Tabla de "regla de N taps" para acciones frecuentes

### Paso 4: Verificación final
Listar todos los docs generados con un resumen de una línea cada uno.

## Notas
- Todos los docs van en `docs/`
- Si un doc ya existe, NO sobreescribirlo (avisar al usuario)
- Usar español para el contenido de docs (son para el usuario)
- Mantener el tono directo y conciso
- Los wireframes son ASCII art, no links a herramientas externas

## MANDATORY Conventions (read CLAUDE.md)
- In tech-stack.md and architecture.md: all code examples, file names, and entity names must be in **English** and **kebab-case**
- Entity names in English (student, lesson, payment, teacher — never alumno, clase, pago, profesor)
- Route paths in English (`/api/students`, `/api/payments`, not `/api/alumnos`)
- User-facing strings referenced in ui-flows.md stay in Spanish
