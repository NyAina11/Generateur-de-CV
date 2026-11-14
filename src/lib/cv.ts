import { CVData, Education, Experience, Language, Skill, TemplateId } from '../types';
import { normalizeHex } from './color';
import { sanitizeDesignConfig } from './design';

export const DEFAULT_THEME_COLOR = '#2563eb';
export const APP_NAME = 'CV Forge AI';

/** Taille maximale acceptée pour une photo encodée (≈ 1,5 Mo de base64). */
const MAX_PHOTO_LENGTH = 2_000_000;
const MAX_ITEMS = 40;
const TEMPLATE_IDS: readonly TemplateId[] = ['modern', 'classic', 'elegant', 'unique'];

/** `crypto.randomUUID` n'existe qu'en contexte sécurisé (HTTPS / localhost). */
export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyCV(): CVData {
  return {
    personal: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', photo: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    languages: [],
    interests: '',
    themeColor: DEFAULT_THEME_COLOR,
    templateId: 'modern',
  };
}

const text = (value: unknown, max = 300): string => (typeof value === 'string' ? value.slice(0, max) : '');

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function list<T>(value: unknown, map: (item: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .slice(0, MAX_ITEMS)
    .map((item) => map(item as Record<string, unknown>));
}

const idOf = (item: Record<string, unknown>) => text(item.id, 80) || createId();

/**
 * Reconstruit un CV valide à partir d'une source non fiable (stockage local,
 * fichier importé). Les champs manquants ou d'anciennes versions sont complétés.
 * Renvoie `null` si l'entrée ne ressemble pas à un CV.
 */
export function sanitizeCVData(input: unknown): CVData | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  if (!('personal' in raw) && !('experience' in raw) && !('education' in raw) && !('skills' in raw)) return null;

  const personal = asRecord(raw.personal);
  const photo = typeof personal.photo === 'string' ? personal.photo : '';
  const designConfig = sanitizeDesignConfig(raw.designConfig);

  let templateId: TemplateId = TEMPLATE_IDS.includes(raw.templateId as TemplateId) ? (raw.templateId as TemplateId) : 'modern';
  if (templateId === 'unique' && !designConfig) templateId = 'modern';

  const cv: CVData = {
    personal: {
      fullName: text(personal.fullName, 120),
      jobTitle: text(personal.jobTitle, 160),
      email: text(personal.email, 160),
      phone: text(personal.phone, 60),
      location: text(personal.location, 160),
      website: text(personal.website, 200),
      photo: /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(photo) && photo.length <= MAX_PHOTO_LENGTH ? photo : '',
      summary: text(personal.summary, 3000),
    },
    experience: list<Experience>(raw.experience, (item) => ({
      id: idOf(item),
      company: text(item.company, 160),
      role: text(item.role, 160),
      startDate: text(item.startDate, 40),
      endDate: text(item.endDate, 40),
      current: item.current === true,
      description: text(item.description, 4000),
    })),
    education: list<Education>(raw.education, (item) => ({
      id: idOf(item),
      school: text(item.school, 160),
      degree: text(item.degree, 200),
      year: text(item.year, 40),
    })),
    skills: list<Skill>(raw.skills, (item) => {
      const level = Math.round(Number(item.level));
      return {
        id: idOf(item),
        name: text(item.name, 80),
        level: Number.isFinite(level) ? Math.min(5, Math.max(1, level)) : 3,
      };
    }),
    languages: list<Language>(raw.languages, (item) => ({
      id: idOf(item),
      name: text(item.name, 80),
      level: text(item.level, 60),
    })),
    interests: text(raw.interests, 500),
    themeColor: normalizeHex(raw.themeColor, DEFAULT_THEME_COLOR),
    templateId,
  };
  if (designConfig) cv.designConfig = designConfig;
  return cv;
}

