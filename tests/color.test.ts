import { describe, expect, it } from 'vitest';
import { contrastRatio, ensureContrast, isValidHex, mix, normalizeHex, parseHex, readableOn, withAlpha } from '../src/lib/color';

describe('parseHex / normalizeHex', () => {
  it('accepte les formats courts, longs et avec alpha', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(parseHex('1E293B')).toEqual({ r: 30, g: 41, b: 59 });
    expect(normalizeHex('#ABCDEF80', '#000000')).toBe('#abcdef');
    expect(normalizeHex('#abc', '#000000')).toBe('#aabbcc');
  });

  it('remplace les valeurs invalides par la couleur de repli', () => {
    for (const value of ['red', 'rgb(0,0,0)', '#12', '#12345', '', null, undefined, 42, 'url(javascript:1)']) {
      expect(normalizeHex(value, '#123456')).toBe('#123456');
      expect(isValidHex(value)).toBe(false);
    }
  });
});

describe('contraste', () => {
  it('calcule le ratio WCAG', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it('choisit un texte lisible selon le fond', () => {
    expect(readableOn('#1e3a5f')).toBe('#ffffff');
    expect(readableOn('#fde047')).toBe('#0f172a');
  });

  it('ensureContrast conserve une couleur déjà lisible', () => {
    expect(ensureContrast('#1f2937', '#ffffff', 7)).toBe('#1f2937');
  });

  it('ensureContrast corrige un texte illisible, sur fond clair comme sur fond sombre', () => {
    const onLight = ensureContrast('#eeeeee', '#ffffff', 7);
    expect(contrastRatio(onLight, '#ffffff')).toBeGreaterThanOrEqual(7);

    const onDark = ensureContrast('#222222', '#0b1220', 7);
    expect(contrastRatio(onDark, '#0b1220')).toBeGreaterThanOrEqual(7);

    const yellow = ensureContrast('#fde047', '#ffffff', 4.5);
    expect(contrastRatio(yellow, '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });
});

describe('mix / withAlpha', () => {
  it('mélange deux couleurs', () => {
    expect(mix('#000000', '#ffffff', 0)).toBe('#000000');
    expect(mix('#000000', '#ffffff', 1)).toBe('#ffffff');
    expect(mix('#000000', '#ffffff', 0.5)).toBe('#808080');
  });

  it('produit une couleur rgba', () => {
    expect(withAlpha('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });
});
