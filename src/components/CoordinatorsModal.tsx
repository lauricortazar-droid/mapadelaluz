import React, { useState } from 'react';
import { X, FileSpreadsheet, ExternalLink, RefreshCw, CheckCircle2, Info, BookOpen } from 'lucide-react';
import { APP_CONFIG } from '../data/config';

interface CoordinatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSheets: () => Promise<void>;
  isSyncing: boolean;
  syncMessage?: string;
  onOpenWorkspace?: () => void;
}

export const CoordinatorsModal: React.FC<CoordinatorsModalProps> = ({
  isOpen,
  onClose,
  onSyncSheets,
  isSyncing,
  syncMessage,
  onOpenWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'sheets'>('form');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coord-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2.5">
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-300" />
            <span>Área de Servicio y Coordinación</span>
          </div>

          <h2 id="coord-title" className="font-serif text-2xl font-bold text-white mb-1">
            Registrar o Actualizar un Grupo
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Herramienta para coordinadores, secretarios y servidores de grupo de la Fraternidad Guerreros de la Luz Mérida.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'form'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Google Forms de Registro
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'sheets'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Sincronización con Google Sheets
            </button>
            {onOpenWorkspace && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWorkspace();
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-500/30 hover:bg-blue-500/50 text-blue-200 border border-blue-400/40 transition flex items-center gap-1.5"
              >
                <span>Google Workspace Hub</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto text-sm text-slate-700">
          {activeTab === 'form' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold mb-1">Actualización de horarios o apertura de nuevo grupo</div>
                  <p className="leading-relaxed">
                    Si eres servidor y tu grupo cambió de domicilio, modificó días de sesión o deseas dar de alta un nuevo grupo en Mérida o municipios conurbados, registra los datos en el formulario oficial.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-300 h-96">
                <iframe
                  src={APP_CONFIG.FORM_COORDINADORES_URL}
                  width="100%"
                  height="100%"
                  title="Formulario de coordinadores"
                  className="w-full h-full border-none"
                >
                  Cargando formulario de Google Forms...
                </iframe>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">¿Problemas al visualizar el formulario embebido?</span>
                <a
                  href={APP_CONFIG.FORM_COORDINADORES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900"
                >
                  <span>Abrir formulario completo en Google Forms</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>¿Cómo funciona la base de datos en Google Sheets?</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Esta webapp puede leer los grupos en tiempo real desde una hoja de cálculo compartida de Google Sheets. Esto permite a los coordinadores actualizar horarios y teléfonos sin necesidad de programar ni tocar el código fuente.
                </p>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 font-mono text-slate-800">
                  <div className="font-bold font-sans text-slate-900">Columnas requeridas en la hoja:</div>
                  <div className="text-[11px] text-slate-600 break-all">
                    id, nombre, tipo, direccion, colonia, municipio, referencias, lat, lng, sesiones, telefono, whatsapp, correo, accesibilidad, activo
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => onSyncSheets()}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando hoja...' : 'Sincronizar ahora con Google Sheets'}</span>
                  </button>

                  {syncMessage && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {syncMessage}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold">Para publicar una hoja de Google Sheets en CSV:</div>
                <ol className="list-decimal list-inside space-y-1 text-amber-800/90 pl-1">
                  <li>En Google Sheets: Menú <strong>Archivo</strong> &gt; <strong>Compartir</strong> &gt; <strong>Publicar en la web</strong>.</li>
                  <li>Selecciona la pestaña con los grupos y en formato elige <strong>Valores separados por comas (.csv)</strong>.</li>
                  <li>Haz clic en <strong>Publicar</strong> y pega el enlace en la variable de entorno <code className="bg-amber-100 px-1 py-0.5 rounded">VITE_SHEETS_CSV_URL</code>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
