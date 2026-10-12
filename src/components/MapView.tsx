import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { Navigation, MapPin, Building2, Phone, MessageCircle } from 'lucide-react';
import { Group, RehabCenter, AppCustomTexts } from '../types';
import { APP_CONFIG } from '../data/config';
import { getGroupStatus } from '../utils/status';
import { formatDistance, getDirectionsUrl } from '../utils/distance';
import { getZoneInfo } from '../utils/zones';

interface MapViewProps {
  groups: Group[];
  selectedGroup: Group | null;
  onSelectGroup: (group: Group) => void;
  onOpenDetails: (group: Group) => void;
  userLocation: { lat: number; lng: number } | null;
  rehabCenters?: RehabCenter[];
  activeMainTab?: 'grupos' | 'centros';
  selectedCenter?: RehabCenter | null;
  onSelectCenter?: (center: RehabCenter) => void;
  customTexts?: AppCustomTexts;
}

// Colores de pines por Zona
const ZONE_COLORS: Record<string, { background: string; borderColor: string; glyphColor: string }> = {
  Jaguar: { background: '#059669', borderColor: '#d1fae5', glyphColor: '#ffffff' }, // Verde
  Tiburón: { background: '#0284c7', borderColor: '#e0f2fe', glyphColor: '#ffffff' }, // Azul
  Delfín: { background: '#2563eb', borderColor: '#dbeafe', glyphColor: '#ffffff' }, // Azul rey
  Águila: { background: '#dc2626', borderColor: '#fee2e2', glyphColor: '#ffffff' }, // Rojo
  Colibrí: { background: '#9333ea', borderColor: '#f3e8ff', glyphColor: '#ffffff' }, // Púrpura
  Tocalli: { background: '#d97706', borderColor: '#fef3c7', glyphColor: '#ffffff' }, // Ámbar
};

function MapCameraHandler({
  selectedGroup,
  selectedCenter,
  userLocation,
}: {
  selectedGroup: Group | null;
  selectedCenter: RehabCenter | null;
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedGroup) {
      map.panTo({ lat: selectedGroup.lat, lng: selectedGroup.lng });
      if (map.getZoom() && map.getZoom()! < 14) {
        map.setZoom(14);
      }
    } else if (selectedCenter) {
      map.panTo({ lat: selectedCenter.lat, lng: selectedCenter.lng });
      if (map.getZoom() && map.getZoom()! < 14) {
        map.setZoom(14);
      }
    }
  }, [map, selectedGroup, selectedCenter]);

  return null;
}

