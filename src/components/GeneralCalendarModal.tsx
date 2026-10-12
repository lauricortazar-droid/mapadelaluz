import React, { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  ExternalLink,
  Sparkles,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Lock,
  Settings,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { AppCustomTexts, CalendarEvent } from '../types';
import { APP_CONFIG } from '../data/config';

interface GeneralCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  customTexts: AppCustomTexts;
  isAdminLoggedIn?: boolean;
  onSaveCustomTexts?: (texts: AppCustomTexts) => void;
  onOpenAdminLogin?: () => void;
}

export const GeneralCalendarModal: React.FC<GeneralCalendarModalProps> = ({
  isOpen,
  onClose,
  customTexts,
  isAdminLoggedIn = false,
  onSaveCustomTexts,
  onOpenAdminLogin,
}) => {
  if (!isOpen) return null;

  // Estados locales para administración de eventos dentro del modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Campos para nuevo evento escrito
  const [newTitle, setNewTitle] = useState('');
  const [newFecha, setNewFecha] = useState('');
  const [newHora, setNewHora] = useState('');
  const [newLugar, setNewLugar] = useState('');
  const [newTipo, setNewTipo] = useState('Aniversario');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newLink, setNewLink] = useState('');

  // Campos para configuración de Google Calendar
  const [calendarMode, setCalendarMode] = useState<'both' | 'manual' | 'google'>(
    customTexts.calendarMode || 'both'
  );
  const [googleCid, setGoogleCid] = useState(
    customTexts.calendarGoogleCid || APP_CONFIG.CALENDAR_ID || 'gdll.agenda@gmail.com'
  );

  const manualEvents = customTexts.calendarManualEvents || [];
  const activeGoogleCid = customTexts.calendarGoogleCid || APP_CONFIG.CALENDAR_ID || 'gdll.agenda@gmail.com';
  const effectiveMode = customTexts.calendarMode || 'both';

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // Guardar nuevo evento escrito
  const handleAddManualEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFecha.trim()) return;

    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newTitle.trim(),
      fecha: newFecha.trim(),
      hora: newHora.trim() || 'Hora por confirmar',
      lugar: newLugar.trim() || 'Sede oficial de la Fraternidad',
      tipo: newTipo.trim() || 'Evento Oficial',
      descripcion: newDescripcion.trim() || undefined,
      link: newLink.trim() || undefined,
    };

    const updatedEvents = [...manualEvents, newEvent];
    const updatedTexts: AppCustomTexts = {
      ...customTexts,
      calendarManualEvents: updatedEvents,
    };

    if (onSaveCustomTexts) {
      onSaveCustomTexts(updatedTexts);
    }

    // Resetear formulario
    setNewTitle('');
    setNewFecha('');
    setNewHora('');
    setNewLugar('');
    setNewTipo('Aniversario');
    setNewDescripcion('');
    setNewLink('');
    setShowAddForm(false);
    showNotification('✓ Evento oficial publicado exitosamente en el calendario general');
  };

  // Eliminar evento escrito
  const handleDeleteEvent = (id: string) => {
    if (!window.confirm('¿Deseas eliminar este evento oficial del calendario general?')) return;
    const updatedEvents = manualEvents.filter((ev) => ev.id !== id);
    const updatedTexts: AppCustomTexts = {
      ...customTexts,
      calendarManualEvents: updatedEvents,
    };
    if (onSaveCustomTexts) {
      onSaveCustomTexts(updatedTexts);
    }
    showNotification('Evento eliminado del calendario general');
  };

  // Guardar configuración de Google Calendar
  const handleSaveCalendarConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTexts: AppCustomTexts = {
      ...customTexts,
      calendarMode,
      calendarGoogleCid: googleCid.trim() || 'gdll.agenda@gmail.com',
    };
    if (onSaveCustomTexts) {
      onSaveCustomTexts(updatedTexts);
    }
    setShowConfigPanel(false);
    showNotification('✓ Configuración del calendario actualizada');
  };

  // URL del iframe embebido de Google Calendar
  const embedGoogleUrl = `https://calendar.google.com/calendar/embed?src=${encodeURIComponent(
    activeGoogleCid
  )}&ctz=America%2FMerida&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1&mode=MONTH&hl=es`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
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
            <CalendarIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Calendario General de la Fraternidad</span>
          </div>

          <h2 id="calendar-modal-title" className="font-serif text-2xl font-bold text-white mb-1">
            Actividades y Agenda Oficial
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed max-w-xl">
            Solamente se muestran los eventos autorizados por la administración y la sincronización en vivo con Google Calendar.
          </p>

          {/* Barra de estado o notificación */}
          {statusMsg && (
            <div className="mt-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs px-3 py-2 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Acciones principales del encabezado */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(activeGoogleCid)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md transition"
              title="Abrir o suscribirse en Google Calendar personal"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Suscribirme a Google Calendar</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
            </a>

            {/* Controles para Administradora */}
            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setShowConfigPanel(false);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                    showAddForm
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border-emerald-400/40'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddForm ? 'Cerrar Formulario' : '+ Redactar Evento'}</span>
                </button>

                <button
                  onClick={() => {
                    setShowConfigPanel(!showConfigPanel);
                    setShowAddForm(false);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                    showConfigPanel
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                  title="Configurar cuenta vinculada de Google Calendar"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Vincular Google Calendar</span>
                </button>
              </div>
            ) : (
              onOpenAdminLogin && (
                <button
                  onClick={onOpenAdminLogin}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white border border-white/15 text-xs font-medium transition"
                  title="Acceder como Administradora para redactar eventos"
                >
                  <Lock className="w-3 h-3" />
                  <span>Acceso Administradora</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Panel Administradora: Formulario de Redacción de Evento */}
          {isAdminLoggedIn && showAddForm && (
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-sm animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Redactar Nuevo Evento Oficial en el Calendario</span>
                </h3>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  👑 Modo Administradora
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Este evento se publicará de inmediato en el calendario general para todos los miembros y visitantes.
              </p>

              <form onSubmit={handleAddManualEvent} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Título del Evento *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Aniversario Grupo Senderos de Luz"
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={newTipo}
                      onChange={(e) => setNewTipo(e.target.value)}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="text"
                      required
                      value={newFecha}
                      onChange={(e) => setNewFecha(e.target.value)}
                      placeholder="Ej. Sábado 28 de Noviembre, 2026"
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={newHora}
                      onChange={(e) => setNewHora(e.target.value)}
                      placeholder="Ej. 7:00 pm - 9:30 pm"
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Lugar o Dirección
                    </label>
                    <input
                      type="text"
                      value={newLugar}
                      onChange={(e) => setNewLugar(e.target.value)}
                      placeholder="Ej. Calle 60 x 57 Centro Histórico / Salón de Usos Múltiples"
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Enlace de Maps o Información (opcional)
                    </label>
                    <input
                      type="url"
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Descripción o detalles para los asistentes
                  </label>
                  <textarea
                    rows={2}
                    value={newDescripcion}
                    onChange={(e) => setNewDescripcion(e.target.value)}
                    placeholder="Información relevante, oradores invitados, programa del día..."
                    className="w-full p-2 bg-white rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publicar Evento Oficial</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Panel Administradora: Configuración de Google Calendar y Modo */}
          {isAdminLoggedIn && showConfigPanel && (
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-300 shadow-sm animate-fade-in space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>Vincular Google Calendar Oficial</span>
                </h3>
                <span className="text-[11px] font-bold text-blue-800 bg-blue-200/70 px-2 py-0.5 rounded-md">
                  Configuración Administradora
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Ingresa el correo o Calendar ID de Google que gestionas para que la agenda se sincronice automáticamente.
              </p>

              <form onSubmit={handleSaveCalendarConfig} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ID o Correo de Google Calendar
                  </label>
                  <input
                    type="text"
                    value={googleCid}
                    onChange={(e) => setGoogleCid(e.target.value)}
                    placeholder="ej. gdll.agenda@gmail.com"
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Predeterminado: <code className="text-blue-700">gdll.agenda@gmail.com</code> (El calendario debe tener permisos de acceso público de solo lectura en Google Calendar).
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ¿Qué contenido mostrar en la pestaña de Calendario General?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                        calendarMode === 'both'
                          ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="mode"
                          checked={calendarMode === 'both'}
                          onChange={() => setCalendarMode('both')}
                        />
                        <span>Ambos</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-500">
                        Eventos escritos y Google Calendar en vivo.
                      </span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                        calendarMode === 'manual'
                          ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="mode"
                          checked={calendarMode === 'manual'}
                          onChange={() => setCalendarMode('manual')}
                        />
                        <span>Solo Escritos</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-500">
                        Únicamente los redactados por la admin.
                      </span>
                    </label>

                    <label
                      className={`p-2.5 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                        calendarMode === 'google'
                          ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="mode"
                          checked={calendarMode === 'google'}
                          onChange={() => setCalendarMode('google')}
                        />
                        <span>Solo Google Calendar</span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-500">
                        Vista embebida directa de Google.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowConfigPanel(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <span>Guardar Vinculación</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SECCIÓN 1: EVENTOS ESCRITOS POR LA ADMINISTRACIÓN */}
          {(effectiveMode === 'both' || effectiveMode === 'manual') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Eventos y Aniversarios Registrados</span>
                </h3>
                {manualEvents.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-500">
                    {manualEvents.length} {manualEvents.length === 1 ? 'evento' : 'eventos'}
                  </span>
                )}
              </div>

              {manualEvents.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-2">
                  <Info className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">
                    No hay eventos escritos registrados actualmente por la administración.
                  </p>
                  {isAdminLoggedIn ? (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Redactar el Primer Evento Escrito</span>
                    </button>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      Los aniversarios y sesiones especiales serán redactados y publicados por la coordinación general.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {manualEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50/40 hover:border-amber-300 transition relative group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-sm text-slate-900">{evt.title}</h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                              {evt.tipo}
                            </span>
                          </div>
                          {evt.descripcion && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {evt.descripcion}
                            </p>
                          )}
                        </div>

                        {/* Botón eliminar para administradora */}
                        {isAdminLoggedIn && (
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Eliminar evento oficial"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-slate-600 flex flex-wrap items-center gap-y-1 gap-x-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium text-slate-800">{evt.fecha}</span>
                          {evt.hora && <span className="text-slate-500">• {evt.hora}</span>}
                        </div>
                        {evt.lugar && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{evt.lugar}</span>
                          </div>
                        )}
                        {evt.link && (
                          <a
                            href={evt.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium text-[11px]"
                          >
                            <span>Ver ubicación</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECCIÓN 2: GOOGLE CALENDAR OFICIAL VINCULADO */}
          {(effectiveMode === 'both' || effectiveMode === 'google') && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-blue-700" />
                    <span>Google Calendar Vinculado ({activeGoogleCid})</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sincronizado directamente con la cuenta oficial de Google Calendar.
                  </p>
                </div>
                <a
                  href={`https://calendar.google.com/calendar/render?cid=${encodeURIComponent(activeGoogleCid)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
                >
                  <span>Abrir en Google</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="rounded-2xl overflow-hidden border border-slate-300 h-96 bg-slate-100 shadow-inner">
                <iframe
                  src={embedGoogleUrl}
                  title={`Google Calendar ${activeGoogleCid}`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-none"
                  loading="lazy"
                >
                  Cargando Google Calendar...
                </iframe>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {isAdminLoggedIn ? (
              <span className="text-amber-800 font-semibold">
                Sesión de administradora activa. Los cambios se guardan automáticamente.
              </span>
            ) : (
              'Calendario oficial de la Fraternidad Guerreros de la Luz.'
            )}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
