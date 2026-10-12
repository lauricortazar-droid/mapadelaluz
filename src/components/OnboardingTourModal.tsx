import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Navigation, 
  MapPin, 
  Map, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Compass, 
  Clock, 
  HeartHandshake,
  Download
} from 'lucide-react';
import { GuerrerosLogo } from './GuerrerosLogo';
import { AppCustomTexts } from '../types';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTexts?: AppCustomTexts;
  onTriggerGeolocation?: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  customTexts,
  onTriggerGeolocation,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Escuchar teclas Escape y flechas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && currentStep < tourSteps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const tourSteps = [
    {
      id: 'welcome',
      tag: 'Bienvenida',
      title: 'Bienvenido al Directorio Oficial',
      subtitle: 'Fraternidad Guerreros de la Luz A.C. — Recuperación en 12 Pasos',
      content: (
        <div className="space-y-4 text-center">
          {/* Logo oficial sin modificar en el centro */}
          <div className="flex justify-center my-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-xl shadow-amber-500/10 inline-flex items-center justify-center">
              <GuerrerosLogo size={130} className="w-32 h-32" customLogoPngUrl={customTexts?.customLogoPngUrl} />
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Este directorio interactivo te ayuda a localizar de forma inmediata más de <strong className="text-amber-300">119 grupos de autoayuda</strong> y centros de rehabilitación hermanos en Mérida, Yucatán y municipios vecinos.
          </p>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <p className="font-bold text-amber-400 text-sm">119+</p>
              <p className="text-slate-400 text-[11px]">Grupos 12 Pasos</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <p className="font-bold text-blue-400 text-sm">6 Zonas</p>
              <p className="text-slate-400 text-[11px]">Jaguar, Águila...</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
              <p className="font-bold text-emerald-400 text-sm">Gratuito</p>
              <p className="text-slate-400 text-[11px]">Confidencial</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'search',
      tag: 'Buscador Inteligente',
      title: 'Encuentra Grupos en Segundos',
      subtitle: 'Filtra por nombre, colonia, municipio o día',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Utiliza la barra de búsqueda superior para ingresar cualquier palabra clave. El directorio buscará en tiempo real:
          </p>

          {/* Demostración interactiva / mockup visual */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <div className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-xs text-slate-200 flex items-center justify-between">
                <span>Ej. <strong className="text-amber-300">Centro, Kanasín, Mujeres, Nocturno...</strong></span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">En vivo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-300">Filtro por días (Lun - Dom)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-300">«Abiertos Hoy / Ahora»</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Puedes combinar la búsqueda con los filtros de modalidad (Mixto, Hombres, Mujeres, Jóvenes) para encontrar la reunión ideal para ti.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'zones',
      tag: 'Zonas Territoriales',
      title: 'Filtra por Zona Fraternal',
      subtitle: 'Organización territorial con prioridad en Zona Jaguar (Yucatán)',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            La Fraternidad organiza sus grupos en 6 zonas heráldicas. Al seleccionar una zona, verás únicamente los grupos que corresponden a esa área:
          </p>

          {/* Demostración de las zonas */}
          <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Píldoras de Filtro Rápido:</p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1">
                <span>🐆</span> Jaguar (Yucatán)
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1">
                <span>🦅</span> Águila
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1">
                <span>🦈</span> Tiburón
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1">
                <span>🐬</span> Delfín
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1">
                <span>🕊️</span> Colibrí
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 flex items-center gap-1">
                <span>🌿</span> Tocalli
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2.5">
            <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Zona Jaguar (Yucatán)</strong> aparece destacada al inicio de la lista de forma prioritaria para brindar el acceso más ágil a los grupos locales.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'geolocation',
      tag: 'Geolocalización',
      title: 'Activa el Modo «Cerca de Mí»',
      subtitle: 'Ordena los grupos por cercanía en kilómetros con rutas directas',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            ¿Necesitas encontrar el grupo más próximo a tu ubicación actual? El botón de geolocalización calcula la distancia exacta:
          </p>

          {/* Demostración interactiva */}
          <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-xs text-white">Botón «Cerca de mí»</p>
                  <p className="text-[11px] text-slate-400">Presiónalo en la barra de filtros</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
                Activar GPS
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Ordena los 119 grupos del más cercano al más lejano.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Muestra la distancia exacta (ej. <em>«A 1.4 km • ~6 min»</em>).</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Abre la ruta con un toque en <strong>Google Maps</strong> o <strong>Waze</strong>.</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Tu privacidad está protegida: la ubicación sólo se procesa localmente en tu navegador.
          </p>
        </div>
      ),
    },
    {
      id: 'map_and_pwa',
      tag: 'Mapa & PWA Móvil',
      title: 'Mapa Interactivo e Instalación',
      subtitle: 'Explora visualmente o instala la aplicación en tu celular',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Lleva el directorio contigo a donde vayas y consúltalo incluso sin conexión a internet:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Map className="w-4 h-4" />
                <span>Vista en Mapa</span>
              </div>
              <p className="text-xs text-slate-300">
                Cambia entre <strong>Lista</strong> y <strong>Mapa</strong> para ver los grupos distribuidos con pines interactivos.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Download className="w-4 h-4" />
                <span>Instalar como App (PWA)</span>
              </div>
              <p className="text-xs text-slate-300">
                Toca <strong>«Instalar App»</strong> en la barra superior para agregarla a tu pantalla de inicio como una aplicación nativa.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              ¡Recuerda que no estás solo! Si necesitas apoyo inmediato 24/7, presiona el botón rojo <strong>«Necesito Ayuda»</strong> para comunicarte vía telefónica o WhatsApp.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const current = tourSteps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Tour */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {current.tag}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Paso {currentStep + 1} de {tourSteps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-800 transition"
              title="Omitir tutorial"
            >
              Saltar
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Cerrar tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Títulos del Paso actual */}
        <div className="px-6 pt-4 pb-1">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-amber-200/90 font-medium mt-0.5">
            {current.subtitle}
          </p>
        </div>

        {/* Contenido scrolleable si la pantalla es reducida */}
        <div className="px-6 py-3 overflow-y-auto flex-1">
          {current.content}
        </div>

        {/* Barra de Navegación y Stepper Inferior */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Indicadores de paso (Dots) */}
          <div className="flex items-center gap-1.5 order-2 sm:order-1">
            {tourSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-amber-400'
                    : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Ir al paso ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>

          {/* Botones Anterior / Siguiente */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            {!isFirst && (
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isLast
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/20 active:scale-95'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-400/20 active:scale-95'
              }`}
            >
              <span>{isLast ? '¡Comenzar a Explorar!' : 'Siguiente'}</span>
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
