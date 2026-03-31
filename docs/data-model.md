# Data Model: ProfeGest MVP

> Las tablas, RLS y migraciones se gestionan via **Supabase MCP** (no ORM local).

## Diagrama de entidades

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   profesor    │       │    alumno    │       │     pago     │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (uuid)    │──┐    │ id (uuid)    │──┐    │ id (uuid)    │
│ email        │  │    │ profesor_id  │  │    │ alumno_id    │
│ nombre       │  │    │ nombre       │  │    │ mes          │
│ avatar_url   │  │    │ contacto     │  │    │ anio         │
│ created_at   │  └───>│ notas        │  └───>│ monto        │
└──────────────┘       │ activo       │       │ pagado       │
                       │ created_at   │       │ fecha_pago   │
                       └──────┬───────┘       │ created_at   │
                              │               └──────────────┘
                              │
                       ┌──────┴───────┐
                       │    clase     │
                       ├──────────────┤
                       │ id (uuid)    │
                       │ alumno_id    │
                       │ dia_semana   │
                       │ hora_inicio  │
                       │ hora_fin     │
                       │ recurrente   │
                       │ created_at   │
                       └──────────────┘
```

## Tablas

### `profesor`
El usuario de la app. Mapeado 1:1 con Supabase Auth.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK, viene de `auth.users.id` |
| email | text | NOT NULL, unique |
| nombre | text | NOT NULL |
| avatar_url | text | Nullable, de Google OAuth |
| created_at | timestamptz | Default now() |

### `alumno`
Cada estudiante del profesor.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK, gen_random_uuid() |
| profesor_id | uuid | FK -> profesor.id, NOT NULL |
| nombre | text | NOT NULL |
| contacto | text | Teléfono, email o WhatsApp |
| notas | text | Info adicional libre |
| activo | boolean | Default true. False = dado de baja (US-08) |
| created_at | timestamptz | Default now() |

### `clase`
Horario recurrente de un alumno. Un alumno puede tener múltiples clases por semana.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| alumno_id | uuid | FK -> alumno.id, NOT NULL |
| dia_semana | smallint | 0=lunes, 6=domingo |
| hora_inicio | time | Ej: '14:00' |
| hora_fin | time | Ej: '15:00' |
| recurrente | boolean | Default true |
| created_at | timestamptz | Default now() |

### `pago`
Registro mensual de pago por alumno.

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK |
| alumno_id | uuid | FK -> alumno.id, NOT NULL |
| mes | smallint | 1-12 |
| anio | smallint | Ej: 2026 |
| monto | numeric(10,2) | Monto esperado |
| pagado | boolean | Default false |
| fecha_pago | date | Nullable, se llena al marcar pagado |
| created_at | timestamptz | Default now() |

**Constraint:** UNIQUE(alumno_id, mes, anio) — un solo registro de pago por alumno por mes.

## Row Level Security (RLS)

Todas las tablas usan RLS para que cada profesor solo vea sus datos:

```sql
-- Ejemplo para alumno
CREATE POLICY "Profesor ve sus alumnos"
  ON alumno FOR ALL
  USING (profesor_id = auth.uid());

-- Para clase (a través de alumno)
CREATE POLICY "Profesor ve clases de sus alumnos"
  ON clase FOR ALL
  USING (alumno_id IN (
    SELECT id FROM alumno WHERE profesor_id = auth.uid()
  ));

-- Para pago (a través de alumno)
CREATE POLICY "Profesor ve pagos de sus alumnos"
  ON pago FOR ALL
  USING (alumno_id IN (
    SELECT id FROM alumno WHERE profesor_id = auth.uid()
  ));
```

## Índices sugeridos

```sql
CREATE INDEX idx_alumno_profesor ON alumno(profesor_id) WHERE activo = true;
CREATE INDEX idx_clase_alumno ON clase(alumno_id);
CREATE INDEX idx_clase_dia ON clase(dia_semana);
CREATE INDEX idx_pago_alumno_periodo ON pago(alumno_id, anio, mes);
CREATE INDEX idx_pago_pendiente ON pago(alumno_id) WHERE pagado = false;
```
