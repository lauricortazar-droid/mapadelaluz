import { Group } from '../types';
import { INITIAL_GROUPS } from '../data/initialGroups';
import { saveGroupToFirestore, deleteGroupFromFirestore } from '../lib/firebase';

export const STORAGE_GROUPS_KEY = 'gdll_directory_groups_v3';
export const STORAGE_LOCAL_EDITS_KEY = 'gdll_local_edits_registry_v1';
export const STORAGE_PENDING_SYNC_KEY = 'gdll_pending_firestore_sync_v1';
export const STORAGE_DELETED_GROUPS_KEY = 'gdll_deleted_groups_registry_v1';

interface LocalEditRecord {
  group: Group;
  timestamp: number;
}

/**
 * Obtiene los registros de ediciones locales guardados
 */
function getLocalEditsRegistry(): Record<string, LocalEditRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_LOCAL_EDITS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Error al leer registro de ediciones locales:', err);
  }
  return {};
}

/**
 * Guarda el registro de ediciones locales
 */
function setLocalEditsRegistry(registry: Record<string, LocalEditRecord>) {
  try {
    localStorage.setItem(STORAGE_LOCAL_EDITS_KEY, JSON.stringify(registry));
  } catch (err) {
    console.warn('Error al guardar registro de ediciones locales:', err);
  }
}

/**
 * Obtiene la lista de IDs eliminados
 */
function getDeletedIdsSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_DELETED_GROUPS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch (err) {
    console.warn('Error al leer IDs eliminados:', err);
  }
  return new Set();
}

/**
 * Registra un ID eliminado
 */
function addDeletedId(id: string | number) {
  try {
    const set = getDeletedIdsSet();
    set.add(String(id));
    localStorage.setItem(STORAGE_DELETED_GROUPS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Error al persistir ID eliminado:', err);
  }
}

/**
 * Remueve un ID del set de eliminados (si se vuelve a crear o restaurar)
 */
function removeDeletedId(id: string | number) {
  try {
    const set = getDeletedIdsSet();
    set.delete(String(id));
    localStorage.setItem(STORAGE_DELETED_GROUPS_KEY, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Error al remover ID eliminado:', err);
  }
}

/**
 * Carga inicial de grupos garantizando que las ediciones locales previas nunca se pierdan
 */
export function loadInitialGroupsWithLocalEdits(): Group[] {
  let baseList: Group[] = [];
  try {
    const saved = localStorage.getItem(STORAGE_GROUPS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseList = parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer STORAGE_GROUPS_KEY:', err);
  }

  if (baseList.length === 0) {
    baseList = [...INITIAL_GROUPS];
  }

  // Aplicar cualquier edición local registrada sobre la base
  const edits = getLocalEditsRegistry();
  const deletedSet = getDeletedIdsSet();

  const groupMap = new Map<string, Group>();
  baseList.forEach((g) => {
    if (!deletedSet.has(String(g.id))) {
      groupMap.set(String(g.id), g);
    }
  });

  // Sobrescribir con las ediciones locales garantizadas
  Object.values(edits).forEach(({ group }) => {
    if (!deletedSet.has(String(group.id))) {
      groupMap.set(String(group.id), group);
    }
  });

  const finalList = Array.from(groupMap.values());
  // Asegurar persistencia limpia
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(finalList));
  } catch {}

  return finalList;
}

/**
 * Guarda una edición de grupo con máxima prioridad local y sincronización en cola
 */
export function saveGroupLocally(
  updatedGroup: Group,
  currentGroups: Group[]
): { updatedGroups: Group[]; savedGroup: Group } {
  const strId = String(updatedGroup.id);
  const now = Date.now();
  const isoDate = new Date().toISOString();

  // Enriquecer el grupo con marcas de tiempo actualizadas
  const enrichedGroup: Group = {
    ...updatedGroup,
    ultima_actualizacion: isoDate,
  };

  // 1. Registrar en el catálogo de ediciones locales
  const edits = getLocalEditsRegistry();
  edits[strId] = {
    group: enrichedGroup,
    timestamp: now,
  };
  setLocalEditsRegistry(edits);

  // 2. Si estaba marcado como eliminado, desmarcarlo
  removeDeletedId(strId);

  // 3. Actualizar la lista en memoria
  let found = false;
  const newGroups = currentGroups.map((g) => {
    if (String(g.id) === strId) {
      found = true;
      return enrichedGroup;
    }
    return g;
  });

  if (!found) {
    newGroups.unshift(enrichedGroup);
  }

  // 4. Guardar inmediatamente en localStorage (sin esperar react lifecycles)
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(newGroups));
  } catch (err) {
    console.error('Error al guardar STORAGE_GROUPS_KEY:', err);
  }

  // 5. Encolar y disparar sincronización con Firestore
  queueGroupForFirestoreSync(enrichedGroup);

  return { updatedGroups: newGroups, savedGroup: enrichedGroup };
}

