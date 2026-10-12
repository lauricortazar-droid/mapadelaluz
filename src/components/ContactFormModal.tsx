import React, { useState } from 'react';
import { X, HeartHandshake, MessageCircle, Send, ShieldCheck, ExternalLink, Facebook } from 'lucide-react';
import { Group } from '../types';
import { APP_CONFIG } from '../data/config';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedGroup: Group | null;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  isOpen,
  onClose,
  selectedGroup,
}) => {
  const [alias, setAlias] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [showGoogleForm, setShowGoogleForm] = useState(false);

  if (!isOpen) return null;

  const targetWa = (selectedGroup?.whatsapp || APP_CONFIG.WHATSAPP_GENERAL).replace(/[^0-9]/g, '');

  const handleSendWhatsapp = (e: React.FormEvent) => {
    e.preventDefault();
    const groupName = selectedGroup ? selectedGroup.nombre : 'un grupo de Mérida';
    const textLines = [
      `Hola, me gustaría asistir o recibir información de la Fraternidad Guerreros de la Luz.`,
      `Grupo de interés: ${groupName}`,
      alias ? `Mi nombre / alias: ${alias}` : '',
      phone ? `Mi teléfono de contacto: ${phone}` : '',
      message ? `Mensaje o duda: ${message}` : '',
      `¿Podrían orientarme sobre los horarios y cómo llegar? Muchas gracias.`,
    ].filter(Boolean);

    const fullText = encodeURIComponent(textLines.join('\n'));
    window.open(`https://wa.me/${targetWa}?text=${fullText}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2.5">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
            <span>Acompañamiento y Primer Contacto</span>
          </div>

          <h2 id="contact-title" className="font-serif text-2xl font-bold text-white mb-1">
            Quiero asistir / Solicitar información
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            {selectedGroup
              ? `Estás consultando para el grupo: ${selectedGroup.nombre}`
              : 'Ponte en contacto con un servidor de la Fraternidad en Mérida.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {showGoogleForm ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                Puedes completar el formulario oficial de Google Forms o volver al contacto rápido por WhatsApp.
              </div>
              <div className="rounded-xl overflow-hidden border border-slate-300 h-96">
                <iframe
                  src={APP_CONFIG.FORM_ASISTENCIA_URL}
                  width="100%"
                  height="100%"
                  title="Formulario de asistencia"
                  className="w-full h-full border-none"
                >
                  Cargando formulario...
                </iframe>
              </div>
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleForm(false)}
                  className="text-xs font-semibold text-blue-900 underline"
                >
                  ← Volver a mensaje directo
                </button>
                <a
                  href={APP_CONFIG.FORM_ASISTENCIA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900"
                >
                  <span>Abrir en nueva pestaña</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendWhatsapp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tu nombre o alias (opcional)
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej. Juan, María (respetamos tu anonimato)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Teléfono / WhatsApp (opcional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej. 999 123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  ¿En qué podemos orientarte?
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ej. Es mi primera vez y quisiera saber a qué hora llegar, si hay estacionamiento o si puedo ir con un familiar..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                ></textarea>
              </div>

              {/* Botón primario: WhatsApp */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar mensaje directo por WhatsApp</span>
              </button>

              {/* Alternativa: Google Forms & Facebook */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
                <a
                  href={selectedGroup?.facebook || APP_CONFIG.FACEBOOK_GENERAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <Facebook className="w-3.5 h-3.5 fill-blue-600 text-blue-600" />
                  <span>Contactar por Facebook</span>
                </a>
                <span className="hidden sm:inline text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setShowGoogleForm(true)}
                  className="text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Llenar formulario Google Forms
                </button>
              </div>
            </form>
          )}

          {/* Privacy note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Tu información es estrictamente confidencial entre compañeros del programa. No guardamos registros con fines comerciales ni de prospección.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
