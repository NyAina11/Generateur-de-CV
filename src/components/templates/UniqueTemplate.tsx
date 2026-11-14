import type { CSSProperties, ReactNode } from 'react';
import { mix, withAlpha } from '../../lib/color';
import { formatPeriod } from '../../lib/cv';
import { DEFAULT_DESIGN, DesignPalette, buildPalette, fontStack, sanitizeDesignConfig } from '../../lib/design';
import { CVData, DesignConfig, PersonalInfo } from '../../types';
import {
  ContactEntry,
  ContactText,
  LanguageLine,
  NAME_PLACEHOLDER,
  Paragraph,
  Photo,
  TITLE_PLACEHOLDER,
  TemplateProps,
  VisibleContent,
  contactEntries,
  skillPercent,
  visibleContent,
} from './shared';

/** Marge intérieure de la page ; les bandeaux « pleine largeur » la compensent. */
const PAGE_PADDING = '13mm';
const COLUMN_PADDING = '11mm';
// Pas de marge basse : la feuille (Preview) réserve elle-même la marge de pied de page,
// ce qui évite qu'un simple espace vide ne fasse basculer le CV sur une page de plus.
const PAGE_INSET = `${PAGE_PADDING} ${PAGE_PADDING} 0`;
const COLUMN_INSET = `${COLUMN_PADDING} ${COLUMN_PADDING} 0`;
const SIDEBAR_LEFT_WIDTH = '31%';
const MAIN_WIDTH_WITH_RIGHT_SIDEBAR = '69%';
const ASYMMETRIC_BAND_START = '63%';

/** « page » : sur le fond du CV · « fill » : sur un aplat de couleur dominante. */
type Tone = 'page' | 'fill';

interface Ctx {
  config: DesignConfig;
  p: DesignPalette;
  headingFont: string;
  personal: PersonalInfo;
  contacts: ContactEntry[];
  content: VisibleContent;
  sectionGap: string;
  itemGap: string;
}

function createContext(data: CVData): Ctx {
  const config = sanitizeDesignConfig(data.designConfig) ?? DEFAULT_DESIGN;
  const spacing = config.sections.spacing;
  return {
    config,
    p: buildPalette(config.colors),
    headingFont: fontStack(config.fonts.heading),
    personal: data.personal,
    contacts: contactEntries(data.personal),
    content: visibleContent(data),
    sectionGap: spacing === 'compact' ? 'space-y-5' : spacing === 'spacious' ? 'space-y-11' : 'space-y-8',
    itemGap: spacing === 'compact' ? 'space-y-4' : spacing === 'spacious' ? 'space-y-8' : 'space-y-6',
  };
}

function toneColors({ p }: Ctx, tone: Tone) {
  return tone === 'fill'
    ? {
        text: p.onPrimary,
        muted: p.onPrimaryMuted,
        strong: p.onPrimary,
        line: withAlpha(p.onPrimary, 0.28),
        chip: withAlpha(p.onPrimary, 0.14),
      }
    : { text: p.text, muted: p.muted, strong: p.primary, line: p.border, chip: withAlpha(p.accent, 0.2) };
}

// --- Titres de section ------------------------------------------------------

function SectionTitle({ ctx, children }: { ctx: Ctx; children: ReactNode }) {
  const { p, headingFont, config } = ctx;
  const base = 'cv-section-title mb-4';
  const font: CSSProperties = { fontFamily: headingFont, color: p.primary };

  switch (config.sections.titleStyle) {
    case 'uppercase-bold':
      return (
        <h3 className={`${base} text-[13px] font-bold uppercase tracking-[0.18em]`} style={font}>
          {children}
        </h3>
      );
    case 'underlined':
      return (
        <h3 className={`${base} border-b-2 pb-1 text-lg font-bold`} style={{ ...font, borderColor: p.accent }}>
          {children}
        </h3>
      );
    case 'highlighted':
      return (
        <h3 className={`${base} text-base font-bold`} style={{ fontFamily: headingFont }}>
          <span className="inline-block rounded-sm px-2.5 py-1" style={{ backgroundColor: p.accent, color: p.onAccent }}>
            {children}
          </span>
        </h3>
      );
    case 'bracketed':
      return (
        <h3 className={`${base} text-lg font-bold`} style={font}>
          <span style={{ color: p.muted }}>[ </span>
          {children}
          <span style={{ color: p.muted }}> ]</span>
        </h3>
      );
    default:
      return (
        <h3 className={`${base} text-xl font-semibold`} style={font}>
          {children}
        </h3>
      );
  }
}

