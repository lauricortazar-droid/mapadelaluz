import { Group, GroupSession, GroupType, SessionDay, SessionModality } from '../types';
import { INITIAL_GROUPS } from '../data/initialGroups';

const STORAGE_KEY = 'gdl_groups_cache_v1';

/**
 * Parsea una cadena CSV simple respetando comillas básicas
 */
function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const row: string[] = [];
    let insideQuotes = false;
    let field = '';

    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        insideQuotes = !insideQuotes;
      } else if (c === ',' && !insideQuotes) {
        row.push(field.trim());
        field = '';
      } else {
        field += c;
      }
    }
    row.push(field.trim());
    return row;
  });
}

/**
 * Parsea el campo de sesiones en formato:
 * "lunes 19:30-21:00 presencial; miercoles 19:30-21:00 presencial; viernes 19:30-21:00 hibrido|https://meet..."
 */
function parseSessionsField(raw: string): GroupSession[] {
  if (!raw) return [];
  const entries = raw.split(';').map((s) => s.trim()).filter(Boolean);
  const results: GroupSession[] = [];

  for (const entry of entries) {
    const [schedulePart, virtualUrl] = entry.split('|').map((s) => s.trim());
    const tokens = schedulePart.split(/\s+/);
    if (tokens.length >= 2) {
      const day = tokens[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') as SessionDay;
      const hours = tokens[1] || '19:00-20:30';
      const [start, end] = hours.split('-');
      const modality = (tokens[2]?.toLowerCase() || 'presencial') as SessionModality;

      results.push({
        dia: day,
        hora_inicio: start || '19:00',
        hora_fin: end || '20:30',
        modalidad: modality === 'virtual' || modality === 'hibrido' ? modality : 'presencial',
        enlace_virtual: virtualUrl || undefined,
      });
    }
  }

  return results;
}

/**
 * Carga los grupos desde una hoja de Google Sheets publicada en CSV
 * o retorna los grupos iniciales locales si falla o no está configurada
 */
export async function loadGroupsFromSheets(sheetsCsvUrl?: string): Promise<{
  groups: Group[];
  fromSheet: boolean;
  error?: string;
}> {
  if (!sheetsCsvUrl) {
    // Intentar leer de caché o usar INITIAL_GROUPS
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { groups: parsed, fromSheet: false };
        }
      } catch {
        // Ignorar error de caché
      }
    }
    return { groups: INITIAL_GROUPS, fromSheet: false };
  }

  try {
    const res = await fetch(sheetsCsvUrl, { cache: 'no-cache' });
    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status}`);
    }
    const text = await res.text();
    const rows = parseCSV(text);
    if (rows.length < 2) {
      throw new Error('La hoja de cálculo no contiene datos válidos');
    }

    const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    const groups: Group[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const getVal = (field: string) => {
        const idx = headers.findIndex((h) => h.includes(field));
        return idx !== -1 ? row[idx] || '' : '';
      };

      const nombre = getVal('nombre');
      if (!nombre) continue;

      const lat = parseFloat(getVal('lat')) || 20.97;
      const lng = parseFloat(getVal('lng')) || -89.62;
      const sesionesRaw = getVal('sesiones') || getVal('horarios');
      const tipo = (getVal('tipo') || 'mixto').toLowerCase() as GroupType;
      const zoneRaw = getVal('zone') || getVal('zona') || 'Jaguar';

      groups.push({
        id: getVal('id') || `sheet-grp-${i}`,
        zone: ['Águila', 'Jaguar', 'Tiburón', 'Delfín', 'Tocalli', 'Colibrí'].includes(zoneRaw) ? (zoneRaw as any) : 'Jaguar',
        nombre,
        tipo: ['hombres', 'mujeres', 'mixto', 'familiares', 'jóvenes'].includes(tipo) ? tipo : 'mixto',
        direccion: getVal('direccion') || 'Mérida, Yucatán',
        colonia: getVal('colonia') || 'Centro',
        municipio: getVal('municipio') || 'Mérida',
        referencias: getVal('referencias') || 'Comuníquese para referencias de acceso.',
        estacionamiento: getVal('estacionamiento') || 'Estacionamiento en vía pública.',
        lat,
        lng,
        sesiones: parseSessionsField(sesionesRaw),
        telefono: getVal('telefono') || '+52 999 923 4567',
        whatsapp: getVal('whatsapp') || '+529999234567',
        correo: getVal('correo') || 'contacto@guerrerosdelaluz.org',
        accesibilidad: getVal('accesibilidad') || 'Planta baja.',
        foto_url: getVal('foto') || undefined,
        activo: getVal('activo').toLowerCase() !== 'false',
        ultima_actualizacion: getVal('actualizacion') || new Date().toISOString().split('T')[0],
      });
    }

    if (groups.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
      return { groups, fromSheet: true };
    }

    return { groups: INITIAL_GROUPS, fromSheet: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Error al conectar con Google Sheets';
    return { groups: INITIAL_GROUPS, fromSheet: false, error: errorMsg };
  }
}
