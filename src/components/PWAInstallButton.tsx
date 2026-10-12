import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone PWA mode, don't show
  if (isInstalled && !justInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions fallback
      setShowIOSGuide(true);
    }
  };

  if (justInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold animate-fade-in">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>¡App Instalada!</span>
      </div>
    );
  }

  // Show button if installable OR on iOS or anytime not yet in standalone
  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-900/30 border border-emerald-400/30 transition-all ${className}`}
          title="Instalar aplicación en tu pantalla de inicio (Android, iPhone o PC)"
          aria-label="Instalar aplicación en dispositivo"
        >
          <Download className="w-3.5 h-3.5 text-emerald-200" />
          <span>Instalar App</span>
        </button>
      ) : variant === 'banner' ? (
        <div className={`p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-emerald-500/30 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-sm text-white">Instala la App de Guerreros de la Luz</p>
              <p className="text-xs text-slate-300">Acceso rápido desde tu inicio, sin conexión y con mapas instantáneos.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Instalar Ahora</span>
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-md transition ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-200" />
          <span>Instalar App en Celular / PC</span>
        </button>
      )}

      {/* Modal Guía de Instalación para iOS / Navegadores */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-white relative">
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>

            <h3 className="text-base font-bold text-white">
              {isIOS ? 'Instalar en iPhone / iPad' : 'Cómo instalar la Aplicación'}
            </h3>

            {isIOS ? (
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/80">
                  <Share className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>1. En Safari, toca el botón de <strong>Compartir</strong> (icono de cuadrado con flecha hacia arriba).</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/80">
                  <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>2. Desliza hacia abajo y selecciona <strong>«Agregar al inicio»</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>3. Toca <strong>Agregar</strong> arriba a la derecha. ¡Listo! La app aparecerá como una app nativa en tu pantalla.</span>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <p>
                  Para instalar la aplicación en Android o tu computadora:
                </p>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-800/80">
                  <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Toca el menú del navegador (los 3 puntos ⋮) y selecciona <strong>«Instalar aplicación»</strong> o <strong>«Agregar a la pantalla principal»</strong>.</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Podrás acceder de forma rápida, a pantalla completa y consultar los grupos aún sin conexión a internet.
                </p>
              </div>
            )}

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-2.5 text-xs font-bold text-white transition border border-slate-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
