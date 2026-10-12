import { Group } from '../types';

/**
 * Genera y descarga un archivo .vcf (vCard 3.0) para que el usuario guarde
 * el contacto del grupo de servicio directamente en los contactos de su teléfono móvil
 * (Android / iOS) sin requerir OAuth ni permisos invasivos.
 */
export function downloadVCard(group: Group): void {
  const cleanName = group.nombre.replace(/["“”]/g, '');
  const cleanOrg = 'Fraternidad Guerreros de la Luz (12 Pasos)';

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${cleanName}`,
    `ORG:${cleanOrg}`,
    `TITLE:Servicio de Información y Acompañamiento`,
    `TEL;TYPE=CELL,VOICE:${group.telefono}`,
    `TEL;TYPE=WHATSAPP:${group.whatsapp}`,
    `EMAIL;TYPE=INTERNET,HOME:${group.correo}`,
    `ADR;TYPE=WORK:;;${group.direccion};${group.colonia};Mérida;Yucatán;;México`,
    `NOTE:Grupo de 12 Pasos. Referencias: ${group.referencias}. Solo por hoy.`,
    'END:VCARD',
  ];

  const vcardString = lines.join('\r\n');
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeFilename = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('download', `contacto_${safeFilename}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
