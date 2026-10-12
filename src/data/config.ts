/**
 * Configuración central de la aplicación
 * "Encuentra tu Grupo – Guerreros de la Luz"
 * Fraternidad de apoyo y crecimiento personal (12 Pasos), Mérida, Yucatán, México.
 */

import { AppCustomTexts } from '../types';

export const APP_CONFIG = {
  // Clave de API de Google Maps JavaScript
  // Se obtiene de variables de entorno de Vite o respaldo
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Map ID requerido para AdvancedMarkerElement (usamos DEMO_MAP_ID o un ID de Cloud console)
  MAP_ID: 'DEMO_MAP_ID',

  // Ubicación central inicial: Mérida, Yucatán, México
  DEFAULT_CENTER: {
    lat: 20.9701,
    lng: -89.6231,
  },
  DEFAULT_ZOOM: 12,

  // Datos de contacto general y línea de crisis / acompañamiento 24/7
  TELEFONO_GENERAL: '+52 999 923 4567',
  WHATSAPP_GENERAL: '+529999234567',
  CORREO_GENERAL: 'contacto@guerrerosdelaluz.org',
  FACEBOOK_GENERAL: 'https://www.facebook.com/guerrerosdelaluzmerida',
  
  // URL de Google Forms para personas que desean asistir o pedir información personalizada
  FORM_ASISTENCIA_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_ASISTENCIA/viewform',

  // URL de Google Forms para coordinadores y servidores de grupo (para altas o actualizaciones)
  FORM_COORDINADORES_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSc_EXAMPLE_COORDINADORES/viewform',

  // ID o enlace de suscripción al Google Calendar general de la Fraternidad
  CALENDAR_ID: 'gdll.agenda@gmail.com',
  CALENDAR_PUBLIC_URL: 'https://calendar.google.com/calendar/embed?src=gdll.agenda%40gmail.com&ctz=America%2FMerida',

  // URL de Google Sheets publicada como CSV (para sincronización dinámica de grupos)
  SHEETS_CSV_URL: import.meta.env.VITE_SHEETS_CSV_URL || '',

  // Nombre y lema de la Fraternidad
  COMMUNITY_NAME: 'Guerreros de la Luz',
  COMMUNITY_SUBTITLE: 'Fraternidad de Apoyo Mutuo y Recuperación en 12 Pasos',
  COMMUNITY_MOTTO: 'Solo por hoy: la luz de la verdad disipa toda oscuridad',
};

export const DEFAULT_CUSTOM_TEXTS: AppCustomTexts = {
  appTitle: 'Guerreros de la Luz',
  appSubtitle: 'Directorio y Mapa Oficial • Red de Autoayuda y Centros Hermanos',
  badgeText: 'A.C.',
  topBannerText: 'Fraternidad de 12 Pasos Guerreros de la Luz A.C. • Sesiones 100% gratuitas y confidenciales • “Solo por hoy”',
  helpButtonText: 'Necesito ayuda ahora',
  generalPhone: '+52 999 923 4567',
  generalWhatsapp: '529999234567',
  generalFacebook: 'https://www.facebook.com/guerrerosdelaluzmerida',
  tabGroupsText: 'Grupos de Autoayuda',
  tabCentersText: 'Centros de Rehabilitación Hermanos',
  calendarButtonText: 'Calendario General',
  cardRouteBtnText: 'Ruta Maps',
  cardWaBtnText: 'WhatsApp',
  cardFbBtnText: 'FB',
  cardDetailsBtnText: 'Ficha',
  cardProposeBtnText: 'Proponer',
  rehabSectionTitle: 'Red de Centros de Rehabilitación Hermanos (28 Centros Aliados)',
  rehabSectionSubtitle: 'Los centros de rehabilitación aliados ofrecen acompañamiento residencial estructurado e internamiento para personas que requieren contención intensiva antes o durante su integración a los grupos de autoayuda de 12 Pasos.',
  footerMotto: '“Solo por hoy: un paso a la vez hacia la luz.”',
  customLogoPngUrl: '',
  calendarMode: 'both',
  calendarGoogleCid: 'gdll.agenda@gmail.com',
  calendarGoogleUrl: '',
  calendarManualEvents: [],
  zoneAllButtonText: 'Todas',
  zoneFilterLabel: 'Zona:',
  zoneJaguarName: 'Jaguar (Yucatán)',
  zoneJaguarLine: 'Fuerza y servicio',
  zoneJaguarRegion: 'Yucatán',
  zoneTiburonName: 'Tiburón',
  zoneTiburonLine: 'Determinación',
  zoneTiburonRegion: 'Quintana Roo',
  zoneDelfinName: 'Delfín',
  zoneDelfinLine: 'Renacimiento',
  zoneDelfinRegion: 'Campeche',
  zoneAguilaName: 'Águila',
  zoneAguilaLine: 'Visión elevada',
  zoneAguilaRegion: 'La Laguna',
  zoneColibriName: 'Colibrí',
  zoneColibriLine: 'Transformación',
  zoneColibriRegion: 'Puebla / Tlaxcala',
  zoneTocalliName: 'Teocalli',
  zoneTocalliLine: 'Unidad Teocalli • Centros de Rehabilitación',
  zoneTocalliRegion: '28 Centros de Rehabilitación Hermanos',
};

