import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Camera,
  ChevronDown,
  GraduationCap,
  Languages as LanguagesIcon,
  LoaderCircle,
  Plus,
  Trash2,
  User,
  WandSparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import {
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type Dispatch,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SetStateAction,
} from 'react';
import { buildSummaryContext, createId, isCVEmpty, moveItem } from '../lib/cv';
import { fileToCompressedDataUrl } from '../lib/image';
import { generateSummary, improveExperienceDescription } from '../services/gemini';
import { CVData, Education, Experience, Language, PersonalInfo, Skill } from '../types';
import { useToast } from './Toast';

interface EditorProps {
  data: CVData;
  onChange: Dispatch<SetStateAction<CVData>>;
  /** Faux si la sauvegarde automatique dans le navigateur a échoué. */
  saved: boolean;
  onLoadSample: () => void;
}

type SectionId = 'personal' | 'experience' | 'education' | 'skills' | 'extras';
type ListKey = 'experience' | 'education' | 'skills' | 'languages';

const LANGUAGE_LEVELS = ['Notions', 'Intermédiaire', 'Courant', 'Bilingue', 'Langue maternelle'];

// --- Petits composants de formulaire ----------------------------------------

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  wrapperClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

function TextField({ label, value, onValueChange, wrapperClassName, ...input }: TextFieldProps) {
  const id = useId();
  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} type="text" className="input-field" value={value} onChange={(event) => onValueChange(event.target.value)} {...input} />
    </div>
  );
}

interface SectionProps {
  id: SectionId;
  title: string;
  icon: LucideIcon;
  count?: number;
  open: boolean;
  onToggle: (id: SectionId) => void;
  children: ReactNode;
}

