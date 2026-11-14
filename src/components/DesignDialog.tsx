import { CircleAlert, LoaderCircle, Palette, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { generateUniqueDesign } from '../services/gemini';
import { DesignConfig } from '../types';

const SUGGESTIONS = [
  'Minimaliste, noir et blanc, police épurée',
  'Professionnel, bleu marine, avec barre latérale',
  'Créatif, couleurs pastel, mise en page en grille',
  'Élégant, vert forêt, police à empattements',
  'Tech, mode sombre, police monospace',
];

const MAX_PROMPT_LENGTH = 600;

interface DesignDialogProps {
  open: boolean;
  /** Titre du poste, utilisé pour préremplir la description lors de la première ouverture. */
  jobTitle: string;
  onClose: () => void;
  onApply: (design: DesignConfig) => void;
}

/**
 * Boîte de dialogue « Design IA ». Elle repose sur l'élément natif <dialog> :
 * le focus y est piégé, Échap la ferme et le reste de la page devient inerte.
 */
export default function DesignDialog({ open, jobTitle, onClose, onApply }: DesignDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setError('');
      setPrompt((current) => current || (jobTitle.trim() ? `Un design professionnel pour un poste de ${jobTitle.trim()}` : ''));
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, jobTitle]);

  const handleGenerate = async () => {
    const description = prompt.trim();
    if (!description || loading) return;
    setLoading(true);
    setError('');
    try {
      onApply(await generateUniqueDesign(description));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'La génération a échoué. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="design-dialog-title"
      onClose={onClose}
      onCancel={(event) => {
        if (loading) event.preventDefault();
      }}
      onClick={(event) => {
        // Un clic sur l'élément <dialog> lui-même correspond à un clic sur le fond assombri.
        if (event.target === dialogRef.current && !loading) onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-transparent p-0 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm open:animate-fade print:hidden"
    >
      <form
        className="rounded-2xl border border-slate-200 bg-white p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void handleGenerate();
        }}
      >
        <div className="mb-5 flex items-start gap-3">
          <div className="rounded-xl bg-indigo-100 p-2.5">
            <Palette className="h-6 w-6 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="design-dialog-title" className="text-lg font-bold text-slate-900">
              Créer un design avec l'IA
            </h2>
            <p className="text-sm text-slate-500">Décrivez le style voulu : couleurs, ambiance, mise en page.</p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Fermer" className="icon-button -mr-2 -mt-1">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label htmlFor="design-prompt" className="field-label">
          Votre description
        </label>
        <textarea
          id="design-prompt"
          autoFocus
          disabled={loading}
          maxLength={MAX_PROMPT_LENGTH}
          className="input-field h-28 resize-none"
          placeholder="Ex. : très épuré, beaucoup d'espace blanc, titres en gras et une touche de jaune vif."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />

        <p className="mb-2 mt-4 text-xs font-medium text-slate-600">Ou partez d'une idée</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setPrompt(suggestion)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Création en cours…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Générer le design
              </>
            )}
          </button>
        </div>
      </form>
    </dialog>
  );
}
