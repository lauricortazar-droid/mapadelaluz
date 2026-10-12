import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Calendar,
  Contact,
  Navigation,
  Building,
  Mail,
  Share2,
  Check,
  ExternalLink,
  Download,
  Edit3,
  Camera,
  Sparkles,
  Facebook,
  Trash2,
  Plus,
  Save,
  Lock,
  AlertTriangle,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { Group, GroupSession, GroupType, SessionDay, SessionModality, ZoneType, AppCustomTexts } from '../types';
import { getGroupStatus, DAY_NAMES_DISPLAY } from '../utils/status';
import { getDirectionsUrl, formatDistance } from '../utils/distance';
import { getGoogleCalendarUrl, downloadIcsFile } from '../utils/calendar';
import { downloadVCard } from '../utils/vcard';
import { getZoneInfo } from '../utils/zones';

interface GroupDetailModalProps {
  group: Group | null;
  onClose: () => void;
  onOpenContactForm: (group: Group) => void;
  onOpenLeaderProposal: (group: Group) => void;
  onOpenAdminEdit?: (group: Group) => void;
  onSaveGroup?: (updatedGroup: Group) => void;
  onDeleteGroup?: (groupId: string | number) => void;
  onAdminLogin?: (pass: string) => boolean;
  isAdminLoggedIn?: boolean;
  customTexts?: AppCustomTexts;
  initialEditMode?: boolean;
}

