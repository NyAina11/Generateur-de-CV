import { DesignConfig } from "../types";

/**
 * SERVICE CLIENT
 * Ce fichier est exécuté par le navigateur de l'utilisateur.
 * Il appelle l'API backend (/api/generate) pour sécuriser la clé API.
 */

async function callAI(action: string, payload: any) {
  try {
    // Appel vers notre propre backend (api/generate.js)
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      // Tentative de lecture du message d'erreur JSON, sinon texte brut
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorData.error || `Erreur serveur (${response.status})`);
    }

    const data = await response.json();

    // L'API renvoie parfois { result: "..." } pour du texte, ou directement l'objet JSON
    if (data.result) {
      return data.result;
    }
    return data; 

  } catch (error) {
    console.error("AI Service Error:", error);
    // En cas d'erreur (ex: pas encore déployé, API 404 en local), on renvoie une valeur par défaut
    // pour ne pas faire crasher l'interface
    if (action === 'GENERATE_DESIGN') return null;
    return "";
  }
}

/**
 * Génère un résumé professionnel via l'API backend.
 */
export const generateSummary = async (jobTitle: string, keywords: string): Promise<string> => {
  return callAI('GENERATE_SUMMARY', { jobTitle, keywords });
};

/**
 * Améliore une description d'expérience via l'API backend.
 */
export const improveExperienceDescription = async (description: string, role: string): Promise<string> => {
  return callAI('IMPROVE_EXPERIENCE', { description, role });
};

/**
 * Génère un design unique via l'API backend.
 */
export const generateUniqueDesign = async (userDescription: string): Promise<DesignConfig> => {
  return callAI('GENERATE_DESIGN', { description: userDescription });
};