function Section({ id, title, icon: Icon, count, open, onToggle, children }: SectionProps) {
  const panelId = `editor-panel-${id}`;
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <h3>
        <button
          type="button"
          onClick={() => onToggle(id)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 bg-slate-50 px-4 py-3.5 text-left transition-colors hover:bg-slate-100"
        >
          <span className="flex items-center gap-2.5 font-semibold text-slate-800">
            <Icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            {title}
            {count !== undefined && count > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{count}</span>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      {open && (
        <div id={panelId} className="animate-reveal space-y-4 p-4">
          {children}
        </div>
      )}
    </section>
  );
}

interface ItemActionsProps {
  label: string;
  index: number;
  total: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}

/** Monter, descendre ou supprimer un élément d'une liste. */
function ItemActions({ label, index, total, onMove, onRemove }: ItemActionsProps) {
  return (
    <div className="flex shrink-0 items-center">
      <button type="button" className="icon-button" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Monter ${label}`}>
        <ArrowUp className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-button"
        onClick={() => onMove(1)}
        disabled={index === total - 1}
        aria-label={`Descendre ${label}`}
      >
        <ArrowDown className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        className="icon-button hover:!bg-rose-50 hover:!text-rose-600"
        onClick={onRemove}
        aria-label={`Supprimer ${label}`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function AIButton({ loading, children, ...button }: { loading: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="ai-button" {...button} disabled={loading || button.disabled}>
      {loading ? (
        <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <WandSparkles className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

// --- Éditeur ----------------------------------------------------------------

export default function Editor({ data, onChange, saved, onLoadSample }: EditorProps) {
  const notify = useToast();
  const [openSection, setOpenSection] = useState<SectionId | null>('personal');
  const [aiBusy, setAiBusy] = useState<ReadonlySet<string>>(new Set());
  /** Identifiant de l'élément qui vient d'être ajouté : son premier champ reçoit le focus. */
  const [focusId, setFocusId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jobTitleRef = useRef<HTMLInputElement>(null);
  const summaryId = useId();
  const interestsHintId = useId();
  const levelListId = useId();

  const toggleSection = (id: SectionId) => {
    setFocusId(null);
    setOpenSection((current) => (current === id ? null : id));
  };

  const setBusy = (key: string, busy: boolean) =>
    setAiBusy((current) => {
      const next = new Set(current);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });

  // Toutes les modifications passent par une mise à jour fonctionnelle : une réponse
  // de l'IA arrivant après d'autres saisies ne les écrase donc pas.
  const updatePersonal = (field: keyof PersonalInfo, value: string) =>
    onChange((cv) => ({ ...cv, personal: { ...cv.personal, [field]: value } }));

  function updateItem<K extends ListKey>(key: K, id: string, patch: Partial<CVData[K][number]>) {
    onChange((cv) => ({
      ...cv,
      [key]: (cv[key] as Array<{ id: string }>).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function moveListItem(key: ListKey, index: number, direction: -1 | 1) {
    onChange((cv) => ({ ...cv, [key]: moveItem(cv[key] as unknown[], index, direction) }));
  }

  function removeItem(key: ListKey, id: string, label: string) {
    const index = data[key].findIndex((item) => item.id === id);
    if (index === -1) return;
    const removed = data[key][index];
    onChange((cv) => ({ ...cv, [key]: (cv[key] as Array<{ id: string }>).filter((item) => item.id !== id) }));
    // « Annuler » réinsère l'élément à sa place sans toucher aux autres modifications.
    const restore = () =>
      onChange((cv) => {
        const list = [...(cv[key] as Array<{ id: string }>)];
        if (list.some((item) => item.id === removed.id)) return cv;
        list.splice(Math.min(index, list.length), 0, removed);
        return { ...cv, [key]: list };
      });
    notify(`${label} supprimée.`, { action: { label: 'Annuler', onClick: restore } });
  }

  const addExperience = () => {
    const item: Experience = { id: createId(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' };
    setFocusId(item.id);
    onChange((cv) => ({ ...cv, experience: [item, ...cv.experience] }));
  };

  const addEducation = () => {
    const item: Education = { id: createId(), school: '', degree: '', year: '' };
    setFocusId(item.id);
    onChange((cv) => ({ ...cv, education: [item, ...cv.education] }));
  };

  const addSkill = () => {
    const item: Skill = { id: createId(), name: '', level: 4 };
    setFocusId(item.id);
    onChange((cv) => ({ ...cv, skills: [...cv.skills, item] }));
  };

  const addLanguage = () => {
    const item: Language = { id: createId(), name: '', level: '' };
    setFocusId(item.id);
    onChange((cv) => ({ ...cv, languages: [...cv.languages, item] }));
  };

  // --- Photo ---
  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permet de re-sélectionner le même fichier
    if (!file) return;
    try {
      updatePersonal('photo', await fileToCompressedDataUrl(file));
    } catch (error) {
      notify(error instanceof Error ? error.message : "Impossible d'utiliser cette image.", { kind: 'error' });
    }
  };

  // --- IA ---
  const handleGenerateSummary = async () => {
    const jobTitle = data.personal.jobTitle.trim();
    if (!jobTitle) {
      notify('Indiquez d’abord le titre du poste : l’IA s’en sert pour rédiger le résumé.');
      jobTitleRef.current?.focus();
      return;
    }
    const previous = data.personal.summary;
    setBusy('summary', true);
    try {
      const summary = await generateSummary(jobTitle, buildSummaryContext(data));
      updatePersonal('summary', summary);
      notify('Résumé rédigé par l’IA. Relisez-le avant de l’utiliser.', {
        kind: 'success',
        action: { label: 'Annuler', onClick: () => updatePersonal('summary', previous) },
      });
    } catch (error) {
      // En cas d'échec, le texte existant n'est jamais modifié.
      notify(error instanceof Error ? error.message : 'La génération a échoué. Réessayez.', { kind: 'error' });
    } finally {
      setBusy('summary', false);
    }
  };

  const handleImproveExperience = async (exp: Experience) => {
    const previous = exp.description;
    if (!previous.trim()) return;
    const key = `exp-${exp.id}`;
    setBusy(key, true);
    try {
      const improved = await improveExperienceDescription(previous, exp.role);
      updateItem('experience', exp.id, { description: improved });
      notify('Description reformulée par l’IA.', {
        kind: 'success',
        action: { label: 'Annuler', onClick: () => updateItem('experience', exp.id, { description: previous }) },
      });
    } catch (error) {
      notify(error instanceof Error ? error.message : 'La reformulation a échoué. Réessayez.', { kind: 'error' });
    } finally {
      setBusy(key, false);
    }
  };

  const { personal } = data;

  return (
    <div className="custom-scrollbar h-full overflow-y-auto px-4 pb-24 pt-5 sm:px-6 lg:pb-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="shrink-0 text-xl font-bold text-slate-900">Votre CV</h2>
        <p className={`text-right text-xs ${saved ? 'text-slate-500' : 'font-medium text-amber-700'}`} role="status">
          {saved ? 'Enregistré dans ce navigateur' : 'Sauvegarde impossible : téléchargez une sauvegarde'}
        </p>
      </div>

      {isCVEmpty(data) && (
        <div className="mb-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <p className="text-sm text-indigo-950">
            Remplissez les rubriques ci-dessous : l'aperçu se met à jour à chaque saisie. Pour voir tout de suite un CV complet, partez d'un
            exemple.
          </p>
          <button
            type="button"
            onClick={onLoadSample}
            className="mt-3 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Charger un exemple
          </button>
        </div>
      )}

      <div className="space-y-3">
        {/* Informations personnelles */}
        <Section id="personal" title="Informations personnelles" icon={User} open={openSection === 'personal'} onToggle={toggleSection}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
              {personal.photo ? (
                <img src={personal.photo} alt="Votre photo" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-slate-300" aria-hidden="true" />
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" tabIndex={-1} />
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-md bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
              >
                <Camera className="h-3.5 w-3.5" aria-hidden="true" />
                {personal.photo ? 'Changer la photo' : 'Ajouter une photo'}
              </button>
              {personal.photo && (
                <button
                  type="button"
                  onClick={() => updatePersonal('photo', '')}
                  aria-label="Supprimer la photo"
                  className="icon-button hover:!bg-rose-50 hover:!text-rose-600"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Nom complet"
              value={personal.fullName}
              onValueChange={(value) => updatePersonal('fullName', value)}
              autoComplete="name"
              placeholder="Camille Durand"
            />
            <TextField
              ref={jobTitleRef}
              label="Titre du poste"
              value={personal.jobTitle}
              onValueChange={(value) => updatePersonal('jobTitle', value)}
              autoComplete="organization-title"
              placeholder="Développeuse full stack"
            />
            <TextField
              label="E-mail"
              type="email"
              value={personal.email}
              onValueChange={(value) => updatePersonal('email', value)}
              autoComplete="email"
              placeholder="prenom.nom@exemple.com"
            />
            <TextField
              label="Téléphone"
              type="tel"
              value={personal.phone}
              onValueChange={(value) => updatePersonal('phone', value)}
              autoComplete="tel"
              placeholder="06 12 34 56 78"
            />
            <TextField
              label="Ville, pays"
              value={personal.location}
              onValueChange={(value) => updatePersonal('location', value)}
              autoComplete="address-level2"
              placeholder="Lyon, France"
            />
            <TextField
              label="Site web ou LinkedIn"
              value={personal.website}
              onValueChange={(value) => updatePersonal('website', value)}
              autoComplete="url"
              inputMode="url"
              placeholder="linkedin.com/in/votre-profil"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label htmlFor={summaryId} className="field-label !mb-0">
                Résumé professionnel
              </label>
              <AIButton loading={aiBusy.has('summary')} onClick={handleGenerateSummary}>
                {aiBusy.has('summary') ? 'Rédaction…' : personal.summary.trim() ? 'Améliorer avec l’IA' : 'Rédiger avec l’IA'}
              </AIButton>
            </div>
            <textarea
              id={summaryId}
              rows={4}
              placeholder="Deux ou trois phrases qui résument votre profil et ce que vous recherchez."
              className="input-field resize-y"
              value={personal.summary}
              onChange={(event) => updatePersonal('summary', event.target.value)}
            />
          </div>
        </Section>

        {/* Expérience */}
        <Section
          id="experience"
          title="Expérience"
          icon={Briefcase}
          count={data.experience.length}
          open={openSection === 'experience'}
          onToggle={toggleSection}
        >
          {data.experience.length === 0 && <p className="text-sm text-slate-500">Ajoutez vos postes, du plus récent au plus ancien.</p>}
          {data.experience.map((exp, index) => {
            const busy = aiBusy.has(`exp-${exp.id}`);
            const label = exp.role.trim() ? `l’expérience « ${exp.role.trim()} »` : `l’expérience ${index + 1}`;
            return (
              <div
                key={exp.id}
                role="group"
                aria-label={exp.role.trim() || `Expérience ${index + 1}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-700">{exp.role.trim() || `Expérience ${index + 1}`}</p>
                  <ItemActions
                    label={label}
                    index={index}
                    total={data.experience.length}
                    onMove={(direction) => moveListItem('experience', index, direction)}
                    onRemove={() => removeItem('experience', exp.id, 'Expérience')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <TextField
                    label="Poste"
                    value={exp.role}
                    onValueChange={(value) => updateItem('experience', exp.id, { role: value })}
                    autoFocus={focusId === exp.id}
                    placeholder="Cheffe de projet"
                  />
                  <TextField
                    label="Entreprise"
                    value={exp.company}
                    onValueChange={(value) => updateItem('experience', exp.id, { company: value })}
                    autoComplete="organization"
                    placeholder="Nom de l’entreprise"
                  />
                  <TextField
                    label="Début"
                    value={exp.startDate}
                    onValueChange={(value) => updateItem('experience', exp.id, { startDate: value })}
                    placeholder="2021 ou mars 2021"
                  />
                  <TextField
                    label="Fin"
                    value={exp.current ? 'Présent' : exp.endDate}
                    onValueChange={(value) => updateItem('experience', exp.id, { endDate: value })}
                    disabled={exp.current}
                    placeholder="2023"
                  />
                </div>
                <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
                    checked={exp.current}
                    onChange={(event) => updateItem('experience', exp.id, { current: event.target.checked })}
                  />
                  J’occupe actuellement ce poste
                </label>

                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label htmlFor={`desc-${exp.id}`} className="field-label !mb-0">
                      Missions et réalisations
                    </label>
                    <AIButton
                      loading={busy}
                      disabled={!exp.description.trim()}
                      title={exp.description.trim() ? undefined : 'Écrivez d’abord quelques mots à reformuler'}
                      onClick={() => handleImproveExperience(exp)}
                    >
                      {busy ? 'Reformulation…' : 'Améliorer avec l’IA'}
                    </AIButton>
                  </div>
                  <textarea
                    id={`desc-${exp.id}`}
                    rows={4}
                    placeholder="Décrivez vos missions et vos résultats, une idée par ligne."
                    className="input-field resize-y"
                    value={exp.description}
                    onChange={(event) => updateItem('experience', exp.id, { description: event.target.value })}
                  />
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addExperience} className="add-button">
            <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une expérience
          </button>
        </Section>

        {/* Formation */}
        <Section
          id="education"
          title="Formation"
          icon={GraduationCap}
          count={data.education.length}
          open={openSection === 'education'}
          onToggle={toggleSection}
        >
          {data.education.length === 0 && <p className="text-sm text-slate-500">Ajoutez vos diplômes, du plus récent au plus ancien.</p>}
          {data.education.map((edu, index) => {
            const label = edu.degree.trim() ? `la formation « ${edu.degree.trim()} »` : `la formation ${index + 1}`;
            return (
              <div
                key={edu.id}
                role="group"
                aria-label={edu.degree.trim() || `Formation ${index + 1}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-semibold text-slate-700">{edu.degree.trim() || `Formation ${index + 1}`}</p>
                  <ItemActions
                    label={label}
                    index={index}
                    total={data.education.length}
                    onMove={(direction) => moveListItem('education', index, direction)}
                    onRemove={() => removeItem('education', edu.id, 'Formation')}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                  <TextField
                    wrapperClassName="sm:col-span-6"
                    label="École ou université"
                    value={edu.school}
                    onValueChange={(value) => updateItem('education', edu.id, { school: value })}
                    autoFocus={focusId === edu.id}
                    placeholder="Université Lumière Lyon 2"
                  />
                  <TextField
                    wrapperClassName="sm:col-span-4"
                    label="Diplôme"
                    value={edu.degree}
                    onValueChange={(value) => updateItem('education', edu.id, { degree: value })}
                    placeholder="Master Marketing digital"
                  />
                  <TextField
                    wrapperClassName="sm:col-span-2"
                    label="Année"
                    value={edu.year}
                    onValueChange={(value) => updateItem('education', edu.id, { year: value })}
                    placeholder="2018"
                  />
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addEducation} className="add-button">
            <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une formation
          </button>
        </Section>

        {/* Compétences */}
        <Section
          id="skills"
          title="Compétences"
          icon={Wrench}
          count={data.skills.length}
          open={openSection === 'skills'}
          onToggle={toggleSection}
        >
          {data.skills.length === 0 && (
            <p className="text-sm text-slate-500">Listez vos compétences clés et indiquez votre niveau pour chacune.</p>
          )}
          <div className="space-y-2">
            {data.skills.map((skill, index) => {
              const label = skill.name.trim() ? `la compétence « ${skill.name.trim()} »` : `la compétence ${index + 1}`;
              return (
                <div key={skill.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="min-w-0 flex-1">
                    <input
                      className="input-field mb-2"
                      value={skill.name}
                      onChange={(event) => updateItem('skills', skill.id, { name: event.target.value })}
                      onKeyDown={(event) => {
                        // Entrée sur la dernière compétence en ajoute une nouvelle.
                        if (event.key === 'Enter' && index === data.skills.length - 1 && skill.name.trim()) addSkill();
                      }}
                      autoFocus={focusId === skill.id}
                      aria-label={`Nom de la compétence ${index + 1}`}
                      placeholder="Ex. : gestion de projet"
                    />
                    <label className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <span className="w-[4.5rem] shrink-0 whitespace-nowrap">Niveau {skill.level}/5</span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={skill.level}
                        onChange={(event) => updateItem('skills', skill.id, { level: Number(event.target.value) })}
                        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-indigo-600"
                      />
                    </label>
                  </div>
                  <ItemActions
                    label={label}
                    index={index}
                    total={data.skills.length}
                    onMove={(direction) => moveListItem('skills', index, direction)}
                    onRemove={() => removeItem('skills', skill.id, 'Compétence')}
                  />
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addSkill} className="add-button">
            <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une compétence
          </button>
        </Section>

        {/* Langues et centres d'intérêt */}
        <Section
          id="extras"
          title="Langues et centres d’intérêt"
          icon={LanguagesIcon}
          count={data.languages.length}
          open={openSection === 'extras'}
          onToggle={toggleSection}
        >
          <datalist id={levelListId}>
            {LANGUAGE_LEVELS.map((level) => (
              <option key={level} value={level} />
            ))}
          </datalist>
          <div className="space-y-2">
            {data.languages.map((language, index) => {
              const label = language.name.trim() ? `la langue « ${language.name.trim()} »` : `la langue ${index + 1}`;
              return (
                <div key={language.id} className="flex items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                  <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                    <TextField
                      label="Langue"
                      value={language.name}
                      onValueChange={(value) => updateItem('languages', language.id, { name: value })}
                      autoFocus={focusId === language.id}
                      placeholder="Anglais"
                    />
                    <TextField
                      label="Niveau"
                      value={language.level}
                      onValueChange={(value) => updateItem('languages', language.id, { level: value })}
                      list={levelListId}
                      placeholder="Courant, B2…"
                    />
                  </div>
                  <ItemActions
                    label={label}
                    index={index}
                    total={data.languages.length}
                    onMove={(direction) => moveListItem('languages', index, direction)}
                    onRemove={() => removeItem('languages', language.id, 'Langue')}
                  />
                </div>
              );
            })}
          </div>
          <button type="button" onClick={addLanguage} className="add-button">
            <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une langue
          </button>

          <div className="border-t border-slate-200 pt-4">
            <TextField
              label="Centres d’intérêt"
              value={data.interests}
              onValueChange={(value) => onChange((cv) => ({ ...cv, interests: value }))}
              aria-describedby={interestsHintId}
              placeholder="Randonnée, photographie, bénévolat"
            />
            <p id={interestsHintId} className="mt-1 text-xs text-slate-500">
              Séparez-les par des virgules.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
