# PRD: Schedule App MVP

## Resumen

App web mobile-first para profesores particulares independientes que necesitan gestionar alumnos, horarios y cobros desde un solo lugar, reemplazando el cuaderno/hoja de cálculo.

## Usuario objetivo

**Perfil:** Profesor/a particular independiente (inglés u otras materias).
**Contexto:** Maneja entre 5 y 20 alumnos. Sin conocimientos técnicos. Usa el celular como herramienta principal.
**Pain points:**
- Cambios de horario frecuentes generan caos en el cuaderno
- No recuerda quién pagó y quién no
- No tiene vista consolidada de su semana

## User Stories

### P0 — Imprescindibles para el MVP

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-01 | profesora | registrar un alumno con nombre, contacto y horario | tener su info centralizada |
| US-02 | profesora | ver mi semana completa con todas las clases | saber qué tengo cada día |
| US-03 | profesora | mover la clase de un alumno a otro día/hora | ajustar cambios sin tachar el cuaderno |
| US-04 | profesora | marcar si un alumno pagó este mes | llevar control de cobros |
| US-05 | profesora | ver de un vistazo quién no ha pagado | saber a quién cobrarle |
| US-06 | profesora | usar la app desde mi celular | consultarla entre clases |

### P1 — Deseables para el MVP

| ID | Como... | Quiero... | Para... |
|----|---------|-----------|---------|
| US-07 | profesora | editar los datos de un alumno | actualizar su contacto o tarifa |
| US-08 | profesora | dar de baja a un alumno | que no aparezca en mi calendario |
| US-09 | profesora | ver el historial de pagos de un alumno | saber si tiene deudas acumuladas |
| US-10 | profesora | registrarme e iniciar sesión con email y contraseña | acceder a mi cuenta de forma simple |

### P2 — Fuera del MVP

- Pagos online / cobros automáticos
- Múltiples profesores / modo academia
- Videollamadas o clases online
- Reportes avanzados o estadísticas
- Notificaciones automáticas a los alumnos

## Flujo principal

```
Login -> Dashboard (vista semanal) -> [Agregar alumno] / [Ver pagos]
                                          |                    |
                                    Form alumno          Lista pagos
                                          |                    |
                                   Aparece en calendario  Marcar pagado/pendiente
```

## Requisitos no funcionales

- **Mobile-first:** Diseñado para pantallas de 360-414px como caso principal
- **Offline-tolerant:** Debe funcionar con conexiones lentas (no requiere offline completo)
- **Performance:** Carga inicial < 3s en 3G
- **Simplicidad:** Máximo 3 taps para cualquier acción frecuente
- **Datos:** Un profesor maneja ~20 alumnos, no se necesita paginación compleja

## Criterio de éxito

Una profesora de inglés lo usa durante un mes y deja de usar el cuaderno.

## Métricas proxy

- Tasa de retención semanal (¿vuelve a abrir la app?)
- Cantidad de pagos registrados vs alumnos activos
- Tiempo desde registro hasta primera clase agendada (< 5 min ideal)
