import { Group, GroupSession, GroupStatus, SessionDay } from '../types';

const DAYS_ORDER: SessionDay[] = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
];

const DAY_NAMES_DISPLAY: Record<SessionDay, string> = {
  domingo: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
};

/**
 * Obtiene la fecha y hora actual en la zona horaria de Mérida, Yucatán (America/Merida / UTC-6)
 */
export function getMeridaCurrentDate(): {
  dayName: SessionDay;
  minutesNow: number;
  timeString: string;
  now: Date;
} {
  const now = new Date();
  
  // Usar Intl.DateTimeFormat para Mérida, Yucatán
  const dtf = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Merida',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = dtf.formatToParts(now);
  let weekdayStr = '';
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === 'weekday') weekdayStr = part.value.toLowerCase();
    if (part.type === 'hour') hour = parseInt(part.value, 10);
    if (part.type === 'minute') minute = parseInt(part.value, 10);
  }

  // Normalizar acentos
  weekdayStr = weekdayStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let matchedDay: SessionDay = 'lunes';
  for (const d of DAYS_ORDER) {
    if (weekdayStr.includes(d)) {
      matchedDay = d;
      break;
    }
  }

  const minutesNow = hour * 60 + minute;
  const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  return { dayName: matchedDay, minutesNow, timeString, now };
}

/**
 * Convierte "HH:mm" a minutos desde las 00:00
 */
export function timeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

/**
 * Formatea hora "19:30" a formato legible "7:30 pm"
 */
export function formatTimeFriendly(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  const mFmt = m === 0 ? '' : `:${m.toString().padStart(2, '0')}`;
  return `${h}${mFmt} ${ampm}`;
}

/**
 * Calcula el estado de un grupo respecto al momento actual
 */
export function getGroupStatus(group: Group): GroupStatus {
  if (!group.activo || !group.sesiones || group.sesiones.length === 0) {
    return {
      isOpenNow: false,
      isToday: false,
      label: 'Sin sesiones activas',
      sublabel: 'Consulte con el coordinador de servicio',
      statusType: 'upcoming',
    };
  }

  const { dayName: currentDay, minutesNow } = getMeridaCurrentDate();
  const currentDayIndex = DAYS_ORDER.indexOf(currentDay);

  // 1. Verificar si está en sesión ahora mismo
  for (const sesion of group.sesiones) {
    if (sesion.dia === currentDay) {
      const startMin = timeStringToMinutes(sesion.hora_inicio);
      const endMin = timeStringToMinutes(sesion.hora_fin);

      if (minutesNow >= startMin && minutesNow <= endMin) {
        return {
          isOpenNow: true,
          isToday: true,
          label: 'En sesión ahora',
          sublabel: `Hasta las ${formatTimeFriendly(sesion.hora_fin)} (${sesion.modalidad})`,
          statusType: 'open-now',
        };
      }
    }
  }

  // 2. Verificar si tiene una sesión hoy más tarde
  const sessionsToday = group.sesiones.filter((s) => s.dia === currentDay);
  const futureSessionsToday = sessionsToday
    .filter((s) => timeStringToMinutes(s.hora_inicio) > minutesNow)
    .sort((a, b) => timeStringToMinutes(a.hora_inicio) - timeStringToMinutes(b.hora_inicio));

  if (futureSessionsToday.length > 0) {
    const nextToday = futureSessionsToday[0];
    return {
      isOpenNow: false,
      isToday: true,
      label: `Sesiona hoy a las ${formatTimeFriendly(nextToday.hora_inicio)}`,
      sublabel: `${formatTimeFriendly(nextToday.hora_inicio)} a ${formatTimeFriendly(nextToday.hora_fin)} (${nextToday.modalidad})`,
      statusType: 'today',
    };
  }

  // 3. Buscar la próxima sesión más cercana en los siguientes 7 días
  let bestDiffDays = 8;
  let bestSession: GroupSession | null = null;

  for (const sesion of group.sesiones) {
    const sessionDayIndex = DAYS_ORDER.indexOf(sesion.dia);
    let diffDays = (sessionDayIndex - currentDayIndex + 7) % 7;
    if (diffDays === 0) {
      // Si fue hoy pero ya pasó, toca la siguiente semana (7 días)
      diffDays = 7;
    }

    if (diffDays < bestDiffDays) {
      bestDiffDays = diffDays;
      bestSession = sesion;
    } else if (diffDays === bestDiffDays && bestSession) {
      if (timeStringToMinutes(sesion.hora_inicio) < timeStringToMinutes(bestSession.hora_inicio)) {
        bestSession = sesion;
      }
    }
  }

  if (bestSession) {
    const dayLabel = bestDiffDays === 1 ? 'mañana' : DAY_NAMES_DISPLAY[bestSession.dia];
    return {
      isOpenNow: false,
      isToday: false,
      label: `Próxima: ${dayLabel} ${formatTimeFriendly(bestSession.hora_inicio)}`,
      sublabel: `${DAY_NAMES_DISPLAY[bestSession.dia]} ${formatTimeFriendly(bestSession.hora_inicio)} - ${formatTimeFriendly(bestSession.hora_fin)}`,
      statusType: 'upcoming',
    };
  }

  return {
    isOpenNow: false,
    isToday: false,
    label: 'Sin horario próximo',
    sublabel: 'Consulte datos de contacto',
    statusType: 'upcoming',
  };
}

export { DAY_NAMES_DISPLAY, DAYS_ORDER };
