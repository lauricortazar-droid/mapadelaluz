import { AppCustomTexts, ZoneType } from '../types';
import { ZONAS_CONFIG } from '../data/rawFraternidadData';

export interface DynamicZoneInfo {
  code: string;
  icon: string;
  name: string;
  shortName: string;
  line: string;
  region: string;
  color: string;
  border: string;
  bg: string;
}

export function getZoneInfo(zone: string | ZoneType, customTexts?: AppCustomTexts): DynamicZoneInfo {
  const base = ZONAS_CONFIG[zone] || ZONAS_CONFIG.Jaguar;

  switch (zone) {
    case 'Jaguar':
      return {
        ...base,
        shortName: 'Jaguar',
        name: customTexts?.zoneJaguarName || 'Jaguar (Yucatán)',
        line: customTexts?.zoneJaguarLine || base.line,
        region: customTexts?.zoneJaguarRegion || 'Yucatán',
      };
    case 'Tiburón':
      return {
        ...base,
        shortName: 'Tiburón',
        name: customTexts?.zoneTiburonName || 'Tiburón',
        line: customTexts?.zoneTiburonLine || base.line,
        region: customTexts?.zoneTiburonRegion || 'Quintana Roo',
      };
    case 'Delfín':
      return {
        ...base,
        shortName: 'Delfín',
        name: customTexts?.zoneDelfinName || 'Delfín',
        line: customTexts?.zoneDelfinLine || base.line,
        region: customTexts?.zoneDelfinRegion || 'Campeche',
      };
    case 'Águila':
      return {
        ...base,
        shortName: 'Águila',
        name: customTexts?.zoneAguilaName || 'Águila',
        line: customTexts?.zoneAguilaLine || base.line,
        region: customTexts?.zoneAguilaRegion || 'La Laguna',
      };
    case 'Colibrí':
      return {
        ...base,
        shortName: 'Colibrí',
        name: customTexts?.zoneColibriName || 'Colibrí',
        line: customTexts?.zoneColibriLine || base.line,
        region: customTexts?.zoneColibriRegion || 'Puebla / Tlaxcala',
      };
    case 'Teocalli':
    case 'Tocalli':
      return {
        ...base,
        shortName: 'Teocalli',
        name: customTexts?.zoneTocalliName || 'Teocalli',
        line: customTexts?.zoneTocalliLine || 'Unidad Teocalli • Centros de Rehabilitación',
        region: customTexts?.zoneTocalliRegion || '28 Centros de Rehabilitación Hermanos',
      };
    default:
      return {
        code: base?.code || 'ZON',
        icon: base?.icon || '📍',
        shortName: zone,
        name: zone,
        line: base?.line || '',
        region: '',
        color: base?.color || '#3b82f6',
        border: base?.border || 'border-blue-500',
        bg: base?.bg || 'bg-blue-50 text-blue-900',
      };
  }
}
