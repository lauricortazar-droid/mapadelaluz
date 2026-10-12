import React, { useState, useEffect } from 'react';
import {
  X,
  HardDrive,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Upload,
  Plus,
  RefreshCw,
  Trash2,
  LogOut,
  Sparkles,
  Phone,
  HelpCircle,
  FileText
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getAccessToken, auth } from '../lib/firebase';
import { Group } from '../types';
import {
  listDriveBackups,
  uploadDirectoryBackupToDrive,
  downloadBackupFromDrive,
  deleteDriveFile,
  syncLiveBackupToDrive,
  AUTO_SYNC_DRIVE_FILENAME,
  DriveBackupFile
} from '../services/googleDriveService';
import {
  createGoogleForm,
  getGoogleForm,
  getGoogleFormResponses,
  getSavedFormIds,
  GoogleFormSummary,
  GoogleFormResponseItem
} from '../services/googleFormsService';
import {
  listGoogleContacts,
  createGoogleContact,
  deleteGoogleContact,
  GoogleContactPerson
} from '../services/googleContactsService';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onImportGroups?: (groups: Group[]) => void;
}

type WorkspaceTab = 'drive' | 'forms' | 'contacts';

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  groups,
  onImportGroups,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('drive');

  // Estado Google Drive
  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);

  // Estado Google Forms
  const [formsList, setFormsList] = useState<GoogleFormSummary[]>([]);
  const [selectedFormResponses, setSelectedFormResponses] = useState<GoogleFormResponseItem[]>([]);
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  // Estado Google Contacts
  const [contactsList, setContactsList] = useState<GoogleContactPerson[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactGroup, setNewContactGroup] = useState('');

  // Notificaciones y diálogos de confirmación
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    onConfirm: () => void;
  } | null>(null);

  // Actualizar estado de autenticación al abrir
  useEffect(() => {
    if (!isOpen) return;
    const unsub = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      const token = await getAccessToken();
      setHasToken(!!token && !!user);
      if (token && user) {
        loadDataForActiveTab(activeTab);
      }
    });
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (hasToken) {
      loadDataForActiveTab(activeTab);
    }
  }, [activeTab, hasToken]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const loadDataForActiveTab = async (tab: WorkspaceTab) => {
    if (tab === 'drive') {
      await fetchDriveFiles();
    } else if (tab === 'forms') {
      await fetchSavedForms();
    } else if (tab === 'contacts') {
      await fetchContacts();
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setFeedbackMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setHasToken(true);
        showNotification('success', `Conectado exitosamente como ${result.user.displayName || result.user.email}`);
        loadDataForActiveTab(activeTab);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setHasToken(false);
    setDriveFiles([]);
    setFormsList([]);
    setContactsList([]);
    showNotification('success', 'Sesión cerrada correctamente.');
  };

  // =====================
  // DRIVE ACTIONS
  // =====================
  const fetchDriveFiles = async () => {
    setIsLoadingDrive(true);
    try {
      const files = await listDriveBackups();
      setDriveFiles(files);
    } catch (err: any) {
      showNotification('error', `Error al cargar Drive: ${err.message}`);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const promptUploadDriveBackup = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Respaldar Directorio en Google Drive',
      description: `¿Deseas subir una copia de seguridad con los ${groups.length} grupos a tu unidad de Google Drive? Se creará un archivo JSON organizado.`,
      confirmText: 'Sí, crear respaldo',
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsUploadingDrive(true);
        try {
          const uploaded = await uploadDirectoryBackupToDrive(groups);
          showNotification('success', `¡Respaldo "${uploaded.name}" guardado exitosamente en Google Drive!`);
          await fetchDriveFiles();
        } catch (err: any) {
          showNotification('error', err.message || 'Error al respaldar en Drive');
        } finally {
          setIsUploadingDrive(false);
        }
      },
    });
  };

  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem('gdll_drive_last_sync_time');
    } catch {
      return null;
    }
  });

  const handleManualLiveSync = async () => {
    setIsLiveSyncing(true);
    try {
      const res = await syncLiveBackupToDrive(groups);
      const timeStr = new Date().toISOString();
      setLastLiveSyncTime(timeStr);
      try {
        localStorage.setItem('gdll_drive_last_sync_time', timeStr);
      } catch {}
      showNotification(
        'success',
        `¡Sincronización a Google Drive completada! (${res.isUpdate ? 'Archivo actualizado' : 'Archivo creado'})`
      );
      await fetchDriveFiles();
    } catch (err: any) {
      showNotification('error', err.message || 'Error al sincronizar con Google Drive');
    } finally {
      setIsLiveSyncing(false);
    }
  };

  const promptDownloadDriveBackup = (file: DriveBackupFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restaurar Directorio desde Google Drive',
      description: `¿Deseas restaurar la lista de grupos desde el respaldo "${file.name}"? Los datos actuales serán reemplazados por los de esta copia.`,
      confirmText: 'Sí, restaurar datos',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          const restored = await downloadBackupFromDrive(file.id);
          if (onImportGroups) {
            onImportGroups(restored);
          }
          showNotification('success', `¡Se han restaurado ${restored.length} grupos desde Google Drive!`);
        } catch (err: any) {
          showNotification('error', err.message || 'Error al restaurar respaldo');
        }
      },
    });
  };

  const promptDeleteDriveFile = (file: DriveBackupFile) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Archivo de Google Drive',
      description: `¿Estás seguro de que deseas eliminar permanentemente "${file.name}" de tu Google Drive? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar archivo',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteDriveFile(file.id);
          showNotification('success', 'Archivo eliminado de Google Drive.');
          await fetchDriveFiles();
        } catch (err: any) {
          showNotification('error', err.message || 'Error al eliminar');
        }
      },
    });
  };

  // =====================
  // FORMS ACTIONS
  // =====================
  const fetchSavedForms = async () => {
    setIsLoadingForms(true);
    try {
      const ids = getSavedFormIds();
      const loaded: GoogleFormSummary[] = [];
      for (const id of ids) {
        try {
          const f = await getGoogleForm(id);
          loaded.push(f);
        } catch (e) {
          console.warn('Form not accessible:', id);
        }
      }
      setFormsList(loaded);
      if (loaded.length > 0 && !activeFormId) {
        handleSelectForm(loaded[0].formId);
      }
    } catch (err: any) {
      showNotification('error', err.message);
    } finally {
      setIsLoadingForms(false);
    }
  };

  const promptCreateForm = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Crear Formulario Oficial en Google Forms',
      description: '¿Deseas generar automáticamente un formulario en tu Google Drive para recopilar nuevas propuestas de grupos, sedes y números de líderes?',
      confirmText: 'Crear Formulario',
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsCreatingForm(true);
        try {
          const newForm = await createGoogleForm('Registro y Modificación de Grupos - Guerreros de la Luz A.C.');
          showNotification('success', `¡Formulario "${newForm.info.title}" creado con éxito en Google Forms!`);
          await fetchSavedForms();
          handleSelectForm(newForm.formId);
        } catch (err: any) {
          showNotification('error', err.message || 'Error al crear formulario');
        } finally {
          setIsCreatingForm(false);
        }
      },
    });
  };

  const handleSelectForm = async (formId: string) => {
    setActiveFormId(formId);
    try {
      const responses = await getGoogleFormResponses(formId);
      setSelectedFormResponses(responses);
    } catch (e) {
      setSelectedFormResponses([]);
    }
  };

  // =====================
  // CONTACTS ACTIONS
  // =====================
  const fetchContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const list = await listGoogleContacts();
      setContactsList(list);
    } catch (err: any) {
      showNotification('error', `Error al cargar contactos: ${err.message}`);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const promptAddCoordinatorToContacts = (name: string, phone: string, groupName: string, zone: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Guardar Contacto en tu Teléfono / Google',
      description: `¿Deseas agregar a "${name}" (${phone}) como contacto oficial de la Fraternidad en tu cuenta de Google Contacts?`,
      confirmText: 'Guardar en Contactos',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await createGoogleContact({
            name,
            phone,
            groupName,
            zone,
            role: 'Servidor de Grupo',
          });
          showNotification('success', `¡Contacto ${name} guardado en Google Contacts!`);
          await fetchContacts();
        } catch (err: any) {
          showNotification('error', err.message || 'Error al guardar contacto');
        }
      },
    });
  };

  const handleManualAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Agregar a Google Contacts',
      description: `¿Confirmas agregar a ${newContactName} (${newContactPhone}) a tu libreta de contactos de Google?`,
      confirmText: 'Confirmar y Guardar',
      onConfirm: async () => {
        setConfirmDialog(null);
        setIsAddingContact(true);
        try {
          await createGoogleContact({
            name: newContactName.trim(),
            phone: newContactPhone.trim(),
            groupName: newContactGroup.trim() || 'Servidor Fraternal',
            role: 'Contacto GDLL',
          });
          showNotification('success', `Contacto ${newContactName} añadido a Google Contacts`);
          setNewContactName('');
          setNewContactPhone('');
          setNewContactGroup('');
          await fetchContacts();
        } catch (err: any) {
          showNotification('error', err.message);
        } finally {
          setIsAddingContact(false);
        }
      },
    });
  };

  const promptDeleteContact = (contact: GoogleContactPerson) => {
    const contactName = contact.names?.[0]?.displayName || 'este contacto';
    setConfirmDialog({
      isOpen: true,
      title: 'Eliminar Contacto de Google',
      description: `¿Estás seguro de que deseas eliminar permanentemente a "${contactName}" de tus contactos de Google?`,
      confirmText: 'Sí, eliminar contacto',
      onConfirm: async () => {
        setConfirmDialog(null);
        try {
          await deleteGoogleContact(contact.resourceName);
          showNotification('success', 'Contacto eliminado con éxito.');
          await fetchContacts();
        } catch (err: any) {
          showNotification('error', err.message);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-blue-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Centro de Google Workspace</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Drive • Forms • Contacts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sincronización oficial con las herramientas en la nube de Google
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificaciones flotantes */}
        {feedbackMessage && (
          <div
            className={`px-4 py-2.5 mx-6 mt-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Sección de Estado de Autenticación con Google */}
        <div className="px-6 py-3.5 bg-slate-800/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {currentUser && hasToken ? (
            <div className="flex items-center gap-3">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google'}
                  className="w-8 h-8 rounded-full border border-amber-400/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'G'}
                </div>
              )}
              <div className="text-xs">
                <p className="font-semibold text-white flex items-center gap-1.5">
                  <span>{currentUser.displayName || 'Usuario de Google'}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Conectado
                  </span>
                </p>
                <p className="text-slate-400 text-[11px]">{currentUser.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs text-slate-300">
                Inicia sesión con tu cuenta de Google para habilitar Drive, Forms y Contactos.
              </span>
            </div>
          )}

          <div>
            {currentUser && hasToken ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar</span>
              </button>
            ) : (
              /* Botón oficial de Google Sign-In */
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoggingIn ? 'Conectando...' : 'Iniciar sesión con Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de Servicios */}
        <div className="flex border-b border-slate-800 bg-slate-900/90 px-6">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'drive'
                ? 'border-amber-400 text-amber-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive</span>
            {driveFiles.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {driveFiles.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'forms'
                ? 'border-blue-400 text-blue-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Forms</span>
            {formsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {formsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'contacts'
                ? 'border-emerald-400 text-emerald-300 bg-slate-800/40'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Google Contacts</span>
            {contactsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {contactsList.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido scrolleable de la Pestaña activa */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {!hasToken ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Conecta tu cuenta de Google</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permite a la aplicación guardar copias de seguridad en tu Google Drive, crear y recibir formularios de propuestas para grupos y sincronizar números de servidores a tus contactos de Google.
              </p>
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95"
              >
                <span>{isLoggingIn ? 'Iniciando...' : 'Iniciar Sesión con Google'}</span>
              </button>
            </div>
          ) : (
            <>
              {/* TAB 1: GOOGLE DRIVE */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  {/* Banner de Sincronización Automática cada 1 Minuto */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-slate-900 border border-emerald-500/40 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                            ☁️ Sincronización Automática Cada 1 Minuto
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                            Activo
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Los cambios guardados en las fichas se sincronizan cada minuto en Google Drive bajo el archivo maestro <code className="text-emerald-300 font-mono text-[11px] bg-slate-900/60 px-1.5 py-0.5 rounded border border-emerald-500/20">{AUTO_SYNC_DRIVE_FILENAME}</code>.
                        </p>
                        {lastLiveSyncTime && (
                          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                            <span>Última sincronización exitosa:</span>
                            <span className="font-medium text-emerald-200">
                              {new Date(lastLiveSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} ({new Date(lastLiveSyncTime).toLocaleDateString()})
                            </span>
                          </p>
                        )}
                      </div>

                      <button
                        onClick={handleManualLiveSync}
                        disabled={isLiveSyncing}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLiveSyncing ? 'animate-spin' : ''}`} />
                        <span>{isLiveSyncing ? 'Sincronizando...' : 'Sincronizar a Drive Ahora'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-amber-400" />
                        <span>Copias de Seguridad en la Nube</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Guarda los {groups.length} grupos en tu cuenta de Google Drive para tener un respaldo seguro o restaurarlo en cualquier momento.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={promptUploadDriveBackup}
                        disabled={isUploadingDrive}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition active:scale-95 disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingDrive ? 'Subiendo...' : 'Crear Respaldo en Drive'}</span>
                      </button>

                      <button
                        onClick={fetchDriveFiles}
                        disabled={isLoadingDrive}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
                        title="Recargar archivos"
                      >
                        <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Lista de archivos en Drive */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Respaldos en tu Google Drive ({driveFiles.length})
                    </h4>

                    {isLoadingDrive ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        Cargando archivos desde Google Drive...
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-slate-850/50 border border-slate-800 text-center text-xs text-slate-400">
                        No se han encontrado copias de seguridad previas en tu Google Drive. Presiona «Crear Respaldo en Drive» para generar la primera.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-850/30">
                        {driveFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/40 transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-white truncate">{file.name}</p>
                                <p className="text-[11px] text-slate-400">
                                  {file.modifiedTime ? new Date(file.modifiedTime).toLocaleString() : 'Fecha desconocida'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
                                  title="Ver en Google Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => promptDownloadDriveBackup(file)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                                title="Restaurar este respaldo"
                              >
                                <Download className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Restaurar</span>
                              </button>
                              <button
                                onClick={() => promptDeleteDriveFile(file)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Eliminar archivo de Drive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GOOGLE FORMS */}
              {activeTab === 'forms' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                        <span>Formularios de Registro y Encuestas</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Crea formularios de Google Forms automáticos para que los servidores propongan grupos o cambios.
                      </p>
                    </div>

                    <button
                      onClick={promptCreateForm}
                      disabled={isCreatingForm}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow transition active:scale-95 disabled:opacity-50 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCreatingForm ? 'Generando...' : 'Crear Formulario GDLL'}</span>
                    </button>
                  </div>

                  {isLoadingForms ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      Cargando formularios desde Google Forms...
                    </div>
                  ) : formsList.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-850/50 border border-slate-800 text-center text-xs text-slate-400">
                      Aún no has generado ningún formulario de Google. Presiona «Crear Formulario GDLL» para crear la plantilla oficial con preguntas preconfiguradas (Nombre del grupo, Zona, Horarios, Servidor).
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formsList.map((form) => (
                        <div
                          key={form.formId}
                          className={`p-4 rounded-2xl border transition ${
                            activeFormId === form.formId
                              ? 'bg-slate-800/90 border-blue-500/40'
                              : 'bg-slate-850/30 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                              <h4 className="text-sm font-bold text-white">{form.info.title}</h4>
                              <p className="text-xs text-slate-400">
                                {form.info.description || 'Formulario de registro y propuestas de la Fraternidad'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {form.responderUri && (
                                <a
                                  href={form.responderUri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold border border-blue-500/30 transition"
                                >
                                  <span>Abrir Formulario</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() => handleSelectForm(form.formId)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                              >
                                Ver Respuestas
                              </button>
                            </div>
                          </div>

                          {/* Respuestas recibidas */}
                          {activeFormId === form.formId && (
                            <div className="mt-3 pt-3 border-t border-slate-700/60">
                              <p className="text-xs font-semibold text-slate-300 mb-2">
                                Respuestas recibidas en este formulario: ({selectedFormResponses.length})
                              </p>
                              {selectedFormResponses.length === 0 ? (
                                <p className="text-xs text-slate-400 italic">
                                  No hay respuestas aún. Comparte el enlace del formulario para que los miembros respondan.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {selectedFormResponses.map((res, idx) => (
                                    <div
                                      key={res.responseId || idx}
                                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-750 text-xs space-y-1"
                                    >
                                      <p className="font-bold text-amber-300">
                                        Respuesta #{idx + 1} — {new Date(res.lastSubmittedTime).toLocaleString()}
                                      </p>
                                      {res.answers && (
                                        <div className="space-y-0.5 text-slate-300 text-[11px]">
                                          {Object.entries(res.answers).map(([qId, ans]) => (
                                            <p key={qId}>
                                              <span className="text-slate-400">Valor:</span>{' '}
                                              {ans.textAnswers?.answers?.map((a) => a.value).join(', ')}
                                            </p>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: GOOGLE CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Sincronizar Contactos con tu Teléfono / Google</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Guarda directamente los números de los servidores y líderes de grupos en tu cuenta de Google Contacts con su zona y grupo correspondiente.
                    </p>

                    {/* Formulario rápido para añadir contacto manual */}
                    <form onSubmit={handleManualAddContact} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-700/60">
                      <input
                        type="text"
                        placeholder="Nombre del servidor..."
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Teléfono (ej. 999 123 4567)..."
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isAddingContact}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{isAddingContact ? 'Guardando...' : 'Guardar en Contactos'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Acceso rápido a coordinadores de la Fraternidad */}
                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                    <p className="text-xs font-bold text-emerald-300">
                      Servidores y Coordinadores Destacados de Zonas:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { name: 'Coordinador Zona Jaguar', phone: '9999001234', group: 'Comité Jaguar', zone: 'Jaguar (Yucatán)' },
                        { name: 'Servicio 24 Horas GDLL', phone: '9992005678', group: 'Mesa de Servicio Central', zone: 'General' },
                        { name: 'Mesa de Información y Ayuda', phone: '9993456789', group: 'Atención Telefónica 12 Pasos', zone: 'Mérida' },
                      ].map((lead, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
                          <div>
                            <p className="font-semibold text-white">{lead.name}</p>
                            <p className="text-slate-400 text-[11px]">{lead.phone} • {lead.zone}</p>
                          </div>
                          <button
                            onClick={() => promptAddCoordinatorToContacts(lead.name, lead.phone, lead.group, lead.zone)}
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition"
                            title="Guardar a mis contactos"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contactos cargados de Google */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Contactos en tu Google ({contactsList.length})
                      </h4>
                      <button
                        onClick={fetchContacts}
                        disabled={isLoadingContacts}
                        className="p-1 text-slate-400 hover:text-white transition"
                        title="Refrescar lista"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingContacts ? 'animate-spin' : ''}`} />
                      </button>
                    </div>

                    {isLoadingContacts ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Consultando tu libreta de Google Contacts...
                      </div>
                    ) : contactsList.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-850/40 text-center text-xs text-slate-400">
                        No se han encontrado contactos guardados en esta cuenta.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-850/30 max-h-60 overflow-y-auto">
                        {contactsList.map((c) => {
                          const name = c.names?.[0]?.displayName || 'Sin nombre';
                          const phone = c.phoneNumbers?.[0]?.value || 'Sin teléfono';
                          const org = c.organizations?.[0]?.name || c.biographies?.[0]?.value || '';
                          return (
                            <div key={c.resourceName} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-800/40 transition">
                              <div>
                                <p className="text-xs font-semibold text-white">{name}</p>
                                <p className="text-[11px] text-slate-400">{phone} {org ? `• ${org}` : ''}</p>
                              </div>
                              <button
                                onClick={() => promptDeleteContact(c)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
                                title="Eliminar contacto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Confirmación para Operaciones Mutantes o Destructivas (Mandatorio por Skill) */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-5 shadow-2xl space-y-4 text-white animate-scale-up">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{confirmDialog.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{confirmDialog.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow"
                >
                  {confirmDialog.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