/** Petit titre des colonnes étroites (barres latérales, encadrés). */
function SideTitle({ ctx, tone, children }: { ctx: Ctx; tone: Tone; children: ReactNode }) {
  const colors = toneColors(ctx, tone);
  return (
    <h3
      className="cv-section-title mb-3 text-xs font-bold uppercase tracking-wider"
      style={{ fontFamily: ctx.headingFont, color: colors.strong }}
    >
      {children}
    </h3>
  );
}

// --- Blocs de contenu -------------------------------------------------------

function ContactList({ ctx, tone, vertical, justify }: { ctx: Ctx; tone: Tone; vertical?: boolean; justify?: string }) {
  if (ctx.contacts.length === 0) return null;
  const colors = toneColors(ctx, tone);
  return (
    <ul
      className={`flex text-sm ${vertical ? 'flex-col gap-2.5' : `flex-wrap gap-x-5 gap-y-1.5 ${justify ?? ''}`}`}
      style={{ color: tone === 'fill' ? colors.text : colors.muted }}
    >
      {ctx.contacts.map((entry) => (
        <li key={entry.key} className="flex min-w-0 items-start gap-2">
          {ctx.config.decorative.useIcons && <entry.icon className="mt-[3px] h-3.5 w-3.5 shrink-0" style={{ color: colors.strong }} />}
          <ContactText entry={entry} className="min-w-0 [overflow-wrap:anywhere]" />
        </li>
      ))}
    </ul>
  );
}

