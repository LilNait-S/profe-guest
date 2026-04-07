/**
 * Peruvian national holidays.
 * Fixed dates that repeat every year.
 * Format: "MM-DD" -> label
 */
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'Año Nuevo',
  '05-01': 'Día del Trabajo',
  '06-07': 'Batalla de Arica',
  '06-29': 'San Pedro y San Pablo',
  '07-23': 'Día de la Fuerza Aérea',
  '07-28': 'Fiestas Patrias',
  '07-29': 'Fiestas Patrias',
  '08-06': 'Batalla de Junín',
  '08-30': 'Santa Rosa de Lima',
  '10-08': 'Combate de Angamos',
  '11-01': 'Día de Todos los Santos',
  '12-08': 'Inmaculada Concepción',
  '12-09': 'Batalla de Ayacucho',
  '12-25': 'Navidad',
};

/**
 * Returns the holiday name for a given date, or null if not a holiday.
 */
export function getHoliday(date: Date): string | null {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return FIXED_HOLIDAYS[`${month}-${day}`] ?? null;
}

/**
 * Returns true if the given date is a holiday.
 */
export function isHoliday(date: Date): boolean {
  return getHoliday(date) !== null;
}

/**
 * Returns true if the given date is a non-working day (Sunday or holiday).
 */
export function isNonWorkingDay(date: Date): boolean {
  return date.getDay() === 0 || isHoliday(date);
}

/**
 * Returns a label for non-working days. Only returns holiday names, not "Domingo"
 * (since Sunday is already obvious from the day name).
 */
export function getNonWorkingLabel(date: Date): string | null {
  return getHoliday(date);
}
