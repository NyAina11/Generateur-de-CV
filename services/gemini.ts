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
      // Lecture du message d'erreur détaillé renvoyé par le backend
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      const errorMessage = errorData.details || errorData.error || `Erreur serveur (${response.status})`;
      
      console.error("Backend Error Details:", errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // L'API renvoie parfois { result: "..." } pour du texte, ou directement l'objet JSON
    if (data.result) {
      return data.result;
    }
    return data; 

  } catch (error: any) {
    console.error("AI Service Error:", error);
    // Afficher l'erreur à l'utilisateur via une alerte pour qu'il sache ce qui se passe
    // (en production, on utiliserait un toast notification)
    if (action === 'GENERATE_DESIGN') {
      alert(`Erreur de génération du design: ${error.message}`);
      return null;
    }
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