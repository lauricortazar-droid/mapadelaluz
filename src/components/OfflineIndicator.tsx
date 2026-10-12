import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600/95 backdrop-blur-md px-4 py-2 text-xs font-semibold text-white shadow-2xl border border-amber-400/40 animate-fade-in">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-100"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>Modo Sin Conexión — Directorio y grupos disponibles localmente.</span>
    </div>
  );
};
