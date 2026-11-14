import {
  Columns2,
  Download,
  Ellipsis,
  Eraser,
  Eye,
  FileText,
  FileUp,
  FlaskConical,
  PanelLeft,
  Pencil,
  Printer,
  Sparkles,
  WandSparkles,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import DesignDialog from './components/DesignDialog';
import Editor from './components/Editor';
import PreviewPane from './components/PreviewPane';
import { useToast } from './components/Toast';
import { createSampleCV } from './data/sample';
import { usePersistentCV } from './hooks/usePersistentCV';
import { normalizeHex } from './lib/color';
import { APP_NAME, createEmptyCV, documentTitle, exportFileName, isCVEmpty, parseImportedCV, serializeCV } from './lib/cv';
import { clearStoredCV } from './lib/storage';
import { CVData, DesignConfig, TemplateId } from './types';

const PRESET_TEMPLATES: Array<{ id: Exclude<TemplateId, 'unique'>; label: string; icon: LucideIcon }> = [
  { id: 'modern', label: 'Moderne', icon: Columns2 },
  { id: 'classic', label: 'Classique', icon: FileText },
  { id: 'elegant', label: 'Élégant', icon: PanelLeft },
];

const THEME_COLORS = [
  { value: '#2563eb', label: 'Bleu' },
  { value: '#059669', label: 'Vert' },
  { value: '#dc2626', label: 'Rouge' },
  { value: '#7c3aed', label: 'Violet' },
  { value: '#0f766e', label: 'Sarcelle' },
  { value: '#1e293b', label: 'Ardoise' },
];

type MobileView = 'edit' | 'preview';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

function App() {
  const [cvData, setCvData, saved] = usePersistentCV();
  const notify = useToast();
  const [showDesignDialog, setShowDesignDialog] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('edit');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const isUnique = cvData.templateId === 'unique';
  const hasCustomColor = !THEME_COLORS.some((color) => color.value === cvData.themeColor);

  // Le titre de l'onglet sert de nom de fichier par défaut lors de l'export PDF.
  useEffect(() => {
    document.title = documentTitle(cvData);
  }, [cvData]);

  // Ferme le menu « Mes données » au clic extérieur ou avec Échap.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handlePrint = () => {
    if (mobileView === 'preview') {
      window.print();
      return;
    }
    // Sur petit écran, l'aperçu est masqué pendant l'édition : on l'affiche d'abord pour
    // que la feuille soit mesurée (pagination) avant d'ouvrir la fenêtre d'impression.
    setMobileView('preview');
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  const changeTheme = (color: string) => setCvData((cv) => ({ ...cv, themeColor: normalizeHex(color, cv.themeColor) }));

  const changeTemplate = (id: TemplateId) => setCvData((cv) => ({ ...cv, templateId: id }));

  /** Remplace tout le CV et propose d'annuler si l'on écrase un contenu existant. */
  const replaceCV = (next: CVData, message: string) => {
    const previous = cvData;
    setCvData(next);
    notify(message, {
      kind: 'success',
      action: isCVEmpty(previous) ? undefined : { label: 'Annuler', onClick: () => setCvData(previous) },
    });
  };

  const handleSelectAIDesign = () => {
    // Un design déjà généré est simplement réactivé ; sinon on ouvre la boîte de dialogue.
    if (cvData.designConfig && !isUnique) changeTemplate('unique');
    else setShowDesignDialog(true);
  };

  const handleApplyDesign = (design: DesignConfig) => {
    setCvData((cv) => ({ ...cv, templateId: 'unique', designConfig: design }));
    setShowDesignDialog(false);
    setMobileView('preview');
    notify('Design appliqué à votre CV.', { kind: 'success' });
  };

  const handleLoadSample = () => {
    setMenuOpen(false);
    replaceCV(createSampleCV(), 'Exemple chargé. Remplacez-le par vos informations.');
  };

  const handleReset = () => {
    setMenuOpen(false);
    if (isCVEmpty(cvData)) return;
    clearStoredCV();
    replaceCV(createEmptyCV(), 'CV effacé.');
  };

  const handleExportData = () => {
    setMenuOpen(false);
    const url = URL.createObjectURL(new Blob([serializeCV(cvData)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName(cvData);
    link.click();
    URL.revokeObjectURL(url);
    notify('Fichier de sauvegarde téléchargé.', { kind: 'success' });
  };

  const handleImportData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) {
      notify('Ce fichier est trop volumineux pour être une sauvegarde de CV.', { kind: 'error' });
      return;
    }
    const imported = parseImportedCV(await file.text());
    if (!imported) {
      notify('Ce fichier n’est pas une sauvegarde CV Forge AI valide.', { kind: 'error' });
      return;
    }
    replaceCV(imported, 'CV importé.');
  };

  const menuItemClass =
    'flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100';

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-100 supports-[height:100dvh]:h-dvh print:block print:!h-auto print:overflow-visible print:bg-transparent">
      <DesignDialog
        open={showDesignDialog}
        jobTitle={cvData.personal.jobTitle}
        onClose={() => setShowDesignDialog(false)}
        onApply={handleApplyDesign}
      />

      {/* Bouton d'export flottant (mobile et tablette) */}
      <button
        type="button"
        onClick={handlePrint}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center rounded-full bg-slate-900 p-4 text-white shadow-2xl transition-transform hover:bg-slate-800 active:scale-90 lg:hidden print:hidden"
        aria-label="Exporter en PDF"
      >
        <Printer className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Barre supérieure */}
      <header className="relative z-30 flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-slate-200 bg-white px-4 py-2.5 shadow-sm sm:gap-x-4 sm:px-6 print:hidden">
        <div className="flex shrink-0 items-center gap-2.5">
          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 p-2 text-white">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="sr-only text-lg font-bold tracking-tight text-slate-900 min-[440px]:not-sr-only">{APP_NAME}</h1>
        </div>

        {/* Bascule Éditer / Aperçu : les deux panneaux ne tiennent pas côte à côte sur petit écran */}
        <div className="ml-auto flex rounded-lg bg-slate-100 p-1 lg:hidden" role="group" aria-label="Affichage">
          {(
            [
              { view: 'edit', label: 'Éditer', icon: Pencil },
              { view: 'preview', label: 'Aperçu', icon: Eye },
            ] as const
          ).map(({ view, label, icon: Icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              aria-pressed={mobileView === view}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                mobileView === view ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Choix du modèle et de la couleur */}
        <div
          className={`custom-scrollbar order-last w-full items-center gap-4 overflow-x-auto pb-1 lg:order-none lg:ml-auto lg:flex lg:w-auto lg:overflow-visible lg:pb-0 ${
            mobileView === 'preview' ? 'flex' : 'hidden'
          }`}
        >
          <div className="flex shrink-0 gap-1 rounded-lg bg-slate-100 p-1" role="group" aria-label="Modèle de CV">
            {PRESET_TEMPLATES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => changeTemplate(id)}
                aria-pressed={cvData.templateId === id}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                  cvData.templateId === id ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={handleSelectAIDesign}
              aria-pressed={isUnique}
              title={cvData.designConfig && !isUnique ? 'Revenir à votre design IA' : 'Créer un design unique avec l’IA'}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors ${
                isUnique ? 'bg-white text-indigo-700 shadow-sm' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <WandSparkles className="h-4 w-4" aria-hidden="true" />
              Design IA
            </button>
          </div>

          {isUnique ? (
            <button
              type="button"
              onClick={() => setShowDesignDialog(true)}
              className="shrink-0 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Générer un autre design
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-2" role="group" aria-label="Couleur du thème">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => changeTheme(color.value)}
                  aria-label={`Couleur ${color.label.toLowerCase()}`}
                  aria-pressed={cvData.themeColor === color.value}
                  title={color.label}
                  className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
                    cvData.themeColor === color.value ? 'ring-2 ring-slate-900 ring-offset-2' : 'ring-1 ring-black/10'
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
              <label
                title="Couleur personnalisée"
                className={`relative h-6 w-6 cursor-pointer overflow-hidden rounded-full transition-transform hover:scale-110 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600 ${
                  hasCustomColor ? 'ring-2 ring-slate-900 ring-offset-2' : 'ring-1 ring-black/10'
                }`}
                style={{
                  background: hasCustomColor
                    ? cvData.themeColor
                    : 'conic-gradient(#ef4444, #f59e0b, #84cc16, #06b6d4, #6366f1, #d946ef, #ef4444)',
                }}
              >
                <span className="sr-only">Couleur personnalisée</span>
                <input
                  type="color"
                  value={cvData.themeColor}
                  onChange={(event) => changeTheme(event.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          )}
        </div>

        {/* Menu « Mes données » */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Mes données : exemple, import, export, effacement"
            title="Mes données"
            className="icon-button h-9 w-9 border border-slate-200"
          >
            <Ellipsis className="h-5 w-5" aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-64 animate-reveal overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
            >
              <button type="button" role="menuitem" onClick={handleLoadSample} className={menuItemClass}>
                <FlaskConical className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Charger un exemple
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  importInputRef.current?.click();
                }}
                className={menuItemClass}
              >
                <FileUp className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Importer une sauvegarde
              </button>
              <button type="button" role="menuitem" onClick={handleExportData} className={menuItemClass}>
                <Download className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Télécharger une sauvegarde
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button type="button" role="menuitem" onClick={handleReset} className={`${menuItemClass} !text-rose-700 hover:!bg-rose-50`}>
                <Eraser className="h-4 w-4" aria-hidden="true" />
                Tout effacer
              </button>
            </div>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportData}
            className="hidden"
            tabIndex={-1}
          />
        </div>

        <button
          type="button"
          onClick={handlePrint}
          title="Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF »"
          className="hidden shrink-0 items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-slate-700 lg:flex"
        >
          <Printer className="h-4 w-4" aria-hidden="true" />
          Exporter en PDF
        </button>
      </header>

      {/* Zone de travail */}
      <main className="flex min-h-0 flex-1 print:block">
        <section
          aria-label="Éditeur"
          className={`w-full shrink-0 border-r border-slate-200 bg-white lg:block lg:w-[420px] xl:w-[480px] 2xl:w-[540px] print:hidden ${
            mobileView === 'edit' ? 'block' : 'hidden'
          }`}
        >
          <Editor data={cvData} onChange={setCvData} saved={saved} onLoadSample={handleLoadSample} />
        </section>

        <PreviewPane data={cvData} className={`min-w-0 flex-1 lg:flex print:block ${mobileView === 'preview' ? 'flex' : 'hidden'}`} />
      </main>
    </div>
  );
}

export default App;