/** Vrai si l'utilisateur n'a encore rien saisi. */
export function isCVEmpty(cv: CVData): boolean {
  const { fullName, jobTitle, email, phone, location, website, photo, summary } = cv.personal;
  return (
    ![fullName, jobTitle, email, phone, location, website, photo, summary, cv.interests].some((v) => v && v.trim()) &&
    cv.experience.length === 0 &&
    cv.education.length === 0 &&
    cv.skills.length === 0 &&
    cv.languages.length === 0
  );
}

/** « 2021 – Présent », « 2019 – 2021 », « 2020 » ou chaîne vide. */
export function formatPeriod(exp: Pick<Experience, 'startDate' | 'endDate' | 'current'>): string {
  const start = exp.startDate.trim();
  const end = exp.current ? 'Présent' : exp.endDate.trim();
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function splitInterests(interests: string): string[] {
  return interests
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Lien cliquable pour un site web saisi librement ; `null` si ce n'est pas une URL sûre. */
export function websiteHref(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.hostname.includes('.') ? url.href : null;
  } catch {
    return null;
  }
}

export function emailHref(value: string): string | null {
  const trimmed = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? `mailto:${trimmed}` : null;
}

export function phoneHref(value: string): string | null {
  const digits = value.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 6 ? `tel:${digits}` : null;
}

/** Contexte envoyé à l'IA pour rédiger un résumé fidèle au contenu du CV. */
export function buildSummaryContext(cv: CVData): string {
  const lines: string[] = [];
  const skills = cv.skills.map((s) => s.name.trim()).filter(Boolean);
  if (skills.length) lines.push(`Compétences : ${skills.join(', ')}`);

  const experiences = cv.experience
    .filter((e) => e.role.trim() || e.company.trim())
    .slice(0, 6)
    .map((e) => {
      const period = formatPeriod(e);
      return `${e.role.trim() || 'Poste'}${e.company.trim() ? ` chez ${e.company.trim()}` : ''}${period ? ` (${period})` : ''}`;
    });
  if (experiences.length) lines.push(`Expériences : ${experiences.join(' ; ')}`);

  const education = cv.education
    .filter((e) => e.degree.trim() || e.school.trim())
    .slice(0, 4)
    .map((e) => [e.degree.trim(), e.school.trim()].filter(Boolean).join(', '));
  if (education.length) lines.push(`Formation : ${education.join(' ; ')}`);

  const languages = cv.languages
    .filter((l) => l.name.trim())
    .map((l) => (l.level.trim() ? `${l.name.trim()} (${l.level.trim()})` : l.name.trim()));
  if (languages.length) lines.push(`Langues : ${languages.join(', ')}`);

  if (cv.personal.summary.trim()) lines.push(`Résumé actuel à améliorer : ${cv.personal.summary.trim()}`);
  return lines.join('\n').slice(0, 1800);
}

/** Titre de l'onglet, repris par le navigateur comme nom du fichier PDF exporté. */
export function documentTitle(cv: CVData): string {
  const name = cv.personal.fullName.trim();
  return name ? `CV ${name}` : `${APP_NAME} – Créez votre CV en ligne`;
}

export function exportFileName(cv: CVData): string {
  const slug = cv.personal.fullName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `cv-${slug || 'sans-nom'}.json`;
}

export function serializeCV(cv: CVData): string {
  return JSON.stringify({ app: 'cv-forge-ai', version: 1, data: cv }, null, 2);
}

/** Lit un fichier exporté par l'application (ou un objet CV brut). */
export function parseImportedCV(content: string): CVData | null {
  try {
    const parsed: unknown = JSON.parse(content);
    const wrapped = asRecord(parsed);
    return sanitizeCVData('data' in wrapped && wrapped.app === 'cv-forge-ai' ? wrapped.data : parsed);
  } catch {
    return null;
  }
}

/** Déplace un élément d'une position vers le haut (-1) ou vers le bas (+1). */
export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (index < 0 || index >= items.length || target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
