# UI Flows: ProfeGest MVP

## Pantallas principales

### 1. Login

```
┌─────────────────────┐
│                     │
│     ProfeGest       │
│                     │
│  Tu agenda de       │
│  clases, simple.    │
│                     │
│  Email              │
│  ┌─────────────────┐│
│  │ tu@email.com    ││
│  └─────────────────┘│
│                     │
│  Contrasena         │
│  ┌─────────────────┐│
│  │ ------          ││
│  └─────────────────┘│
│                     │
│  ┌─────────────────┐│
│  │     Entrar      ││
│  └─────────────────┘│
│                     │
│  No tienes cuenta?  │
│  Crear cuenta       │
│                     │
└─────────────────────┘
```

### 2. Dashboard — Vista semanal (home)

La pantalla principal. Muestra la semana actual con las clases agendadas.

```
┌─────────────────────┐
│ ☰  ProfeGest    👤  │
├─────────────────────┤
│ ← Semana 30 Mar →   │
├─────────────────────┤
│ LUN 30               │
│ ┌─────────────────┐ │
│ │ 09:00 Ana López  │ │
│ │ 10:00 Pedro Ruiz │ │
│ └─────────────────┘ │
│                     │
│ MAR 31               │
│ ┌─────────────────┐ │
│ │ 14:00 María Gómez│ │
│ │ 16:00 Juan Díaz  │ │
│ └─────────────────┘ │
│                     │
│ MIÉ 01               │
│ ┌─────────────────┐ │
│ │ 09:00 Ana López  │ │
│ └─────────────────┘ │
│ ...                 │
├─────────────────────┤
│ 📅  👥  💰         │
│ Inicio Alumnos Pagos│
└─────────────────────┘
```

**Interacciones:**
- Tap en clase -> va al detalle del alumno
- Swipe/flechas -> cambiar semana
- Navegación inferior fija: Inicio, Alumnos, Pagos

### 3. Lista de alumnos

```
┌─────────────────────┐
│ ← Alumnos      [+]  │
├─────────────────────┤
│ 🔍 Buscar...        │
├─────────────────────┤
│ Ana López           │
│ Lun y Mié 09:00    │
│ ─────────────────── │
│ Pedro Ruiz          │
│ Lun 10:00           │
│ ─────────────────── │
│ María Gómez         │
│ Mar y Jue 14:00    │
│ ─────────────────── │
│ Juan Díaz           │
│ Mar 16:00 · ⚠ Debe │
├─────────────────────┤
│ 📅  👥  💰         │
└─────────────────────┘
```

**Interacciones:**
- Tap en alumno -> detalle/edición
- [+] -> formulario nuevo alumno
- Indicador visual si tiene pago pendiente

### 4. Formulario nuevo/editar alumno

```
┌─────────────────────┐
│ ← Nuevo alumno      │
├─────────────────────┤
│                     │
│ Nombre *            │
│ ┌─────────────────┐ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ Contacto            │
│ ┌─────────────────┐ │
│ │ Tel o WhatsApp  │ │
│ └─────────────────┘ │
│                     │
│ Horarios            │
│ ┌─────────────────┐ │
│ │ Lun  09:00-10:00│ │
│ │ [+ Agregar hora]│ │
│ └─────────────────┘ │
│                     │
│ Notas               │
│ ┌─────────────────┐ │
│ │                 │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │    Guardar      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### 5. Vista de pagos del mes

```
┌─────────────────────┐
│ ← Pagos             │
├─────────────────────┤
│ ← Marzo 2026 →      │
├─────────────────────┤
│ ⚠ PENDIENTES (2)    │
│ ─────────────────── │
│ Juan Díaz     $5000 │
│         [Marcar ✓]  │
│ ─────────────────── │
│ Pedro Ruiz    $4000 │
│         [Marcar ✓]  │
├─────────────────────┤
│ ✓ PAGADOS (2)       │
│ ─────────────────── │
│ Ana López     $5000 │
│       Pagó: 05/03   │
│ ─────────────────── │
│ María Gómez   $4500 │
│       Pagó: 10/03   │
├─────────────────────┤
│ 📅  👥  💰         │
└─────────────────────┘
```

**Interacciones:**
- "Marcar ✓" cambia estado a pagado con fecha de hoy
- Tap en alumno -> historial de pagos del alumno
- Flechas -> navegar entre meses

### 6. Historial de pagos de un alumno

```
┌─────────────────────┐
│ ← Ana López         │
├─────────────────────┤
│ Historial de pagos  │
├─────────────────────┤
│ Mar 2026  ✓ $5000   │
│           Pagó 05/03│
│ ─────────────────── │
│ Feb 2026  ✓ $5000   │
│           Pagó 03/02│
│ ─────────────────── │
│ Ene 2026  ✓ $4500   │
│           Pagó 08/01│
├─────────────────────┤
│ 📅  👥  💰         │
└─────────────────────┘
```

## Navegación

```
Tab Bar (bottom nav, fixed):
├── 📅 Inicio     -> /          (dashboard semanal)
├── 👥 Alumnos    -> /alumnos   (lista)
└── 💰 Pagos     -> /pagos     (mes actual)
```

Regla de 3 taps: cualquier acción frecuente se alcanza en máximo 3 interacciones.

| Acción | Taps |
|--------|------|
| Ver clases del día | 1 (abrir app) |
| Marcar pago | 2 (Pagos -> Marcar ✓) |
| Agregar alumno | 2 (Alumnos -> [+]) |
| Cambiar horario | 3 (Alumnos -> alumno -> editar horario) |
