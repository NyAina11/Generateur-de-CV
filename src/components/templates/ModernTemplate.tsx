import type { ReactNode } from 'react';
import { ensureContrast } from '../../lib/color';
import { formatPeriod } from '../../lib/cv';
import {
  ContactText,
  LanguageLine,
  LevelDots,
  NAME_PLACEHOLDER,
  Paragraph,
  Photo,
  TITLE_PLACEHOLDER,
  TemplateProps,
  contactEntries,
  visibleContent,
} from './shared';

function SectionTitle({ color, children }: { color: string; children: ReactNode }) {
  return (
    <h3 className="cv-section-title mb-4 border-b border-slate-200 pb-1 text-[13px] font-bold uppercase tracking-wider" style={{ color }}>
      {children}
    </h3>
  );
}

export function ModernTemplate({ data }: TemplateProps) {
  const { personal } = data;
  const fill = data.themeColor;
  // Les couleurs claires (jaune, cyan…) sont assombries quand elles servent de texte.
  const largeText = ensureContrast(fill, '#ffffff', 3);
  const smallText = ensureContrast(fill, '#ffffff', 4.5);

  const contacts = contactEntries(personal);
  const { experience, education, skills, languages, interests, summary } = visibleContent(data);
  const hasMain = experience.length > 0 || education.length > 0;
  const hasAside = skills.length > 0 || languages.length > 0 || interests.length > 0;

  return (
    <div className="px-[14mm] pt-[14mm] text-slate-800">
      <header className="mb-8 border-b-2 pb-6" style={{ borderColor: fill }}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <Photo src={personal.photo} className="h-24 w-24 shrink-0 rounded-full border-2" style={{ borderColor: fill }} />
            <div className="min-w-0 flex-1">
              <h1 className="mb-2 break-words text-4xl font-bold uppercase leading-tight tracking-tight text-slate-900">
                {personal.fullName || NAME_PLACEHOLDER}
              </h1>
              <h2 className="text-xl font-medium" style={{ color: largeText }}>
                {personal.jobTitle || TITLE_PLACEHOLDER}
              </h2>
            </div>
          </div>
          {contacts.length > 0 && (
            <ul className="max-w-[40%] shrink-0 space-y-1.5 pt-1 text-xs text-slate-600">
              {contacts.map((entry) => (
                <li key={entry.key} className="flex items-center justify-end gap-2">
                  <ContactText entry={entry} className="break-all text-right" />
                  <entry.icon className="h-3.5 w-3.5 shrink-0" style={{ color: smallText }} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {summary && <Paragraph className="mt-5 text-sm text-slate-700">{summary}</Paragraph>}
      </header>

      <div className="grid grid-cols-12 gap-8">
        {hasMain && (
          <div className={`space-y-8 ${hasAside ? 'col-span-8' : 'col-span-12'}`}>
            {experience.length > 0 && (
              <section>
                <SectionTitle color={smallText}>Expérience professionnelle</SectionTitle>
                <div className="space-y-6">
                  {experience.map((exp) => (
                    <div key={exp.id} className="cv-item">
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <h4 className="font-bold text-slate-800">{exp.role}</h4>
                        {formatPeriod(exp) && (
                          <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {formatPeriod(exp)}
                          </span>
                        )}
                      </div>
                      {exp.company && <div className="mb-2 text-sm font-medium text-slate-600">{exp.company}</div>}
                      {exp.description && <Paragraph className="text-sm text-slate-700">{exp.description}</Paragraph>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section>
                <SectionTitle color={smallText}>Formation</SectionTitle>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="cv-item flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-800">{edu.school || edu.degree}</h4>
                        {edu.school && edu.degree && <div className="text-sm text-slate-600">{edu.degree}</div>}
                      </div>
                      {edu.year && <span className="shrink-0 text-xs font-semibold text-slate-600">{edu.year}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {hasAside && (
          <div className={`space-y-8 ${hasMain ? 'col-span-4' : 'col-span-12'}`}>
            {skills.length > 0 && (
              <section className="cv-item">
                <SectionTitle color={smallText}>Compétences</SectionTitle>
                <ul className="space-y-2 text-sm text-slate-700">
                  {skills.map((skill) => (
                    <li key={skill.id} className="flex items-center justify-between gap-3">
                      <span className="min-w-0 break-words">{skill.name}</span>
                      <LevelDots level={skill.level} color={fill} emptyColor="#e2e8f0" />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {languages.length > 0 && (
              <section className="cv-item">
                <SectionTitle color={smallText}>Langues</SectionTitle>
                <div className="space-y-1.5 text-sm text-slate-700">
                  {languages.map((language) => (
                    <LanguageLine key={language.id} language={language} levelStyle={{ color: '#64748b' }} />
                  ))}
                </div>
              </section>
            )}

            {interests.length > 0 && (
              <section className="cv-item">
                <SectionTitle color={smallText}>Centres d'intérêt</SectionTitle>
                <div className="flex flex-wrap gap-1.5">
                  {interests.map((interest, index) => (
                    <span
                      key={`${index}-${interest}`}
                      className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export const modernBackground = () => '#ffffff';
