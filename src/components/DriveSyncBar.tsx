import React from 'react';
import {
  Cloud,
  CloudCheck,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  LogIn,
  CheckCircle2,
  Clock,
  HardDrive
} from 'lucide-react';
import { DriveSyncStatus } from '../hooks/useDriveAutoSync';

interface DriveSyncBarProps {
  status: DriveSyncStatus;
  lastSyncTime: Date | null;
  lastFileLink: string | null;
  countdown: number;
  autoSyncEnabled: boolean;
  errorMessage: string | null;
  onSyncNow: () => void;
  onConnectGoogle: () => void;
  onToggleAutoSync: (enabled: boolean) => void;
  onOpenWorkspaceModal?: () => void;
}

export const DriveSyncBar: React.FC<DriveSyncBarProps> = ({
  status,
  lastSyncTime,
  lastFileLink,
  countdown,
  autoSyncEnabled,
  errorMessage,
  onSyncNow,
  onConnectGoogle,
  onToggleAutoSync,
  onOpenWorkspaceModal,
}) => {
  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Nunca';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'Hace un momento';
    if (seconds < 60) return `Hace ${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-xl shadow-md border border-emerald-500/30 p-3 sm:p-4 mb-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Lado izquierdo: Estado e Icono */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 shrink-0">
            {status === 'syncing' ? (
              <RefreshCw className="w-5 h-5 animate-spin text-teal-300" />
            ) : status === 'synced' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : status === 'not_authenticated' ? (
              <HardDrive className="w-5 h-5 text-amber-300" />
            ) : status === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-300" />
            ) : (
              <Cloud className="w-5 h-5 text-emerald-300" />
            )}
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-emerald-100 flex items-center gap-1.5">
                ☁️ Google Drive Auto-Sync
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                Cada 1 minuto
              </span>
              {autoSyncEnabled && status !== 'not_authenticated' && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3" />
                  Próxima en {countdown}s
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 flex items-center gap-1.5 flex-wrap">
              {status === 'syncing' && (
                <span className="text-teal-300 font-medium">Sincronizando directorio con Google Drive...</span>
              )}
              {status === 'synced' && (
                <span>
                  Respaldo sincronizado en Google Drive • <span className="text-emerald-300 font-medium">{formatTimeAgo(lastSyncTime)}</span>
                </span>
              )}
              {status === 'not_authenticated' && (
                <span className="text-amber-200">
                  Google Drive requiere sesión activa de Google para el respaldo automático de cada minuto.
                </span>
              )}
              {status === 'error' && (
                <span className="text-rose-300">
                  {errorMessage || 'Error de sincronización con Google Drive.'}
                </span>
              )}
              {status === 'idle' && (
                <span>
                  Último respaldo: <span className="text-emerald-300 font-medium">{formatTimeAgo(lastSyncTime)}</span>
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
          {status === 'not_authenticated' ? (
            <button
              onClick={onConnectGoogle}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Conectar Google Drive
            </button>
          ) : (
            <>
              {lastFileLink && (
                <a
                  href={lastFileLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-emerald-200 text-xs font-medium border border-emerald-500/30 flex items-center gap-1 transition"
                  title="Abrir archivo de respaldo en Google Drive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Ver en Drive
                </a>
              )}

              <button
                onClick={onSyncNow}
                disabled={status === 'syncing'}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium border border-emerald-400/40 flex items-center gap-1.5 shadow transition active:scale-95"
                title="Sincronizar cambios de grupos con Google Drive ahora mismo"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
                Sincronizar Ahora
              </button>
            </>
          )}

          {onOpenWorkspaceModal && (
            <button
              onClick={onOpenWorkspaceModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              title="Abrir centro de integración Google Workspace"
            >
              Panel Drive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
