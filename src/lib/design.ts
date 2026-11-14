import { DesignConfig } from '../types';
import { ensureContrast, isDark, mix, normalizeHex, readableOn } from './color';

export const DESIGN_FONTS = ['Inter', 'Merriweather', 'Playfair Display', 'Roboto Mono', 'Lato'] as const;
export type DesignFont = (typeof DESIGN_FONTS)[number];

const FONT_STACKS: Record<DesignFont, string> = {
  Inter: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  Merriweather: "'Merriweather', Georgia, 'Times New Roman', serif",
  'Playfair Display': "'Playfair Display', Georgia, 'Times New Roman', serif",
  'Roboto Mono': "'Roboto Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace",
  Lato: "'Lato', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const DEFAULT_DESIGN: DesignConfig = {
  layout: 'single-column',
  header: { alignment: 'left', style: 'clean', nameSize: 'large' },
  sections: { style: 'clean', titleStyle: 'uppercase-bold', spacing: 'normal' },
  colors: { primary: '#1e293b', secondary: '#475569', background: '#ffffff', text: '#1f2937', accent: '#cbd5e1' },
  fonts: { heading: 'Inter', body: 'Inter' },
  decorative: { shape: 'none', borderStyle: 'none', useIcons: true },
};

const LAYOUTS = ['sidebar-left', 'sidebar-right', 'single-column', 'minimal-grid', 'asymmetric'] as const;
const ALIGNMENTS = ['left', 'center', 'right'] as const;
const HEADER_STYLES = ['clean', 'banner', 'floating-box', 'underlined'] as const;
const NAME_SIZES = ['normal', 'large', 'huge'] as const;
const SECTION_STYLES = ['clean', 'cards', 'left-border', 'timeline'] as const;
const TITLE_STYLES = ['simple', 'uppercase-bold', 'underlined', 'highlighted', 'bracketed'] as const;
const SPACINGS = ['compact', 'normal', 'spacious'] as const;
const SHAPES = ['none', 'dots', 'geometric', 'waves', 'tech-lines'] as const;
const BORDER_STYLES = ['none', 'solid', 'double', 'dashed'] as const;

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/**
 * Valide une configuration de design venant d'une source non fiable (réponse de
 * l'IA, fichier importé, stockage local). Toute valeur inconnue est remplacée par
 * une valeur par défaut. Renvoie `null` si l'entrée n'est pas un objet exploitable.
 */
export function sanitizeDesignConfig(input: unknown): DesignConfig | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const raw = input as Record<string, unknown>;
  const header = asRecord(raw.header);
  const sections = asRecord(raw.sections);
  const colors = asRecord(raw.colors);
  const fonts = asRecord(raw.fonts);
  const decorative = asRecord(raw.decorative);
  const d = DEFAULT_DESIGN;

  return {
    layout: oneOf(raw.layout, LAYOUTS, d.layout),
    header: {
      alignment: oneOf(header.alignment, ALIGNMENTS, d.header.alignment),
      style: oneOf(header.style, HEADER_STYLES, d.header.style),
      nameSize: oneOf(header.nameSize, NAME_SIZES, d.header.nameSize),
    },
    sections: {
      style: oneOf(sections.style, SECTION_STYLES, d.sections.style),
      titleStyle: oneOf(sections.titleStyle, TITLE_STYLES, d.sections.titleStyle),
      spacing: oneOf(sections.spacing, SPACINGS, d.sections.spacing),
    },
    colors: {
      primary: normalizeHex(colors.primary, d.colors.primary),
      secondary: normalizeHex(colors.secondary, d.colors.secondary),
      background: normalizeHex(colors.background, d.colors.background),
      text: normalizeHex(colors.text, d.colors.text),
      accent: normalizeHex(colors.accent, d.colors.accent),
    },
    fonts: {
      heading: oneOf(fonts.heading, DESIGN_FONTS, d.fonts.heading as DesignFont),
      body: oneOf(fonts.body, DESIGN_FONTS, d.fonts.body as DesignFont),
    },
    decorative: {
      shape: oneOf(decorative.shape, SHAPES, d.decorative.shape),
      borderStyle: oneOf(decorative.borderStyle, BORDER_STYLES, d.decorative.borderStyle),
      useIcons: typeof decorative.useIcons === 'boolean' ? decorative.useIcons : d.decorative.useIcons,
    },
  };
}

export function fontStack(font: string): string {
  return FONT_STACKS[oneOf(font, DESIGN_FONTS, 'Inter')];
}

/** Couleurs prêtes à l'emploi, toutes garanties lisibles sur leur fond. */
export interface DesignPalette {
  background: string;
  /** Texte courant (contraste ≥ 7 sur le fond). */
  text: string;
  /** Texte secondaire : dates, entreprises (contraste ≥ 4.5). */
  muted: string;
  /** Couleur dominante utilisable comme texte ou trait sur le fond (contraste ≥ 3). */
  primary: string;
  /** Couleur dominante brute, à utiliser comme aplat. */
  primaryFill: string;
  onPrimary: string;
  /** Texte secondaire sur un aplat de couleur dominante. */
  onPrimaryMuted: string;
  accent: string;
  onAccent: string;
  /** Fond des cartes et encadrés. */
  surface: string;
  border: string;
  isDark: boolean;
}

export function buildPalette(colors: DesignConfig['colors']): DesignPalette {
  const background = normalizeHex(colors.background, DEFAULT_DESIGN.colors.background);
  const primaryFill = normalizeHex(colors.primary, DEFAULT_DESIGN.colors.primary);
  const accent = normalizeHex(colors.accent, DEFAULT_DESIGN.colors.accent);
  const text = ensureContrast(normalizeHex(colors.text, DEFAULT_DESIGN.colors.text), background, 7);
  const onPrimary = readableOn(primaryFill);

  return {
    background,
    text,
    muted: ensureContrast(normalizeHex(colors.secondary, DEFAULT_DESIGN.colors.secondary), background, 4.5),
    primary: ensureContrast(primaryFill, background, 3),
    primaryFill,
    onPrimary,
    onPrimaryMuted: ensureContrast(mix(onPrimary, primaryFill, 0.25), primaryFill, 4.5),
    accent,
    onAccent: readableOn(accent),
    surface: mix(background, text, 0.045),
    border: mix(background, text, 0.16),
    isDark: isDark(background),
  };
}
