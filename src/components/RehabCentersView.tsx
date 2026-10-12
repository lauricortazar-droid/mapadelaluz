import React, { useState, useMemo } from 'react';
import { RehabCenter, AppCustomTexts } from '../types';
import { Search, MapPin, Phone, MessageCircle, Navigation, ExternalLink, ShieldAlert, Heart, Building2, Users, Facebook } from 'lucide-react';
import { formatDistance } from '../utils/distance';

interface RehabCentersViewProps {
  centers: RehabCenter[];
  onSelectCenterOnMap: (center: RehabCenter) => void;
  selectedCenter: RehabCenter | null;
  customTexts?: AppCustomTexts;
}

export const RehabCentersView: React.FC<RehabCentersViewProps> = ({
  centers,
  onSelectCenterOnMap,
  selectedCenter,
  customTexts,
}) => {
  const [search, setSearch] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [selectedModalCenter, setSelectedModalCenter] = useState<RehabCenter | null>(null);

  const networks = useMemo(() => {
    const list = Array.from(new Set(centers.map((c) => c.network))).filter(Boolean);
    return list;
  }, [centers]);

  const filteredCenters = useMemo(() => {
    return centers.filter((c) => {
      if (networkFilter && c.network !== networkFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const target = `${c.name} ${c.city} ${c.state} ${c.address} ${c.responsibleName} ${c.network}`
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (!target.includes(q)) return false;
      }
      return true;
    });
  }, [centers, search, networkFilter]);

  const sectionTitle = customTexts?.rehabSectionTitle || 'Red de Centros de Rehabilitación Hermanos (28 Centros Aliados)';
  const sectionSubtitle = customTexts?.rehabSectionSubtitle || 'Los centros de rehabilitación aliados ofrecen acompañamiento residencial estructurado e internamiento para personas que requieren contención intensiva antes o durante su integración a los grupos de autoayuda de 12 Pasos. La familia debe confirmar directamente con los responsables disponibilidad de camas, requisitos de ingreso y costos de estancia.';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner explicativo de centros hermanos */}
      <div className="bg-gradient-to-r from-amber-500/15 via-blue-900/10 to-indigo-950/15 p-5 rounded-3xl border border-amber-300/40 space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base sm:text-lg">
          <Building2 className="w-5 h-5 text-amber-600" />
          <span>{sectionTitle}</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed max-w-4xl">
          {sectionSubtitle}
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, municipio (Conkal, Caucel, Ticul, Tekax...) o responsable..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Filtro por red */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setNetworkFilter('')}
            className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition ${
              networkFilter === ''
                ? 'bg-blue-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Todas las Redes ({centers.length})
          </button>
          {networks.map((net) => (
            <button
              key={net}
              onClick={() => setNetworkFilter(net)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition ${
                networkFilter === net
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Centros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCenters.map((center) => {
          const cleanPhone = center.phone.replace(/[^0-9]/g, '');
          const cleanWa = center.whatsapp.replace(/[^0-9]/g, '');

          return (
            <div
              key={center.n}
              onClick={() => onSelectCenterOnMap(center)}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                selectedCenter?.n === center.n
                  ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-lg bg-amber-50/10'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className="space-y-2.5">
                {/* Header de tarjeta */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900">
                    {center.network}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {center.city}, {center.state}
                  </span>
                </div>

                {/* Nombre */}
                <h3 className="font-serif text-base font-bold text-slate-900 leading-snug">
                  {center.name}
                </h3>

                {/* Dirección */}
                <div className="flex items-start gap-1.5 text-xs text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{center.address}</span>
                </div>

                {/* Responsable */}
                <div className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1 border border-slate-100">
                  <div className="text-slate-500 text-[11px]">Responsable de admisión:</div>
                  <div className="font-bold text-slate-800">{center.responsibleName}</div>
                </div>

                {/* Población atendida */}
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{center.population}</span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hola, solicito información sobre disponibilidad y requisitos de ingreso en ${center.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold border border-emerald-200 transition"
                    title="WhatsApp del responsable"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>

                  {/* Llamar */}
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition"
                    title="Llamar"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-700" />
                  </a>

                  {/* Facebook */}
                  <a
                    href={center.facebookUrl || customTexts?.generalFacebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition"
                    title="Página de Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
                  </a>

                  {/* Google Maps ruta */}
                  <a
                    href={center.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold border border-blue-200 transition"
                    title="Ubicación en Google Maps"
                  >
                    <Navigation className="w-3.5 h-3.5 text-blue-700" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedModalCenter(center);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-blue-950 text-white text-xs font-semibold"
                >
                  Ficha
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ficha Completa del Centro */}
      {selectedModalCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-t-3xl relative">
              <button
                onClick={() => setSelectedModalCenter(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                ✕
              </button>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 mb-2 inline-block">
                {selectedModalCenter.network}
              </span>
              <h2 className="font-serif text-2xl font-bold text-white mb-1">
                {selectedModalCenter.name}
              </h2>
              <p className="text-xs text-blue-200">
                {selectedModalCenter.city}, {selectedModalCenter.state}
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 flex-1 overflow-y-auto">
              <div>
                <strong className="block text-slate-900 font-semibold mb-0.5">Dirección completa:</strong>
                <p className="text-slate-600">{selectedModalCenter.address}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <strong className="block text-slate-900 font-semibold">Responsable(s) de Admisión:</strong>
                  <span className="text-slate-700 font-medium">{selectedModalCenter.responsibleName}</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Población atendida:</strong>
                  <span className="text-slate-600">{selectedModalCenter.population}</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Servicios residenciales:</strong>
                  <span className="text-slate-600">{selectedModalCenter.services}</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-semibold">Qué incluye la estancia:</strong>
                  <span className="text-slate-600">{selectedModalCenter.includes}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Para coordinar un traslado o consultar disponibilidad, contacta directamente al responsable antes de acudir físicamente al centro.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={`tel:${selectedModalCenter.phone.replace(/[^0-9]/g, '')}`}
                  className="py-2.5 rounded-xl bg-slate-900 text-white font-bold text-center"
                >
                  Llamar
                </a>
                <a
                  href={`https://wa.me/${selectedModalCenter.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, solicito información sobre el centro ${selectedModalCenter.name}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-center"
                >
                  WhatsApp
                </a>
                <a
                  href={selectedModalCenter.facebookUrl || customTexts?.generalFacebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center flex items-center justify-center gap-1"
                >
                  <Facebook className="w-4 h-4 fill-white" />
                  <span>Facebook</span>
                </a>
                <a
                  href={selectedModalCenter.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-xl bg-blue-600 text-white font-bold text-center"
                >
                  Maps
                </a>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex justify-end">
              <button
                onClick={() => setSelectedModalCenter(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
