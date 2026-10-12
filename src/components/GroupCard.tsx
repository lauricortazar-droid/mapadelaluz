import React from 'react';
import { MapPin, Navigation, Phone, MessageCircle, Clock, ChevronRight, Edit3, Camera, Sparkles, Accessibility, Facebook } from 'lucide-react';
import { Group, AppCustomTexts } from '../types';
import { getGroupStatus } from '../utils/status';
import { formatDistance, getDirectionsUrl } from '../utils/distance';
import { getZoneInfo } from '../utils/zones';

interface GroupCardProps {
  group: Group;
  isSelected: boolean;
  onSelect: (group: Group) => void;
  onOpenDetails: (group: Group) => void;
  onOpenLeaderProposal: (group: Group) => void;
  onOpenAdminEdit?: (group: Group) => void;
  isAdminLoggedIn?: boolean;
  customTexts?: AppCustomTexts;
}

const TYPE_BADGE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  mixto: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', label: 'Mixto' },
  hombres: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', label: 'Hombres' },
  mujeres: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', label: 'Mujeres' },
  jóvenes: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Jóvenes' },
  familiares: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Familiares' },
};

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  isSelected,
  onSelect,
  onOpenDetails,
  onOpenLeaderProposal,
  onOpenAdminEdit,
  isAdminLoggedIn,
  customTexts,
}) => {
  const status = getGroupStatus(group);
  const badgeInfo = TYPE_BADGE_STYLE[group.tipo] || TYPE_BADGE_STYLE.mixto;
  const zoneInfo = getZoneInfo(group.zone, customTexts);
  const cleanPhone = group.telefono.replace(/\s+/g, '');
  const cleanWa = group.whatsapp.replace(/[^0-9]/g, '');

  const routeLabel = customTexts?.cardRouteBtnText || 'Ruta';
  const waLabel = customTexts?.cardWaBtnText || 'WA';
  const fbLabel = customTexts?.cardFbBtnText || 'FB';
  const proposeLabel = customTexts?.cardProposeBtnText || 'Proponer';
  const detailsLabel = customTexts?.cardDetailsBtnText || 'Ficha';
  const fbUrl = group.facebook || customTexts?.generalFacebook || 'https://www.facebook.com/guerrerosdelaluzmerida';

  return (
    <article
      onClick={() => onSelect(group)}
      className={`rounded-2xl border transition-all duration-200 p-4 bg-white relative cursor-pointer ${
        isSelected
          ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-lg bg-amber-50/10'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top row: Zona + Status Badge + Distance */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Badge Zona */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${zoneInfo.bg} ${zoneInfo.border}`}
            title={`${zoneInfo.name} • ${zoneInfo.line} (${zoneInfo.region})`}
          >
            <span>{zoneInfo.icon}</span>
            <span>{zoneInfo.name}</span>
          </span>

          {group.publicCode && (
            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {group.publicCode}
            </span>
          )}

          {/* Status badge */}
          {status.statusType === 'open-now' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {status.label}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3 h-3 text-slate-400" />
              {status.label}
            </span>
          )}
        </div>

        {/* Distance if available */}
        {group.distanceKm !== undefined && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <Navigation className="w-3 h-3" />
            <span>{formatDistance(group.distanceKm)}</span>
            {group.durationMinutes && (
              <span className="text-[10px] font-normal text-amber-900/80">
                • ~{group.durationMinutes} min
              </span>
            )}
          </span>
        )}
      </div>

      {/* Group Title */}
      <h3 className="font-serif text-base font-bold text-slate-900 leading-snug hover:text-blue-900 transition flex items-center justify-between">
        <span>{group.nombre}</span>
        {/* Badge tipo */}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeInfo.bg} ${badgeInfo.text}`}>
          {badgeInfo.label}
        </span>
      </h3>

      {/* Address & City */}
      <div className="mt-1.5 flex items-start gap-1.5 text-xs text-slate-600">
        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
        <span className="line-clamp-2">
          <strong className="text-slate-800">{group.city || group.municipio}.</strong> {group.direccion}
        </span>
      </div>

      {/* Schedules raw or summary */}
      <div className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center justify-between">
        <span className="truncate">{group.schedulesRaw || status.sublabel}</span>
        {group.sessionTypesRaw && (
          <span className="text-[10px] text-slate-400 ml-1 truncate max-w-[120px]" title={group.sessionTypesRaw}>
            {group.sessionTypesRaw}
          </span>
        )}
      </div>

      {/* Quick Action buttons */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Cómo llegar */}
          <a
            href={group.mapsUrl || getDirectionsUrl(group.lat, group.lng)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition"
            title="Abrir en Google Maps"
          >
            <Navigation className="w-3 h-3 text-blue-700" />
            <span className="hidden sm:inline">{routeLabel}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hola, quisiera información sobre las sesiones de ${group.nombre}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 transition"
            title="WhatsApp de servicio"
          >
            <MessageCircle className="w-3 h-3 text-emerald-700" />
            <span>{waLabel}</span>
          </a>

          {/* Facebook */}
          <a
            href={fbUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition"
            title={`Facebook ${group.facebook ? 'del grupo' : 'oficial de la comunidad'}`}
          >
            <Facebook className="w-3 h-3 text-blue-600 fill-blue-600" />
            <span>{fbLabel}</span>
          </a>

          {/* Proponer actualización (Líderes) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLeaderProposal(group);
            }}
            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition"
            title="Proponer cambios de datos o fotos de la fachada (Líderes)"
          >
            <Edit3 className="w-3 h-3 text-amber-700" />
            <span className="hidden sm:inline">{proposeLabel}</span>
          </button>

          {/* Si está en modo Administradora: Botón directo de editar */}
          {isAdminLoggedIn && onOpenAdminEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAdminEdit(group);
              }}
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold border border-purple-300 transition"
              title="Editar datos como Administradora"
            >
              <span>👑 Editar</span>
            </button>
          )}
        </div>

        {/* Ver Ficha Completa */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(group);
          }}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-950 text-white text-xs font-semibold transition active:scale-95"
        >
          <span>{detailsLabel}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </article>
  );
};
