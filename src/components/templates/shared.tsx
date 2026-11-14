import { Globe, Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { emailHref, phoneHref, splitInterests, websiteHref } from '../../lib/cv';
import { CVData, Education, Experience, Language, PersonalInfo, Skill } from '../../types';

export interface TemplateProps {
  data: CVData;
}

export const NAME_PLACEHOLDER = 'Votre nom';
export const TITLE_PLACEHOLDER = 'Titre du poste';

export interface ContactEntry {
  key: string;
  icon: LucideIcon;
  text: string;
  href: string | null;
}

/** Coordonnées renseignées, avec leur lien cliquable dans le PDF quand c'est possible. */
export function contactEntries(personal: PersonalInfo): ContactEntry[] {
  const website = personal.website.trim();
  return [
    { key: 'email', icon: Mail, text: personal.email.trim(), href: emailHref(personal.email) },
    { key: 'phone', icon: Phone, text: personal.phone.trim(), href: phoneHref(personal.phone) },
    { key: 'location', icon: MapPin, text: personal.location.trim(), href: null },
    { key: 'website', icon: Globe, text: website.replace(/^https?:\/\//i, '').replace(/\/$/, ''), href: websiteHref(website) },
  ].filter((entry) => entry.text);
}

export function ContactText({ entry, className, style }: { entry: ContactEntry; className?: string; style?: CSSProperties }) {
  return entry.href ? (
    <a href={entry.href} className={className} style={style}>
      {entry.text}
    </a>
  ) : (
    <span className={className} style={style}>
      {entry.text}
    </span>
  );
}

/** Contenu réellement affichable : les entrées laissées vides dans l'éditeur sont ignorées. */
export interface VisibleContent {
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  interests: string[];
  summary: string;
}

export function visibleContent(data: CVData): VisibleContent {
  const filled = (...values: string[]) => values.some((value) => value.trim());
  return {
    experience: data.experience.filter((e) => filled(e.role, e.company, e.description, e.startDate, e.endDate)),
    education: data.education.filter((e) => filled(e.school, e.degree, e.year)),
    skills: data.skills.filter((s) => filled(s.name)),
    languages: data.languages.filter((l) => filled(l.name)),
    interests: splitInterests(data.interests),
    summary: data.personal.summary.trim(),
  };
}

export const skillPercent = (level: number) => `${Math.min(100, Math.max(0, level * 20))}%`;

/** Cinq pastilles indiquant le niveau d'une compétence. */
export function LevelDots({ level, color, emptyColor }: { level: number; color: string; emptyColor: string }) {
  return (
    <span className="flex shrink-0 items-center gap-[3px]" aria-label={`Niveau ${level} sur 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <span key={step} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: step <= level ? color : emptyColor }} />
      ))}
    </span>
  );
}

export function LanguageLine({ language, levelStyle }: { language: Language; levelStyle?: CSSProperties }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-medium">{language.name}</span>
      {language.level.trim() && (
        <span className="text-[0.85em]" style={levelStyle}>
          {language.level}
        </span>
      )}
    </div>
  );
}

export function Photo({ src, className, style }: { src?: string; className: string; style?: CSSProperties }) {
  if (!src) return null;
  return <img src={src} alt="" className={`object-cover ${className}`} style={style} />;
}

export function Paragraph({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <p className={`whitespace-pre-wrap break-words leading-relaxed ${className ?? ''}`} style={style}>
      {children}
    </p>
  );
}
