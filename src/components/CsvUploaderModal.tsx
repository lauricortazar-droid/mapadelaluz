import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Group, ZoneType } from '../types';

interface CsvUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportGroups: (importedGroups: Group[], mode: 'replace' | 'merge') => void;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export const CsvUploaderModal: React.FC<CsvUploaderModalProps> = ({
  isOpen,
  onClose,
  onImportGroups,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Group[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo con extensión .csv');
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setError('El archivo CSV no contiene filas suficientes.');
          return;
        }

        const headers = parseCSVLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        const groups: Group[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVLine(lines[i]);
          const getVal = (colKey: string) => {
            const idx = headers.findIndex((h) => h.includes(colKey));
            return idx !== -1 ? cols[idx] || '' : '';
          };

          const name = getVal('nom') || getVal('name') || cols[1] || cols[0];
          if (!name) continue;

          const zoneRaw = getVal('zon') || getVal('zone') || 'Jaguar';
          let zone: ZoneType = 'Jaguar';
          if (zoneRaw.toLowerCase().includes('aguila') || zoneRaw.toLowerCase().includes('águila')) zone = 'Águila';
          else if (zoneRaw.toLowerCase().includes('tibur') || zoneRaw.toLowerCase().includes('tiburon')) zone = 'Tiburón';
          else if (zoneRaw.toLowerCase().includes('delf')) zone = 'Delfín';
          else if (zoneRaw.toLowerCase().includes('colib')) zone = 'Colibrí';
          else if (zoneRaw.toLowerCase().includes('toca') || zoneRaw.toLowerCase().includes('teoca')) zone = 'Tocalli';

          const address = getVal('dir') || getVal('address') || 'Dirección registrada';
          const city = getVal('ciud') || getVal('city') || getVal('mun') || 'Mérida';
          const whatsapp = getVal('what') || getVal('tel') || '529999234567';
          const facebook = getVal('face') || getVal('fb') || undefined;
          const schedules = getVal('hor') || getVal('sched') || 'Lunes a viernes 8 a 10 pm';
          const mapsUrl = getVal('map') || getVal('url') || undefined;

          groups.push({
            id: getVal('id') || getVal('code') || `csv-${i}`,
            publicCode: getVal('code') || `FGDLL-${zone.slice(0, 3).toUpperCase()}-${i.toString().padStart(3, '0')}`,
            zone,
            nombre: name.startsWith('Grupo') ? name : `Grupo ${name}`,
            tipo: 'mixto',
            direccion: address,
            colonia: 'Centro',
            municipio: city,
            city,
            referencias: address,
            lat: 20.97 + (i % 10) * 0.003,
            lng: -89.62 + (i % 8) * 0.003,
            sesiones: [
              { dia: 'lunes', hora_inicio: '20:00', hora_fin: '22:00', modalidad: 'presencial' },
              { dia: 'miercoles', hora_inicio: '20:00', hora_fin: '22:00', modalidad: 'presencial' },
              { dia: 'viernes', hora_inicio: '20:00', hora_fin: '22:00', modalidad: 'presencial' },
            ],
            schedulesRaw: schedules,
            sessionTypesRaw: 'Sesión Principal (dos Horas por la Noche)',
            telefono: `+52 ${whatsapp}`,
            whatsapp: whatsapp.replace(/[^0-9]/g, ''),
            correo: 'contacto@guerrerosdelaluz.org',
            facebook,
            mapsUrl,
            accesibilidad: 'Acceso en planta baja.',
            activo: true,
            ultima_actualizacion: new Date().toISOString().split('T')[0],
          });
        }

        if (groups.length === 0) {
          setError('No se pudieron detectar grupos válidos en el CSV.');
        } else {
          setParsedPreview(groups);
        }
      } catch (err) {
        setError('Ocurrió un error al leer el archivo CSV.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleApply = () => {
    if (parsedPreview.length === 0) return;
    onImportGroups(parsedPreview, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="csv-title"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-2.5">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Importación de Datos</span>
          </div>

          <h2 id="csv-title" className="font-serif text-2xl font-bold text-white mb-1">
            Subir Archivo CSV de Grupos
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Sube un archivo de hoja de cálculo (.csv) con las columnas de grupos para alimentar y actualizar el directorio en vivo.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto text-xs text-slate-700">
          {/* Zona de arrastre / selección de archivo */}
          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center transition bg-slate-50/50 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>

            <div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>Elegir archivo CSV</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-slate-400 text-[11px] mt-2">
                {file ? `Archivo seleccionado: ${file.name}` : 'O arrastra tu archivo .csv aquí'}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parsedPreview.length > 0 && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  ✓ {parsedPreview.length} grupos detectados en el CSV
                </span>
                <span className="text-emerald-700 font-semibold text-[11px]">Listo para cargar</span>
              </div>

              {/* Vista previa de primeros 3 */}
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {parsedPreview.slice(0, 5).map((g, i) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-[11px] flex justify-between">
                    <div>
                      <strong className="text-slate-900">{g.nombre}</strong>
                      <span className="text-slate-500 ml-2">({g.zone} • {g.municipio})</span>
                    </div>
                    <span className="text-slate-400">{g.schedulesRaw}</span>
                  </div>
                ))}
                {parsedPreview.length > 5 && (
                  <div className="text-center text-[10px] text-slate-400 pt-1">
                    ... y {parsedPreview.length - 5} grupos más.
                  </div>
                )}
              </div>

              {/* Modo de importación */}
              <div className="pt-2 border-t border-slate-200 flex items-center gap-4">
                <span className="font-semibold text-slate-700">Acción:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                  />
                  <span>Reemplazar directorio actual</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                  />
                  <span>Combinar / Agregar</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold transition text-xs"
          >
            Cancelar
          </button>

          <button
            onClick={handleApply}
            disabled={parsedPreview.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Importar {parsedPreview.length > 0 ? `${parsedPreview.length} grupos` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
