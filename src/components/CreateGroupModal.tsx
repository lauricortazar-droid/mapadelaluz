import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Building,
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Facebook,
} from 'lucide-react';
import { Group, GroupSession, GroupType, SessionDay, SessionModality, ZoneType, AppCustomTexts } from '../types';
import { getZoneInfo } from '../utils/zones';
import { DAY_NAMES_DISPLAY } from '../utils/status';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewGroup: (group: Group) => void;
  customTexts?: AppCustomTexts;
  userLocation?: { lat: number; lng: number } | null;
}

const AVAILABLE_ZONES: ZoneType[] = ['Jaguar', 'Teocalli', 'Tiburón', 'Delfín', 'Águila', 'Colibrí'];
const AVAILABLE_DAYS: SessionDay[] = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onAddNewGroup,
  customTexts,
  userLocation,
}) => {
  const [nombre, setNombre] = useState('');
  const [zone, setZone] = useState<ZoneType>('Jaguar');
  const [tipo, setTipo] = useState<GroupType>('mixto');
  const [publicCode, setPublicCode] = useState('');
  const [direccion, setDireccion] = useState('');
  const [colonia, setColonia] = useState('');
  const [city, setCity] = useState('Mérida');
  const [referencias, setReferencias] = useState('');
  const [telefono, setTelefono] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [correo, setCorreo] = useState('');
  const [mapsUrl, setMapsUrl] = useState('');
  const [facebook, setFacebook] = useState('');
  const [schedulesRaw, setSchedulesRaw] = useState('Lunes a Sábado de 20:00 a 21:30 hrs');
  const [sessionTypesRaw, setSessionTypesRaw] = useState('Presencial');
  const [fotoUrl, setFotoUrl] = useState('');
  const [lat, setLat] = useState<number>(userLocation?.lat || 20.967375);
  const [lng, setLng] = useState<number>(userLocation?.lng || -89.6237);
  const [activo, setActivo] = useState(true);

  // Sesiones individuales
  const [sesiones, setSesiones] = useState<GroupSession[]>([
    { dia: 'lunes', hora_inicio: '20:00', hora_fin: '21:30', modalidad: 'presencial' },
    { dia: 'miercoles', hora_inicio: '20:00', hora_fin: '21:30', modalidad: 'presencial' },
    { dia: 'viernes', hora_inicio: '20:00', hora_fin: '21:30', modalidad: 'presencial' },
  ]);

  // Draft para nueva sesión
  const [draftDia, setDraftDia] = useState<SessionDay>('martes');
  const [draftInicio, setDraftInicio] = useState('20:00');
  const [draftFin, setDraftFin] = useState('21:30');
  const [draftModalidad, setDraftModalidad] = useState<SessionModality>('presencial');

  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddDraftSession = () => {
    if (!draftInicio || !draftFin) return;
    setSesiones((prev) => [
      ...prev,
      {
        dia: draftDia,
        hora_inicio: draftInicio,
        hora_fin: draftFin,
        modalidad: draftModalidad,
      },
    ]);
  };

  const handleRemoveSession = (index: number) => {
    setSesiones((prev) => prev.filter((_, i) => i !== index));
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
          setFotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setFormError('Por favor ingresa el nombre del grupo.');
      return;
    }
    if (!direccion.trim()) {
      setFormError('Por favor ingresa la dirección del grupo.');
      return;
    }
    if (!whatsapp.trim()) {
      setFormError('Por favor ingresa el número de WhatsApp para contacto.');
      return;
    }

    const newGroup: Group = {
      id: `group-admin-${Date.now()}`,
      publicCode: publicCode.trim() || undefined,
      nombre: nombre.trim(),
      zone,
      tipo,
      direccion: direccion.trim(),
      colonia: colonia.trim() || 'Centro',
      municipio: city.trim() || 'Mérida',
      city: city.trim() || 'Mérida',
      referencias: referencias.trim(),
      telefono: telefono.trim() || whatsapp.trim(),
      whatsapp: whatsapp.trim(),
      correo: correo.trim() || 'contacto@guerrerosdelaluz.org',
      mapsUrl: mapsUrl.trim() || undefined,
      facebook: facebook.trim() || undefined,
      schedulesRaw: schedulesRaw.trim(),
      sessionTypesRaw: sessionTypesRaw.trim(),
      foto_url: fotoUrl.trim() || undefined,
      activo,
      lat: Number(lat) || 20.967375,
      lng: Number(lng) || -89.6237,
      sesiones,
      accesibilidad: 'Acceso peatonal',
      ultima_actualizacion: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
    };

    onAddNewGroup(newGroup);
    onClose();
  };

  const selectedZoneInfo = getZoneInfo(zone, customTexts);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
      >
        {/* Cover / Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950">
              👑 Administradora
            </span>
            <span className="text-xs text-blue-200/90">Alta en Directorio Oficial</span>
          </div>

          <h2 id="create-group-title" className="font-serif text-2xl font-bold text-white mb-1">
            Agregar Nuevo Grupo a la Fraternidad
          </h2>
          <p className="text-xs text-blue-200/80">
            Completa la ficha técnica para registrar el nuevo grupo. Quedará disponible inmediatamente en el mapa y la lista.
          </p>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1 overflow-y-auto text-xs">
          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Datos Principales */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              <span>Identificación del Grupo</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Grupo *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Grupo Guerreros Centro"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-medium text-sm focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Zona de la Fraternidad *
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value as ZoneType)}
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
                <p className="text-[10px] text-slate-500 mt-1">
                  Lema: “{selectedZoneInfo.line}”
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tipo de Grupo
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as GroupType)}
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Código Público (opcional)
                </label>
                <input
                  type="text"
                  value={publicCode}
                  onChange={(e) => setPublicCode(e.target.value)}
                  placeholder="Ej. JAG-05"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-amber-400"
                  />
                  <span>Grupo Activo y visible al público</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Ubicación */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-900" />
              <span>Ubicación y Domicilio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Dirección y Calle *
                </label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Calle 60 #450 x 49 y 51"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Colonia
                </label>
                <input
                  type="text"
                  value={colonia}
                  onChange={(e) => setColonia(e.target.value)}
                  placeholder="Ej. Centro"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Municipio / Ciudad
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ej. Mérida"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Latitud (Coordenada GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 20.967375)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Longitud (Coordenada GPS)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || -89.6237)}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Referencias para llegar
                </label>
                <textarea
                  rows={2}
                  value={referencias}
                  onChange={(e) => setReferencias(e.target.value)}
                  placeholder="Ej. A dos cuadras del parque de Santa Ana, portón verde con letrero de la fraternidad."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Enlace directo de Google Maps (opcional)
                </label>
                <input
                  type="url"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
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
              <span>Contacto y Redes Sociales</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  WhatsApp de Servicio (10 dígitos) *
                </label>
                <input
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej. 999 123 4567"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none font-semibold text-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Teléfono de Atención
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 999 123 4567"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Página o Grupo de Facebook
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Horarios y Sesiones */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-serif text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Horarios Oficiales y Días de Reunión</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Horario Descriptivo
                </label>
                <input
                  type="text"
                  value={schedulesRaw}
                  onChange={(e) => setSchedulesRaw(e.target.value)}
                  placeholder="Ej. Lunes a sábado de 8 a 10 pm"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modalidades y Tipos
                </label>
                <input
                  type="text"
                  value={sessionTypesRaw}
                  onChange={(e) => setSessionTypesRaw(e.target.value)}
                  placeholder="Ej. Presencial, Transmisión virtual"
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Lista interactiva de sesiones */}
            <div className="mt-3 pt-3 border-t border-slate-200">
              <span className="font-semibold text-slate-800 block mb-2">
                Días de Sesión Registrados ({sesiones.length}):
              </span>

              <div className="space-y-1.5 mb-3">
                {sesiones.map((s, idx) => (
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
                      title="Quitar sesión"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Agregar nueva sesión individual */}
              <div className="p-3 bg-white rounded-xl border border-dashed border-amber-400/80 space-y-2">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar un día y horario de sesión:</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Día</label>
                    <select
                      value={draftDia}
                      onChange={(e) => setDraftDia(e.target.value as SessionDay)}
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
                      value={draftInicio}
                      onChange={(e) => setDraftInicio(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Fin</label>
                    <input
                      type="time"
                      value={draftFin}
                      onChange={(e) => setDraftFin(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={handleAddDraftSession}
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
              <span>Foto de la Fachada (Opcional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL de la Fotografía
                </label>
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-none"
                />

                <div className="mt-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 cursor-pointer font-semibold transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir desde dispositivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {fotoUrl && (
                <div className="text-center">
                  <span className="block text-[10px] text-slate-400 mb-1">Vista previa</span>
                  <img
                    src={fotoUrl}
                    alt="Vista previa"
                    className="h-28 w-auto max-w-full rounded-xl object-cover mx-auto border border-slate-300 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-lg transition flex items-center gap-1.5 active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar y Publicar Nuevo Grupo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
