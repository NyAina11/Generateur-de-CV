import { CVData } from '../types';
import { sanitizeCVData } from './cv';

export const STORAGE_KEY = 'cv-forge-ai:cv:v1';

/** Charge le CV enregistré dans ce navigateur, s'il existe et qu'il est valide. */
export function loadStoredCV(): CVData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeCVData(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** Renvoie `false` si l'enregistrement a échoué (stockage plein ou désactivé). */
export function storeCV(cv: CVData): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cv));
    return true;
  } catch {
    return false;
  }
}

export function clearStoredCV(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Stockage indisponible : rien à effacer.
  }
}
