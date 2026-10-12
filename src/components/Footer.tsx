import React from 'react';
import { Shield, Lock, Heart, Phone, Mail, MessageCircle, Facebook } from 'lucide-react';
import { APP_CONFIG } from '../data/config';
import { AppCustomTexts } from '../types';

interface FooterProps {
  customTexts?: AppCustomTexts;
  onOpenTour?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ customTexts, onOpenTour }) => {
  const phoneToUse = customTexts?.generalPhone || APP_CONFIG.TELEFONO_GENERAL;
  const waToUse = customTexts?.generalWhatsapp || APP_CONFIG.WHATSAPP_GENERAL;
  const fbToUse = customTexts?.generalFacebook || APP_CONFIG.FACEBOOK_GENERAL;
  const mottoToUse = customTexts?.footerMotto || '“Solo por hoy: un paso a la vez hacia la luz.”';

  const cleanPhone = phoneToUse.replace(/\s+/g, '');
  const cleanWa = waToUse.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-12 py-10 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top: Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-800 text-xs">
          {/* Anonimato */}
          <div className="space-y-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>Principio de Anonimato</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              El anonimato es la base espiritual de nuestras tradiciones. Protegemos rigurosamente la identidad de cada persona que asiste. Lo que se comparte en cada sesión, permanece en la sesión.
            </p>
          </div>

          {/* Privacidad de geolocalización */}
          <div className="space-y-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Privacidad de Ubicación</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              La función “Cerca de mí” calcula distancias de forma 100% local en tu navegador. Tus coordenadas GPS nunca se registran, almacenan ni transmiten a servidores externos ni a terceros.
            </p>
          </div>

          {/* Contacto de Guardia */}
          <div className="space-y-2 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Heart className="w-4 h-4" />
              <span>Línea de Servicio en Mérida</span>
            </div>
            <div className="space-y-1 text-slate-300">
              <div>
                Tel: <a href={`tel:${cleanPhone}`} className="hover:text-white font-mono">{phoneToUse}</a>
              </div>
              <div>
                WhatsApp: <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer" className="hover:text-white underline">Compañero de guardia 24/7</a>
              </div>
              <div>
                Facebook: <a href={fbToUse} target="_blank" rel="noopener noreferrer" className="hover:text-white underline inline-flex items-center gap-1"><Facebook className="w-3 h-3 fill-blue-400 text-blue-400 inline" /> Red Guerreros de la Luz</a>
              </div>
              <div className="text-[11px] text-slate-500">
                Sede de Intergrupos: Mérida, Yucatán, México.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-slate-400">Fraternidad Guerreros de la Luz</strong> — Comunidad autónoma de 12 Pasos sin fines de lucro.
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="text-amber-400 hover:text-amber-300 underline cursor-pointer ml-1"
              >
                • Ver tutorial de inicio
              </button>
            )}
          </div>
          <div className="text-center sm:text-right">
            <span>{mottoToUse}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
