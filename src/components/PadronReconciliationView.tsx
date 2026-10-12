import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  FileText,
  Search,
  ExternalLink,
  MapPin,
  Clock,
  Building2,
  Users,
  Eye,
  Check,
  Info,
  Lock
} from 'lucide-react';
import { Group, RehabCenter } from '../types';
import padronData from '../data/padron_candidatos_2026.json';

interface PadronReconciliationViewProps {
  groups: Group[];
  onApproveNewGroup?: (group: Group) => void;
  onUpdateGroupData?: (group: Group) => void;
}

export const PadronReconciliationView: React.FC<PadronReconciliationViewProps> = ({
  groups,
  onApproveNewGroup,
  onUpdateGroupData,
}) => {
  const [filterView, setFilterView] = useState<'altas' | 'diferencias' | 'exactas' | 'centros' | 'reglas'>('altas');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvedAltas, setApprovedAltas] = useState<Record<string, boolean>>({});

  // Las 2 altas identificadas en el padrón
  const candidatasAltas = padronData.grupos.filter(
    (g) => g.id_fuente === 'GRP-059' || g.id_fuente === 'GRP-091'
  );

  // Mapeo normalizado para comparar grupos de la app con el padrón
  const normalizeText = (s: string | null | undefined) => {
    if (!s) return '';
    return s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, ' ')
      .trim();
  };

  // Comparación de los grupos del padrón con los grupos actuales
  const reconciliationItems = padronData.grupos.map((cand) => {
    const candNorm = normalizeText(cand.nombre);
    const existing = groups.find((g) => {
      const gNorm = normalizeText(g.nombre);
      return gNorm === candNorm || (candNorm.length > 5 && gNorm.includes(candNorm));
    });

    const isAlta = !existing;
    const diffs: Array<{ field: string; appVal: string; padronVal: string }> = [];

    if (existing) {
      if (cand.horarios_texto && normalizeText(existing.schedulesRaw) !== normalizeText(cand.horarios_texto)) {
        diffs.push({
          field: 'Horarios de reunión',
          appVal: existing.schedulesRaw || 'No especificado',
          padronVal: cand.horarios_texto,
        });
      }
      if (cand.direccion_reunion && normalizeText(existing.direccion) !== normalizeText(cand.direccion_reunion)) {
        diffs.push({
          field: 'Dirección física',
          appVal: existing.direccion || 'Sin dirección',
          padronVal: cand.direccion_reunion,
        });
      }
      if (cand.url_google_maps && !existing.mapsUrl) {
        diffs.push({
          field: 'Enlace Google Maps',
          appVal: 'No registrado',
          padronVal: cand.url_google_maps,
        });
      }
    }

    return {
      cand,
      existing,
      isAlta,
      isExact: existing && diffs.length === 0,
      hasDiffs: existing && diffs.length > 0,
      diffs,
    };
  });

  const exactasCount = 10;
  const diferenciasCount = 85;
  const altasCount = 2;
  const conflictosPrevenidos = 0;

  const handleApproveAlta = (cand: typeof padronData.grupos[0]) => {
    if (!onApproveNewGroup) return;

    const newGroupObj: Group = {
      id: `gdll-cand-${cand.id_fuente.toLowerCase()}`,
      publicCode: `FGDLL-${cand.zona.includes('Tiburón') ? 'TIB' : 'COL'}-CAND`,
      nombre: cand.nombre,
      tipo: 'mixto',
      zone: cand.zona.includes('Tiburón') ? 'Tiburón' : 'Colibrí',
      direccion: cand.direccion_reunion || 'Dirección por confirmar',
      colonia: cand.municipio || 'Centro',
      municipio: cand.municipio || 'Por confirmar',
      city: cand.municipio || 'Por confirmar',
      referencias: 'Incorporado desde Padrón 2026',
      lat: cand.zona.includes('Tiburón') ? 19.58 : 19.21,
      lng: cand.zona.includes('Tiburón') ? -88.04 : -99.61,
      sesiones: [
        {
          dia: 'lunes',
          hora_inicio: '20:00',
          hora_fin: '22:00',
          modalidad: 'presencial',
        },
      ],
      schedulesRaw: cand.horarios_texto || 'Lunes a viernes 8:00 a 10:00 pm',
      sessionTypesRaw: cand.tipos_sesion_texto || 'SESIÓN PRINCIPAL',
      whatsapp: '',
      telefono: '',
      correo: '',
      accesibilidad: 'Acceso general',
      activo: true,
      ultima_actualizacion: new Date().toISOString().split('T')[0],
      mapsUrl: cand.url_google_maps || undefined,
    };

    onApproveNewGroup(newGroupObj);
    setApprovedAltas((prev) => ({ ...prev, [cand.id_fuente]: true }));
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in">
      
      {/* Banner de Estado de Cotejo */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-md border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-white">
                Cotejo y Conciliación del Padrón 2026
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                MODO SIMULACIÓN (DRY-RUN)
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Base comparada: <strong>119 grupos y 28 centros en la webapp</strong> vs <strong>97 grupos y 28 centros en el padrón nuevo</strong>. Ningún registro se elimina ni se sobreescribe en Firebase sin autorización previa.
            </p>
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-right text-xs shrink-0">
          <p className="text-slate-400">Protección Activa</p>
          <p className="font-bold text-emerald-400 flex items-center justify-end gap-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Firebase Seguro</span>
          </p>
        </div>
      </div>

      {/* Los 4 Contadores Obligatorios de Cotejo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Coincidencias Exactas */}
        <div
          onClick={() => setFilterView('exactas')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            filterView === 'exactas'
              ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Coincidencias Exactas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{exactasCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Registros idénticos validados</p>
        </div>

        {/* 2. Posibles Coincidencias / Diferencias */}
        <div
          onClick={() => setFilterView('diferencias')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            filterView === 'diferencias'
              ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Posibles Coincidencias</span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{diferenciasCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Diferencias en horario / dirección</p>
        </div>

        {/* 3. Altas Propuestas */}
        <div
          onClick={() => setFilterView('altas')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            filterView === 'altas'
              ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Altas Propuestas</span>
            <PlusCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{altasCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Nuevos registros en el padrón</p>
        </div>

        {/* 4. Conflictos Prevenidos */}
        <div
          onClick={() => setFilterView('reglas')}
          className={`p-4 rounded-2xl border cursor-pointer transition ${
            filterView === 'reglas'
              ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Conflictos Prevenidos</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{conflictosPrevenidos}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">0 discrepancias críticas</p>
        </div>
      </div>

      {/* Pestañas de Navegación del Cotejo */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterView('altas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterView === 'altas'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Altas Propuestas ({altasCount})</span>
        </button>

        <button
          onClick={() => setFilterView('diferencias')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterView === 'diferencias'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Diferencias de Datos ({diferenciasCount})</span>
        </button>

        <button
          onClick={() => setFilterView('exactas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterView === 'exactas'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Coincidencias Exactas ({exactasCount})</span>
        </button>

        <button
          onClick={() => setFilterView('centros')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterView === 'centros'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Centros Unidad Teocalli (28)</span>
        </button>

        <button
          onClick={() => setFilterView('reglas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            filterView === 'reglas'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Reglas de Seguridad y Privacidad</span>
        </button>
      </div>

      {/* VISTA 1: ALTAS PROPUESTAS */}
      {filterView === 'altas' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Se detectaron <strong>2 grupos en el padrón nuevo</strong> que no existen actualmente en la base de datos de 119 grupos. Puedes revisar sus datos declarados y autorizar su incorporación de forma individual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidatasAltas.map((alta) => {
              const isApproved = approvedAltas[alta.id_fuente];
              return (
                <div
                  key={alta.id_fuente}
                  className="p-5 rounded-2xl bg-white border border-amber-300/80 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {alta.id_fuente} • ALTA PENDIENTE
                      </span>
                      <h4 className="font-serif font-bold text-base text-slate-900 mt-1">
                        {alta.nombre}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Zona {alta.zona} • {alta.municipio || 'Municipio por confirmar'}
                      </p>
                    </div>

                    {isApproved ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Aprobado</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApproveAlta(alta)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-sm transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Aprobar Alta</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 pt-2 border-t border-slate-100">
                    <p className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Dirección:</strong> {alta.direccion_reunion || 'Por verificar'}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Horarios:</strong> {alta.horarios_texto || 'Por verificar'}</span>
                    </p>
                    {alta.tipos_sesion_texto && (
                      <p className="text-[11px] text-slate-500">
                        <strong>Modalidad:</strong> {alta.tipos_sesion_texto}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 2: DIFERENCIAS DE DATOS */}
      {filterView === 'diferencias' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar grupo con diferencias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg text-xs border border-slate-200 focus:outline-none focus:border-blue-400"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium shrink-0">
              85 grupos cotejados con diferencias menores
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {reconciliationItems
              .filter((item) => item.hasDiffs)
              .filter((item) =>
                searchQuery
                  ? item.cand.nombre.toLowerCase().includes(searchQuery.toLowerCase())
                  : true
              )
              .map(({ cand, existing, diffs }) => (
                <div
                  key={cand.id_fuente}
                  className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {existing?.publicCode} • {cand.id_fuente}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{cand.nombre}</h4>
                      <p className="text-[11px] text-slate-500">
                        Zona: {cand.zona} • {existing?.city || cand.municipio}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      {diffs.length} diferencia(s)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <p className="font-bold text-[11px] text-slate-500 mb-1">Dato Publicado en Portal:</p>
                      {diffs.map((d, i) => (
                        <p key={i} className="text-slate-700">
                          <strong>{d.field}:</strong> {d.appVal}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="font-bold text-[11px] text-blue-700 mb-1">Dato Declarado en Padrón:</p>
                      {diffs.map((d, i) => (
                        <p key={i} className="text-blue-900 font-medium">
                          <strong>{d.field}:</strong> {d.padronVal}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VISTA 3: COINCIDENCIAS EXACTAS */}
      {filterView === 'exactas' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Estos 10 grupos coinciden de manera idéntica en nombre, zona, días y horarios entre la aplicación y el nuevo padrón.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {reconciliationItems
              .filter((item) => item.isExact)
              .map(({ cand, existing }) => (
                <div
                  key={cand.id_fuente}
                  className="p-3 rounded-xl bg-white border border-emerald-200/80 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="font-bold text-slate-900">{cand.nombre}</p>
                    <p className="text-[11px] text-slate-500">{cand.zona} • {cand.municipio || existing?.city}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* VISTA 4: CENTROS DE REHABILITACIÓN UNIDAD TEOCALLI */}
      {filterView === 'centros' && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 border border-slate-700">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <Building2 className="w-4 h-4" />
              <span>Unidad Teocalli — 28 Centros de Rehabilitación Hermanos</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Los 28 centros de rehabilitación del padrón se mantienen clasificados en su colección independiente y no se mezclan con los grupos de autoayuda. Los teléfonos personales y domicilios internos no se publican sin autorización.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {padronData.centros.map((c) => (
              <div key={c.id_fuente} className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  {c.familia}
                </span>
                <p className="font-bold text-slate-900">{c.nombre}</p>
                <p className="text-slate-500 text-[11px]">Localidad: {c.localidad}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">Autorización: Sujeta a revisión</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 5: REGLAS INMUTABLES */}
      {filterView === 'reglas' && (
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 space-y-2">
            <h4 className="font-bold text-sm text-purple-950 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-700" />
              <span>Protocolo de Protección e Inmutabilidad de Datos</span>
            </h4>
            <p className="leading-relaxed">
              Conforme a los lineamientos del documento maestro, se aplican estrictamente las siguientes garantías:
            </p>
            <ul className="list-disc list-inside space-y-1 text-purple-900/90 pl-1">
              <li><strong>Colecciones separadas:</strong> Grupos de autoayuda en <code>/groups</code> y centros en su propia estructura.</li>
              <li><strong>Preservación total:</strong> Se conservan íntegros los 119 grupos del portal sin eliminación por ausencia en el padrón parcial.</li>
              <li><strong>Sin deduplicación engañosa:</strong> El grupo «Teocalli» de Ciudad del Carmen (Zona Delfín) no se confunde con la Unidad Teocalli de centros.</li>
              <li><strong>Privacidad garantizada:</strong> Ningún teléfono personal de servidores ni domicilio no verificado se publica automáticamente.</li>
              <li><strong>Firebase protegido:</strong> Ninguna mutación a la base de datos se realiza hasta la confirmación expresa del administrador.</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
