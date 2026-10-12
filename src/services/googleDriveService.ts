import { getAccessToken } from '../lib/firebase';
import { Group } from '../types';

export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
  webViewLink?: string;
}

export const AUTO_SYNC_DRIVE_FILENAME = 'Directorio_Guerreros_de_la_Luz_AutoSync.json';

/**
 * Lista archivos de respaldo en Google Drive
 */
export async function listDriveBackups(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para acceder a Google Drive');

  const q = encodeURIComponent("name contains 'Guerreros' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&orderBy=modifiedTime desc`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Error al consultar Google Drive: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Sincronización continua de respaldo (1 minuto):
 * Busca el archivo central 'Directorio_Guerreros_de_la_Luz_AutoSync.json'.
 * Si ya existe, lo actualiza limpiamente en Google Drive sin saturar con duplicados.
 * Si no existe, lo crea automáticamente.
 */
export async function syncLiveBackupToDrive(groups: Group[]): Promise<{
  file: DriveBackupFile;
  isUpdate: boolean;
  timestamp: string;
}> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Inicia sesión con Google para sincronizar el respaldo en Google Drive');
  }

  const timestamp = new Date().toISOString();
  const backupPayload = {
    fraternidad: 'Guerreros de la Luz A.C.',
    tipo: 'Respaldo Automático 1-Minuto',
    fechaSincronizacion: timestamp,
    totalGrupos: groups.length,
    version: '3.1-autosync',
    grupos: groups,
  };

  const fileContent = JSON.stringify(backupPayload, null, 2);

  // 1. Buscar si ya existe el archivo maestro de sincronización
  const searchQ = encodeURIComponent(`name = '${AUTO_SYNC_DRIVE_FILENAME}' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${searchQ}&fields=files(id,name,mimeType,modifiedTime,webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  let existingFileId: string | null = null;
  if (searchRes.ok) {
    const searchData = await searchRes.json().catch(() => ({ files: [] }));
    if (searchData.files && searchData.files.length > 0) {
      existingFileId = searchData.files[0].id;
    }
  }

  // 2. Si existe, actualizar el contenido mediante PATCH uploadType=media
  if (existingFileId) {
    const patchUrl = `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(
      existingFileId
    )}?uploadType=media&fields=id,name,mimeType,modifiedTime,webViewLink`;

    const patchRes = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: fileContent,
    });

    if (!patchRes.ok) {
      const err = await patchRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Error al actualizar en Google Drive: ${patchRes.status}`);
    }

    const updatedFile: DriveBackupFile = await patchRes.json();
    return {
      file: updatedFile,
      isUpdate: true,
      timestamp,
    };
  }

  // 3. Si no existe, crear por primera vez mediante multipart POST
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: AUTO_SYNC_DRIVE_FILENAME,
    mimeType: 'application/json',
    description: `Copia de seguridad en tiempo real del directorio de grupos (${groups.length} grupos). Se sincroniza cada minuto.`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const postUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink';

  const postRes = await fetch(postUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!postRes.ok) {
    const err = await postRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al crear respaldo en Google Drive: ${postRes.status}`);
  }

  const createdFile: DriveBackupFile = await postRes.json();
  return {
    file: createdFile,
    isUpdate: false,
    timestamp,
  };
}

/**
 * Crea una copia de respaldo fechada e histórica a petición manual
 */
export async function uploadDirectoryBackupToDrive(groups: Group[]): Promise<DriveBackupFile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para subir a Google Drive');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Directorio_Guerreros_de_la_Luz_${timestamp}.json`;

  const backupPayload = {
    fraternidad: 'Guerreros de la Luz A.C.',
    fechaExportacion: new Date().toISOString(),
    totalGrupos: groups.length,
    version: '3.1',
    grupos: groups,
  };

  const fileContent = JSON.stringify(backupPayload, null, 2);

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Copia manual de seguridad del directorio de grupos (${groups.length} grupos)`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al guardar en Google Drive: ${response.status}`);
  }

  return await response.json();
}

/**
 * Descarga y parsea un archivo de respaldo desde Google Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<Group[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google');

  const safeFileId = encodeURIComponent(fileId);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${safeFileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Error al descargar archivo de Google Drive: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data.grupos && Array.isArray(data.grupos)) return data.grupos;
  throw new Error('El archivo descargado no tiene el formato esperado de grupos.');
}

/**
 * Elimina un archivo en Google Drive (operación destructiva protegida)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google');

  const safeFileId = encodeURIComponent(fileId);
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${safeFileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar archivo de Google Drive: ${response.status}`);
  }
}
