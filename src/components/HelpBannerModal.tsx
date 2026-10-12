import React from 'react';
import { Phone, MessageCircle, Heart, X, Clock, MapPin, ShieldCheck, ArrowRight, Facebook } from 'lucide-react';
import { APP_CONFIG } from '../data/config';
import { Group } from '../types';
import { getGroupStatus } from '../utils/status';

interface HelpBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSelectGroup: (group: Group) => void;
}

export const HelpBannerModal: React.FC<HelpBannerModalProps> = ({
  isOpen,
  onClose,
  groups,
  onSelectGroup,
}) => {
  if (!isOpen) return null;

  // Encontrar grupos con sesión hoy o abiertos ahora
  const urgentGroups = [...groups]
    .map((g) => ({ group: g, status: getGroupStatus(g) }))
    .filter((item) => item.status.isToday || item.status.isOpenNow)
    .slice(0, 3);

  const cleanPhone = APP_CONFIG.TELEFONO_GENERAL.replace(/\s+/g, '');
  const cleanWa = APP_CONFIG.WHATSAPP_GENERAL.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-200 relative animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
      >
        {/* Header con gradiente cálido */}
        <div className="bg-gradient-to-br from-rose-700 via-rose-800 to-slate-900 p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/30 transition"
            aria-label="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 bg-rose-500/30 border border-rose-300/30 px-3 py-1 rounded-full text-xs font-semibold text-rose-100 mb-3">
            <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-300 animate-pulse" />
            <span>Servicio de Guardia y Contención 24 Horas</span>
          </div>

          <h2 id="help-title" className="font-serif text-2xl font-bold text-white mb-1.5">
            No estás solo(a). Hay una solución.
          </h2>
          <p className="text-rose-100/90 text-sm leading-relaxed">
            Si estás pasando por una crisis, una recaída o simplemente necesitas hablar con alguien que comprende el dolor, estamos aquí para escucharte sin juzgar.
          </p>
        </div>

        {/* Contenido interactivo */}
        <div className="p-6 space-y-6">
          {/* Botones de acción directa 1-click */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 active:scale-98 transition text-sm text-center"
            >
              <Phone className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-normal text-rose-100">Llamada telefónica</div>
                <div>Llamar de inmediato</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, necesito información o apoyo de la Fraternidad Guerreros de la Luz Mérida.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 active:scale-98 transition text-sm text-center"
            >
              <MessageCircle className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-normal text-emerald-100">Escribir por WhatsApp</div>
                <div>Chatear ahora</div>
              </div>
            </a>
          </div>

          {/* Facebook comunidad */}
          <a
            href={APP_CONFIG.FACEBOOK_GENERAL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-semibold text-xs transition"
          >
            <Facebook className="w-4 h-4 fill-blue-600 text-blue-600" />
            <span>Página Oficial de Facebook (Guerreros de la Luz Mérida)</span>
          </a>

          {/* Teléfono en texto para marcar */}
          <div className="text-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Línea de servicio local en Mérida: </span>
            <span className="text-sm font-bold text-slate-800">{APP_CONFIG.TELEFONO_GENERAL}</span>
          </div>

          {/* Próximas sesiones hoy */}
          {urgentGroups.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Grupos con sesión el día de hoy:</span>
              </h3>
              <div className="space-y-2">
                {urgentGroups.map(({ group, status }) => (
                  <div
                    key={group.id}
                    onClick={() => {
                      onSelectGroup(group);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-900">
                        {group.nombre}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {group.colonia}, {group.municipio}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-700 font-medium">{status.label}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Garantía de anonimato y costo */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Anonimato y confidencialidad absolutos</div>
              <p className="text-blue-800/90 leading-relaxed">
                No requerimos tu nombre completo, dirección ni datos privados. La asistencia a las sesiones es 100% gratuita; no se cobran cuotas ni honorarios.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Entendido, ver mapa
          </button>
        </div>
      </div>
    </div>
  );
};
