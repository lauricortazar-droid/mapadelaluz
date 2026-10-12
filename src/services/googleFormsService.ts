import { getAccessToken } from '../lib/firebase';

export interface GoogleFormSummary {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri?: string;
  revisionId?: string;
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers?: Record<string, {
    questionId: string;
    textAnswers?: {
      answers: Array<{ value: string }>;
    };
  }>;
}

const STORAGE_SAVED_FORMS_KEY = 'gdll_google_forms_v1';

/**
 * Obtiene la lista de IDs de formularios creados o enlazados guardados localmente
 */
export function getSavedFormIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_FORMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveFormId(formId: string) {
  try {
    const ids = getSavedFormIds();
    if (!ids.includes(formId)) {
      ids.unshift(formId);
      localStorage.setItem(STORAGE_SAVED_FORMS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

/**
 * Crea un formulario oficial de Google Forms para la Fraternidad
 */
export async function createGoogleForm(title: string, description?: string): Promise<GoogleFormSummary> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google para crear formularios.');

  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title || 'Registro y Actualización de Grupos - Guerreros de la Luz',
        documentTitle: title || 'Guerreros de la Luz - Formulario de Grupos',
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al crear formulario: ${createRes.status}`);
  }

  const formData: GoogleFormSummary = await createRes.json();
  const formId = formData.formId;

  // Añadir preguntas al formulario mediante batchUpdate
  try {
    const batchBody = {
      requests: [
        {
          updateFormInfo: {
            info: {
              description: description || 'Formulario oficial de la Fraternidad Guerreros de la Luz A.C. para proponer modificaciones, aperturas o actualizaciones de grupos de 12 Pasos.',
            },
            updateMask: 'description',
          },
        },
        {
          createItem: {
            item: {
              title: 'Nombre del Grupo de Autoayuda',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Zona Fraternal',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: 'Jaguar (Yucatán)' },
                      { value: 'Águila' },
                      { value: 'Tiburón' },
                      { value: 'Delfín' },
                      { value: 'Colibrí' },
                      { value: 'Tocalli' },
                      { value: 'Otra Zona' },
                    ],
                  },
                },
              },
            },
            location: { index: 1 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Dirección Completa, Colonia y Referencias',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true },
                },
              },
            },
            location: { index: 2 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Días y Horarios de Reunión (Ej. Lunes a Viernes 8:00 PM)',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 3 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Nombre y Teléfono del Servidor / Coordinador',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: false },
                },
              },
            },
            location: { index: 4 },
          },
        },
      ],
    };

    await fetch(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchBody),
    });
  } catch (batchErr) {
    console.warn('No se pudieron insertar todas las preguntas secundarias:', batchErr);
  }

  saveFormId(formId);
  return formData;
}

/**
 * Consulta la información y enlaces de un formulario
 */
export async function getGoogleForm(formId: string): Promise<GoogleFormSummary> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al obtener formulario: ${res.status}`);
  }

  return await res.json();
}

/**
 * Consulta las respuestas recibidas en el formulario
 */
export async function getGoogleFormResponses(formId: string): Promise<GoogleFormResponseItem[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Debes iniciar sesión con Google');

  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Error al obtener respuestas del formulario: ${res.status}`);
  }

  const data = await res.json();
  return data.responses || [];
}
