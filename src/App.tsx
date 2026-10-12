import React, { useState, useEffect, useMemo } from 'react';
import { Group, RehabCenter, LeaderProposal, FilterState, ZoneType, AppCustomTexts } from './types';
import { INITIAL_GROUPS } from './data/initialGroups';
import { RAW_CENTROS } from './data/rawFraternidadData';
import { APP_CONFIG, DEFAULT_CUSTOM_TEXTS } from './data/config';
import { calculateDistanceKm, estimateDurationMinutes } from './utils/distance';
import { getGroupStatus, timeStringToMinutes, getMeridaCurrentDate } from './utils/status';

// Componentes UI
import { QuotaBanner } from './components/QuotaBanner';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { GroupCard } from './components/GroupCard';
import { MapView } from './components/MapView';
import { GroupDetailModal } from './components/GroupDetailModal';
import { HelpBannerModal } from './components/HelpBannerModal';
import { ContactFormModal } from './components/ContactFormModal';
import { CoordinatorsModal } from './components/CoordinatorsModal';
import { GeneralCalendarModal } from './components/GeneralCalendarModal';
import { LeaderProposalModal } from './components/LeaderProposalModal';
import { AdminModal } from './components/AdminModal';
import { CsvUploaderModal } from './components/CsvUploaderModal';
import { RehabCentersView } from './components/RehabCentersView';
import { Footer } from './components/Footer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingTourModal } from './components/OnboardingTourModal';
import { GoogleWorkspaceModal } from './components/GoogleWorkspaceModal';
import { CreateGroupModal } from './components/CreateGroupModal';
import { DriveSyncBar } from './components/DriveSyncBar';

// Servicios de persistencia local-first y sincronización Google Drive
import {
  loadInitialGroupsWithLocalEdits,
  saveGroupLocally,
  deleteGroupLocally,
  mergeFirestoreWithLocalEdits,
  flushPendingFirestoreSync,
} from './services/groupStorageService';
import { useDriveAutoSync } from './hooks/useDriveAutoSync';

// Firebase y Cloud Firestore Sync
import {
  auth,
  initAuth,
  subscribeToGroups,
  saveGroupToFirestore,
  deleteGroupFromFirestore,
  subscribeToProposals,
  submitProposalToFirestore,
  updateProposalStatusInFirestore
} from './lib/firebase';

// Iconos
import { SearchX, Building2, Users, Plus } from 'lucide-react';

const STORAGE_GROUPS_KEY = 'gdll_directory_groups_v3';
const STORAGE_PROPOSALS_KEY = 'gdll_leader_proposals_v1';
const STORAGE_CUSTOM_TEXTS_KEY = 'gdll_custom_texts_v2';
const STORAGE_ADMIN_PASSWORD_KEY = 'gdll_admin_pwd_v1';
const STORAGE_ONBOARDING_SEEN_KEY = 'gdll_onboarding_tour_seen_v1';
const DEFAULT_ADMIN_PASSWORD = '1234';

