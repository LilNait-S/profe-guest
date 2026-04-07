import type { Subject } from '@/types';

export const SUBJECT_COLORS = [
  { name: 'Rojo', value: '#ef4444' },
  { name: 'Naranja', value: '#f97316' },
  { name: 'Amarillo', value: '#eab308' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Morado', value: '#a855f7' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
] as const;

export const DEFAULT_SUBJECT_COLOR = SUBJECT_COLORS[4].value; // Azul

/**
 * Gets the color for a subject by name. Falls back to null if not found.
 */
export function getSubjectColor(
  subjectName: string | null | undefined,
  subjects: Subject[],
): string | null {
  if (!subjectName) return null;
  const subject = subjects.find((s) => s.name === subjectName);
  return subject?.color ?? null;
}