function ExperienceList({ ctx }: { ctx: Ctx }) {
  const { p, config, content } = ctx;
  const style = config.sections.style;

  return (
    <div className={ctx.itemGap}>
      {content.experience.map((exp) => {
        const period = formatPeriod(exp);
        const body = (
          <>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h4 className="text-[17px] font-bold leading-snug">{exp.role}</h4>
              {period &&
                (style === 'cards' ? (
                  <span
                    className="shrink-0 rounded px-2 py-0.5 text-xs font-bold"
                    style={{ backgroundColor: withAlpha(p.primary, 0.14), color: p.primary }}
                  >
                    {period}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs font-semibold" style={{ color: p.muted }}>
                    {period}
                  </span>
                ))}
            </div>
            {exp.company && (
              <div className="mb-2 text-sm font-semibold" style={{ color: style === 'cards' ? p.muted : p.primary }}>
                {exp.company}
              </div>
            )}
            {exp.description && <Paragraph className="text-sm">{exp.description}</Paragraph>}
          </>
        );

        if (style === 'cards') {
          return (
            <div key={exp.id} className="cv-item rounded-lg border p-5" style={{ backgroundColor: p.surface, borderColor: p.border }}>
              {body}
            </div>
          );
        }
        if (style === 'timeline') {
          return (
            <div key={exp.id} className="cv-item relative border-l-2 pl-6" style={{ borderColor: p.accent }}>
              <div className="absolute -left-[5px] top-2 h-2 w-2 rounded-full" style={{ backgroundColor: p.primary }} />
              {body}
            </div>
          );
        }
        return (
          <div
            key={exp.id}
            className={`cv-item ${style === 'left-border' ? 'border-l-4 pl-4' : ''}`}
            style={style === 'left-border' ? { borderColor: p.primary } : undefined}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}

function EducationList({ ctx, tone = 'page', compact }: { ctx: Ctx; tone?: Tone; compact?: boolean }) {
  const colors = toneColors(ctx, tone);
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {ctx.content.education.map((edu) =>
        compact ? (
          <div key={edu.id} className="cv-item">
            <div className="text-sm font-bold">{edu.school || edu.degree}</div>
            {edu.school && edu.degree && <div className="text-xs">{edu.degree}</div>}
            {edu.year && (
              <div className="text-xs" style={{ color: colors.muted }}>
                {edu.year}
              </div>
            )}
          </div>
        ) : (
          <div key={edu.id} className="cv-item flex items-baseline justify-between gap-3">
            <div>
              <h4 className="font-bold">{edu.school || edu.degree}</h4>
              {edu.school && edu.degree && (
                <div className="text-sm" style={{ color: colors.muted }}>
                  {edu.degree}
                </div>
              )}
            </div>
            {edu.year && (
              <span className="shrink-0 text-xs font-semibold" style={{ color: colors.muted }}>
                {edu.year}
              </span>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function SkillChips({ ctx, tone }: { ctx: Ctx; tone: Tone }) {
  const colors = toneColors(ctx, tone);
  return (
    <ul className="flex flex-wrap gap-1.5">
      {ctx.content.skills.map((skill) => (
        <li
          key={skill.id}
          className="rounded border px-2 py-1 text-xs font-medium"
          style={{ borderColor: tone === 'fill' ? colors.line : ctx.p.accent, backgroundColor: colors.chip, color: colors.text }}
        >
          {skill.name}
        </li>
      ))}
    </ul>
  );
}

function SkillBars({ ctx }: { ctx: Ctx }) {
  const { p } = ctx;
  return (
    <ul className="space-y-2">
      {ctx.content.skills.map((skill) => (
        <li key={skill.id} className="flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 break-words">{skill.name}</span>
          <span className="h-1 w-14 shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: p.border }}>
            <span className="block h-full rounded-full" style={{ width: skillPercent(skill.level), backgroundColor: p.primary }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

function LanguageList({ ctx, tone }: { ctx: Ctx; tone: Tone }) {
  const colors = toneColors(ctx, tone);
  return (
    <div className="space-y-1.5 text-sm">
      {ctx.content.languages.map((language) => (
        <LanguageLine key={language.id} language={language} levelStyle={{ color: colors.muted }} />
      ))}
    </div>
  );
}

/** Compétences, langues et centres d'intérêt empilés dans une colonne étroite. */
function SideExtras({ ctx, tone }: { ctx: Ctx; tone: Tone }) {
  const { skills, languages, interests } = ctx.content;
  return (
    <>
      {skills.length > 0 && (
        <section className="cv-item">
          <SideTitle ctx={ctx} tone={tone}>
            Compétences
          </SideTitle>
          <SkillChips ctx={ctx} tone={tone} />
        </section>
      )}
      {languages.length > 0 && (
        <section className="cv-item">
          <SideTitle ctx={ctx} tone={tone}>
            Langues
          </SideTitle>
          <LanguageList ctx={ctx} tone={tone} />
        </section>
      )}
      {interests.length > 0 && (
        <section className="cv-item">
          <SideTitle ctx={ctx} tone={tone}>
            Centres d'intérêt
          </SideTitle>
          <p className="text-sm leading-relaxed">{interests.join(', ')}</p>
        </section>
      )}
    </>
  );
}

function SummarySection({ ctx }: { ctx: Ctx }) {
  if (!ctx.content.summary) return null;
  return (
    <section className="cv-item">
      <SectionTitle ctx={ctx}>Profil</SectionTitle>
      <Paragraph className="text-sm">{ctx.content.summary}</Paragraph>
    </section>
  );
}

function ExperienceSection({ ctx, title = 'Expérience' }: { ctx: Ctx; title?: string }) {
  if (ctx.content.experience.length === 0) return null;
  return (
    <section>
      <SectionTitle ctx={ctx}>{title}</SectionTitle>
      <ExperienceList ctx={ctx} />
    </section>
  );
}

function EducationSection({ ctx, compact }: { ctx: Ctx; compact?: boolean }) {
  if (ctx.content.education.length === 0) return null;
  return (
    <section>
      <SectionTitle ctx={ctx}>Formation</SectionTitle>
      <EducationList ctx={ctx} compact={compact} />
    </section>
  );
}

// --- En-tête ----------------------------------------------------------------

interface HeaderProps {
  ctx: Ctx;
  withContact: boolean;
  withPhoto: boolean;
  /** Marge du conteneur parent, compensée par le style « bandeau ». */
  bleed: string;
  /** Colonne étroite : la taille « huge » du nom est réduite. */
  narrow?: boolean;
}

function Header({ ctx, withContact, withPhoto, bleed, narrow }: HeaderProps) {
  const { p, config, personal, headingFont } = ctx;
  const { alignment, style, nameSize } = config.header;
  const banner = style === 'banner';

  const direction =
    alignment === 'center'
      ? 'flex-col items-center text-center'
      : alignment === 'right'
        ? 'flex-row-reverse items-center text-right'
        : 'flex-row items-center text-left';
  const justify = alignment === 'center' ? 'justify-center' : alignment === 'right' ? 'justify-end' : '';

  const nameClass =
    nameSize === 'huge'
      ? `${narrow ? 'text-5xl' : 'text-6xl'} tracking-tighter`
      : nameSize === 'large'
        ? 'text-4xl tracking-tight'
        : 'text-3xl';

  let boxClass = '';
  let boxStyle: CSSProperties = {};
  if (banner) {
    boxStyle = {
      backgroundColor: p.primaryFill,
      color: p.onPrimary,
      margin: `-${bleed} -${bleed} 0`,
      padding: `${bleed} ${bleed} 10mm`,
    };
  } else if (style === 'floating-box') {
    boxClass = 'rounded-xl border p-7 shadow-md';
    boxStyle = { backgroundColor: p.surface, borderColor: p.border };
  } else if (style === 'underlined') {
    boxClass = 'border-b-2 pb-6';
    boxStyle = { borderColor: p.accent };
  }

  return (
    <header className={`flex gap-6 ${direction} ${boxClass}`} style={boxStyle}>
      {withPhoto && (
        <Photo
          src={personal.photo}
          className={`h-28 w-28 shrink-0 ${banner || style === 'floating-box' ? 'rounded-full border-4' : 'rounded-xl'}`}
          style={banner ? { borderColor: withAlpha(p.onPrimary, 0.35) } : { borderColor: p.background }}
        />
      )}
      <div className={alignment === 'center' ? 'max-w-full' : 'min-w-0 flex-1'}>
        <h1
          className={`${nameClass} mb-2 break-words font-bold leading-[1.05]`}
          style={{ fontFamily: headingFont, color: banner ? p.onPrimary : p.text }}
        >
          {personal.fullName || NAME_PLACEHOLDER}
        </h1>
        <p className="text-xl font-medium" style={{ color: banner ? p.onPrimaryMuted : p.primary }}>
          {personal.jobTitle || TITLE_PLACEHOLDER}
        </p>
        {withContact && ctx.contacts.length > 0 && (
          <div className="mt-4">
            <ContactList ctx={ctx} tone={banner ? 'fill' : 'page'} justify={justify} />
          </div>
        )}
      </div>
    </header>
  );
}

// --- Dispositions -----------------------------------------------------------

function SidebarLeftLayout({ ctx }: { ctx: Ctx }) {
  const { p, personal } = ctx;
  return (
    <div className="flex">
      <aside className="flex shrink-0 flex-col gap-7 px-8 pt-8" style={{ width: SIDEBAR_LEFT_WIDTH, color: p.onPrimary }}>
        <Photo
          src={personal.photo}
          className="mx-auto h-32 w-32 rounded-full border-4"
          style={{ borderColor: withAlpha(p.onPrimary, 0.3) }}
        />
        {ctx.contacts.length > 0 && (
          <section className="cv-item">
            <SideTitle ctx={ctx} tone="fill">
              Contact
            </SideTitle>
            <ContactList ctx={ctx} tone="fill" vertical />
          </section>
        )}
        <SideExtras ctx={ctx} tone="fill" />
      </aside>

      <div className={`min-w-0 flex-1 ${ctx.sectionGap}`} style={{ padding: COLUMN_INSET }}>
        <Header ctx={ctx} withContact={false} withPhoto={false} bleed={COLUMN_PADDING} narrow />
        <SummarySection ctx={ctx} />
        <ExperienceSection ctx={ctx} />
        <EducationSection ctx={ctx} />
      </div>
    </div>
  );
}

function SidebarRightLayout({ ctx }: { ctx: Ctx }) {
  return (
    <div className="flex">
      <div className={`min-w-0 shrink-0 ${ctx.sectionGap}`} style={{ width: MAIN_WIDTH_WITH_RIGHT_SIDEBAR, padding: COLUMN_INSET }}>
        <Header ctx={ctx} withContact={false} withPhoto bleed={COLUMN_PADDING} narrow />
        <SummarySection ctx={ctx} />
        <ExperienceSection ctx={ctx} />
        <EducationSection ctx={ctx} />
      </div>

      <aside className="flex min-w-0 flex-1 flex-col gap-7 px-8 pt-8">
        {ctx.contacts.length > 0 && (
          <section className="cv-item">
            <SideTitle ctx={ctx} tone="page">
              Contact
            </SideTitle>
            <ContactList ctx={ctx} tone="page" vertical />
          </section>
        )}
        <SideExtras ctx={ctx} tone="page" />
      </aside>
    </div>
  );
}

function MinimalGridLayout({ ctx }: { ctx: Ctx }) {
  const { summary, skills, languages, interests, education, experience } = ctx.content;
  const hasSide = Boolean(summary) || skills.length > 0 || languages.length > 0 || interests.length > 0 || education.length > 0;
  const hasMain = experience.length > 0;

  return (
    <div style={{ padding: PAGE_INSET }}>
      <Header ctx={ctx} withContact withPhoto bleed={PAGE_PADDING} />
      <div className="mt-10 grid grid-cols-12 gap-10">
        {hasSide && (
          <div className={`${hasMain ? 'col-span-4' : 'col-span-12'} ${ctx.sectionGap}`}>
            <SummarySection ctx={ctx} />
            {skills.length > 0 && (
              <section className="cv-item">
                <SectionTitle ctx={ctx}>Compétences</SectionTitle>
                <SkillBars ctx={ctx} />
              </section>
            )}
            {languages.length > 0 && (
              <section className="cv-item">
                <SectionTitle ctx={ctx}>Langues</SectionTitle>
                <LanguageList ctx={ctx} tone="page" />
              </section>
            )}
            <EducationSection ctx={ctx} compact />
            {interests.length > 0 && (
              <section className="cv-item">
                <SectionTitle ctx={ctx}>Centres d'intérêt</SectionTitle>
                <p className="text-sm leading-relaxed">{interests.join(', ')}</p>
              </section>
            )}
          </div>
        )}
        {hasMain && (
          <div className={hasSide ? 'col-span-8' : 'col-span-12'}>
            <ExperienceSection ctx={ctx} />
          </div>
        )}
      </div>
    </div>
  );
}

function AsymmetricLayout({ ctx }: { ctx: Ctx }) {
  const { p, personal, headingFont, config, content } = ctx;
  const nameClass =
    config.header.nameSize === 'huge'
      ? 'text-5xl tracking-tighter'
      : config.header.nameSize === 'large'
        ? 'text-4xl tracking-tight'
        : 'text-3xl';

  return (
    <div className="grid grid-cols-3 gap-10" style={{ padding: PAGE_INSET }}>
      <div className={`col-span-2 min-w-0 ${ctx.sectionGap}`}>
        <header>
          <h1
            className={`${nameClass} mb-2 break-words font-extrabold leading-[1.05]`}
            style={{ color: p.primary, fontFamily: headingFont }}
          >
            {personal.fullName || NAME_PLACEHOLDER}
          </h1>
          <p className="text-xl font-bold" style={{ color: p.muted }}>
            {personal.jobTitle || TITLE_PLACEHOLDER}
          </p>
        </header>

        {content.summary && (
          <Paragraph className="cv-item border-l-4 pl-4 text-sm" style={{ borderColor: p.primary }}>
            {content.summary}
          </Paragraph>
        )}

        <ExperienceSection ctx={ctx} title="Expérience professionnelle" />
      </div>

      <div className="col-span-1 min-w-0 pt-14">
        <div className="flex flex-col gap-6 rounded-xl border p-6" style={{ backgroundColor: p.surface, borderColor: p.border }}>
          <Photo src={personal.photo} className="mx-auto h-28 w-28 rounded-full border-4" style={{ borderColor: p.background }} />
          {ctx.contacts.length > 0 && (
            <section className="cv-item">
              <SideTitle ctx={ctx} tone="page">
                Contact
              </SideTitle>
              <ContactList ctx={ctx} tone="page" vertical />
            </section>
          )}
          <SideExtras ctx={ctx} tone="page" />
          {content.education.length > 0 && (
            <section>
              <SideTitle ctx={ctx} tone="page">
                Formation
              </SideTitle>
              <EducationList ctx={ctx} compact />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function SingleColumnLayout({ ctx }: { ctx: Ctx }) {
  const { skills, languages, interests, education } = ctx.content;
  const hasExtras = skills.length > 0 || languages.length > 0 || interests.length > 0;

  return (
    <div className={ctx.sectionGap} style={{ padding: PAGE_INSET }}>
      <Header ctx={ctx} withContact withPhoto bleed={PAGE_PADDING} />
      <SummarySection ctx={ctx} />
      <ExperienceSection ctx={ctx} />

      {(education.length > 0 || hasExtras) && (
        <div className="grid grid-cols-2 gap-10">
          {education.length > 0 && (
            <div className={hasExtras ? '' : 'col-span-2'}>
              <EducationSection ctx={ctx} />
            </div>
          )}
          {hasExtras && (
            <div className={`space-y-6 ${education.length > 0 ? '' : 'col-span-2'}`}>
              {skills.length > 0 && (
                <section className="cv-item">
                  <SectionTitle ctx={ctx}>Compétences</SectionTitle>
                  <SkillChips ctx={ctx} tone="page" />
                </section>
              )}
              {languages.length > 0 && (
                <section className="cv-item">
                  <SectionTitle ctx={ctx}>Langues</SectionTitle>
                  <LanguageList ctx={ctx} tone="page" />
                </section>
              )}
              {interests.length > 0 && (
                <section className="cv-item">
                  <SectionTitle ctx={ctx}>Centres d'intérêt</SectionTitle>
                  <p className="text-sm leading-relaxed">{interests.join(', ')}</p>
                </section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Modèle « unique » (configuration générée par l'IA) ---------------------

export function UniqueTemplate({ data }: TemplateProps) {
  const ctx = createContext(data);
  const layout = ctx.config.layout;

  return (
    <div style={{ color: ctx.p.text, fontFamily: fontStack(ctx.config.fonts.body) }}>
      {layout === 'sidebar-left' ? (
        <SidebarLeftLayout ctx={ctx} />
      ) : layout === 'sidebar-right' ? (
        <SidebarRightLayout ctx={ctx} />
      ) : layout === 'minimal-grid' ? (
        <MinimalGridLayout ctx={ctx} />
      ) : layout === 'asymmetric' ? (
        <AsymmetricLayout ctx={ctx} />
      ) : (
        <SingleColumnLayout ctx={ctx} />
      )}
    </div>
  );
}

/** Fond de la page : couvre toute la hauteur, y compris sur plusieurs pages. */
export function uniqueBackground(data: CVData): string {
  const config = sanitizeDesignConfig(data.designConfig) ?? DEFAULT_DESIGN;
  const p = buildPalette(config.colors);

  if (config.layout === 'sidebar-left') {
    return `linear-gradient(to right, ${p.primaryFill} 0, ${p.primaryFill} ${SIDEBAR_LEFT_WIDTH}, ${p.background} ${SIDEBAR_LEFT_WIDTH})`;
  }
  if (config.layout === 'sidebar-right') {
    const edge = MAIN_WIDTH_WITH_RIGHT_SIDEBAR;
    return `linear-gradient(to right, ${p.background} 0, ${p.background} calc(${edge} - 1px), ${p.border} calc(${edge} - 1px), ${p.border} ${edge}, ${p.surface} ${edge})`;
  }
  if (config.layout === 'asymmetric') {
    const band = mix(p.background, p.accent, 0.14);
    return `linear-gradient(to right, ${p.background} 0, ${p.background} ${ASYMMETRIC_BAND_START}, ${band} ${ASYMMETRIC_BAND_START})`;
  }
  return p.background;
}

/** Formes décoratives et cadre, positionnés par rapport à la page entière. */
export function UniqueDecor({ data }: TemplateProps) {
  const config = sanitizeDesignConfig(data.designConfig) ?? DEFAULT_DESIGN;
  const p = buildPalette(config.colors);
  const { shape, borderStyle } = config.decorative;
  const sidebarLeft = config.layout === 'sidebar-left';

  // Le cadre ne convient qu'aux mises en page sans aplat « pleine largeur ».
  const framed =
    borderStyle !== 'none' &&
    config.header.style !== 'banner' &&
    (config.layout === 'single-column' || config.layout === 'minimal-grid' || config.layout === 'asymmetric');

  return (
    <>
      {shape === 'dots' && (
        <>
          <div
            className="absolute right-0 top-0 h-[55mm] w-[55mm]"
            style={{
              opacity: 0.22,
              backgroundImage: `radial-gradient(${p.primary} 1.2px, transparent 1.2px)`,
              backgroundSize: '11px 11px',
            }}
          />
          <div
            className="absolute bottom-0 h-[35mm] w-[35mm]"
            style={{
              [sidebarLeft ? 'right' : 'left']: 0,
              opacity: 0.16,
              backgroundImage: `radial-gradient(${p.accent} 1.2px, transparent 1.2px)`,
              backgroundSize: '11px 11px',
            }}
          />
        </>
      )}

      {shape === 'geometric' && (
        <>
          <div
            className="absolute -top-[18mm] h-[58mm] w-[58mm] rounded-full"
            style={{ [sidebarLeft ? 'right' : 'left']: '-18mm', backgroundColor: p.accent, opacity: 0.16 }}
          />
          <div
            className="absolute -right-[14mm] bottom-[30mm] h-[42mm] w-[42mm] rotate-45"
            style={{ backgroundColor: p.primary, opacity: 0.08 }}
          />
        </>
      )}

      {shape === 'waves' && (
        <svg className="absolute bottom-0 left-0 h-[30mm] w-full" viewBox="0 0 800 120" preserveAspectRatio="none">
          <path d="M0 70 C 130 20, 270 110, 400 62 S 670 20, 800 66 V120 H0 Z" fill={p.accent} opacity="0.28" />
          <path d="M0 92 C 150 55, 290 122, 430 86 S 690 58, 800 96 V120 H0 Z" fill={p.primary} opacity="0.16" />
        </svg>
      )}

      {shape === 'tech-lines' && (
        <div
          className="absolute bottom-0 top-0 w-px"
          style={{ [sidebarLeft ? 'right' : 'left']: '5.5mm', backgroundColor: p.accent, opacity: 0.55 }}
        >
          <div className="absolute -left-[2px] top-[10%] h-[5px] w-[5px]" style={{ backgroundColor: p.primary }} />
          <div className="absolute -left-[2px] top-[46%] h-[5px] w-[5px]" style={{ backgroundColor: p.primary }} />
          <div className="absolute -left-[2px] bottom-[18%] h-[5px] w-[5px]" style={{ backgroundColor: p.primary }} />
        </div>
      )}

      {framed && (
        <div
          className="absolute inset-[5mm]"
          style={{ borderStyle, borderColor: p.accent, borderWidth: borderStyle === 'double' ? 4 : 1.5 }}
        />
      )}
    </>
  );
}