export const MapView: React.FC<MapViewProps> = ({
  groups,
  selectedGroup,
  onSelectGroup,
  onOpenDetails,
  userLocation,
  rehabCenters = [],
  activeMainTab = 'grupos',
  selectedCenter = null,
  onSelectCenter,
  customTexts,
}) => {
  const [infoWindowGroup, setInfoWindowGroup] = useState<Group | null>(null);
  const [infoWindowCenter, setInfoWindowCenter] = useState<RehabCenter | null>(null);

  useEffect(() => {
    if (selectedGroup) {
      setInfoWindowGroup(selectedGroup);
      setInfoWindowCenter(null);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedCenter) {
      setInfoWindowCenter(selectedCenter);
      setInfoWindowGroup(null);
    }
  }, [selectedCenter]);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-full rounded-2xl md:rounded-none overflow-hidden shadow-inner border md:border-none border-slate-200">
      <APIProvider apiKey={APP_CONFIG.GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={APP_CONFIG.DEFAULT_CENTER}
          defaultZoom={APP_CONFIG.DEFAULT_ZOOM}
          mapId={APP_CONFIG.MAP_ID}
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="w-full h-full"
          style={{ width: '100%', height: '100%', minHeight: '380px' }}
        >
          <MapCameraHandler
            selectedGroup={selectedGroup}
            selectedCenter={selectedCenter}
            userLocation={userLocation}
          />

          {/* Marcadores de Grupos de Autoayuda */}
          {activeMainTab === 'grupos' &&
            groups.map((group) => {
              const isSelected = selectedGroup?.id === group.id;
              const pinStyle = ZONE_COLORS[group.zone] || ZONE_COLORS.Jaguar;
              const status = getGroupStatus(group);

              return (
                <AdvancedMarker
                  key={group.id}
                  position={{ lat: group.lat, lng: group.lng }}
                  title={`${group.nombre} (${group.zone} • ${group.city || group.municipio})`}
                  onClick={() => {
                    onSelectGroup(group);
                    setInfoWindowGroup(group);
                    setInfoWindowCenter(null);
                  }}
                >
                  <div className="relative transition-transform duration-200 hover:scale-110">
                    <Pin
                      background={isSelected ? '#d97706' : pinStyle.background}
                      borderColor={isSelected ? '#ffffff' : pinStyle.borderColor}
                      glyphColor={isSelected ? '#ffffff' : pinStyle.glyphColor}
                      scale={isSelected ? 1.25 : 0.95}
                    />
                    {status.isOpenNow && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
                      </span>
                    )}
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* Marcadores de Centros de Rehabilitación */}
          {activeMainTab === 'centros' &&
            rehabCenters.map((center) => {
              const isSelected = selectedCenter?.n === center.n;
              return (
                <AdvancedMarker
                  key={`center-${center.n}`}
                  position={{ lat: center.lat, lng: center.lng }}
                  title={`${center.name} (${center.network} • ${center.city})`}
                  onClick={() => {
                    if (onSelectCenter) onSelectCenter(center);
                    setInfoWindowCenter(center);
                    setInfoWindowGroup(null);
                  }}
                >
                  <div className="relative transition-transform duration-200 hover:scale-110">
                    <Pin
                      background={isSelected ? '#ea580c' : '#1e3a8a'}
                      borderColor="#ffffff"
                      glyphColor="#fef08a"
                      scale={isSelected ? 1.3 : 1.05}
                    />
                  </div>
                </AdvancedMarker>
              );
            })}

          {/* Marcador de ubicación del usuario */}
          {userLocation && (
            <AdvancedMarker position={userLocation} title="Tu ubicación actual">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
                <div className="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                  ●
                </div>
              </div>
            </AdvancedMarker>
          )}

          {/* InfoWindow para Grupo */}
          {infoWindowGroup && activeMainTab === 'grupos' && (
            <InfoWindow
              position={{ lat: infoWindowGroup.lat, lng: infoWindowGroup.lng }}
              onCloseClick={() => setInfoWindowGroup(null)}
              headerContent={
                <div className="font-serif font-bold text-sm text-slate-900 pr-2">
                  {infoWindowGroup.nombre}
                </div>
              }
            >
              <div className="p-1 max-w-[260px] text-xs text-slate-700 space-y-2">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">
                    {getZoneInfo(infoWindowGroup.zone, customTexts).name} • {infoWindowGroup.city || infoWindowGroup.municipio}
                  </span>
                </div>

                <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 text-[11px]">
                    {getGroupStatus(infoWindowGroup).label}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {infoWindowGroup.schedulesRaw || getGroupStatus(infoWindowGroup).sublabel}
                  </div>
                </div>

                {infoWindowGroup.distanceKm !== undefined && (
                  <div className="text-[11px] font-bold text-amber-700">
                    A {formatDistance(infoWindowGroup.distanceKm)} de tu posición
                  </div>
                )}

                <div className="pt-1 flex items-center gap-1.5 justify-between">
                  <a
                    href={infoWindowGroup.mapsUrl || getDirectionsUrl(infoWindowGroup.lat, infoWindowGroup.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-[11px] border border-blue-200"
                  >
                    <Navigation className="w-3 h-3 text-blue-700" />
                    <span>Ruta</span>
                  </a>

                  <button
                    onClick={() => onOpenDetails(infoWindowGroup)}
                    className="flex-1 py-1 px-2 rounded-md bg-slate-900 hover:bg-blue-950 text-white font-bold text-[11px]"
                  >
                    Ver ficha
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* InfoWindow para Centro de Rehabilitación */}
          {infoWindowCenter && activeMainTab === 'centros' && (
            <InfoWindow
              position={{ lat: infoWindowCenter.lat, lng: infoWindowCenter.lng }}
              onCloseClick={() => setInfoWindowCenter(null)}
              headerContent={
                <div className="font-serif font-bold text-sm text-slate-900 pr-2">
                  {infoWindowCenter.name}
                </div>
              }
            >
              <div className="p-1 max-w-[260px] text-xs text-slate-700 space-y-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-900 inline-block">
                  {infoWindowCenter.network}
                </span>

                <div className="text-[11px] text-slate-600 line-clamp-2">
                  {infoWindowCenter.address}
                </div>

                <div className="text-[11px] text-slate-500">
                  Responsable: <strong className="text-slate-800">{infoWindowCenter.responsibleName}</strong>
                </div>

                <div className="pt-1 flex items-center gap-1.5">
                  <a
                    href={`https://wa.me/${infoWindowCenter.whatsapp}?text=${encodeURIComponent(`Hola, solicito informes sobre ${infoWindowCenter.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-emerald-600 text-white font-bold text-[11px]"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={infoWindowCenter.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-md bg-blue-50 text-blue-900 font-bold text-[11px] border border-blue-200"
                  >
                    <Navigation className="w-3 h-3 text-blue-700" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Leyenda flotante en la esquina inferior */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-sm p-2 rounded-xl shadow-lg border border-slate-200 text-[11px]">
        {activeMainTab === 'grupos' ? (
          <>
            <span className="font-bold text-slate-700 mr-1">Zonas:</span>
            <span className="flex items-center gap-1 text-emerald-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Jaguar</span>
            </span>
            <span className="flex items-center gap-1 text-sky-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
              <span>Tiburón</span>
            </span>
            <span className="flex items-center gap-1 text-blue-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Delfín</span>
            </span>
            <span className="flex items-center gap-1 text-rose-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              <span>Águila</span>
            </span>
            <span className="flex items-center gap-1 text-purple-800 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span>Colibrí</span>
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-900"></span>
            <span>28 Centros de Rehabilitación Hermanos</span>
          </div>
        )}
      </div>
    </div>
  );
};
