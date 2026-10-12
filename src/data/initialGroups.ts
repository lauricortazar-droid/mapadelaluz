import { Group, GroupSession, GroupType, SessionDay, ZoneType } from '../types';
import { RAW_GRUPOS, RAW_CENTROS } from './rawFraternidadData';

/**
 * Convierte un texto descriptivo de horarios a sesiones estructuradas
 */
function parseScheduleTextToSessions(schedText: string): GroupSession[] {
  const text = (schedText || '').toLowerCase();
  const sessions: GroupSession[] = [];

  const defaultStart = '20:00';
  const defaultEnd = '22:00';

  let start = defaultStart;
  let end = defaultEnd;

  if (text.includes('7 a 9') || text.includes('7:00 a 9:00') || text.includes('7pm') || text.includes('19:00')) {
    start = '19:00';
    end = '21:00';
  } else if (text.includes('8:30') || text.includes('8 30')) {
    start = '20:30';
    end = '22:30';
  } else if (text.includes('7:30')) {
    start = '19:30';
    end = '21:30';
  } else if (text.includes('10:00') || text.includes('10 a 11:30') || text.includes('10:30')) {
    start = '10:00';
    end = '11:30';
  }

  const allDays: SessionDay[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  if (text.includes('todos los dias') || text.includes('todos los días') || text.includes('lunes a domingo') || text.includes('de lunes a domingo')) {
    allDays.forEach((d) => sessions.push({ dia: d, hora_inicio: start, hora_fin: end, modalidad: 'presencial' }));
  } else if (text.includes('lunes a sabado') || text.includes('lunes a sábado') || text.includes('de lunes a sabado') || text.includes('de lunes a sábado')) {
    allDays.slice(0, 6).forEach((d) => sessions.push({ dia: d, hora_inicio: start, hora_fin: end, modalidad: 'presencial' }));
  } else if (text.includes('lunes a viernes') || text.includes('de lunes a viernes')) {
    allDays.slice(0, 5).forEach((d) => sessions.push({ dia: d, hora_inicio: start, hora_fin: end, modalidad: 'presencial' }));
  } else {
    // Buscar días específicos
    if (text.includes('lunes')) sessions.push({ dia: 'lunes', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('martes')) sessions.push({ dia: 'martes', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('miercoles') || text.includes('miércoles')) sessions.push({ dia: 'miercoles', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('jueves')) sessions.push({ dia: 'jueves', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('viernes')) sessions.push({ dia: 'viernes', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('sabado') || text.includes('sábado')) sessions.push({ dia: 'sabado', hora_inicio: start, hora_fin: end, modalidad: 'presencial' });
    if (text.includes('domingo')) sessions.push({ dia: 'domingo', hora_inicio: '10:00', hora_fin: '12:00', modalidad: 'presencial' });
  }

  // Si no se pudo deducir ningún día, asignar lunes a viernes por defecto
  if (sessions.length === 0) {
    allDays.slice(0, 5).forEach((d) => sessions.push({ dia: d, hora_inicio: '20:00', hora_fin: '22:00', modalidad: 'presencial' }));
  }

  return sessions;
}

function deduceGroupType(sessionTypes: string, name: string): GroupType {
  const t = `${sessionTypes} ${name}`.toLowerCase();
  if (t.includes('mujeres') || t.includes('fem')) return 'mujeres';
  if (t.includes('hombres')) return 'hombres';
  if (t.includes('jóvenes') || t.includes('jovenes') || t.includes('alateen') || t.includes('adn')) return 'jóvenes';
  if (t.includes('familia') || t.includes('familiares')) return 'familiares';
  return 'mixto';
}

const ZONE_PRIORITY: Record<string, number> = {
  'Jaguar': 1, // Yucatán (Mérida, etc.) primero en "Todas"
  'Tiburón': 2,
  'Delfín': 3,
  'Águila': 4,
  'Colibrí': 5,
  'Teocalli': 6,
  'Tocalli': 6,
};

const SORTED_RAW_GRUPOS = [...RAW_GRUPOS].sort((a, b) => {
  const pA = ZONE_PRIORITY[a.zone] || 99;
  const pB = ZONE_PRIORITY[b.zone] || 99;
  if (pA !== pB) return pA - pB;
  return a.id - b.id;
});

/**
 * 119 Grupos de autoayuda tradicionales
 */
const GRUPOS_TRADICIONALES: Group[] = SORTED_RAW_GRUPOS.map((raw) => {
  const cityParts = (raw.city || '').split(',').map((s) => s.trim()).filter(Boolean);
  const municipio = cityParts[0] || (raw.zone === 'Jaguar' ? 'Mérida' : raw.zone === 'Tiburón' ? 'Playa del Carmen' : raw.zone === 'Delfín' ? 'Cd. del Carmen' : raw.zone === 'Águila' ? 'Torreón' : 'Toluca');
  const colonia = raw.address.includes('col') || raw.address.includes('Col')
    ? (raw.address.match(/(?:colonia|col\.)\s*([^,\.]+)/i)?.[1]?.trim() || 'Centro')
    : 'Centro';

  return {
    id: raw.publicCode || `grp-${raw.id}`,
    publicCode: raw.publicCode,
    zone: raw.zone as ZoneType,
    nombre: `Grupo ${raw.name}`,
    tipo: deduceGroupType(raw.sessionTypes, raw.name),
    direccion: raw.address || `Calle Principal S/N, ${municipio}`,
    colonia: colonia,
    municipio: municipio,
    city: raw.city,
    referencias: raw.address ? `Ubicado en ${raw.address}` : 'Comuníquese por WhatsApp para referencias de acceso.',
    estacionamiento: 'Estacionamiento sobre la vía pública.',
    lat: raw.lat || 20.9701,
    lng: raw.lng || -89.6231,
    sesiones: parseScheduleTextToSessions(raw.schedules),
    schedulesRaw: raw.schedules || 'Lunes a viernes de 8:00 a 10:00 p. m.',
    sessionTypesRaw: raw.sessionTypes || 'Sesión Principal (dos Horas por la Noche)',
    telefono: raw.whatsapp ? `+52 ${raw.whatsapp}` : '+52 999 923 4567',
    whatsapp: raw.whatsapp ? (raw.whatsapp.length === 10 ? `52${raw.whatsapp}` : raw.whatsapp) : '529999234567',
    correo: 'contacto@guerrerosdelaluz.org',
    facebook: raw.facebook || undefined,
    mapsUrl: raw.mapsUrl || undefined,
    accesibilidad: 'Acceso en planta baja.',
    foto_url: undefined,
    activo: raw.status === 'active',
    ultima_actualizacion: '2026-10-08',
    verifiedAt: raw.verifiedAt,
  };
});

/**
 * 28 Centros de Rehabilitación Hermanos copiados a la etiqueta de zona "Teocalli" (Unidad Teocalli)
 */
export const REHAB_CENTERS_AS_TEOCALLI_GROUPS: Group[] = RAW_CENTROS.map((raw, idx) => {
  const city = raw.city || 'Mérida';
  const state = raw.state || 'Yucatán';
  const fullCity = `${city}, ${state}`;
  const colonia = raw.address.includes('Col')
    ? (raw.address.match(/(?:colonia|col\.)\s*([^,\.]+)/i)?.[1]?.trim() || 'Centro')
    : 'Centro';

  const centerName = raw.name.toLowerCase().startsWith('centro') ||
    raw.name.toLowerCase().startsWith('clínica') ||
    raw.name.toLowerCase().startsWith('casa')
      ? raw.name
      : `Centro ${raw.name}`;

  return {
    id: `rehab-teo-${raw.n || idx + 1}`,
    publicCode: `FGDLL-TEO-${String(raw.n || idx + 1).padStart(3, '0')}`,
    zone: 'Teocalli' as ZoneType,
    nombre: centerName,
    tipo: 'mixto',
    direccion: raw.address || `Instalaciones residenciales en ${fullCity}`,
    colonia,
    municipio: city,
    city: fullCity,
    referencias: `Unidad Teocalli • Centro de Rehabilitación y Acompañamiento Residencial. ${raw.generalInfo || raw.description || ''}`.trim(),
    estacionamiento: 'Instalaciones con área de acceso y estacionamiento vehicular.',
    lat: raw.lat || 20.9701 + (idx % 6) * 0.008,
    lng: raw.lng || -89.6231 - (idx % 6) * 0.008,
    sesiones: [
      { dia: 'lunes', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'martes', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'miercoles', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'jueves', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'viernes', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'sabado', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
      { dia: 'domingo', hora_inicio: '00:00', hora_fin: '23:59', modalidad: 'presencial' },
    ],
    schedulesRaw: 'Atención Residencial 24 Horas • Unidad Teocalli',
    sessionTypesRaw: 'Centro de Rehabilitación, Internamiento Estructurado y Acompañamiento 12 Pasos',
    telefono: raw.phone ? `+52 ${raw.phone}` : '+52 999 923 4567',
    whatsapp: raw.whatsapp ? (raw.whatsapp.length === 10 ? `52${raw.whatsapp}` : raw.whatsapp) : (raw.phone ? (raw.phone.length === 10 ? `52${raw.phone}` : raw.phone) : '529999234567'),
    correo: 'contacto@guerrerosdelaluz.org',
    facebook: raw.facebookUrl || undefined,
    mapsUrl: raw.mapsUrl || undefined,
    accesibilidad: 'Instalaciones residenciales con acompañamiento permanente.',
    foto_url: undefined,
    activo: true,
    ultima_actualizacion: '2026-10-08',
    verifiedAt: '2026-08-15 (Directorio Teocalli)',
  };
});

/**
 * Padrón Integral de Grupos y Centros de la Fraternidad:
 * 119 grupos de autoayuda + 28 centros de rehabilitación copiados a la zona Teocalli
 */
export const INITIAL_GROUPS: Group[] = [
  ...GRUPOSTRADICIONALES_SAFE(),
  ...REHAB_CENTERS_AS_TEOCALLI_GROUPS,
];

function GRUPOSTRADICIONALES_SAFE(): Group[] {
  return GRUPOS_TRADICIONALES;
}
