import React, { useState } from 'react';
import {
  X,
  Lock,
  Save,
  CheckCircle2,
  Download,
  Upload,
  Check,
  Camera,
  Palette,
  RotateCcw,
  Sliders,
  Type,
  FileCheck,
  Image as ImageIcon,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Group, LeaderProposal, ZoneType, AppCustomTexts, CalendarEvent } from '../types';
import { DEFAULT_CUSTOM_TEXTS } from '../data/config';
import { getZoneInfo } from '../utils/zones';
import { PadronReconciliationView } from './PadronReconciliationView';
import { GuerrerosLogo } from './GuerrerosLogo';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onAdminLogin: (pass: string) => boolean;
  onAdminLogout: () => void;
  groups: Group[];
  onSaveGroup: (updatedGroup: Group) => void;
  onDeleteGroup: (groupId: string | number) => void;
  onAddNewGroup: (newGroup: Group) => void;
  proposals: LeaderProposal[];
  onApproveProposal: (proposal: LeaderProposal) => void;
  onRejectProposal: (proposalId: string) => void;
  onExportCsv: () => void;
  onOpenCsvUpload: () => void;
  editingGroupFromOutside?: Group | null;
  customTexts: AppCustomTexts;
  onSaveCustomTexts: (texts: AppCustomTexts) => void;
  onResetCustomTexts: () => void;
  initialTab?: 'editor' | 'proposals' | 'tools' | 'customize' | 'cotejo';
  onUpdatePassword?: (newPassword: string) => void;
  onOpenWorkspace?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onAdminLogin,
  onAdminLogout,
  groups,
  onSaveGroup,
  onDeleteGroup,
  onAddNewGroup,
  proposals,
  onApproveProposal,
  onRejectProposal,
  onExportCsv,
  onOpenCsvUpload,
  editingGroupFromOutside,
  customTexts,
  onSaveCustomTexts,
  onResetCustomTexts,
  initialTab = 'editor',
  onUpdatePassword,
  onOpenWorkspace,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordUpdatedMessage, setPasswordUpdatedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'proposals' | 'tools' | 'customize' | 'cotejo'>(initialTab);
  const [selectedGroupToEdit, setSelectedGroupToEdit] = useState<Group | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Formulario de edición de grupo
  const [editName, setEditName] = useState('');
  const [editZone, setEditZone] = useState<ZoneType>('Jaguar');
  const [editAddress, setEditAddress] = useState('');
  const [editColonia, setEditColonia] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editSchedules, setEditSchedules] = useState('');
  const [editSessionTypes, setEditSessionTypes] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editMapsUrl, setEditMapsUrl] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editFotoUrl, setEditFotoUrl] = useState('');

  // Formulario de personalización de textos
  const [textsForm, setTextsForm] = useState<AppCustomTexts>(customTexts);

  React.useEffect(() => {
    setTextsForm(customTexts);
  }, [customTexts]);

  // Estados para personalización del ícono PNG oficial
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [logoFileError, setLogoFileError] = useState<string | null>(null);

  // Estados para nuevo evento en el calendario desde pestaña de personalización
  const [showAdminEventForm, setShowAdminEventForm] = useState(false);
  const [adminEvtTitle, setAdminEvtTitle] = useState('');
  const [adminEvtFecha, setAdminEvtFecha] = useState('');
  const [adminEvtHora, setAdminEvtHora] = useState('');
  const [adminEvtLugar, setAdminEvtLugar] = useState('');
  const [adminEvtTipo, setAdminEvtTipo] = useState('Aniversario');
  const [adminEvtDescripcion, setAdminEvtDescripcion] = useState('');
  const [adminEvtLink, setAdminEvtLink] = useState('');

  // Medir dimensiones cuando cambia customLogoPngUrl
  React.useEffect(() => {
    if (textsForm.customLogoPngUrl && textsForm.customLogoPngUrl.trim()) {
      const img = new Image();
      img.onload = () => {
        setLogoDimensions({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        setLogoDimensions(null);
      };
      img.src = textsForm.customLogoPngUrl;
    } else {
      setLogoDimensions(null);
    }
  }, [textsForm.customLogoPngUrl]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('image')) {
      setLogoFileError('Por favor selecciona un archivo de imagen en formato PNG.');
      return;
    }

    setLogoFileError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          setLogoDimensions({ width: img.width, height: img.height });
          setTextsForm((prev) => ({ ...prev, customLogoPngUrl: dataUrl }));
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddCalendarEventFromAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEvtTitle.trim() || !adminEvtFecha.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: adminEvtTitle.trim(),
      fecha: adminEvtFecha.trim(),
      hora: adminEvtHora.trim() || 'Hora por confirmar',
      lugar: adminEvtLugar.trim() || 'Sede oficial de la Fraternidad',
      tipo: adminEvtTipo.trim() || 'Evento Oficial',
      descripcion: adminEvtDescripcion.trim() || undefined,
      link: adminEvtLink.trim() || undefined,
    };

    const currentList = textsForm.calendarManualEvents || [];
    setTextsForm((prev) => ({
      ...prev,
      calendarManualEvents: [...currentList, newEvt],
    }));

    setAdminEvtTitle('');
    setAdminEvtFecha('');
    setAdminEvtHora('');
    setAdminEvtLugar('');
    setAdminEvtTipo('Aniversario');
    setAdminEvtDescripcion('');
    setAdminEvtLink('');
    setShowAdminEventForm(false);
  };

  const handleDeleteCalendarEventFromAdmin = (id: string) => {
    const currentList = textsForm.calendarManualEvents || [];
    setTextsForm((prev) => ({
      ...prev,
      calendarManualEvents: currentList.filter((ev) => ev.id !== id),
    }));
  };

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  React.useEffect(() => {
    if (editingGroupFromOutside) {
      setActiveTab('editor');
      setSelectedGroupToEdit(editingGroupFromOutside);
      setEditName(editingGroupFromOutside.nombre);
      setEditZone(editingGroupFromOutside.zone || 'Jaguar');
      setEditAddress(editingGroupFromOutside.direccion);
      setEditColonia(editingGroupFromOutside.colonia);
      setEditCity(editingGroupFromOutside.city || editingGroupFromOutside.municipio);
      setEditWhatsapp(editingGroupFromOutside.whatsapp);
      setEditPhone(editingGroupFromOutside.telefono);
      setEditSchedules(editingGroupFromOutside.schedulesRaw || '');
      setEditSessionTypes(editingGroupFromOutside.sessionTypesRaw || '');
      setEditFacebook(editingGroupFromOutside.facebook || '');
      setEditMapsUrl(editingGroupFromOutside.mapsUrl || '');
      setEditActive(editingGroupFromOutside.activo);
      setEditFotoUrl(editingGroupFromOutside.foto_url || '');
    } else if (!selectedGroupToEdit && groups.length > 0) {
      const target = groups[0];
      setSelectedGroupToEdit(target);
      setEditName(target.nombre);
      setEditZone(target.zone || 'Jaguar');
      setEditAddress(target.direccion);
      setEditColonia(target.colonia);
      setEditCity(target.city || target.municipio);
      setEditWhatsapp(target.whatsapp);
      setEditPhone(target.telefono);
      setEditSchedules(target.schedulesRaw || '');
      setEditSessionTypes(target.sessionTypesRaw || '');
      setEditFacebook(target.facebook || '');
      setEditMapsUrl(target.mapsUrl || '');
      setEditActive(target.activo);
      setEditFotoUrl(target.foto_url || '');
    }
  }, [editingGroupFromOutside, groups]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onAdminLogin(passwordInput);
    if (!success) {
      setLoginError(true);
    } else {
      setLoginError(false);
      setPasswordInput('');
    }
  };

  const handleSaveCurrentGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupToEdit) return;

    const updated: Group = {
      ...selectedGroupToEdit,
      nombre: editName,
      zone: editZone,
      direccion: editAddress,
      colonia: editColonia,
      municipio: editCity || selectedGroupToEdit.municipio,
      city: editCity,
      whatsapp: editWhatsapp,
      telefono: editPhone,
      schedulesRaw: editSchedules,
      sessionTypesRaw: editSessionTypes,
      facebook: editFacebook.trim() ? editFacebook.trim() : undefined,
      mapsUrl: editMapsUrl.trim() ? editMapsUrl.trim() : undefined,
      activo: editActive,
      foto_url: editFotoUrl.trim() ? editFotoUrl.trim() : undefined,
      ultima_actualizacion: new Date().toISOString().split('T')[0],
    };

    onSaveGroup(updated);
    setSelectedGroupToEdit(updated);
    setStatusMessage('¡Cambios guardados y asegurados con éxito!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveTexts = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveCustomTexts(textsForm);
    setStatusMessage('¡Todos los títulos, nombres y botones han sido actualizados!');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleResetTexts = () => {
    if (confirm('¿Restablecer todos los textos a los valores predeterminados?')) {
      onResetCustomTexts();
      setTextsForm(DEFAULT_CUSTOM_TEXTS);
      setStatusMessage('Textos restaurados a los originales.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const pendingProposals = proposals.filter((p) => p.status === 'pendiente');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔐</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              Panel de Administradora
            </span>
            {isAdminLoggedIn && (
              <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Sesión activa</span>
              </span>
            )}
          </div>

          <h2 id="admin-title" className="font-serif text-2xl font-bold text-white mb-1">
            Gestión de Datos y Personalización Total
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Personaliza en vivo todos los títulos, botones, nombres, lemas y teléfonos. Administra grupos, aprueba propuestas con fotos y carga archivos CSV.
          </p>

          {isAdminLoggedIn && (
            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'editor'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Editar Grupos ({groups.length})
                </button>
                <button
                  onClick={() => setActiveTab('customize')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'customize'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Personalizar Textos y Botones</span>
                </button>
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'proposals'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <span>Propuestas de Líderes</span>
                  {pendingProposals.length > 0 && (
                    <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                      {pendingProposals.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    activeTab === 'tools'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  Subir / Exportar CSV
                </button>
                <button
                  onClick={() => setActiveTab('cotejo')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                    activeTab === 'cotejo'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Cotejo Padrón 2026</span>
                  <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full text-[10px] font-bold">
                    97/119
                  </span>
                </button>
              </div>

              <button
                onClick={onAdminLogout}
                className="text-xs text-rose-300 hover:text-white underline font-semibold"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-6 flex-1 overflow-y-auto">
          {!isAdminLoggedIn ? (
            /* Pantalla de bloqueo de Administradora */
            <div className="max-w-sm mx-auto py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-700 shadow-inner">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 mb-1">
                  Acceso exclusivo para Administradora
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ingresa tu clave de acceso para desbloquear la personalización total de textos y la subida de CSV.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setLoginError(false);
                  }}
                  placeholder="Ingresa tu contraseña"
                  className="w-full text-center tracking-widest text-lg font-mono py-2.5 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />

                {loginError && (
                  <div className="text-xs text-rose-600 font-semibold">
                    Contraseña incorrecta. Por favor verifica e intenta de nuevo.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-blue-950 text-white font-bold text-xs shadow-md transition"
                >
                  Entrar como Administradora
                </button>
              </form>
            </div>
          ) : (
            /* Panel autenticado */
            <div className="space-y-6">
              {statusMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* PESTAÑA: PERSONALIZAR TEXTOS Y BOTONES */}
              {activeTab === 'customize' && (
                <form onSubmit={handleSaveTexts} className="space-y-6 text-xs text-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900 flex items-center gap-2">
                        <Type className="w-4 h-4 text-amber-600" />
                        <span>Personalizador de Textos, Títulos y Botones de la App</span>
                      </h3>
                      <p className="text-slate-500 text-[11px]">
                        Modifica los nombres que aparecen en la interfaz. Los cambios se aplicarán de inmediato.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetTexts}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold flex items-center gap-1 transition"
                      title="Volver a los textos de fábrica"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer</span>
                    </button>
                  </div>

                  {/* Sección de Ícono Oficial PNG con sugerencia de medida */}
                  <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-300 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-700">
                          <ImageIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-slate-900">
                            Personalizar Ícono de Guerreros de la Luz (PNG)
                          </h4>
                          <p className="text-[11px] text-slate-600">
                            Sugerencia de medida recomendada: <strong className="text-amber-800">512 x 512 píxeles</strong> (mínimo recomendado: <strong>256 x 256 px</strong>). Formato PNG con fondo transparente para visualización nítida en pantallas Retina y modo oscuro.
                          </p>
                        </div>
                      </div>
                      {textsForm.customLogoPngUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setTextsForm({ ...textsForm, customLogoPngUrl: '' });
                            setLogoDimensions(null);
                            setLogoFileError(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-semibold text-amber-900 hover:text-slate-950 bg-amber-200/70 hover:bg-amber-300 rounded-lg transition"
                        >
                          Restablecer al SVG Oficial
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                      {/* Controles de carga */}
                      <div className="md:col-span-8 space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Opción 1: Subir imagen PNG desde tu equipo
                          </label>
                          <input
                            type="file"
                            accept="image/png,image/*"
                            onChange={handleLogoFileUpload}
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-400 file:text-slate-950 hover:file:bg-amber-500 file:cursor-pointer cursor-pointer border border-slate-300 rounded-xl p-1 bg-white"
                          />
                          {logoFileError && (
                            <p className="text-[11px] text-rose-600 mt-1 font-medium">{logoFileError}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Opción 2: O ingresar URL web directa de la imagen PNG
                          </label>
                          <input
                            type="url"
                            value={textsForm.customLogoPngUrl || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextsForm({ ...textsForm, customLogoPngUrl: val });
                              if (val.trim()) {
                                const img = new Image();
                                img.onload = () => setLogoDimensions({ width: img.width, height: img.height });
                                img.onerror = () => setLogoDimensions(null);
                                img.src = val;
                              } else {
                                setLogoDimensions(null);
                              }
                            }}
                            placeholder="https://ejemplo.com/icono_guerreros.png"
                            className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-800 font-mono"
                          />
                        </div>

                        {logoDimensions && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>
                              Resolución detectada: <strong>{logoDimensions.width} x {logoDimensions.height} px</strong>
                              {logoDimensions.width >= 256 && logoDimensions.height >= 256
                                ? ' (✓ Cumple con la sugerencia de medida recomendada)'
                                : ' (Aviso: Recomendamos al menos 256x256 px o 512x512 px para máxima nitidez)'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Previsualización en vivo */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center shadow-inner">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 mb-2">
                          Previsualización en Vivo
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center p-1 border border-slate-700 mx-auto">
                              <GuerrerosLogo size={42} customLogoPngUrl={textsForm.customLogoPngUrl} />
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1 block">Cabecera (48px)</span>
                          </div>
                          <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center p-1 border border-slate-700 mx-auto">
                              <GuerrerosLogo size={58} customLogoPngUrl={textsForm.customLogoPngUrl} />
                            </div>
                            <span className="text-[9px] text-slate-400 mt-1 block">Grande (64px)</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 font-medium">
                          {textsForm.customLogoPngUrl ? '✓ Ícono PNG Personalizado Activo' : 'Emblema SVG Predeterminado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sección 1: Cabecera y Marca */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      1. Títulos de la Cabecera y Marca
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Título Principal</label>
                        <input
                          type="text"
                          value={textsForm.appTitle}
                          onChange={(e) => setTextsForm({ ...textsForm, appTitle: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Distintivo / Siglas</label>
                        <input
                          type="text"
                          value={textsForm.badgeText}
                          onChange={(e) => setTextsForm({ ...textsForm, badgeText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Subtítulo Descriptivo</label>
                        <input
                          type="text"
                          value={textsForm.appSubtitle}
                          onChange={(e) => setTextsForm({ ...textsForm, appSubtitle: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Lema del Banner Superior</label>
                      <input
                        type="text"
                        value={textsForm.topBannerText}
                        onChange={(e) => setTextsForm({ ...textsForm, topBannerText: e.target.value })}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Sección 2: Botones y Pestañas Principales */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      2. Botones Principales y Pestañas
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Botón de Ayuda / Crisis</label>
                        <input
                          type="text"
                          value={textsForm.helpButtonText}
                          onChange={(e) => setTextsForm({ ...textsForm, helpButtonText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Pestaña Grupos</label>
                        <input
                          type="text"
                          value={textsForm.tabGroupsText}
                          onChange={(e) => setTextsForm({ ...textsForm, tabGroupsText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Pestaña Centros</label>
                        <input
                          type="text"
                          value={textsForm.tabCentersText}
                          onChange={(e) => setTextsForm({ ...textsForm, tabCentersText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Teléfono General de Servicio</label>
                        <input
                          type="text"
                          value={textsForm.generalPhone}
                          onChange={(e) => setTextsForm({ ...textsForm, generalPhone: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">WhatsApp General (sin espacios)</label>
                        <input
                          type="text"
                          value={textsForm.generalWhatsapp}
                          onChange={(e) => setTextsForm({ ...textsForm, generalWhatsapp: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Página de Facebook Oficial</label>
                        <input
                          type="url"
                          value={textsForm.generalFacebook || ''}
                          onChange={(e) => setTextsForm({ ...textsForm, generalFacebook: e.target.value })}
                          placeholder="https://facebook.com/..."
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Botón Calendario</label>
                        <input
                          type="text"
                          value={textsForm.calendarButtonText}
                          onChange={(e) => setTextsForm({ ...textsForm, calendarButtonText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 3: Botones de las Tarjetas de Grupo */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      3. Nombres de Botones en cada Tarjeta de Grupo
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div>
                        <label className="block font-semibold mb-1">Botón de Ruta / Maps</label>
                        <input
                          type="text"
                          value={textsForm.cardRouteBtnText}
                          onChange={(e) => setTextsForm({ ...textsForm, cardRouteBtnText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Botón WhatsApp</label>
                        <input
                          type="text"
                          value={textsForm.cardWaBtnText}
                          onChange={(e) => setTextsForm({ ...textsForm, cardWaBtnText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Botón Facebook</label>
                        <input
                          type="text"
                          value={textsForm.cardFbBtnText || 'FB'}
                          onChange={(e) => setTextsForm({ ...textsForm, cardFbBtnText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Botón Ficha</label>
                        <input
                          type="text"
                          value={textsForm.cardDetailsBtnText}
                          onChange={(e) => setTextsForm({ ...textsForm, cardDetailsBtnText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">Botón Proponer (Líder)</label>
                        <input
                          type="text"
                          value={textsForm.cardProposeBtnText}
                          onChange={(e) => setTextsForm({ ...textsForm, cardProposeBtnText: e.target.value })}
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sección 4: Sección de Centros de Rehabilitación */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                      4. Centros de Rehabilitación Hermanos
                    </span>
                    <div>
                      <label className="block font-semibold mb-1">Título de Sección de Centros</label>
                      <input
                        type="text"
                        value={textsForm.rehabSectionTitle}
                        onChange={(e) => setTextsForm({ ...textsForm, rehabSectionTitle: e.target.value })}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Descripción de Centros Aliados</label>
                      <textarea
                        rows={2}
                        value={textsForm.rehabSectionSubtitle}
                        onChange={(e) => setTextsForm({ ...textsForm, rehabSectionSubtitle: e.target.value })}
                        className="w-full p-2 bg-white rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>

                  {/* Sección 5: Textos y Nombres de Zonas */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                        5. Personalización Completa de Zonas y Filtros
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Edita los nombres oficiales, lemas y regiones de cada zona, así como las etiquetas del filtro.
                      </p>
                    </div>

                    {/* Filtro general de zonas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Etiqueta del Filtro</label>
                        <input
                          type="text"
                          value={textsForm.zoneFilterLabel || ''}
                          placeholder="Zona:"
                          onChange={(e) => setTextsForm({ ...textsForm, zoneFilterLabel: e.target.value })}
                          className="w-full p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Texto Botón 'Todas las Zonas'</label>
                        <input
                          type="text"
                          value={textsForm.zoneAllButtonText && !textsForm.zoneAllButtonText.toLowerCase().includes('jaguar') ? textsForm.zoneAllButtonText : 'Todas'}
                          placeholder="Todas"
                          onChange={(e) => setTextsForm({ ...textsForm, zoneAllButtonText: e.target.value })}
                          className="w-full p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    {/* Las 6 zonas */}
                    <div className="space-y-3">
                      {/* 1. Zona Jaguar */}
                      <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                          <span>🐆</span>
                          <span>Zona Jaguar (Yucatán - Sede Principal)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneJaguarName || ''}
                              placeholder="Jaguar (Yucatán)"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneJaguarName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-emerald-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneJaguarLine}
                              placeholder="Fuerza y servicio"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneJaguarLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-emerald-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneJaguarRegion || ''}
                              placeholder="Yucatán"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneJaguarRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-emerald-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 2. Zona Tiburón */}
                      <div className="bg-sky-50/50 border border-sky-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-sky-900 text-xs">
                          <span>🦈</span>
                          <span>Zona Tiburón</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneTiburonName || ''}
                              placeholder="Tiburón"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTiburonName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-sky-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneTiburonLine}
                              placeholder="Determinación"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTiburonLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-sky-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneTiburonRegion || ''}
                              placeholder="Quintana Roo"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTiburonRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-sky-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Zona Delfín */}
                      <div className="bg-blue-50/50 border border-blue-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                          <span>🐬</span>
                          <span>Zona Delfín</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneDelfinName || ''}
                              placeholder="Delfín"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneDelfinName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-blue-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneDelfinLine}
                              placeholder="Renacimiento"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneDelfinLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-blue-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneDelfinRegion || ''}
                              placeholder="Campeche"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneDelfinRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-blue-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 4. Zona Águila */}
                      <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
                          <span>🦅</span>
                          <span>Zona Águila</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneAguilaName || ''}
                              placeholder="Águila"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneAguilaName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-rose-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneAguilaLine}
                              placeholder="Visión elevada"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneAguilaLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-rose-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneAguilaRegion || ''}
                              placeholder="La Laguna"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneAguilaRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-rose-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 5. Zona Colibrí */}
                      <div className="bg-purple-50/50 border border-purple-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                          <span>🐦</span>
                          <span>Zona Colibrí</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneColibriName || ''}
                              placeholder="Colibrí"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneColibriName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-purple-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneColibriLine}
                              placeholder="Transformación"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneColibriLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-purple-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneColibriRegion || ''}
                              placeholder="Puebla / Tlaxcala"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneColibriRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-purple-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 6. Zona Tocalli */}
                      <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl space-y-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                          <span>🏛️</span>
                          <span>Zona Teocalli (Centros de Rehabilitación Hermanos)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Nombre visible</label>
                            <input
                              type="text"
                              value={textsForm.zoneTocalliName || ''}
                              placeholder="Teocalli"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTocalliName: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-amber-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Lema / Frase</label>
                            <input
                              type="text"
                              value={textsForm.zoneTocalliLine}
                              placeholder="Unión y sabiduría"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTocalliLine: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-amber-300 text-xs"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-0.5">Región / Territorio</label>
                            <input
                              type="text"
                              value={textsForm.zoneTocalliRegion || ''}
                              placeholder="Red Aliada"
                              onChange={(e) => setTextsForm({ ...textsForm, zoneTocalliRegion: e.target.value })}
                              className="w-full p-2 bg-white rounded-lg border border-amber-300 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección 6: Configuración del Calendario General */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                          6. Calendario General de la Fraternidad (Eventos Escritos y Google Calendar)
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          El calendario público mostrará exclusivamente lo que redactes por escrito o vincules con tu Google Calendar.
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {textsForm.calendarGoogleCid || 'gdll.agenda@gmail.com'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Cuenta / ID de Google Calendar</label>
                        <input
                          type="text"
                          value={textsForm.calendarGoogleCid || 'gdll.agenda@gmail.com'}
                          onChange={(e) => setTextsForm({ ...textsForm, calendarGoogleCid: e.target.value })}
                          placeholder="gdll.agenda@gmail.com"
                          className="w-full p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs font-mono"
                        />
                        <span className="text-[10px] text-slate-500">
                          Calendario oficial para vincular y sincronizar agenda de Google.
                        </span>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1 text-slate-700">Modo de Visualización</label>
                        <select
                          value={textsForm.calendarMode || 'both'}
                          onChange={(e) => setTextsForm({ ...textsForm, calendarMode: e.target.value as any })}
                          className="w-full p-2 bg-slate-50 rounded-lg border border-slate-300 text-xs"
                        >
                          <option value="both">Ambos (Eventos escritos + Google Calendar en vivo)</option>
                          <option value="manual">Solamente Eventos Escritos por la Administradora</option>
                          <option value="google">Solamente Google Calendar Vinculado</option>
                        </select>
                      </div>
                    </div>

                    {/* Eventos escritos registrados */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-xs text-slate-800">
                          Eventos Escritos Oficiales ({textsForm.calendarManualEvents?.length || 0})
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowAdminEventForm(!showAdminEventForm)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{showAdminEventForm ? 'Cerrar Formulario' : '+ Redactar Evento'}</span>
                        </button>
                      </div>

                      {/* Formulario para nuevo evento */}
                      {showAdminEventForm && (
                        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-300 space-y-3">
                          <span className="font-bold text-xs text-amber-900 block">
                            Nuevo Evento Oficial Escrito
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block font-medium text-slate-700 mb-0.5">Título *</label>
                              <input
                                type="text"
                                value={adminEvtTitle}
                                onChange={(e) => setAdminEvtTitle(e.target.value)}
                                placeholder="Ej. Taller de los 12 Pasos"
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-slate-700 mb-0.5">Tipo de Evento</label>
                              <select
                                value={adminEvtTipo}
                                onChange={(e) => setAdminEvtTipo(e.target.value)}
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              >
                                <option value="Aniversario">Aniversario de Grupo</option>
                                <option value="Taller de 12 Pasos">Taller de 12 Pasos</option>
                                <option value="Junta de Servicio">Junta de Servicio / Intergrupos</option>
                                <option value="Reunión Magna">Reunión Magna Regional</option>
                                <option value="Sesión Abierta">Sesión Abierta a Familiares</option>
                                <option value="Conferencia">Conferencia Especial</option>
                                <option value="Otro">Otro Evento Especial</option>
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-slate-700 mb-0.5">Fecha *</label>
                              <input
                                type="text"
                                value={adminEvtFecha}
                                onChange={(e) => setAdminEvtFecha(e.target.value)}
                                placeholder="Ej. Sábado 24 de Octubre, 2026"
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-slate-700 mb-0.5">Horario</label>
                              <input
                                type="text"
                                value={adminEvtHora}
                                onChange={(e) => setAdminEvtHora(e.target.value)}
                                placeholder="Ej. 10:00 am - 1:00 pm"
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block font-medium text-slate-700 mb-0.5">Lugar o Dirección</label>
                              <input
                                type="text"
                                value={adminEvtLugar}
                                onChange={(e) => setAdminEvtLugar(e.target.value)}
                                placeholder="Ej. Sede Central / Calle 60 x 57 Centro Histórico"
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block font-medium text-slate-700 mb-0.5">Descripción o nota</label>
                              <textarea
                                rows={2}
                                value={adminEvtDescripcion}
                                onChange={(e) => setAdminEvtDescripcion(e.target.value)}
                                placeholder="Detalles adicionales..."
                                className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAdminEventForm(false)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={handleAddCalendarEventFromAdmin}
                              className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                            >
                              Agregar a la lista
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Lista de eventos */}
                      {(!textsForm.calendarManualEvents || textsForm.calendarManualEvents.length === 0) ? (
                        <p className="text-xs text-slate-500 italic p-2 bg-white rounded-lg border border-slate-200">
                          No hay eventos escritos agregados todavía. Puedes redactar uno con el botón superior.
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {textsForm.calendarManualEvents.map((evt) => (
                            <div
                              key={evt.id}
                              className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900">{evt.title}</span>
                                <span className="ml-2 text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                                  {evt.tipo}
                                </span>
                                <p className="text-[11px] text-slate-500">
                                  {evt.fecha} • {evt.hora} {evt.lugar && `• ${evt.lugar}`}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteCalendarEventFromAdmin(evt.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition"
                                title="Eliminar este evento"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de Guardar Textos */}
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Personalización de Textos</span>
                    </button>
                  </div>
                </form>
              )}

              {/* PESTAÑA: EDITOR DE CADA GRUPO */}
              {activeTab === 'editor' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Selector lateral de grupo */}
                  <div className="md:col-span-4 space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Selecciona un grupo para editar:
                    </label>
                    <div className="max-h-96 overflow-y-auto space-y-1 rounded-xl border border-slate-200 p-1 bg-slate-50">
                      {groups.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => {
                            setSelectedGroupToEdit(g);
                            setEditName(g.nombre);
                            setEditZone(g.zone || 'Jaguar');
                            setEditAddress(g.direccion);
                            setEditColonia(g.colonia);
                            setEditCity(g.city || g.municipio);
                            setEditWhatsapp(g.whatsapp);
                            setEditPhone(g.telefono);
                            setEditSchedules(g.schedulesRaw || '');
                            setEditSessionTypes(g.sessionTypesRaw || '');
                            setEditMapsUrl(g.mapsUrl || '');
                            setEditActive(g.activo);
                            setEditFotoUrl(g.foto_url || '');
                          }}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition flex items-center justify-between ${
                            selectedGroupToEdit?.id === g.id
                              ? 'bg-blue-900 text-white font-bold shadow-sm'
                              : 'hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          <div className="truncate">
                            <span className="font-semibold">{g.nombre}</span>
                            <span className="block text-[10px] opacity-75">{g.zone} • {g.colonia}</span>
                          </div>
                          {!g.activo && (
                            <span className="text-[9px] bg-rose-500 text-white px-1 rounded">Inactivo</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formulario de edición del grupo seleccionado */}
                  <div className="md:col-span-8 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                    <form onSubmit={handleSaveCurrentGroup} className="space-y-4 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-serif font-bold text-slate-900 text-sm">
                          Editando: {selectedGroupToEdit?.nombre}
                        </span>
                        <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-700">
                          <input
                            type="checkbox"
                            checked={editActive}
                            onChange={(e) => setEditActive(e.target.checked)}
                            className="rounded text-blue-900"
                          />
                          <span>Grupo Activo</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Nombre del Grupo</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Zona Fraternidad</label>
                          <select
                            value={editZone}
                            onChange={(e) => setEditZone(e.target.value as ZoneType)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300 font-semibold"
                          >
                            {(['Jaguar', 'Teocalli', 'Tiburón', 'Delfín', 'Águila', 'Colibrí'] as ZoneType[]).map((z) => {
                              const zi = getZoneInfo(z, customTexts);
                              return (
                                <option key={z} value={z}>
                                  {zi.icon} {zi.name} ({zi.region || zi.line})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-slate-700 mb-1">Dirección y Calle</label>
                          <input
                            type="text"
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Colonia</label>
                          <input
                            type="text"
                            value={editColonia}
                            onChange={(e) => setEditColonia(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Ciudad / Municipio</label>
                          <input
                            type="text"
                            value={editCity}
                            onChange={(e) => setEditCity(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                          <input
                            type="text"
                            value={editWhatsapp}
                            onChange={(e) => setEditWhatsapp(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Horarios de Sesión</label>
                          <input
                            type="text"
                            value={editSchedules}
                            onChange={(e) => setEditSchedules(e.target.value)}
                            placeholder="Ej. Lunes a sábado de 8 a 10 pm"
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Tipos de Sesión</label>
                          <input
                            type="text"
                            value={editSessionTypes}
                            onChange={(e) => setEditSessionTypes(e.target.value)}
                            placeholder="Ej. Sesión Principal, Jóvenes"
                            className="w-full p-2 bg-white rounded-lg border border-slate-300"
                          />
                        </div>
                      </div>

                      {/* Enlace de Google Maps (Opcional, sin obligación) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block font-semibold text-slate-700">
                            Enlace de Google Maps (Opcional)
                          </label>
                          <span className="text-[10px] text-slate-400">
                            No es obligatorio; el mapa calcula la ruta por coordenadas
                          </span>
                        </div>
                        <input
                          type="url"
                          value={editMapsUrl}
                          onChange={(e) => setEditMapsUrl(e.target.value)}
                          placeholder="https://maps.app.goo.gl/... (opcional)"
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>

                      {/* Enlace de Facebook */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Página o Enlace de Facebook (Opcional)
                        </label>
                        <input
                          type="url"
                          value={editFacebook}
                          onChange={(e) => setEditFacebook(e.target.value)}
                          placeholder="https://www.facebook.com/... (opcional)"
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>

                      {/* URL de Foto */}
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">URL de Foto de Fachada</label>
                        <input
                          type="url"
                          value={editFotoUrl}
                          onChange={(e) => setEditFotoUrl(e.target.value)}
                          placeholder="https://... (opcional)"
                          className="w-full p-2 bg-white rounded-lg border border-slate-300"
                        />
                      </div>

                      {/* Botón Guardar y Eliminar */}
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-200 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              selectedGroupToEdit &&
                              window.confirm(
                                `¿Estás segura de eliminar permanentemente el grupo "${selectedGroupToEdit.nombre}"?`
                              )
                            ) {
                              onDeleteGroup(selectedGroupToEdit.id);
                              setStatusMessage(`Grupo "${selectedGroupToEdit.nombre}" eliminado exitosamente.`);
                              setTimeout(() => setStatusMessage(null), 3500);
                            }
                          }}
                          className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar Grupo</span>
                        </button>

                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4 text-amber-400" />
                          <span>Guardar Cambios de Grupo</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Pestaña: Propuestas de Líderes */}
              {activeTab === 'proposals' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">
                      Bandeja de propuestas enviadas por Líderes de Grupo
                    </span>
                    <span className="text-slate-500">
                      {pendingProposals.length} pendiente(s) de revisión
                    </span>
                  </div>

                  {pendingProposals.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <div className="font-bold text-slate-800">No hay propuestas pendientes</div>
                      <p className="text-slate-500 text-[11px]">
                        Cuando un coordinador o líder envíe una propuesta con foto o datos nuevos, aparecerá aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingProposals.map((prop) => (
                        <div
                          key={prop.id}
                          className="p-4 bg-white rounded-2xl border border-slate-300 shadow-sm space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                              <span className="font-bold text-sm text-slate-900">{prop.groupName}</span>
                              <span className="text-slate-500 ml-2">
                                Propuesto por: <strong>{prop.authorName}</strong> ({prop.authorRole}) • Tel: {prop.authorWhatsapp}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(prop.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl">
                            <div>
                              <strong className="block text-slate-900">Dirección propuesta:</strong>
                              <span>{prop.proposedAddress || 'Sin cambio'}</span>
                            </div>
                            <div>
                              <strong className="block text-slate-900">Zona propuesta:</strong>
                              <span>{prop.proposedZone || 'Sin cambio'}</span>
                            </div>
                            <div>
                              <strong className="block text-slate-900">Horarios propuestos:</strong>
                              <span>{prop.proposedSchedules || 'Sin cambio'}</span>
                            </div>
                            <div>
                              <strong className="block text-slate-900">WhatsApp propuesto:</strong>
                              <span>{prop.proposedWhatsapp || 'Sin cambio'}</span>
                            </div>
                            {prop.proposedFacebook && (
                              <div className="sm:col-span-2">
                                <strong className="block text-slate-900">Facebook propuesto:</strong>
                                <a href={prop.proposedFacebook} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline truncate block">
                                  {prop.proposedFacebook}
                                </a>
                              </div>
                            )}
                            {prop.proposedMapsUrl && (
                              <div className="sm:col-span-2">
                                <strong className="block text-slate-900">Link Google Maps:</strong>
                                <a href={prop.proposedMapsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline truncate block">
                                  {prop.proposedMapsUrl}
                                </a>
                              </div>
                            )}
                            {prop.notes && (
                              <div className="sm:col-span-2">
                                <strong className="block text-slate-900">Motivo / Notas:</strong>
                                <span>{prop.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* Foto tomada por el líder */}
                          {prop.photoBase64 && (
                            <div className="space-y-1">
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-amber-600" />
                                <span>Foto de la fachada / Google Maps adjuntada por el líder:</span>
                              </span>
                              <img
                                src={prop.photoBase64}
                                alt="Foto propuesta"
                                className="w-48 h-32 object-cover rounded-xl border border-slate-300 shadow-sm"
                              />
                            </div>
                          )}

                          {/* Acciones Aprobar / Rechazar */}
                          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => onRejectProposal(prop.id)}
                              className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold transition"
                            >
                              Rechazar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onApproveProposal(prop);
                                setStatusMessage(`¡Propuesta para ${prop.groupName} aprobada y aplicada!`);
                                setTimeout(() => setStatusMessage(null), 3500);
                              }}
                              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar y Aplicar Cambios</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Pestaña: Herramientas CSV y Seguridad (Exclusivo Administradora) */}
              {activeTab === 'tools' && (
                <div className="space-y-5 text-xs text-slate-700">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Subir o Descargar Archivo CSV (Exclusivo Administradora)
                    </h4>
                    <p className="leading-relaxed text-slate-600">
                      Solo tú como administradora autorizada puedes cargar un archivo CSV para actualizar el directorio. Los líderes o usuarios comunes no tienen acceso a esta función.
                    </p>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenCsvUpload();
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Subir nuevo archivo CSV ahora</span>
                      </button>

                      <button
                        type="button"
                        onClick={onExportCsv}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold transition shadow-sm"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Descargar grupos actuales (.csv)</span>
                      </button>

                      {onOpenWorkspace && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenWorkspace();
                          }}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-amber-600 hover:from-blue-600 hover:to-amber-500 text-white font-bold transition shadow-sm"
                        >
                          <span>☁️ Google Workspace (Drive • Forms • Contactos)</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sección de Seguridad: Cambiar Contraseña */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h4 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600" />
                      <span>Seguridad y Clave de Administradora</span>
                    </h4>
                    <p className="leading-relaxed text-slate-600">
                      Puedes cambiar tu contraseña de administradora en cualquier momento. La nueva clave se guardará de forma privada en tu navegador.
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newPasswordInput.trim().length >= 4 && onUpdatePassword) {
                          onUpdatePassword(newPasswordInput.trim());
                          setPasswordUpdatedMessage(true);
                          setNewPasswordInput('');
                          setTimeout(() => setPasswordUpdatedMessage(false), 4000);
                        }
                      }}
                      className="flex flex-wrap items-center gap-2 pt-1"
                    >
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Nueva contraseña (mínimo 4 caracteres)"
                        className="p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-mono min-w-[260px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={newPasswordInput.trim().length < 4}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-blue-950 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs transition"
                      >
                        Actualizar contraseña
                      </button>
                    </form>
                    {passwordUpdatedMessage && (
                      <div className="text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                        <Check className="w-3.5 h-3.5" />
                        <span>¡Contraseña de Administradora actualizada exitosamente!</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PESTAÑA: COTEJO Y CONCILIACIÓN DEL PADRÓN 2026 */}
              {activeTab === 'cotejo' && (
                <PadronReconciliationView
                  groups={groups}
                  onApproveNewGroup={(newG) => {
                    onAddNewGroup(newG);
                    setStatusMessage(`¡Grupo "${newG.nombre}" aprobado e incorporado exitosamente!`);
                    setTimeout(() => setStatusMessage(null), 4000);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
};