/**
 * Elimina un grupo de forma persistente
 */
export function deleteGroupLocally(
  groupId: string | number,
  currentGroups: Group[]
): Group[] {
  const strId = String(groupId);

  // 1. Agregar a eliminados permanentes
  addDeletedId(strId);

  // 2. Remover del registro de ediciones locales
  const edits = getLocalEditsRegistry();
  if (edits[strId]) {
    delete edits[strId];
    setLocalEditsRegistry(edits);
  }

  // 3. Filtrar de la lista
  const newGroups = currentGroups.filter((g) => String(g.id) !== strId);

  // 4. Guardar inmediatamente en localStorage
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(newGroups));
  } catch (err) {}

  // 5. Eliminar en Firestore
  deleteGroupFromFirestore(strId).catch((err) =>
    console.warn('Error al eliminar en Firestore / eliminado localmente:', err)
  );

  return newGroups;
}

/**
 * Fusiona los grupos recibidos de Firestore respetando las ediciones locales recientes
 */
export function mergeFirestoreWithLocalEdits(
  firestoreGroups: Group[],
  currentLocalGroups: Group[]
): Group[] {
  if (!Array.isArray(firestoreGroups) || firestoreGroups.length === 0) {
    return currentLocalGroups;
  }

  const edits = getLocalEditsRegistry();
  const deletedSet = getDeletedIdsSet();

  // Mapear grupos actuales por ID
  const resultMap = new Map<string, Group>();
  currentLocalGroups.forEach((g) => {
    if (!deletedSet.has(String(g.id))) {
      resultMap.set(String(g.id), g);
    }
  });

  // Procesar cada grupo de Firestore
  firestoreGroups.forEach((fsGroup) => {
    const fsId = String(fsGroup.id);

    // Si fue eliminado localmente, no resucitar
    if (deletedSet.has(fsId)) return;

    const localEdit = edits[fsId];
    if (localEdit) {
      // Comparar fechas de actualización si están disponibles
      const localTime = localEdit.timestamp || 0;
      const fsTime = fsGroup.ultima_actualizacion
        ? new Date(fsGroup.ultima_actualizacion).getTime()
        : 0;

      // Si la edición local es más reciente que el documento en Firestore, mantener la versión local
      if (localTime >= fsTime) {
        resultMap.set(fsId, localEdit.group);
        return;
      }
    }

    // Si no hay edición local pendiente o la remota es más nueva, usar la remota
    resultMap.set(fsId, fsGroup);
  });

  // Asegurar que todas las ediciones locales no presentes en Firestore sigan vivas
  Object.values(edits).forEach(({ group }) => {
    const strId = String(group.id);
    if (!deletedSet.has(strId)) {
      resultMap.set(strId, group);
    }
  });

  const merged = Array.from(resultMap.values());

  // Guardar inmediatamente en localStorage
  try {
    localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(merged));
  } catch (err) {}

  return merged;
}

/**
 * Encola un grupo para sincronizar con Firestore e intenta la subida
 */
function queueGroupForFirestoreSync(group: Group) {
  // Guardar en la cola de sincronización pendiente
  try {
    const raw = localStorage.getItem(STORAGE_PENDING_SYNC_KEY);
    const queue: Record<string, Group> = raw ? JSON.parse(raw) : {};
    queue[String(group.id)] = group;
    localStorage.setItem(STORAGE_PENDING_SYNC_KEY, JSON.stringify(queue));
  } catch (err) {}

  // Intentar guardado directo
  saveGroupToFirestore(group)
    .then(() => {
      // Si tuvo éxito, retirar de la cola
      try {
        const raw = localStorage.getItem(STORAGE_PENDING_SYNC_KEY);
        if (raw) {
          const queue: Record<string, Group> = JSON.parse(raw);
          delete queue[String(group.id)];
          localStorage.setItem(STORAGE_PENDING_SYNC_KEY, JSON.stringify(queue));
        }
      } catch (err) {}
    })
    .catch((err) => {
      console.warn('Firestore offline o permiso pendiente. Grupo resguardado localmente y en cola:', err);
    });
}

/**
 * Reintenta sincronizar grupos pendientes en Firestore
 */
export async function flushPendingFirestoreSync(): Promise<number> {
  try {
    const raw = localStorage.getItem(STORAGE_PENDING_SYNC_KEY);
    if (!raw) return 0;

    const queue: Record<string, Group> = JSON.parse(raw);
    const entries = Object.entries(queue);
    if (entries.length === 0) return 0;

    let syncedCount = 0;
    for (const [id, grp] of entries) {
      try {
        await saveGroupToFirestore(grp);
        delete queue[id];
        syncedCount++;
      } catch (err) {
        console.warn(`No se pudo sincronizar grupo ${id} aún:`, err);
      }
    }

    localStorage.setItem(STORAGE_PENDING_SYNC_KEY, JSON.stringify(queue));
    return syncedCount;
  } catch (err) {
    return 0;
  }
}
