import { DesignConfig } from "../types";

/**
 * PRODUCTION MODE
 * This service now calls the secure backend endpoint (/api/generate).
 * It does NOT require the API key to be present in the browser bundle.
 */

async function callAI(action: string, payload: any) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur serveur (${response.status})`);
    }

    const data = await response.json();

    // The backend returns { result: string } for text, or the raw JSON object for designs
    if (data.result) {
      return data.result;
    }
    return data; 

  } catch (error) {
    console.error("AI Service Error:", error);
    throw error;
  }
}

/**
 * Generates a professional summary via the backend API.
 */
export const generateSummary = async (jobTitle: string, keywords: string): Promise<string> => {
  return callAI('GENERATE_SUMMARY', { jobTitle, keywords });
};

/**
 * Improves experience description via the backend API.
 */
export const improveExperienceDescription = async (description: string, role: string): Promise<string> => {
  return callAI('IMPROVE_EXPERIENCE', { description, role });
};

/**
 * Generates a unique design configuration via the backend API.
 */
export const generateUniqueDesign = async (userDescription: string): Promise<DesignConfig> => {
  // The backend returns the raw JSON object for this action
  return callAI('GENERATE_DESIGN', { description: userDescription });
};