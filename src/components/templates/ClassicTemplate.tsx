import type { ReactNode } from 'react';
import { ensureContrast } from '../../lib/color';
import { formatPeriod } from '../../lib/cv';
import {
  ContactText,
  NAME_PLACEHOLDER,
  Paragraph,
  Photo,
  TITLE_PLACEHOLDER,
  TemplateProps,
  contactEntries,
  visibleContent,
} from './shared';

function SectionTitle({ color, centered, children }: { color: string; centered?: boolean; children: ReactNode }) {
  return (
    <h3
      className={`cv-section-title mb-4 border-b pb-1 font-sans text-[13px] font-bold uppercase tracking-widest ${
        centered ? 'text-center' : 'text-left'
      }`}
      style={{ borderColor: color, color }}
    >
      {children}
    </h3>
  );
}

export function ClassicTemplate({ data }: TemplateProps) {
  const { personal } = data;
  // Le thème colore les filets et les titres de section, en restant lisible sur blanc.
  const accent = ensureContrast(data.themeColor, '#ffffff', 4.5);

  const contacts = contactEntries(personal);
  const { experience, education, skills, languages, interests, summary } = visibleContent(data);

  return (
    <div className="px-[16mm] pt-[16mm] font-serif text-slate-900">
      <header className="mb-8 border-b-2 pb-6" style={{ borderColor: accent }}>
        <div className="flex flex-col items-center">
          <Photo src={personal.photo} className="mb-4 h-32 w-32 border-2 grayscale" style={{ borderColor: accent }} />
          <h1 className="mb-2 break-words text-center text-4xl font-bold uppercase leading-tight tracking-widest">
            {personal.fullName || NAME_PLACEHOLDER}
          </h1>
          <h2 className="mb-4 text-center text-lg italic text-slate-600">{personal.jobTitle || TITLE_PLACEHOLDER}</h2>

          {contacts.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 font-sans text-xs tracking-wide text-slate-600">
              {contacts.map((entry) => (
                <li key={entry.key} className="flex items-center gap-1.5">
                  <entry.icon className="h-3 w-3 shrink-0" style={{ color: accent }} />
                  <ContactText entry={entry} className="break-all" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="space-y-8">
        {summary && (
          <section className="cv-item px-8 text-center">
            <Paragraph className="text-sm italic text-slate-700">{summary}</Paragraph>
          </section>
        )}

        {skills.length > 0 && (
          <section className="cv-item">
            <SectionTitle color={accent} centered>
              Compétences clés
            </SectionTitle>
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {skills.map((skill) => (
                <li key={skill.id} className="font-medium text-slate-700">
                  • {skill.name}
                </li>
              ))}
            </ul>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionTitle color={accent}>Expérience</SectionTitle>
            <div className="space-y-6">
              {experience.map((exp) => (
                <div key={exp.id} className="cv-item">
                  <div className="flex items-baseline justify-between gap-4">
                    <h4 className="text-lg font-bold">{exp.role}</h4>
                    {formatPeriod(exp) && <span className="shrink-0 font-sans text-sm italic text-slate-600">{formatPeriod(exp)}</span>}
                  </div>
                  {exp.company && <div className="mb-2 font-medium text-slate-700">{exp.company}</div>}
                  {exp.description && <Paragraph className="text-sm text-slate-800">{exp.description}</Paragraph>}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle color={accent}>Formation</SectionTitle>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="cv-item flex items-end justify-between gap-4">
                  <div>
                    <h4 className="font-bold">{edu.school || edu.degree}</h4>
                    {edu.school && edu.degree && <div className="text-sm italic text-slate-600">{edu.degree}</div>}
                  </div>
                  {edu.year && <span className="shrink-0 font-sans text-sm text-slate-600">{edu.year}</span>}
                </div>
              ))}
            </div>
          </section>
        )}

        {(languages.length > 0 || interests.length > 0) && (
          <section className="cv-item">
            <SectionTitle color={accent}>Informations complémentaires</SectionTitle>
            <dl className="space-y-1.5 text-sm text-slate-800">
              {languages.length > 0 && (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-bold">Langues :</dt>
                  <dd>
                    {languages
                      .map((language) => (language.level.trim() ? `${language.name} (${language.level.trim()})` : language.name))
                      .join(', ')}
                  </dd>
                </div>
              )}
              {interests.length > 0 && (
                <div className="flex gap-2">
                  <dt className="shrink-0 font-bold">Centres d'intérêt :</dt>
                  <dd>{interests.join(', ')}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
      </div>
    </div>
  );
}

export const classicBackground = () => '#ffffff';
