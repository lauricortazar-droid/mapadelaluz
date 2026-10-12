import { Group, GroupSession } from '../types';
import { DAY_NAMES_DISPLAY } from './status';

const ICS_DAY_MAP: Record<string, string> = {
  domingo: 'SU',
  lunes: 'MO',
  martes: 'TU',
  miercoles: 'WE',
  jueves: 'TH',
  viernes: 'FR',
  sabado: 'SA',
};

/**
 * Obtiene la próxima fecha para un día de la semana específico
 */
function getNextDateForDay(dayStr: string, timeStr: string): { start: Date; end: Date } {
  const dayIndexMap: Record<string, number> = {
    domingo: 0,
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
  };

  const targetDay = dayIndexMap[dayStr] ?? 1;
  const now = new Date();
  const currentDay = now.getDay();
  let diff = (targetDay - currentDay + 7) % 7;
  if (diff === 0) {
    // Si es hoy, verificar si la hora ya pasó
    const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
    if (now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m)) {
      diff = 7;
    }
  }

  const startDate = new Date(now);
  startDate.setDate(now.getDate() + diff);
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  startDate.setHours(h, m, 0, 0);

  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + 90); // 1.5 horas por defecto si no se especifica

  return { start: startDate, end: endDate };
}

function formatDateToIsoString(d: Date): string {
  return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
}

/**
 * Genera la URL para agregar la sesión a Google Calendar Web
 */
export function getGoogleCalendarUrl(group: Group, session?: GroupSession): string {
  const chosenSession = session || group.sesiones[0];
  if (!chosenSession) return 'https://calendar.google.com';

  const { start } = getNextDateForDay(chosenSession.dia, chosenSession.hora_inicio);
  const [hEnd, mEnd] = (chosenSession.hora_fin || '21:00').split(':').map((v) => parseInt(v, 10) || 0);
  const end = new Date(start);
  end.setHours(hEnd, mEnd, 0, 0);

  const startIso = formatDateToIsoString(start);
  const endIso = formatDateToIsoString(end);

  const title = encodeURIComponent(`Sesión: ${group.nombre} (12 Pasos)`);
  const details = encodeURIComponent(
    `Comunidad Guerreros de la Luz - Sesión de recuperación y apoyo mutuo.\n\n` +
    `Día: ${DAY_NAMES_DISPLAY[chosenSession.dia]} de ${chosenSession.hora_inicio} a ${chosenSession.hora_fin}\n` +
    `Modalidad: ${chosenSession.modalidad.toUpperCase()}\n` +
    (chosenSession.enlace_virtual ? `Enlace virtual: ${chosenSession.enlace_virtual}\n` : '') +
    `Dirección: ${group.direccion}, ${group.colonia}, ${group.municipio}\n` +
    `Referencias: ${group.referencias}\n` +
    `Contacto de servicio: ${group.telefono} | WhatsApp: ${group.whatsapp}\n\n` +
    `"Solo por hoy: un día a la vez"`
  );
  const location = encodeURIComponent(`${group.direccion}, ${group.colonia}, ${group.municipio}, Yucatán, México`);
  const byDay = ICS_DAY_MAP[chosenSession.dia] || 'MO';
  const recur = encodeURIComponent(`RRULE:FREQ=WEEKLY;BYDAY=${byDay}`);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}&recur=${recur}`;
}

/**
 * Genera y descarga un archivo .ics universal para Apple Calendar, Outlook o Google Calendar
 */
export function downloadIcsFile(group: Group, session?: GroupSession): void {
  const chosenSession = session || group.sesiones[0];
  if (!chosenSession) return;

  const { start } = getNextDateForDay(chosenSession.dia, chosenSession.hora_inicio);
  const [hEnd, mEnd] = (chosenSession.hora_fin || '21:00').split(':').map((v) => parseInt(v, 10) || 0);
  const end = new Date(start);
  end.setHours(hEnd, mEnd, 0, 0);

  const startIso = formatDateToIsoString(start);
  const endIso = formatDateToIsoString(end);
  const byDay = ICS_DAY_MAP[chosenSession.dia] || 'MO';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Guerreros de la Luz//Directorio de Grupos//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:gdl-sesion-${group.id}-${chosenSession.dia}@guerrerosdelaluz.org`,
    `DTSTAMP:${formatDateToIsoString(new Date())}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDay}`,
    `SUMMARY:Sesión: ${group.nombre} (12 Pasos)`,
    `DESCRIPTION:Comunidad de apoyo y 12 Pasos Guerreros de la Luz.\\nModalidad: ${chosenSession.modalidad}\\nContacto: ${group.telefono}`,
    `LOCATION:${group.direccion}\\, ${group.colonia}\\, ${group.municipio}\\, Yucatán`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${group.nombre.replace(/[^a-zA-Z0-9]/g, '_')}_sesion.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