export default function App() {
  // Lista de grupos con persistencia garantizada que nunca pierde ediciones previas
  const [allGroups, setAllGroups] = useState<Group[]>(() => {
    return loadInitialGroupsWithLocalEdits();
  });

  // Lista de 28 Centros de Rehabilitación Hermanos
  const [rehabCenters, setRehabCenters] = useState<RehabCenter[]>(() => {
    return RAW_CENTROS.map((c) => ({
      ...c,
      lat: c.lat || 20.97,
      lng: c.lng || -89.62,
    }));
  });

  // Lista de propuestas de líderes
  const [proposals, setProposals] = useState<LeaderProposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROPOSALS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Pestaña principal: 'grupos' (119 de autoayuda) o 'centros' (28 centros de rehabilitación)
  const [activeMainTab, setActiveMainTab] = useState<'grupos' | 'centros'>('grupos');

  // Selección activa
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<RehabCenter | null>(null);
  const [modalGroup, setModalGroup] = useState<Group | null>(null);

  // Modo y sesión de Administradora
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminEditingTargetGroup, setAdminEditingTargetGroup] = useState<Group | null>(null);
  const [modalGroupInitialEdit, setModalGroupInitialEdit] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Sincronización continua de respaldo en Google Drive cada 1 minuto
  const driveSync = useDriveAutoSync({
    groups: allGroups,
    isAdmin: isAdminLoggedIn,
  });

  // Clave de Administradora protegida y configurable
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_PASSWORD_KEY);
      if (saved && saved.trim()) return saved;
    } catch {}
    return DEFAULT_ADMIN_PASSWORD;
  });

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    try {
      localStorage.setItem(STORAGE_ADMIN_PASSWORD_KEY, newPass);
    } catch {}
  };

  // Propuesta de líderes modal
  const [isLeaderProposalOpen, setIsLeaderProposalOpen] = useState(false);
  const [proposalTargetGroup, setProposalTargetGroup] = useState<Group | null>(null);

  // Personalización de textos de toda la aplicación (editable por administradora)
  const [customTexts, setCustomTexts] = useState<AppCustomTexts>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_TEXTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.zoneAllButtonText && parsed.zoneAllButtonText.toLowerCase().includes('jaguar')) {
          parsed.zoneAllButtonText = 'Todas';
        }
        return { ...DEFAULT_CUSTOM_TEXTS, ...parsed };
      }
    } catch {}
    return DEFAULT_CUSTOM_TEXTS;
  });

  const [adminInitialTab, setAdminInitialTab] = useState<'editor' | 'proposals' | 'tools' | 'customize'>('editor');

  // Subir CSV modal
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Otros modales
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCoordinatorsOpen, setIsCoordinatorsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactGroupTarget, setContactGroupTarget] = useState<Group | null>(null);

  // Google Workspace Hub Modal (Drive, Forms, Contacts)
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  // Sincronización en tiempo real con Firebase Firestore
  useEffect(() => {
    // Intentar subir grupos pendientes al conectarse
    flushPendingFirestoreSync().catch(() => {});

    // 1. Grupos públicos: fusión inteligente que protege ediciones locales recientes
    const unsubGroups = subscribeToGroups(
      (firestoreGroups) => {
        if (Array.isArray(firestoreGroups) && firestoreGroups.length > 0) {
          setAllGroups((current) => mergeFirestoreWithLocalEdits(firestoreGroups, current));
        }
      },
      (err) => console.log('Firestore offline / usando datos locales asegurados:', err.message)
    );

    // 2. Propuestas de líderes: protegidas bajo rol de administración
    let unsubProposals: (() => void) | null = null;
    const unsubAuth = initAuth((user) => {
      const isGoogleAdmin = user?.email === 'gdll.agenda@gmail.com' && user?.emailVerified;
      if (isGoogleAdmin || isAdminLoggedIn) {
        if (!unsubProposals) {
          unsubProposals = subscribeToProposals(
            (firestoreProposals) => {
              if (Array.isArray(firestoreProposals)) {
                setProposals(firestoreProposals);
              }
            },
            (err) => console.log('Firestore proposals offline:', err.message)
          );
        }
      } else {
        if (unsubProposals) {
          unsubProposals();
          unsubProposals = null;
        }
      }
    });

    return () => {
      unsubGroups();
      if (unsubProposals) unsubProposals();
      unsubAuth();
    };
  }, [isAdminLoggedIn]);

  // Tutorial de inicio (Onboarding Tour) - Se muestra sólo una vez para nuevos usuarios
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    try {
      const seen = localStorage.getItem(STORAGE_ONBOARDING_SEEN_KEY);
      return !seen;
    } catch {
      return false;
    }
  });

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(STORAGE_ONBOARDING_SEEN_KEY, 'true');
    } catch {}
  };

  const handleOpenOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  // Geolocalización del usuario
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | undefined>(undefined);

  // Vista en móvil ('list' | 'map')
  const [mobileView, setMobileView] = useState<'map' | 'list'>('list');

  // Filtros de búsqueda para grupos
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    zone: '',
    day: '',
    timeOfDay: '',
    type: '',
    modality: '',
    openToday: false,
    openNow: false,
  });

  // Guardar grupos en localStorage cada vez que se actualicen
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(allGroups));
    } catch {}
  }, [allGroups]);

  // Guardar propuestas en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROPOSALS_KEY, JSON.stringify(proposals));
    } catch {}
  }, [proposals]);

  // Guardar personalización de textos en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_TEXTS_KEY, JSON.stringify(customTexts));
    } catch {}
  }, [customTexts]);

  const handleSaveCustomTexts = (newTexts: AppCustomTexts) => {
    setCustomTexts(newTexts);
  };

  const handleResetCustomTexts = () => {
    setCustomTexts(DEFAULT_CUSTOM_TEXTS);
  };

  // Manejo de login de administradora
  const handleAdminLogin = (password: string) => {
    if (password === adminPassword) {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
  };

  // Función para solicitar ubicación "Cerca de mí"
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.');
      return;
    }

    setIsLocating(true);
    setLocationError(undefined);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Permiso de ubicación denegado. Puedes buscar tu colonia o zona manualmente.');
        } else {
          setLocationError('No se pudo determinar tu ubicación exacta.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Grupos enriquecidos con distancias
  const groupsWithDistance = useMemo(() => {
    return allGroups.map((group) => {
      if (!userLocation) return group;
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, group.lat, group.lng);
      const duration = estimateDurationMinutes(dist);
      return {
        ...group,
        distanceKm: dist,
        durationMinutes: duration,
      };
    });
  }, [allGroups, userLocation]);

  // Centros de rehabilitación enriquecidos con distancias
  const rehabCentersWithDistance = useMemo(() => {
    return rehabCenters.map((c) => {
      if (!userLocation) return c;
      const dist = calculateDistanceKm(userLocation.lat, userLocation.lng, c.lat, c.lng);
      const duration = estimateDurationMinutes(dist);
      return {
        ...c,
        distanceKm: dist,
        durationMinutes: duration,
      };
    });
  }, [rehabCenters, userLocation]);

  // Filtrado y ordenamiento de grupos
  const filteredGroups = useMemo(() => {
    const { dayName: currentDay, minutesNow } = getMeridaCurrentDate();

    let list = groupsWithDistance.filter((group) => {
      // 1. Filtro por Zona (Águila, Jaguar, Tiburón, Delfín, Teocalli, Colibrí)
      if (filters.zone) {
        const isTeocalliFilter = filters.zone === 'Teocalli' || filters.zone === 'Tocalli';
        const isGroupTeocalli = group.zone === 'Teocalli' || group.zone === 'Tocalli';
        if (isTeocalliFilter) {
          if (!isGroupTeocalli) return false;
        } else if (group.zone !== filters.zone) {
          return false;
        }
      }

      // 2. Búsqueda por texto (nombre, publicCode, colonia, municipio, dirección, zona)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const targetStr = `${group.nombre} ${group.publicCode || ''} ${group.zone} ${group.colonia} ${group.municipio} ${group.city || ''} ${group.direccion} ${group.referencias}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        if (!targetStr.includes(query)) {
          return false;
        }
      }

      // 3. Filtro por tipo de grupo
      if (filters.type && group.tipo !== filters.type) {
        return false;
      }

      // 4. Filtro por día específico
      if (filters.day) {
        const meetsDay = group.sesiones.some((s) => s.dia === filters.day);
        if (!meetsDay) return false;
      }

      // 5. Filtro por horario
      if (filters.timeOfDay) {
        const meetsTime = group.sesiones.some((s) => {
          const startMin = timeStringToMinutes(s.hora_inicio);
          if (filters.timeOfDay === 'manana') return startMin < 720;
          if (filters.timeOfDay === 'tarde') return startMin >= 720 && startMin < 1080;
          if (filters.timeOfDay === 'noche') return startMin >= 1080;
          return true;
        });
        if (!meetsTime) return false;
      }

      // 6. Abierto hoy
      if (filters.openToday) {
        const meetsToday = group.sesiones.some((s) => s.dia === currentDay);
        if (!meetsToday) return false;
      }

      // 7. En sesión ahora
      if (filters.openNow) {
        const status = getGroupStatus(group);
        if (!status.isOpenNow) return false;
      }

      return true;
    });

    // Ordenamiento: En "Todas", la Zona Jaguar (Yucatán) siempre va primero
    const ZONE_ORDER: Record<string, number> = {
      'Jaguar': 1, // Yucatán primero
      'Tiburón': 2,
      'Delfín': 3,
      'Águila': 4,
      'Colibrí': 5,
      'Teocalli': 6,
      'Tocalli': 6,
    };

    list = [...list].sort((a, b) => {
      // Si estamos en "Todas" las zonas, priorizar Zona Jaguar (Yucatán) primero
      if (!filters.zone) {
        const orderA = ZONE_ORDER[a.zone] || 99;
        const orderB = ZONE_ORDER[b.zone] || 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
      }

      // Si el usuario tiene ubicación activa, ordenar por distancia
      if (userLocation) {
        return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
      }

      // Si no hay ubicación, ordenar por estado de junta
      const stA = getGroupStatus(a);
      const stB = getGroupStatus(b);
      const score = (st: typeof stA) => (st.isOpenNow ? 3 : st.isToday ? 2 : 1);
      return score(stB) - score(stA);
    });

    return list;
  }, [groupsWithDistance, filters, userLocation]);

  // Guardar grupo editado por la administradora (garantía de persistencia inmediata y en la nube)
  const handleSaveGroupFromAdmin = (updatedGroup: Group): Group => {
    const { updatedGroups, savedGroup } = saveGroupLocally(updatedGroup, allGroups);
    setAllGroups(updatedGroups);
    // Disparar sincronización con Google Drive inmediatamente
    driveSync.syncNow().catch(() => {});
    return savedGroup;
  };

  // Eliminar grupo de forma persistente
  const handleDeleteGroupFromAdmin = (groupId: string | number) => {
    const updated = deleteGroupLocally(groupId, allGroups);
    setAllGroups(updated);
    driveSync.syncNow().catch(() => {});
  };

  // Agregar nuevo grupo de forma persistente
  const handleAddNewGroupFromAdmin = (newGroup: Group) => {
    const { updatedGroups } = saveGroupLocally(newGroup, allGroups);
    setAllGroups(updatedGroups);
    driveSync.syncNow().catch(() => {});
  };

  // Registrar nueva propuesta enviada por un líder
  const handleSubmitProposalFromLeader = (newProposal: LeaderProposal) => {
    setProposals((prev) => [newProposal, ...prev]);
    submitProposalToFirestore(newProposal).catch((err) =>
      console.warn('Firestore offline / propuesta guardada localmente:', err)
    );
  };

  // Aprobar propuesta desde el panel de administradora
  const handleApproveProposal = (proposal: LeaderProposal) => {
    let updatedTargetGroup: Group | null = null;

    setAllGroups((prev) =>
      prev.map((g) => {
        if (g.id === proposal.groupId) {
          const updated: Group = {
            ...g,
            nombre: proposal.proposedName || g.nombre,
            zone: proposal.proposedZone || g.zone,
            direccion: proposal.proposedAddress || g.direccion,
            city: proposal.proposedCity || g.city,
            schedulesRaw: proposal.proposedSchedules || g.schedulesRaw,
            sessionTypesRaw: proposal.proposedSessionTypes || g.sessionTypesRaw,
            whatsapp: proposal.proposedWhatsapp || g.whatsapp,
            telefono: proposal.proposedWhatsapp ? `+52 ${proposal.proposedWhatsapp}` : g.telefono,
            facebook: proposal.proposedFacebook || g.facebook,
            mapsUrl: proposal.proposedMapsUrl || g.mapsUrl,
            foto_url: proposal.photoBase64 || g.foto_url,
            ultima_actualizacion: new Date().toISOString().split('T')[0],
          };
          updatedTargetGroup = updated;
          return updated;
        }
        return g;
      })
    );

    // Marcar como aprobada en local y Firestore
    setProposals((prev) =>
      prev.map((p) => (p.id === proposal.id ? { ...p, status: 'aprobada', reviewedAt: new Date().toISOString() } : p))
    );

    updateProposalStatusInFirestore(proposal.id, 'approved').catch(() => {});
    if (updatedTargetGroup) {
      saveGroupToFirestore(updatedTargetGroup).catch(() => {});
    }
  };

  // Rechazar propuesta
  const handleRejectProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rechazada', reviewedAt: new Date().toISOString() } : p))
    );
    updateProposalStatusInFirestore(proposalId, 'rejected').catch(() => {});
  };

  // Importar grupos desde CSV
  const handleImportGroupsFromCsv = (importedGroups: Group[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setAllGroups(importedGroups);
    } else {
      setAllGroups((prev) => [...importedGroups, ...prev]);
    }
  };

  // Exportar grupos a CSV
  const handleExportCsv = () => {
    const headers = [
      'id',
      'publicCode',
      'zone',
      'nombre',
      'ciudad',
      'colonia',
      'direccion',
      'whatsapp',
      'facebook',
      'horarios',
      'tipos_sesion',
      'mapsUrl',
      'activo',
    ];

    const rows = allGroups.map((g) => [
      `"${g.id}"`,
      `"${g.publicCode || ''}"`,
      `"${g.zone}"`,
      `"${g.nombre.replace(/"/g, '""')}"`,
      `"${g.city || g.municipio}"`,
      `"${g.colonia}"`,
      `"${g.direccion.replace(/"/g, '""')}"`,
      `"${g.whatsapp}"`,
      `"${g.facebook || ''}"`,
      `"${(g.schedulesRaw || '').replace(/"/g, '""')}"`,
      `"${(g.sessionTypesRaw || '').replace(/"/g, '""')}"`,
      `"${g.mapsUrl || ''}"`,
      `"${g.activo}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grupos_guerreros_de_la_luz_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
      <QuotaBanner />

      {/* Cabecera principal con logo oficial y botón de Administradora (🔐 / 👑) */}
      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenCoordinators={() => setIsCoordinatorsOpen(true)}
        onOpenCsvUpload={() => setIsCsvModalOpen(true)}
        onOpenAdmin={() => {
          setAdminInitialTab('editor');
          setIsAdminModalOpen(true);
        }}
        onOpenCustomizeText={() => {
          setAdminInitialTab('customize');
          setIsAdminModalOpen(true);
        }}
        onOpenTour={handleOpenOnboarding}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        activeMainTab={activeMainTab}
        onTabChange={(tab) => {
          setActiveMainTab(tab);
          setSelectedGroup(null);
          setSelectedCenter(null);
        }}
        groupsCount={allGroups.length}
        centersCount={rehabCenters.length}
        customTexts={customTexts}
      />

      {/* Si estamos en la pestaña de Grupos de Autoayuda */}
      {activeMainTab === 'grupos' ? (
        <>
          {/* Barra de búsqueda y filtros con soporte de ZONAS */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onLocateMe={handleLocateMe}
            isLocating={isLocating}
            hasLocation={Boolean(userLocation)}
            locationError={locationError}
            totalResults={filteredGroups.length}
            totalGroups={allGroups.length}
            mobileView={mobileView}
            onMobileViewChange={setMobileView}
            customTexts={customTexts}
          />

          {/* Contenedor principal dividido (Lista + Mapa de Google Maps) */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
            {/* Barra de Respaldo y Sincronización Google Drive cada 1 Minuto para Administradora */}
            {isAdminLoggedIn && (
              <DriveSyncBar
                status={driveSync.status}
                lastSyncTime={driveSync.lastSyncTime}
                lastFileLink={driveSync.lastFileLink}
                countdown={driveSync.countdown}
                autoSyncEnabled={driveSync.autoSyncEnabled}
                errorMessage={driveSync.errorMessage}
                onSyncNow={driveSync.syncNow}
                onConnectGoogle={driveSync.connectGoogle}
                onToggleAutoSync={driveSync.toggleAutoSync}
                onOpenWorkspaceModal={() => setIsWorkspaceOpen(true)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 min-h-[650px] items-start">
              {/* Panel Izquierdo: Lista de Tarjetas de Grupos */}
              <div
                className={`md:col-span-6 lg:col-span-5 space-y-3 ${
                  mobileView === 'map' ? 'hidden md:block' : 'block'
                }`}
              >
                {isAdminLoggedIn && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-blue-900/10 p-3.5 rounded-2xl border border-amber-300 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <div>
                        <span className="font-serif font-bold text-xs text-slate-900 block">Modo Administradora Activo</span>
                        <span className="text-[11px] text-slate-600">Edita, borra o agrega información en cualquier ficha</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsCreateGroupOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5 shrink-0 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Nuevo Grupo</span>
                    </button>
                  </div>
                )}
                {filteredGroups.length === 0 ? (
                  <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-4">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <SearchX className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
                        No encontramos grupos con esos filtros
                      </h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                        Prueba seleccionando "Todas las zonas", borrando la búsqueda o restableciendo los filtros.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setFilters({
                          search: '',
                          zone: '',
                          day: '',
                          timeOfDay: '',
                          type: '',
                          modality: '',
                          openToday: false,
                          openNow: false,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition shadow-sm"
                    >
                      Restablecer todos los filtros
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        isSelected={selectedGroup?.id === group.id}
                        onSelect={(g) => setSelectedGroup(g)}
                        onOpenDetails={(g) => setModalGroup(g)}
                        onOpenLeaderProposal={(g) => {
                          setProposalTargetGroup(g);
                          setIsLeaderProposalOpen(true);
                        }}
                        onOpenAdminEdit={(g) => {
                          setAdminEditingTargetGroup(g);
                          setIsAdminModalOpen(true);
                        }}
                        isAdminLoggedIn={isAdminLoggedIn}
                        customTexts={customTexts}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Panel Derecho: Mapa Interactivo de Google Maps */}
              <div
                className={`md:col-span-6 lg:col-span-7 h-[500px] md:h-[calc(100vh-210px)] sticky top-[170px] ${
                  mobileView === 'list' ? 'hidden md:block' : 'block'
                }`}
              >
                <MapView
                  groups={filteredGroups}
                  selectedGroup={selectedGroup}
                  onSelectGroup={(g) => setSelectedGroup(g)}
                  onOpenDetails={(g) => setModalGroup(g)}
                  userLocation={userLocation}
                  activeMainTab="grupos"
                  customTexts={customTexts}
                />
              </div>
            </div>
          </main>
        </>
      ) : (
        /* Pestaña: Sección de Centros de Rehabilitación Hermanos (28 Centros) */
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-12 lg:col-span-8">
              <RehabCentersView
                centers={rehabCentersWithDistance}
                onSelectCenterOnMap={(c) => setSelectedCenter(c)}
                selectedCenter={selectedCenter}
                customTexts={customTexts}
              />
            </div>
            {/* Mapa para Centros */}
            <div className="md:col-span-12 lg:col-span-4 h-[450px] lg:h-[calc(100vh-210px)] sticky top-[140px]">
              <MapView
                groups={[]}
                selectedGroup={null}
                onSelectGroup={() => {}}
                onOpenDetails={() => {}}
                userLocation={userLocation}
                rehabCenters={rehabCentersWithDistance}
                activeMainTab="centros"
                selectedCenter={selectedCenter}
                onSelectCenter={(c) => setSelectedCenter(c)}
                customTexts={customTexts}
              />
            </div>
          </div>
        </main>
      )}

      {/* Pie de página con aviso de anonimato y privacidad */}
      <Footer customTexts={customTexts} onOpenTour={handleOpenOnboarding} />

      {/* MODALES */}
      {/* 1. Modal Administradora (Emoji 🔐/👑, edición directa, personalización, CSV y aprobación) */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setAdminEditingTargetGroup(null);
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onAdminLogin={handleAdminLogin}
        onAdminLogout={handleAdminLogout}
        onUpdatePassword={handleUpdateAdminPassword}
        groups={allGroups}
        onSaveGroup={handleSaveGroupFromAdmin}
        onDeleteGroup={handleDeleteGroupFromAdmin}
        onAddNewGroup={handleAddNewGroupFromAdmin}
        proposals={proposals}
        onApproveProposal={handleApproveProposal}
        onRejectProposal={handleRejectProposal}
        onExportCsv={handleExportCsv}
        onOpenCsvUpload={() => {
          setIsAdminModalOpen(false);
          setIsCsvModalOpen(true);
        }}
        editingGroupFromOutside={adminEditingTargetGroup}
        customTexts={customTexts}
        onSaveCustomTexts={handleSaveCustomTexts}
        onResetCustomTexts={handleResetCustomTexts}
        initialTab={adminInitialTab}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />

      {/* 2. Modal Propuesta de Actualización de Líderes (con fotos para Google Maps) */}
      <LeaderProposalModal
        group={proposalTargetGroup}
        isOpen={isLeaderProposalOpen}
        onClose={() => {
          setIsLeaderProposalOpen(false);
          setProposalTargetGroup(null);
        }}
        onSubmitProposal={handleSubmitProposalFromLeader}
        customTexts={customTexts}
      />

      {/* 3. Modal Subir Archivo CSV */}
      <CsvUploaderModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImportGroups={handleImportGroupsFromCsv}
      />

      {/* 4. Modal Ficha Completa del Grupo */}
      <GroupDetailModal
        group={modalGroup}
        onClose={() => {
          setModalGroup(null);
          setModalGroupInitialEdit(false);
        }}
        onOpenContactForm={(g) => {
          setContactGroupTarget(g);
          setIsContactOpen(true);
        }}
        onOpenLeaderProposal={(g) => {
          setProposalTargetGroup(g);
          setIsLeaderProposalOpen(true);
        }}
        onOpenAdminEdit={(g) => {
          setModalGroup(g);
          setModalGroupInitialEdit(true);
        }}
        onSaveGroup={(updated) => {
          handleSaveGroupFromAdmin(updated);
          setModalGroup(updated);
        }}
        onDeleteGroup={(groupId) => {
          handleDeleteGroupFromAdmin(groupId);
          setModalGroup(null);
        }}
        onAdminLogin={handleAdminLogin}
        isAdminLoggedIn={isAdminLoggedIn}
        customTexts={customTexts}
        initialEditMode={modalGroupInitialEdit}
      />

      {/* Modal Crear / Agregar Nuevo Grupo */}
      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onAddNewGroup={(newG) => {
          handleAddNewGroupFromAdmin(newG);
          setModalGroup(newG);
          setModalGroupInitialEdit(false);
        }}
        customTexts={customTexts}
        userLocation={userLocation}
      />

      {/* 5. Modal Necesito Ayuda Ahora 24/7 */}
      <HelpBannerModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        groups={allGroups}
        onSelectGroup={(g) => {
          setSelectedGroup(g);
          setModalGroup(g);
        }}
      />

      {/* 6. Modal Formulario de Acompañamiento / Primer Contacto */}
      <ContactFormModal
        isOpen={isContactOpen}
        onClose={() => {
          setIsContactOpen(false);
          setContactGroupTarget(null);
        }}
        selectedGroup={contactGroupTarget}
      />

      {/* 7. Modal Coordinadores */}
      <CoordinatorsModal
        isOpen={isCoordinatorsOpen}
        onClose={() => setIsCoordinatorsOpen(false)}
        onSyncSheets={async () => {}}
        isSyncing={false}
        onOpenWorkspace={() => setIsWorkspaceOpen(true)}
      />

      {/* 8. Modal Calendario General */}
      <GeneralCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        customTexts={customTexts}
        isAdminLoggedIn={isAdminLoggedIn}
        onSaveCustomTexts={handleSaveCustomTexts}
        onOpenAdminLogin={() => {
          setIsCalendarOpen(false);
          setIsAdminModalOpen(true);
        }}
      />

      {/* 9. Modal Tutorial de Inicio (Tour de pantalla para nuevos usuarios) */}
      <OnboardingTourModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        customTexts={customTexts}
        onTriggerGeolocation={handleLocateMe}
      />

      {/* 10. Modal Google Workspace Hub (Google Drive, Forms y Contacts) */}
      <GoogleWorkspaceModal
        isOpen={isWorkspaceOpen}
        onClose={() => setIsWorkspaceOpen(false)}
        groups={allGroups}
        onImportGroups={(imported) => setAllGroups(imported)}
      />

      {/* Indicador de Estado Sin Conexión (PWA Offline) */}
      <OfflineIndicator />
    </div>
  );
}