const AVAILABLE_ZONES: ZoneType[] = ['Jaguar', 'Teocalli', 'Tiburón', 'Delfín', 'Águila', 'Colibrí'];
const AVAILABLE_DAYS: SessionDay[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  onClose,
  onOpenContactForm,
  onOpenLeaderProposal,
  onOpenAdminEdit,
  onSaveGroup,
  onDeleteGroup,
  onAdminLogin,
  isAdminLoggedIn,
  customTexts,
  initialEditMode = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form states for editing
  const [editNombre, setEditNombre] = useState('');
  const [editZone, setEditZone] = useState<ZoneType>('Jaguar');
  const [editTipo, setEditTipo] = useState<GroupType>('mixto');
  const [editPublicCode, setEditPublicCode] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editColonia, setEditColonia] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editReferencias, setEditReferencias] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editMapsUrl, setEditMapsUrl] = useState('');
  const [editFacebook, setEditFacebook] = useState('');
  const [editSchedulesRaw, setEditSchedulesRaw] = useState('');
  const [editSessionTypesRaw, setEditSessionTypesRaw] = useState('');
  const [editFotoUrl, setEditFotoUrl] = useState('');
  const [editActivo, setEditActivo] = useState(true);
  const [editLat, setEditLat] = useState<number>(20.967375);
  const [editLng, setEditLng] = useState<number>(-89.6237);
  const [editSesiones, setEditSesiones] = useState<GroupSession[]>([]);

  // Sub-formulario para agregar nueva sesión
  const [newDia, setNewDia] = useState<SessionDay>('lunes');
  const [newHoraInicio, setNewHoraInicio] = useState('20:00');
  const [newHoraFin, setNewHoraFin] = useState('21:30');
  const [newModalidad, setNewModalidad] = useState<SessionModality>('presencial');

  // Referencia al ID previo para evitar resetear modo edición en re-render de actualización
  const previousGroupIdRef = React.useRef<string | number | null>(null);

  // Inicializar estados cuando cambia el grupo
  useEffect(() => {
    if (group) {
      setEditNombre(group.nombre || '');
      setEditZone(group.zone || 'Jaguar');
      setEditTipo(group.tipo || 'mixto');
      setEditPublicCode(group.publicCode || '');
      setEditDireccion(group.direccion || '');
      setEditColonia(group.colonia || '');
      setEditCity(group.city || group.municipio || 'Mérida');
      setEditReferencias(group.referencias || '');
      setEditTelefono(group.telefono || '');
      setEditWhatsapp(group.whatsapp || '');
      setEditCorreo(group.correo || '');
      setEditMapsUrl(group.mapsUrl || '');
      setEditFacebook(group.facebook || '');
      setEditSchedulesRaw(group.schedulesRaw || '');
      setEditSessionTypesRaw(group.sessionTypesRaw || '');
      setEditFotoUrl(group.foto_url || '');
      setEditActivo(group.activo ?? true);
      setEditLat(group.lat || 20.967375);
      setEditLng(group.lng || -89.6237);
      setEditSesiones(group.sesiones || []);

      if (previousGroupIdRef.current !== group.id) {
        setIsEditing(initialEditMode);
        previousGroupIdRef.current = group.id;
      }
    }
    setShowDeleteConfirm(false);
    setShowLoginModal(false);
  }, [group, initialEditMode]);

  if (!group) return null;

  const status = getGroupStatus(group);
  const zoneInfo = getZoneInfo(group.zone, customTexts);
  const cleanPhone = group.telefono.replace(/\s+/g, '');
  const cleanWa = group.whatsapp.replace(/[^0-9]/g, '');

  const handleShare = () => {
    const textToShare = `${group.nombre} - Fraternidad Guerreros de la Luz (Zona ${group.zone})\nDirección: ${group.direccion}, ${group.city || group.municipio}\nWhatsApp: ${group.whatsapp}\nRuta Maps: ${group.mapsUrl || getDirectionsUrl(group.lat, group.lng)}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${group.nombre} - Guerreros de la Luz`,
          text: textToShare,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(textToShare);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleAddSession = () => {
    if (!newHoraInicio || !newHoraFin) return;
    setEditSesiones((prev) => [
      ...prev,
      {
        dia: newDia,
        hora_inicio: newHoraInicio,
        hora_fin: newHoraFin,
        modalidad: newModalidad,
      },
    ]);
  };

  const handleRemoveSession = (index: number) => {
    setEditSesiones((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen seleccionada supera los 2 MB. Por favor elige una imagen más ligera.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditFotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNombre.trim()) {
      alert('El nombre del grupo es obligatorio.');
      return;
    }

    const updatedGroup: Group = {
      ...group,
      nombre: editNombre.trim(),
      zone: editZone,
      tipo: editTipo,
      publicCode: editPublicCode.trim() || undefined,
      direccion: editDireccion.trim(),
      colonia: editColonia.trim(),
      municipio: editCity.trim() || group.municipio,
      city: editCity.trim() || group.city,
      referencias: editReferencias.trim(),
      telefono: editTelefono.trim(),
      whatsapp: editWhatsapp.trim(),
      correo: editCorreo.trim(),
      mapsUrl: editMapsUrl.trim() || undefined,
      facebook: editFacebook.trim() || undefined,
      schedulesRaw: editSchedulesRaw.trim(),
      sessionTypesRaw: editSessionTypesRaw.trim(),
      foto_url: editFotoUrl.trim() || undefined,
      activo: editActivo,
      lat: Number(editLat) || group.lat,
      lng: Number(editLng) || group.lng,
      sesiones: editSesiones,
      ultima_actualizacion: new Date().toISOString(),
    };

    if (onSaveGroup) {
      onSaveGroup(updatedGroup);
    }
    setSaveSuccessMsg('¡Ficha actualizada exitosamente!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsEditing(false);
    }, 1200);
  };

  const handleConfirmDelete = () => {
    if (onDeleteGroup) {
      onDeleteGroup(group.id);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdminLogin) {
      const ok = onAdminLogin(passwordInput);
      if (ok) {
        setPasswordError(false);
        setShowLoginModal(false);
        setPasswordInput('');
        setIsEditing(true);
      } else {
        setPasswordError(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="group-title"
      >
        {/* Cover / Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {/* Zona */}
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm"
              title={`${zoneInfo.name} • ${zoneInfo.line}`}
            >
              <span>{zoneInfo.icon}</span>
              <span>{zoneInfo.name}</span>
            </span>

            {zoneInfo.line && (
              <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-xs italic bg-white/15 text-amber-200">
                “{zoneInfo.line}”
              </span>
            )}

            {group.publicCode && (
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-white/15 text-white">
                {group.publicCode}
              </span>
            )}

            {/* Status indicator */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status.statusType === 'open-now'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/15 text-slate-200'
              }`}
            >
              {status.label}
            </span>

            {group.distanceKm !== undefined && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                A {formatDistance(group.distanceKm)} de ti
              </span>
            )}
          </div>

          <h2 id="group-title" className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
            {group.nombre}
          </h2>

          <div className="flex items-center gap-2 text-sm text-blue-200/90">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              {group.city || group.municipio} • Lema de Zona: “{zoneInfo.line}”
            </span>
          </div>

          {/* BARRA DE HERRAMIENTAS ADMINISTRADORA (Visible cuando isAdminLoggedIn) */}
          {isAdminLoggedIn && (
            <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <span>👑 Modo Administradora</span>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Ficha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Info / Horario</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow transition flex items-center gap-1.5 active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Borrar Grupo</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
                  >
                    Ver Ficha Normal
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK DE ÉXITO */}
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* MODO EDICIÓN COMPLETO DE LA FICHA POR ADMINISTRADORA */}
        {isEditing && isAdminLoggedIn ? (
          <form onSubmit={handleSaveForm} className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-900 font-semibold">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Estás editando la ficha oficial de este grupo. Todos los cambios se guardan al hacer clic en 'Guardar Cambios'.</span>
              </div>
            </div>

            {/* 1. Datos Principales */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                <span>1. Identificación y Clasificación</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nombre del Grupo *</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-semibold text-sm focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Zona de la Fraternidad</label>
                  <select
                    value={editZone}
                    onChange={(e) => setEditZone(e.target.value as ZoneType)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-semibold focus:border-amber-500 focus:outline-none"
                  >
                    {AVAILABLE_ZONES.map((z) => {
                      const zi = getZoneInfo(z, customTexts);
                      return (
                        <option key={z} value={z}>
                          {zi.icon} {zi.name} ({zi.region || zi.line})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Grupo</label>
                  <select
                    value={editTipo}
                    onChange={(e) => setEditTipo(e.target.value as GroupType)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium focus:border-amber-500 focus:outline-none"
                  >
                    <option value="mixto">Mixto</option>
                    <option value="hombres">Hombres</option>
                    <option value="mujeres">Mujeres</option>
                    <option value="jóvenes">Jóvenes</option>
                    <option value="familiares">Familiares</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Público (opcional)</label>
                  <input
                    type="text"
                    value={editPublicCode}
                    onChange={(e) => setEditPublicCode(e.target.value)}
                    placeholder="Ej. JAG-02"
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={editActivo}
                      onChange={(e) => setEditActivo(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-900 focus:ring-amber-400"
                    />
                    <span>Grupo Activo y visible en el mapa</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. Ubicación */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-900" />
                <span>2. Ubicación y Domicilio</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Dirección y Calle</label>
                  <input
                    type="text"
                    value={editDireccion}
                    onChange={(e) => setEditDireccion(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Colonia</label>
                  <input
                    type="text"
                    value={editColonia}
                    onChange={(e) => setEditColonia(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={editLat}
                    onChange={(e) => setEditLat(parseFloat(e.target.value) || group.lat)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitud (GPS)</label>
                  <input
                    type="number"
                    step="any"
                    value={editLng}
                    onChange={(e) => setEditLng(parseFloat(e.target.value) || group.lng)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Referencias de llegada</label>
                  <textarea
                    rows={2}
                    value={editReferencias}
                    onChange={(e) => setEditReferencias(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Enlace de Google Maps (URL)</label>
                  <input
                    type="url"
                    value={editMapsUrl}
                    onChange={(e) => setEditMapsUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Contacto y Redes */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>3. Contacto y Comunicación</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp de Servicio</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-semibold text-emerald-800 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono Fijo / Móvil</label>
                  <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editCorreo}
                    onChange={(e) => setEditCorreo(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Página o Grupo de Facebook</label>
                  <input
                    type="url"
                    value={editFacebook}
                    onChange={(e) => setEditFacebook(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 4. Horarios y Gestión de Sesiones */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>4. Horarios y Sesiones (Agregar / Quitar Horarios)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Horario Resumido</label>
                  <input
                    type="text"
                    value={editSchedulesRaw}
                    onChange={(e) => setEditSchedulesRaw(e.target.value)}
                    placeholder="Ej. Lunes a Sábado de 20:00 a 21:30 hrs"
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modalidades y Tipos</label>
                  <input
                    type="text"
                    value={editSessionTypesRaw}
                    onChange={(e) => setEditSessionTypesRaw(e.target.value)}
                    placeholder="Ej. Presencial, Transmisión"
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Días y Horarios Individuales */}
              <div className="mt-3 pt-3 border-t border-slate-200">
                <span className="font-semibold text-slate-800 block mb-2">
                  Días y Horarios Registrados ({editSesiones.length}):
                </span>

                <div className="space-y-1.5 mb-3">
                  {editSesiones.length === 0 ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 text-center">
                      No hay horarios específicos registrados. Agrega uno abajo.
                    </div>
                  ) : (
                    editSesiones.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 uppercase tracking-wider w-24">
                            {DAY_NAMES_DISPLAY[s.dia]}
                          </span>
                          <span className="bg-blue-50 text-blue-900 px-2 py-0.5 rounded font-mono text-xs border border-blue-200">
                            {s.hora_inicio} a {s.hora_fin}
                          </span>
                          <span className="text-slate-500 text-[11px] capitalize">
                            ({s.modalidad})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSession(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Quitar este horario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Sub-formulario para agregar nueva sesión */}
                <div className="p-3 bg-white rounded-xl border border-dashed border-amber-400 space-y-2">
                  <span className="font-bold text-amber-900 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Nuevo Día y Horario a este Grupo:</span>
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Día</label>
                      <select
                        value={newDia}
                        onChange={(e) => setNewDia(e.target.value as SessionDay)}
                        className="w-full p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs capitalize"
                      >
                        {AVAILABLE_DAYS.map((d) => (
                          <option key={d} value={d}>
                            {DAY_NAMES_DISPLAY[d]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Inicio</label>
                      <input
                        type="time"
                        value={newHoraInicio}
                        onChange={(e) => setNewHoraInicio(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Fin</label>
                      <input
                        type="time"
                        value={newHoraFin}
                        onChange={(e) => setNewHoraFin(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleAddSession}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Fotografía de Fachada */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                <span>5. Fotografía de Fachada</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">URL de Foto</label>
                  <input
                    type="url"
                    value={editFotoUrl}
                    onChange={(e) => setEditFotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                  />

                  <div className="mt-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer font-semibold transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir foto desde dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {editFotoUrl && (
                  <div className="text-center">
                    <span className="block text-[10px] text-slate-400 mb-1">Vista previa</span>
                    <img
                      src={editFotoUrl}
                      alt="Vista previa"
                      className="h-28 w-auto max-w-full rounded-xl object-cover mx-auto border border-slate-300 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 6. Zona de Peligro / Borrado */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-rose-900 block">Eliminar este Grupo</span>
                <p className="text-rose-700 text-[11px]">
                  Borra permanentemente este grupo del directorio y del mapa oficial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition shrink-0 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar Grupo</span>
              </button>
            </div>

            {/* Botones Guardar / Cancelar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur p-2 rounded-2xl shadow-md">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg transition flex items-center gap-1.5 active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cambios de la Ficha</span>
              </button>
            </div>
          </form>
        ) : (
          /* MODO VISTA NORMAL DE LA FICHA */
          <div className="p-6 sm:p-7 space-y-6 flex-1 overflow-y-auto">
            {/* Foto de Fachada si existe */}
            {group.foto_url && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm max-h-56">
                <img
                  src={group.foto_url}
                  alt={group.nombre}
                  className="w-full h-48 sm:h-56 object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur text-white text-[10px] font-semibold flex items-center gap-1">
                  <Camera className="w-3 h-3 text-amber-400" />
                  <span>Fachada oficial</span>
                </div>
              </div>
            )}

            {/* Main Primary Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Cómo llegar */}
              <a
                href={group.mapsUrl || getDirectionsUrl(group.lat, group.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 transition text-center group"
              >
                <Navigation className="w-5 h-5 text-blue-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Cómo llegar</span>
                <span className="text-[10px] text-blue-600">Google Maps</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(`Hola, quisiera más información para asistir a las sesiones del grupo ${group.nombre}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 transition text-center group"
              >
                <MessageCircle className="w-5 h-5 text-emerald-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">WhatsApp</span>
                <span className="text-[10px] text-emerald-600 truncate max-w-full">{group.whatsapp}</span>
              </a>

              {/* Facebook */}
              <a
                href={group.facebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 transition text-center group"
                title="Abrir página oficial de Facebook"
              >
                <Facebook className="w-5 h-5 text-indigo-700 mb-1 group-hover:scale-110 transition-transform fill-indigo-700" />
                <span className="text-xs font-bold">Facebook</span>
                <span className="text-[10px] text-indigo-700">Página oficial</span>
              </a>

              {/* Llamar */}
              <a
                href={`tel:${cleanPhone}`}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 transition text-center group"
              >
                <Phone className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Llamar</span>
                <span className="text-[10px] text-slate-500">Teléfono servicio</span>
              </a>

              {/* Guardar contacto vCard */}
              <button
                onClick={() => downloadVCard(group)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition text-center group col-span-2 sm:col-span-1"
                title="Descarga la tarjeta de contacto (.vcf) para guardarla en tu teléfono"
              >
                <Contact className="w-5 h-5 text-amber-700 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Guardar</span>
                <span className="text-[10px] text-amber-700">Descargar .vcf</span>
              </button>
            </div>

            {/* Días y horarios de sesión */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Horarios y tipos de sesión</span>
                </h3>
                {group.verifiedAt && (
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verificado
                  </span>
                )}
              </div>

              {/* Texto descriptivo de horarios si existe */}
              {group.schedulesRaw && (
                <div className="mb-3 p-3 bg-white rounded-xl border border-slate-200 text-xs">
                  <strong className="text-slate-800 block mb-0.5">Horario oficial:</strong>
                  <p className="text-slate-700 font-medium">{group.schedulesRaw}</p>
                  {group.sessionTypesRaw && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Modalidad y tipos: {group.sessionTypesRaw}
                    </p>
                  )}
                </div>
              )}

              <div className="divide-y divide-slate-200">
                {group.sesiones && group.sesiones.length > 0 ? (
                  group.sesiones.map((sesion, index) => (
                    <div
                      key={index}
                      className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-24 text-xs font-bold uppercase tracking-wider text-slate-800">
                          {DAY_NAMES_DISPLAY[sesion.dia]}
                        </span>
                        <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                          {sesion.hora_inicio} a {sesion.hora_fin}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={getGoogleCalendarUrl(group, sesion)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition"
                          title="Agregar este horario a Google Calendar"
                        >
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Google Calendar</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>

                        <button
                          onClick={() => downloadIcsFile(group, sesion)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition"
                          title="Descargar archivo .ics universal"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>.ics</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-2 text-xs text-slate-500">
                    No hay sesiones individuales registradas. Consulta el horario oficial descriptivo arriba.
                  </p>
                )}
              </div>
            </div>

            {/* Ubicación y referencias */}
            <div className="space-y-3.5">
              <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-900" />
                <span>Ubicación y referencias</span>
              </h3>

              <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3 text-sm text-slate-700">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Dirección
                  </span>
                  <p className="font-medium text-slate-900">{group.direccion}</p>
                  <p className="text-xs text-slate-500">{group.colonia ? `${group.colonia}, ` : ''}{group.city || group.municipio}, Zona {group.zone}.</p>
                </div>

                {group.referencias && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Referencias para llegar
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{group.referencias}</p>
                  </div>
                )}

                {group.mapsUrl && (
                  <div className="pt-2 border-t border-slate-100 text-xs">
                    <a
                      href={group.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold"
                    >
                      <span>Ver enlace registrado en Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-xs">
                  <a
                    href={group.facebook || 'https://www.facebook.com/guerrerosdelaluzmerida'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-bold"
                  >
                    <Facebook className="w-3.5 h-3.5 fill-indigo-700" />
                    <span>{group.facebook ? 'Visitar página de Facebook de este grupo' : 'Visitar página oficial de Facebook de la Fraternidad'}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              </div>
            </div>

            {/* Banner de acción para Líderes (Proponer cambio / Subir foto) */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-blue-950/10 rounded-2xl p-5 border border-amber-300/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-serif font-bold text-slate-900 text-base flex items-center gap-1.5 justify-center sm:justify-start">
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>¿Eres líder o servidor de este grupo?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Envía una propuesta de actualización de horarios, dirección o toma una foto de la fachada para el mapa.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenLeaderProposal(group);
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition shrink-0 active:scale-95 flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Proponer actualización o foto</span>
              </button>
            </div>

            {/* Si NO es administradora: Opción para iniciar sesión de administradora en esta ficha */}
            {!isAdminLoggedIn && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-purple-900">
                  <Lock className="w-4 h-4 text-purple-700 shrink-0" />
                  <span>¿Eres Administradora? Inicia sesión aquí para editar o eliminar esta ficha directamente.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shrink-0 transition"
                >
                  Acceso Admin
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </>
              )}
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 transition"
              >
                <span>{isEditing ? '👁️ Ver Ficha' : '👑 Editar Ficha de Administradora'}</span>
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Cerrar ficha
          </button>
        </div>
      </div>

      {/* DIÁLOGO MODAL: CONFIRMACIÓN DE BORRADO DE GRUPO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-slate-900">
                ¿Eliminar permanentemente este grupo?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Estás a punto de borrar el grupo <strong>"{group.nombre}"</strong>. Esta acción lo eliminará de la Fraternidad, del mapa interactivo y de la base de datos oficial.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Grupo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIÁLOGO MODAL: LOGIN RÁPIDO DE ADMINISTRADORA */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-700" />
                <span className="font-serif font-bold text-sm text-slate-900">Acceso de Administradora</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600 text-[11px]">
                Ingresa la contraseña de administradora para editar o borrar esta ficha:
              </p>

              <div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError(false);
                  }}
                  placeholder="Contraseña de Administradora"
                  className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:border-purple-600 focus:outline-none"
                />
                {passwordError && (
                  <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                    Contraseña incorrecta. Inténtalo de nuevo.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold shadow"
                >
                  Desbloquear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
