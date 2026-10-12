import React from 'react';
import { Shield, Sparkles, HeartHandshake, Calendar, PhoneCall, Upload, Palette, Building2, Users, Facebook, HelpCircle } from 'lucide-react';
import { AppCustomTexts } from '../types';
import { GuerrerosLogo } from './GuerrerosLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenCalendar: () => void;
  onOpenCoordinators: () => void;
  onOpenCsvUpload: () => void;
  onOpenAdmin: () => void;
  onOpenCustomizeText?: () => void;
  onOpenTour?: () => void;
  onOpenWorkspace?: () => void;
  isAdminLoggedIn: boolean;
  activeMainTab: 'grupos' | 'centros';
  onTabChange: (tab: 'grupos' | 'centros') => void;
  groupsCount: number;
  centersCount: number;
  customTexts: AppCustomTexts;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenCalendar,
  onOpenCoordinators,
  onOpenCsvUpload,
  onOpenAdmin,
  onOpenCustomizeText,
  onOpenTour,
  onOpenWorkspace,
  isAdminLoggedIn,
  activeMainTab,
  onTabChange,
  groupsCount,
  centersCount,
  customTexts,
}) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl border-b border-amber-500/30 sticky top-0 z-30">
      {/* Top micro banner editable */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1 text-xs text-amber-200/90 text-center flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        <span className="truncate max-w-4xl">{customTexts.topBannerText}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand / Logo oficial con el escudo de armas */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onTabChange('grupos')}>
            {/* Logotipo SVG adaptado exactamente de la imagen oficial subida por el usuario */}
            <div className="relative hover:scale-105 transition-transform duration-200">
              <GuerrerosLogo size={52} className="drop-shadow-md" customLogoPngUrl={customTexts?.customLogoPngUrl} />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Directorio en línea" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  {customTexts.appTitle}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded">
                  {customTexts.badgeText}
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 font-medium">
                {customTexts.appSubtitle}
              </p>
            </div>
          </div>

          {/* Botones móviles: Admin emoji + Facebook + Ayuda inmediata + PWA + Tour */}
          <div className="flex items-center gap-1.5 md:hidden">
            {/* PWA Install en móvil */}
            <PWAInstallButton variant="compact" className="px-2 py-1.5 text-[11px]" />

            {/* Tour / Tutorial en móvil */}
            {onOpenTour && (
              <button
                onClick={onOpenTour}
                className="p-2 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 transition shadow-sm"
                title="Ver tutorial de inicio"
                aria-label="Ver tutorial"
              >
                <HelpCircle className="w-4 h-4 text-amber-300" />
              </button>
            )}

            {/* Google Workspace en móvil */}
            {onOpenWorkspace && (
              <button
                onClick={onOpenWorkspace}
                className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30 transition shadow-sm"
                title="Google Drive, Forms y Contactos"
                aria-label="Google Workspace"
              >
                <Sparkles className="w-4 h-4 text-blue-300" />
              </button>
            )}

            {/* Facebook en móvil */}
            <a
              href={customTexts.generalFacebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-400/30 transition shadow-sm"
              title="Facebook oficial"
              aria-label="Facebook Oficial"
            >
              <Facebook className="w-4 h-4 fill-blue-300" />
            </a>

            {/* Botón con Emoji para entrar a Admin */}
            <button
              onClick={onOpenAdmin}
              className={`p-2 rounded-xl text-base border transition shadow-sm ${
                isAdminLoggedIn
                  ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Panel de Administradora"
              aria-label="Panel Administradora"
            >
              {isAdminLoggedIn ? '👑' : '🔐'}
            </button>

            {/* Ayuda 24/7 en móvil */}
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all border border-rose-400/40"
              aria-label="Pedir ayuda ahora"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Ayuda</span>
            </button>
          </div>
        </div>

        {/* Action Buttons & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Switcher principal: Grupos de Autoayuda vs Centros de Rehabilitación */}
          <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/15">
            <button
              onClick={() => onTabChange('grupos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'grupos'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{customTexts.tabGroupsText} ({groupsCount})</span>
            </button>

            <button
              onClick={() => onTabChange('centros')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeMainTab === 'centros'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{customTexts.tabCentersText} ({centersCount})</span>
            </button>
          </div>

          {/* SÓLO SI ERES ADMIN PUEDES SUBIR CSV */}
          {isAdminLoggedIn && (
            <button
              onClick={onOpenCsvUpload}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-sm border border-amber-400 animate-fade-in"
              title="Solo Administradora: Subir archivo CSV para actualizar directorio"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir CSV</span>
            </button>
          )}

          {/* SÓLO SI ERES ADMIN: Botón rápido de Personalizar Textos */}
          {isAdminLoggedIn && onOpenCustomizeText && (
            <button
              onClick={onOpenCustomizeText}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm border border-purple-400 animate-fade-in"
              title="Personalizar todos los títulos, botones y textos"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Personalizar Textos</span>
            </button>
          )}

          {/* Botón Instalar PWA */}
          <PWAInstallButton variant="compact" />

          {/* Botón Guía / Tour Interactivo */}
          {onOpenTour && (
            <button
              onClick={onOpenTour}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-xs font-semibold backdrop-blur transition border border-amber-400/30 shadow-sm"
              title="Ver tutorial de inicio interactivo"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Guía / Tour</span>
            </button>
          )}

          {/* Botón Google Workspace (Drive, Forms, Contacts) */}
          {onOpenWorkspace && (
            <button
              onClick={onOpenWorkspace}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600/30 to-amber-500/20 hover:from-blue-600/40 hover:to-amber-500/30 text-white text-xs font-semibold backdrop-blur transition border border-blue-400/30 shadow-sm"
              title="Google Drive, Forms y Contactos"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Workspace</span>
            </button>
          )}

          {/* Facebook oficial */}
          <a
            href={customTexts.generalFacebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 hover:text-white text-xs font-semibold backdrop-blur transition border border-blue-400/30 shadow-sm"
            title="Facebook Oficial Fraternidad Guerreros de la Luz"
          >
            <Facebook className="w-3.5 h-3.5 text-blue-300 fill-blue-300" />
            <span>Facebook</span>
          </a>

          {/* Calendario general */}
          <button
            onClick={onOpenCalendar}
            className="hidden sm:inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-semibold backdrop-blur transition border border-white/15"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            <span>{customTexts.calendarButtonText}</span>
          </button>

          {/* Botón con emoji para entrar a Admin */}
          <button
            onClick={onOpenAdmin}
            className={`hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs shadow-md transition border ${
              isAdminLoggedIn
                ? 'bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            title="Panel de Administradora"
          >
            <span className="text-sm">{isAdminLoggedIn ? '👑' : '🔐'}</span>
            <span>{isAdminLoggedIn ? 'Admin Activo' : 'Admin'}</span>
          </button>

          {/* Botón Necesito Ayuda Ahora 24/7 */}
          <button
            onClick={onOpenHelp}
            className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all border border-rose-400/40"
          >
            <HeartHandshake className="w-4 h-4 text-rose-200" />
            <span>{customTexts.helpButtonText}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
