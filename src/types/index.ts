export type ZoneType = 'Águila' | 'Jaguar' | 'Tiburón' | 'Delfín' | 'Teocalli' | 'Colibrí' | 'Tocalli';

export type GroupType = 'mixto' | 'hombres' | 'mujeres' | 'familiares' | 'jóvenes';

export type SessionDay = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';

export type SessionModality = 'presencial' | 'virtual' | 'hibrido';

export interface GroupSession {
  dia: SessionDay;
  hora_inicio: string; // formato "19:00"
  hora_fin: string;    // formato "20:30"
  modalidad: SessionModality;
  enlace_virtual?: string;
}

export interface Group {
  id: string | number;
  publicCode?: string;
  zone: ZoneType;
  nombre: string;
  tipo: GroupType;
  direccion: string;
  colonia: string;
  municipio: string;
  city?: string;
  referencias: string;
  estacionamiento?: string;
  lat: number;
  lng: number;
  sesiones: GroupSession[];
  schedulesRaw?: string;
  sessionTypesRaw?: string;
  telefono: string;
  whatsapp: string;
  correo: string;
  facebook?: string;
  mapsUrl?: string;
  accesibilidad: string;
  foto_url?: string;
  activo: boolean;
  ultima_actualizacion: string;
  verifiedAt?: string | null;
  // Propiedades calculadas en tiempo de ejecución
  distanceKm?: number;
  durationMinutes?: number;
}

export interface RehabCenter {
  n: number;
  name: string;
  network: string; // 'La Legión', 'Gladiadores', 'Amazonas', 'Familia Fénix', etc.
  state: string;
  city: string;
  address: string;
  responsibleName: string;
  phone: string;
  whatsapp: string;
  description: string;
  services: string;
  population: string;
  includes: string;
  mapsUrl: string;
  facebookUrl?: string;
  generalInfo: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  durationMinutes?: number;
}

export interface LeaderProposal {
  id: string;
  groupId: string | number;
  groupName: string;
  authorName: string;
  authorRole: string; // e.g. "Coordinador", "Secretario", "Líder de Grupo", "Servidor"
  authorWhatsapp: string;
  proposedName?: string;
  proposedZone?: ZoneType;
  proposedAddress?: string;
  proposedCity?: string;
  proposedSchedules?: string;
  proposedSessionTypes?: string;
  proposedWhatsapp?: string;
  proposedFacebook?: string;
  proposedMapsUrl?: string;
  notes?: string;
  photoBase64?: string;
  photoName?: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  createdAt: string;
  reviewedAt?: string;
}

export interface GroupStatus {
  isOpenNow: boolean;
  isToday: boolean;
  label: string;
  sublabel: string;
  statusType: 'open-now' | 'today' | 'upcoming';
  nextSessionDate?: Date;
}

export interface FilterState {
  search: string;
  zone: '' | ZoneType;
  day: string; // '' | SessionDay
  timeOfDay: '' | 'manana' | 'tarde' | 'noche';
  type: '' | GroupType;
  modality: '' | SessionModality;
  openToday: boolean;
  openNow: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
  descripcion?: string;
  link?: string;
}

export interface AppCustomTexts {
  appTitle: string;
  appSubtitle: string;
  badgeText: string;
  topBannerText: string;
  helpButtonText: string;
  generalPhone: string;
  generalWhatsapp: string;
  generalFacebook: string;
  tabGroupsText: string;
  tabCentersText: string;
  calendarButtonText: string;
  cardRouteBtnText: string;
  cardWaBtnText: string;
  cardFbBtnText: string;
  cardDetailsBtnText: string;
  cardProposeBtnText: string;
  rehabSectionTitle: string;
  rehabSectionSubtitle: string;
  footerMotto: string;
  // Personalización del ícono oficial en PNG
  customLogoPngUrl?: string;
  // Configuración del Calendario General (solamente lo escrito por admin o vinculado a Google Calendar)
  calendarMode?: 'manual' | 'google' | 'both';
  calendarGoogleUrl?: string;
  calendarGoogleCid?: string;
  calendarManualEvents?: CalendarEvent[];
  // Botones y etiquetas del filtro de Zona
  zoneAllButtonText?: string;
  zoneFilterLabel?: string;
  // Zona Jaguar
  zoneJaguarName?: string;
  zoneJaguarLine: string;
  zoneJaguarRegion?: string;
  // Zona Tiburón
  zoneTiburonName?: string;
  zoneTiburonLine: string;
  zoneTiburonRegion?: string;
  // Zona Delfín
  zoneDelfinName?: string;
  zoneDelfinLine: string;
  zoneDelfinRegion?: string;
  // Zona Águila
  zoneAguilaName?: string;
  zoneAguilaLine: string;
  zoneAguilaRegion?: string;
  // Zona Colibrí
  zoneColibriName?: string;
  zoneColibriLine: string;
  zoneColibriRegion?: string;
  // Zona Tocalli
  zoneTocalliName?: string;
  zoneTocalliLine: string;
  zoneTocalliRegion?: string;
}
