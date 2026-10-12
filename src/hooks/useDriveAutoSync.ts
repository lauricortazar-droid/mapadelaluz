import { useState, useEffect, useRef, useCallback } from 'react';
import { Group } from '../types';
import { syncLiveBackupToDrive, AUTO_SYNC_DRIVE_FILENAME } from '../services/googleDriveService';
import { getAccessToken, googleSignIn, auth } from '../lib/firebase';

export type DriveSyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'not_authenticated';

interface UseDriveAutoSyncProps {
  groups: Group[];
  isAdmin: boolean;
}

export function useDriveAutoSync({ groups, isAdmin }: UseDriveAutoSyncProps) {
  const [status, setStatus] = useState<DriveSyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    try {
      const saved = localStorage.getItem('gdll_drive_last_sync_time');
      return saved ? new Date(saved) : null;
    } catch {
      return null;
    }
  });
  const [lastFileLink, setLastFileLink] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(60);

  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  const isSyncingRef = useRef(false);

  // Ejecuta la sincronización con Google Drive
  const performSync = useCallback(async (isManual = false) => {
    if (isSyncingRef.current) return;

    try {
      const token = await getAccessToken();
      if (!token) {
        setStatus('not_authenticated');
        return;
      }

      isSyncingRef.current = true;
      setStatus('syncing');
      setErrorMessage(null);

      const result = await syncLiveBackupToDrive(groupsRef.current);

      const now = new Date();
      setLastSyncTime(now);
      if (result.file.webViewLink) {
        setLastFileLink(result.file.webViewLink);
      }
      try {
        localStorage.setItem('gdll_drive_last_sync_time', now.toISOString());
      } catch {}

      setStatus('synced');
      setCountdown(60);
    } catch (err: any) {
      console.warn('Error durante sincronización con Google Drive:', err);
      const msg = err?.message || 'Error al conectar con Google Drive';
      if (msg.includes('iniciar sesión') || msg.includes('token') || msg.includes('401')) {
        setStatus('not_authenticated');
      } else {
        setStatus('error');
        setErrorMessage(msg);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Función para conectar sesión con Google
  const connectGoogle = async () => {
    try {
      setStatus('syncing');
      const res = await googleSignIn();
      if (res?.accessToken) {
        setStatus('idle');
        await performSync(true);
        return true;
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err?.message || 'Error al autorizar cuenta de Google');
    }
    return false;
  };

  // Temporizador de 1 minuto (60 segundos)
  useEffect(() => {
    if (!isAdmin || !autoSyncEnabled) {
      return;
    }

    // Intervalo de segundo a segundo para la cuenta regresiva visible
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Ha transcurrido el minuto: ejecutar sincronización
          performSync();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAdmin, autoSyncEnabled, performSync]);

  // Chequeo de token inicial cuando el admin está activo
  useEffect(() => {
    if (!isAdmin) return;

    const checkToken = async () => {
      const token = await getAccessToken();
      if (!token) {
        setStatus('not_authenticated');
      } else if (status === 'not_authenticated' || status === 'idle') {
        performSync();
      }
    };

    checkToken();
  }, [isAdmin, performSync]);

  const toggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    if (enabled) {
      setCountdown(60);
    }
  };

  return {
    status,
    lastSyncTime,
    lastFileLink,
    fileName: AUTO_SYNC_DRIVE_FILENAME,
    errorMessage,
    countdown,
    autoSyncEnabled,
    toggleAutoSync,
    syncNow: () => performSync(true),
    connectGoogle,
  };
}
