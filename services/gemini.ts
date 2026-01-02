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
      
      // Message user-friendly pour les quotas
      if (response.status === 429) {
        throw new Error("Quota d'IA atteint. Veuillez patienter un instant avant de réessayer.");
      }

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
    
    // Affichage plus propre des erreurs à l'utilisateur
    let msg = error.message;
    if (msg.includes('Quota') || msg.includes('429')) {
       msg = "Le service IA est très demandé. Merci de réessayer dans 15 secondes.";
    }

    if (action === 'GENERATE_DESIGN') {
      alert(`Oups ! ${msg}`);
      return null;
    } else {
      // Pour les petites actions (résumé, amélioration), on peut utiliser alert aussi pour être sûr que l'utilisateur voit le pb
      alert(`Erreur IA : ${msg}`);
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