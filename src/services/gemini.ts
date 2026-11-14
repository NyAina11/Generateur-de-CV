import { sanitizeDesignConfig } from '../lib/design';
import { DesignConfig } from '../types';

/**
 * SERVICE CLIENT
 * Exécuté dans le navigateur. Il appelle notre backend (/api/generate), seul à
 * connaître la clé API Gemini.
 *
 * Chaque fonction renvoie le résultat ou lève une `AIError` dont le message est
 * affichable tel quel : c'est à l'interface de décider comment le présenter.
 */

export class AIError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'AIError';
  }
}

type AIAction = 'GENERATE_SUMMARY' | 'IMPROVE_EXPERIENCE' | 'GENERATE_DESIGN';

const TIMEOUT_MS = 60_000;

function fallbackMessage(status: number): string {
  if (status === 429) return 'Le service IA est très demandé. Réessayez dans quelques secondes.';
  if (status === 404) return "Le service IA n'est pas disponible sur ce déploiement.";
  if (status >= 500) return 'Le service IA est momentanément indisponible. Réessayez dans un instant.';
  return `La demande a échoué (erreur ${status}).`;
}

async function callAI<T>(action: AIAction, payload: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal,
    });
  } catch {
    throw new AIError(
      controller.signal.aborted
        ? "L'IA met trop de temps à répondre. Réessayez dans un instant."
        : 'Impossible de joindre le service IA. Vérifiez votre connexion.',
    );
  } finally {
    clearTimeout(timer);
  }

  const data: { result?: unknown; error?: string; message?: string } | null = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof data?.message === 'string' && data.message ? data.message : fallbackMessage(response.status);
    throw new AIError(message, response.status, data?.error);
  }

  const result = data?.result;
  if (result === undefined || result === null || result === '') {
    // Réponse 200 sans résultat : typiquement une page HTML servie à la place de l'API.
    throw new AIError(
      data ? "L'IA n'a rien renvoyé. Réessayez." : "Le service IA n'est pas disponible sur ce déploiement.",
      response.status,
    );
  }
  return result as T;
}

/** Rédige un résumé professionnel à partir du poste visé et du contenu du CV. */
export async function generateSummary(jobTitle: string, context: string): Promise<string> {
  return callAI<string>('GENERATE_SUMMARY', { jobTitle, context });
}

/** Reformule la description d'une expérience. */
export async function improveExperienceDescription(description: string, role: string): Promise<string> {
  return callAI<string>('IMPROVE_EXPERIENCE', { description, role });
}

/** Génère une configuration de design, validée avant d'être renvoyée. */
export async function generateUniqueDesign(userDescription: string): Promise<DesignConfig> {
  const design = sanitizeDesignConfig(await callAI<unknown>('GENERATE_DESIGN', { description: userDescription }));
  if (!design) {
    throw new AIError("L'IA a renvoyé un design inutilisable. Réessayez.");
  }
  return design;
}
