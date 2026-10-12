import { getAccessToken } from '../lib/firebase';

export interface GoogleContactPerson {
  resourceName: string;
  etag?: string;
  names?: Array<{
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }>;
  phoneNumbers?: Array<{
    value?: string;
    type?: string;
    formattedType?: string;
  }>;
  emailAddresses?: Array<{
    value?: string;
    type?: string;
  }>;
  organizations?: Array<{
    name?: string;
    title?: string;
  }>;
  biographies?: Array<{
    value?: string;
  }>;
}

/**
 * Consulta la libreta de contactos de Google del usuario
 */
export async function listGoogleContacts(): Promise<GoogleContactPerson[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para ver tus contactos');

  const url = 'https://people.googleapis.com/v1/people/me/connections?personFields=names,phoneNumbers,emailAddresses,organizations,biographies&pageSize=100&sortOrder=FIRST_NAME_ASCENDING';

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al consultar contactos de Google: ${res.status}`);
  }

  const data = await res.json();
  return data.connections || [];
}

/**
 * Agrega un servidor, líder o contacto de grupo a Google Contacts
 */
export async function createGoogleContact(params: {
  name: string;
  phone: string;
  groupName?: string;
  zone?: string;
  role?: string;
  email?: string;
}): Promise<GoogleContactPerson> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para crear un contacto');

  const notesParts: string[] = ['Contacto de Fraternidad Guerreros de la Luz A.C.'];
  if (params.groupName) notesParts.push(`Grupo: ${params.groupName}`);
  if (params.zone) notesParts.push(`Zona: ${params.zone}`);
  if (params.role) notesParts.push(`Rol/Servicio: ${params.role}`);

  const body: any = {
    names: [
      {
        givenName: params.name,
        familyName: '(GDLL)',
      },
    ],
    phoneNumbers: [
      {
        value: params.phone,
        type: 'mobile',
      },
    ],
    organizations: [
      {
        name: 'Guerreros de la Luz A.C.',
        title: params.role || 'Servidor / Contacto de Grupo',
      },
    ],
    biographies: [
      {
        value: notesParts.join(' • '),
        contentType: 'TEXT_PLAIN',
      },
    ],
  };

  if (params.email) {
    body.emailAddresses = [{ value: params.email, type: 'work' }];
  }

  const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al crear contacto en Google: ${res.status}`);
  }

  return await res.json();
}

/**
 * Elimina un contacto de Google (operación destructiva protegida)
 */
export async function deleteGoogleContact(resourceName: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google');

  const safeResourceName = encodeURIComponent(resourceName);
  const res = await fetch(`https://people.googleapis.com/v1/${safeResourceName}:deleteContact`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Error al eliminar contacto de Google: ${res.status}`);
  }
}
