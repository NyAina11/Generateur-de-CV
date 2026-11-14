import type { ReactNode } from 'react';
import { ensureContrast, readableOn, withAlpha } from '../../lib/color';
import { formatPeriod } from '../../lib/cv';
import { CVData } from '../../types';
import {
  ContactText,
  LanguageLine,
  NAME_PLACEHOLDER,
  Paragraph,
  Photo,
  TITLE_PLACEHOLDER,
  TemplateProps,
  contactEntries,
  skillPercent,
  visibleContent,
} from './shared';

const SIDEBAR_WIDTH = '32%';

function MainTitle({ color, children }: { color: string; children: ReactNode }) {
  return (
    <h3 className="cv-section-title mb-5 flex items-center gap-2 text-xl font-bold text-slate-800">
      <span className="h-1 w-8 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </h3>
  );
}

function SideTitle({ lineColor, children }: { lineColor: string; children: ReactNode }) {
  return (
    <h3 className="cv-section-title mb-3 border-b pb-1 text-xs font-bold uppercase tracking-wider" style={{ borderColor: lineColor }}>
      {children}
    </h3>
  );
}

export function ElegantTemplate({ data }: TemplateProps) {
  const { personal } = data;
  const fill = data.themeColor;
  // Le texte de la barre latérale s'adapte : foncé sur un thème clair, blanc sinon.
  const onFill = readableOn(fill);
  const soft = withAlpha(onFill, 0.22);
  const marker = ensureContrast(fill, '#ffffff', 3);

  const contacts = contactEntries(personal);
  const { experience, education, skills, languages, interests, summary } = visibleContent(data);
  const name = personal.fullName || NAME_PLACEHOLDER;

  return (
    <div className="flex">
      {/* Barre latérale : son fond coloré est peint par la page pour couvrir toute la hauteur. */}
      <aside className="flex shrink-0 flex-col gap-8 px-8 pt-8" style={{ width: SIDEBAR_WIDTH, color: onFill }}>
        <div>
          <div
            className="mb-4 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-4xl font-bold"
            style={{ backgroundColor: soft }}
          >
            {personal.photo ? <Photo src={personal.photo} className="h-full w-full" /> : name.charAt(0).toUpperCase()}
          </div>
          <h1 className="mb-2 break-words text-2xl font-bold leading-tight">{name}</h1>
          <p className="font-medium">{personal.jobTitle || TITLE_PLACEHOLDER}</p>
        </div>

        {contacts.length > 0 && (
          <ul className="space-y-3 text-sm">
            {contacts.map((entry) => (
              <li key={entry.key} className="flex items-start gap-2">
                <entry.icon className="mt-0.5 h-4 w-4 shrink-0" />
                <ContactText entry={entry} className="min-w-0 break-words [overflow-wrap:anywhere]" />
              </li>
            ))}
          </ul>
        )}

        {skills.length > 0 && (
          <section className="cv-item">
            <SideTitle lineColor={soft}>Compétences</SideTitle>
            <div className="space-y-2.5">
              {skills.map((skill) => (
                <div key={skill.id}>
                  <div className="mb-1 break-words text-xs">{skill.name}</div>
                  <div className="h-1 overflow-hidden rounded-full" style={{ backgroundColor: soft }}>
                    <div className="h-full rounded-full" style={{ width: skillPercent(skill.level), backgroundColor: onFill }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="cv-item">
            <SideTitle lineColor={soft}>Langues</SideTitle>
            <div className="space-y-1.5 text-xs">
              {languages.map((language) => (
                <LanguageLine key={language.id} language={language} />
              ))}
            </div>
          </section>
        )}

        {interests.length > 0 && (
          <section className="cv-item">
            <SideTitle lineColor={soft}>Centres d'intérêt</SideTitle>
            <p className="text-xs leading-relaxed">{interests.join(', ')}</p>
          </section>
        )}
      </aside>

      <div className="min-w-0 flex-1 space-y-8 px-8 pt-8">
        {summary && (
          <section className="cv-item">
            <MainTitle color={marker}>Profil</MainTitle>
            <Paragraph className="text-sm text-slate-600">{summary}</Paragraph>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <MainTitle color={marker}>Expériences</MainTitle>
            <div className="ml-2 space-y-7 border-l-2 border-slate-200">
              {experience.map((exp) => (
                <div key={exp.id} className="cv-item relative pl-7">
                  <div
                    className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-white"
                    style={{ backgroundColor: marker }}
                  />
                  <h4 className="text-lg font-bold leading-snug text-slate-800">{exp.role}</h4>
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-600">{exp.company}</span>
                    {formatPeriod(exp) && <span className="shrink-0 text-xs font-bold uppercase text-slate-500">{formatPeriod(exp)}</span>}
                  </div>
                  {exp.description && <Paragraph className="text-sm text-slate-600">{exp.description}</Paragraph>}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <MainTitle color={marker}>Formation</MainTitle>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="cv-item rounded-lg border-l-4 bg-slate-50 p-4" style={{ borderColor: marker }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-800">{edu.school || edu.degree}</h4>
                      {edu.school && edu.degree && <p className="text-sm text-slate-600">{edu.degree}</p>}
                    </div>
                    {edu.year && (
                      <span className="shrink-0 rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600">
                        {edu.year}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export const elegantBackground = (data: CVData) =>
  `linear-gradient(to right, ${data.themeColor} 0, ${data.themeColor} ${SIDEBAR_WIDTH}, #ffffff ${SIDEBAR_WIDTH})`;
