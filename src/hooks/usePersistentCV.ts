import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createEmptyCV, sanitizeCVData } from '../lib/cv';
import { STORAGE_KEY, loadStoredCV, storeCV } from '../lib/storage';
import { CVData } from '../types';

const SAVE_DELAY_MS = 400;

/**
 * État du CV, enregistré automatiquement dans le navigateur : un rechargement de
 * page ou une fermeture d'onglet ne fait plus perdre le travail en cours.
 *
 * `saved` passe à `false` si l'enregistrement échoue (stockage plein ou désactivé).
 */
export function usePersistentCV(): [CVData, Dispatch<SetStateAction<CVData>>, boolean] {
  const [cv, setCv] = useState<CVData>(() => loadStoredCV() ?? createEmptyCV());
  const [saved, setSaved] = useState(true);
  /** Modification en attente d'écriture ; `null` quand tout est enregistré. */
  const pending = useRef<CVData | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Rien à écrire au chargement : on vient de lire cette valeur dans le stockage.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    pending.current = cv;
    const timer = window.setTimeout(() => {
      pending.current = null;
      setSaved(storeCV(cv));
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [cv]);

  useEffect(() => {
    // À la fermeture de l'onglet, on n'écrit que s'il reste une modification en attente :
    // un onglet resté ouvert sans changement n'écrase pas un CV plus récent.
    const flush = () => {
      if (pending.current) {
        storeCV(pending.current);
        pending.current = null;
      }
    };
    // Le CV a été modifié dans un autre onglet : on reprend sa version.
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue === null) return;
      try {
        const next = sanitizeCVData(JSON.parse(event.newValue));
        if (next) setCv(next);
      } catch {
        // Valeur illisible : on conserve l'état courant.
      }
    };
    window.addEventListener('pagehide', flush);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return [cv, setCv, saved];
}
