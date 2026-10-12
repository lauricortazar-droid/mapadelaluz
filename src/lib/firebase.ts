import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Group, LeaderProposal } from '../types';

// Inicializar app de Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Exportar db y auth según directrices de Firebase
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId) 
  : getFirestore(app);

export const auth = getAuth(app);

// Validar conexión inicial a Firestore
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase en modo offline o sin conexión en este momento.');
    }
  }
}
testConnection();

// Manejador estandarizado de errores Firestore
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// Google Workspace Scopes & Authentication
// ==========================================
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/forms.responses.readonly',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
];

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        if (onAuthSuccess) onAuthSuccess(user, null);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ==========================================
// Firestore Operaciones para Grupos y Propuestas
// ==========================================

export function subscribeToGroups(onGroups: (groups: Group[]) => void, onError?: (err: Error) => void) {
  const colPath = 'groups';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const groups: Group[] = [];
        snapshot.forEach((docSnap) => {
          groups.push(docSnap.data() as Group);
        });
        onGroups(groups);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, colPath);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

export async function saveGroupToFirestore(group: Group) {
  const strId = String(group.id);
  const docPath = `groups/${strId}`;
  try {
    const payload = {
      ...group,
      id: strId,
      nombre: group.nombre,
      name: group.nombre,
      direccion: group.direccion,
      address: group.direccion,
      zone: group.zone,
      updatedAt: new Date().toISOString(),
      ultima_actualizacion: group.ultima_actualizacion || new Date().toISOString(),
    };
    await setDoc(doc(db, 'groups', strId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

export async function deleteGroupFromFirestore(groupId: string) {
  const strId = String(groupId);
  const docPath = `groups/${strId}`;
  try {
    await deleteDoc(doc(db, 'groups', strId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeToProposals(onProposals: (proposals: LeaderProposal[]) => void, onError?: (err: Error) => void) {
  const colPath = 'proposals';
  return onSnapshot(
    collection(db, colPath),
    (snapshot) => {
      const items: LeaderProposal[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as LeaderProposal);
      });
      onProposals(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, colPath);
      } catch (e: any) {
        if (onError) onError(e);
      }
    }
  );
}

export async function submitProposalToFirestore(proposal: LeaderProposal) {
  const strId = String(proposal.id);
  const docPath = `proposals/${strId}`;
  try {
    await setDoc(doc(db, 'proposals', strId), {
      ...proposal,
      createdAt: proposal.createdAt || new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

export async function updateProposalStatusInFirestore(proposalId: string, status: 'pending' | 'approved' | 'rejected') {
  const docPath = `proposals/${proposalId}`;
  try {
    await updateDoc(doc(db, 'proposals', proposalId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

export async function submitContactMessageToFirestore(messageData: {
  id: string;
  name: string;
  phone: string;
  message: string;
  groupId?: string;
}) {
  const docPath = `contactMessages/${messageData.id}`;
  try {
    await setDoc(doc(db, 'contactMessages', messageData.id), {
      ...messageData,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}
