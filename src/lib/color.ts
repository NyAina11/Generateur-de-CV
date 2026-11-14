/**
 * Utilitaires de couleur : normalisation hexadécimale et contraste WCAG.
 * Ils garantissent qu'un design (thème choisi ou généré par l'IA) reste lisible.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const DARK_INK = '#0f172a';
const LIGHT_INK = '#ffffff';

const clamp = (value: number, min = 0, max = 255) => Math.min(max, Math.max(min, value));

/** Convertit « #abc », « abc », « #aabbcc » ou « #aabbccdd » en composantes RGB. */
export function parseHex(input: unknown): RGB | null {
  if (typeof input !== 'string') return null;
  let hex = input.trim().replace(/^#/, '');
  if (!/^[0-9a-f]+$/i.test(hex)) return null;
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map((char) => char + char)
      .join('');
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  } else if (hex.length !== 6) {
    return null;
  }
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

export function toHex({ r, g, b }: RGB): string {
  const part = (value: number) => Math.round(clamp(value)).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Renvoie la couleur au format « #rrggbb », ou `fallback` si elle est invalide. */
export function normalizeHex(input: unknown, fallback: string): string {
  const rgb = parseHex(input);
  return rgb ? toHex(rgb) : fallback;
}

export function isValidHex(input: unknown): boolean {
  return parseHex(input) !== null;
}

/** Luminance relative WCAG 2.x (0 = noir, 1 = blanc). */
export function luminance(color: string): number {
  const rgb = parseHex(color) ?? { r: 0, g: 0, b: 0 };
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

/** Ratio de contraste WCAG entre deux couleurs (de 1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function isDark(color: string): boolean {
  return contrastRatio(color, LIGHT_INK) >= contrastRatio(color, DARK_INK);
}

/** Couleur de texte (claire ou foncée) la plus lisible sur le fond donné. */
export function readableOn(background: string, light = LIGHT_INK, dark = DARK_INK): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

/** Mélange linéaire : `weight` = 0 renvoie `a`, 1 renvoie `b`. */
export function mix(a: string, b: string, weight: number): string {
  const ca = parseHex(a) ?? { r: 0, g: 0, b: 0 };
  const cb = parseHex(b) ?? { r: 0, g: 0, b: 0 };
  const w = Math.min(1, Math.max(0, weight));
  return toHex({
    r: ca.r + (cb.r - ca.r) * w,
    g: ca.g + (cb.g - ca.g) * w,
    b: ca.b + (cb.b - ca.b) * w,
  });
}

export function withAlpha(color: string, alpha: number): string {
  const rgb = parseHex(color) ?? { r: 0, g: 0, b: 0 };
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.min(1, Math.max(0, alpha))})`;
}

/**
 * Ajuste `foreground` jusqu'à atteindre le contraste minimal sur `background`,
 * en le rapprochant progressivement du noir ou du blanc. La teinte d'origine est
 * conservée autant que possible.
 */
export function ensureContrast(foreground: string, background: string, minRatio = 4.5): string {
  if (contrastRatio(foreground, background) >= minRatio) return foreground;
  const target = readableOn(background, LIGHT_INK, '#000000');
  for (let step = 1; step <= 10; step += 1) {
    const candidate = mix(foreground, target, step / 10);
    if (contrastRatio(candidate, background) >= minRatio) return candidate;
  }
  return target;
}
