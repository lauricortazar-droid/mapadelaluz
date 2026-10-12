import React, { useState } from 'react';
import { X, Camera, Upload, Send, MessageCircle, CheckCircle2, AlertCircle, Building, MapPin, Clock, Phone, Sparkles } from 'lucide-react';
import { Group, LeaderProposal, ZoneType, AppCustomTexts } from '../types';
import { APP_CONFIG } from '../data/config';
import { getZoneInfo } from '../utils/zones';

interface LeaderProposalModalProps {
  group: Group | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProposal: (proposal: LeaderProposal) => void;
  customTexts?: AppCustomTexts;
}

export const LeaderProposalModal: React.FC<LeaderProposalModalProps> = ({
  group,
  isOpen,
  onClose,
  onSubmitProposal,
  customTexts,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Coordinador');
  const [authorWhatsapp, setAuthorWhatsapp] = useState('');

  // Campos propuestos (prellenados con los datos actuales)
  const [proposedName, setProposedName] = useState(group?.nombre || '');
  const [proposedZone, setProposedZone] = useState<ZoneType>(group?.zone || 'Jaguar');
  const [proposedAddress, setProposedAddress] = useState(group?.direccion || '');
  const [proposedCity, setProposedCity] = useState(group?.city || group?.municipio || '');
  const [proposedSchedules, setProposedSchedules] = useState(group?.schedulesRaw || '');
  const [proposedWhatsapp, setProposedWhatsapp] = useState(group?.whatsapp || '');
  const [proposedFacebook, setProposedFacebook] = useState(group?.facebook || '');
  const [proposedMapsUrl, setProposedMapsUrl] = useState(group?.mapsUrl || '');
  const [notes, setNotes] = useState('');

  // Foto tomada con cámara o subida
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);
  const [photoName, setPhotoName] = useState<string | undefined>(undefined);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSubmittedProposal, setLastSubmittedProposal] = useState<LeaderProposal | null>(null);

  // Sincronizar campos al abrir con un grupo específico
  React.useEffect(() => {
    if (group) {
      setProposedName(group.nombre);
      setProposedZone(group.zone || 'Jaguar');
      setProposedAddress(group.direccion);
      setProposedCity(group.city || group.municipio);
      setProposedSchedules(group.schedulesRaw || '');
      setProposedWhatsapp(group.whatsapp);
      setProposedFacebook(group.facebook || '');
      setProposedMapsUrl(group.mapsUrl || '');
      setIsSubmitted(false);
      setPhotoBase64(undefined);
    }
  }, [group]);

  if (!isOpen || !group) return null;

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      alert('Por favor escribe tu nombre o alias de servicio.');
      return;
    }

    const newProposal: LeaderProposal = {
      id: `prop-${Date.now()}`,
      groupId: group.id,
      groupName: group.nombre,
      authorName,
      authorRole,
      authorWhatsapp,
      proposedName,
      proposedZone,
      proposedAddress,
      proposedCity,
      proposedSchedules,
      proposedWhatsapp,
      proposedFacebook,
      proposedMapsUrl,
      notes,
      photoBase64,
      photoName,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
    };

    onSubmitProposal(newProposal);
    setLastSubmittedProposal(newProposal);
    setIsSubmitted(true);
  };

  const handleShareToAdminWhatsapp = () => {
    if (!lastSubmittedProposal) return;
    const adminPhone = APP_CONFIG.WHATSAPP_GENERAL.replace(/[^0-9]/g, '');
    const msg = [
      `🏛️ *PROPUESTA DE ACTUALIZACIÓN DE GRUPO*`,
      `Grupo: *${lastSubmittedProposal.groupName}* (ID: ${lastSubmittedProposal.groupId})`,
      `Líder: ${lastSubmittedProposal.authorName} (${lastSubmittedProposal.authorRole})`,
      `WhatsApp del líder: ${lastSubmittedProposal.authorWhatsapp}`,
      `Zona propuesta: ${lastSubmittedProposal.proposedZone}`,
      `Nueva dirección: ${lastSubmittedProposal.proposedAddress}`,
      `Horarios propuestos: ${lastSubmittedProposal.proposedSchedules}`,
      `WhatsApp propuesto: ${lastSubmittedProposal.proposedWhatsapp}`,
      lastSubmittedProposal.proposedFacebook ? `Facebook propuesto: ${lastSubmittedProposal.proposedFacebook}` : '',
      lastSubmittedProposal.proposedMapsUrl ? `Google Maps: ${lastSubmittedProposal.proposedMapsUrl}` : '',
      lastSubmittedProposal.photoBase64 ? `📸 *Foto adjuntada en el portal para Google Maps*` : '',
      lastSubmittedProposal.notes ? `Notas: ${lastSubmittedProposal.notes}` : '',
      `Por favor revisa y aprueba en el panel de Administradora. ¡Gracias por el servicio!`,
    ].filter(Boolean).join('\n');

    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-title"
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

          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Servicio de Líderes y Coordinación</span>
          </div>

          <h2 id="proposal-title" className="font-serif text-2xl font-bold text-white mb-1">
            Propuesta de Actualización de Grupo
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Como líder puedes proponer cambios de horarios, dirección o fotos de fachada. La propuesta será revisada por la administradora antes de aplicarse.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-1">
                  ¡Propuesta registrada con éxito!
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Tu solicitud ha sido guardada en la bandeja de propuestas pendientes para que la administradora la apruebe. También puedes notificarle directamente por WhatsApp.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleShareToAdminWhatsapp}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Avisar a la Administradora por WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition"
                >
                  Finalizar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
              {/* Sección 1: Datos del Líder */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Tus datos como líder de servicio</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Tu Nombre o Alias *</label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Ej. Carlos H."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Cargo en el Grupo</label>
                    <select
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Coordinador">Coordinador(a)</option>
                      <option value="Secretario">Secretario(a)</option>
                      <option value="Tesorero">Tesorero(a)</option>
                      <option value="Servidor de Grupo">Servidor de Grupo</option>
                      <option value="Líder">Líder</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Tu Tel / WhatsApp</label>
                    <input
                      type="tel"
                      value={authorWhatsapp}
                      onChange={(e) => setAuthorWhatsapp(e.target.value)}
                      placeholder="Ej. 999 123 4567"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Datos Propuestos para el Grupo */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>Datos propuestos para: {group.nombre}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Nombre del Grupo</label>
                    <input
                      type="text"
                      value={proposedName}
                      onChange={(e) => setProposedName(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Zona Fraternidad</label>
                    <select
                      value={proposedZone}
                      onChange={(e) => setProposedZone(e.target.value as ZoneType)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 font-semibold"
                    >
                      {(['Jaguar', 'Tiburón', 'Delfín', 'Águila', 'Colibrí', 'Tocalli'] as ZoneType[]).map((z) => {
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Dirección Completa / Referencias</label>
                    <input
                      type="text"
                      value={proposedAddress}
                      onChange={(e) => setProposedAddress(e.target.value)}
                      placeholder="Calle, número, colonia"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Ciudad / Municipio</label>
                    <input
                      type="text"
                      value={proposedCity}
                      onChange={(e) => setProposedCity(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Días y Horarios de Sesión</label>
                    <input
                      type="text"
                      value={proposedSchedules}
                      onChange={(e) => setProposedSchedules(e.target.value)}
                      placeholder="Ej. Lunes a sábado de 8 a 10 pm"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">WhatsApp de Servicio del Grupo</label>
                    <input
                      type="text"
                      value={proposedWhatsapp}
                      onChange={(e) => setProposedWhatsapp(e.target.value)}
                      placeholder="10 dígitos"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Página o Enlace de Facebook (Opcional)</label>
                    <input
                      type="url"
                      value={proposedFacebook}
                      onChange={(e) => setProposedFacebook(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">Link de Google Maps (Opcional)</label>
                    <input
                      type="url"
                      value={proposedMapsUrl}
                      onChange={(e) => setProposedMapsUrl(e.target.value)}
                      placeholder="https://maps.app.goo.gl/... (opcional)"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 3: Tomar o subir foto de la fachada */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                  <span>Tomar o subir foto del grupo (para Google Maps)</span>
                </div>
                <p className="text-amber-900/80 text-[11px] leading-relaxed">
                  Puedes tomar una foto directamente con la cámara de tu celular de la fachada o el letrero para ayudar a las personas a identificar el local fácilmente.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer transition shadow-sm active:scale-95">
                    <Camera className="w-4 h-4" />
                    <span>Tomar foto con la cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>

                  <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 cursor-pointer transition">
                    <Upload className="w-4 h-4" />
                    <span>Subir imagen desde galería</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                </div>

                {photoBase64 && (
                  <div className="pt-2 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-amber-200">
                    <img
                      src={photoBase64}
                      alt="Previsualización"
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-semibold text-slate-800 text-xs truncate">{photoName || 'Foto capturada'}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">✓ Lista para adjuntar a la propuesta</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhotoBase64(undefined)}
                      className="text-rose-600 hover:text-rose-800 p-1 font-bold text-xs"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Notas adicionales */}
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notas o comentarios para la Administradora</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Cambiamos de local la semana pasada; esta es la nueva fachada con el letrero visible..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              {/* Botón enviar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-blue-950 text-white font-bold text-sm shadow-lg transition active:scale-98 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>Mandar propuesta de actualización</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
