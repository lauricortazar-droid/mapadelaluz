import React from 'react';
import { Search, Navigation, Filter, X, Map, List, Clock, Sparkles } from 'lucide-react';
import { FilterState, GroupType, SessionDay, SessionModality, ZoneType, AppCustomTexts } from '../types';
import { getZoneInfo } from '../utils/zones';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onLocateMe: () => void;
  isLocating: boolean;
  hasLocation: boolean;
  locationError?: string;
  totalResults: number;
  totalGroups: number;
  mobileView: 'split' | 'map' | 'list';
  onMobileViewChange: (view: 'map' | 'list') => void;
  customTexts?: AppCustomTexts;
}

const ZONAS_LIST: ZoneType[] = ['Jaguar', 'Tiburón', 'Delfín', 'Águila', 'Colibrí', 'Teocalli'];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onLocateMe,
  isLocating,
  hasLocation,
  locationError,
  totalResults,
  totalGroups,
  mobileView,
  onMobileViewChange,
  customTexts,
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.zone ||
    filters.day ||
    filters.timeOfDay ||
    filters.type ||
    filters.modality ||
    filters.openToday ||
    filters.openNow
  );

  const resetFilters = () => {
    onFilterChange({
      search: '',
      zone: '',
      day: '',
      timeOfDay: '',
      type: '',
      modality: '',
      openToday: false,
      openNow: false,
    });
  };

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] md:top-[85px] z-20 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-2.5">
        {/* Row 1: Search box + Cerca de mí + Mobile View Switcher */}
        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Buscar por grupo, código (ej. FGDLL-JAG-027), colonia, ciudad o zona..."
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
              aria-label="Buscar grupos"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange({ ...filters, search: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Botón Cerca de mí */}
            <button
              onClick={onLocateMe}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
                hasLocation
                  ? 'bg-blue-900 text-white hover:bg-blue-800'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border border-amber-400'
              } ${isLocating ? 'opacity-70 cursor-wait' : ''}`}
              title="Ordenar por proximidad a mi ubicación actual"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>
                {isLocating
                  ? 'Localizando...'
                  : hasLocation
                  ? 'Cerca de mí (Activo)'
                  : 'Cerca de mí'}
              </span>
            </button>

            {/* Selector móvil Mapa / Lista */}
            <div className="flex md:hidden bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => onMobileViewChange('list')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mobileView === 'list'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>
              <button
                onClick={() => onMobileViewChange('map')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mobileView === 'map'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Location error notice */}
        {locationError && (
          <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between">
            <span>{locationError}</span>
            <button
              onClick={() => onLocateMe()}
              className="underline font-semibold ml-2 hover:text-amber-950"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Row 2: Pastillas interactivas de Zona y Horarios */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {/* Filtro por Zona (Águila, Jaguar, Tiburón, Delfín, Tocalli, Colibrí) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200 shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">
              {customTexts?.zoneFilterLabel || 'Zona:'}
            </span>
            <button
              onClick={() => onFilterChange({ ...filters, zone: '' })}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition ${
                filters.zone === ''
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Todas las zonas"
            >
              {customTexts?.zoneAllButtonText && !customTexts.zoneAllButtonText.toLowerCase().includes('jaguar') ? customTexts.zoneAllButtonText : 'Todas'}
            </button>
            {ZONAS_LIST.map((z) => {
              const zoneInfo = getZoneInfo(z, customTexts);
              const isSelected = filters.zone === z;
              return (
                <button
                  key={z}
                  onClick={() => onFilterChange({ ...filters, zone: isSelected ? '' : z })}
                  title={`${zoneInfo.name} • ${zoneInfo.line} (${zoneInfo.region})`}
                  className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white/80'
                  }`}
                >
                  <span>{zoneInfo.icon}</span>
                  <span>{zoneInfo.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick toggle: Abierto ahora */}
          <button
            onClick={() => onFilterChange({ ...filters, openNow: !filters.openNow })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold shrink-0 transition ${
              filters.openNow
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filters.openNow ? 'bg-white' : 'bg-emerald-500 animate-pulse'}`} />
            <span>En sesión ahora</span>
          </button>

          {/* Quick toggle: Sesiona hoy */}
          <button
            onClick={() => onFilterChange({ ...filters, openToday: !filters.openToday })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold shrink-0 transition ${
              filters.openToday
                ? 'bg-blue-900 text-white shadow-sm ring-2 ring-blue-500'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Sesiona hoy</span>
          </button>

          {/* Select Día de la semana */}
          <select
            value={filters.day}
            onChange={(e) => onFilterChange({ ...filters, day: e.target.value })}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 bg-slate-100 border text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
              filters.day ? 'bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-300' : 'border-slate-200'
            }`}
          >
            <option value="">Día: Todos</option>
            <option value="lunes">Lunes</option>
            <option value="martes">Martes</option>
            <option value="miercoles">Miércoles</option>
            <option value="jueves">Jueves</option>
            <option value="viernes">Viernes</option>
            <option value="sabado">Sábado</option>
            <option value="domingo">Domingo</option>
          </select>

          {/* Select Horario */}
          <select
            value={filters.timeOfDay}
            onChange={(e) => onFilterChange({ ...filters, timeOfDay: e.target.value as FilterState['timeOfDay'] })}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 bg-slate-100 border text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
              filters.timeOfDay ? 'bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-300' : 'border-slate-200'
            }`}
          >
            <option value="">Horario: Todos</option>
            <option value="manana">Mañana</option>
            <option value="tarde">Tarde</option>
            <option value="noche">Noche (8 a 10 pm)</option>
          </select>

          {/* Select Tipo de Grupo */}
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value as GroupType })}
            className={`px-3 py-1.5 rounded-full font-semibold shrink-0 bg-slate-100 border text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
              filters.type ? 'bg-blue-50 text-blue-900 border-blue-300 ring-1 ring-blue-300' : 'border-slate-200'
            }`}
          >
            <option value="">Tipo: Todos</option>
            <option value="mixto">Mixto</option>
            <option value="hombres">Hombres</option>
            <option value="mujeres">Mujeres</option>
            <option value="jóvenes">Jóvenes</option>
            <option value="familiares">Familiares</option>
          </select>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-700 hover:text-rose-900 font-semibold shrink-0 hover:bg-rose-50 rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Counter summary */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
          <div className="flex items-center gap-1.5">
            <span>
              Mostrando <strong className="text-slate-800">{totalResults}</strong> de {totalGroups} grupos
            </span>
            {filters.zone ? (
              <span className="font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-full">
                • {getZoneInfo(filters.zone, customTexts).name} ({getZoneInfo(filters.zone, customTexts).line})
              </span>
            ) : (
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                • {getZoneInfo('Jaguar', customTexts).name} primero
              </span>
            )}
            {hasLocation && (
              <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                • Ordenados por proximidad
              </span>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Red Nacional Fraternidad Guerreros de la Luz</span>
          </div>
        </div>
      </div>
    </div>
  );
};
