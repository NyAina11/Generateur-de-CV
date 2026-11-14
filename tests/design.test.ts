import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../src/lib/color';
import { DEFAULT_DESIGN, buildPalette, fontStack, sanitizeDesignConfig } from '../src/lib/design';

describe('sanitizeDesignConfig', () => {
  it('rejette ce qui n’est pas un objet', () => {
    for (const value of [null, undefined, 'x', 3, [], true]) {
      expect(sanitizeDesignConfig(value)).toBeNull();
    }
  });

  it('complète un objet vide avec les valeurs par défaut', () => {
    expect(sanitizeDesignConfig({})).toEqual(DEFAULT_DESIGN);
  });

  it('conserve une configuration valide', () => {
    const config = {
      layout: 'asymmetric',
      header: { alignment: 'center', style: 'banner', nameSize: 'huge' },
      sections: { style: 'cards', titleStyle: 'bracketed', spacing: 'spacious' },
      colors: { primary: '#7c3aed', secondary: '#52525b', background: '#ffffff', text: '#18181b', accent: '#f59e0b' },
      fonts: { heading: 'Playfair Display', body: 'Lato' },
      decorative: { shape: 'waves', borderStyle: 'double', useIcons: false },
    };
    expect(sanitizeDesignConfig(config)).toEqual(config);
  });

  it('neutralise les valeurs inconnues ou dangereuses', () => {
    const result = sanitizeDesignConfig({
      layout: 'hologram',
      header: { alignment: 'top', style: 'banner', nameSize: 12 },
      sections: 'oops',
      colors: { primary: 'red; background:url(x)', background: '#FFF', text: null },
      fonts: { heading: 'Comic Sans MS', body: "Inter'; color: red" },
      decorative: { shape: 'waves', borderStyle: 'groove', useIcons: 'yes' },
    });
    expect(result).not.toBeNull();
    expect(result!.layout).toBe(DEFAULT_DESIGN.layout);
    expect(result!.header).toEqual({ alignment: 'left', style: 'banner', nameSize: 'large' });
    expect(result!.sections).toEqual(DEFAULT_DESIGN.sections);
    expect(result!.colors.primary).toBe(DEFAULT_DESIGN.colors.primary);
    expect(result!.colors.background).toBe('#ffffff');
    expect(result!.colors.text).toBe(DEFAULT_DESIGN.colors.text);
    expect(result!.fonts).toEqual({ heading: 'Inter', body: 'Inter' });
    expect(result!.decorative).toEqual({ shape: 'waves', borderStyle: 'none', useIcons: true });
  });
});

describe('buildPalette', () => {
  const palettes = {
    clair: { primary: '#1e3a5f', secondary: '#64748b', background: '#ffffff', text: '#1f2937', accent: '#93c5fd' },
    sombre: { primary: '#22d3ee', secondary: '#94a3b8', background: '#0b1220', text: '#e2e8f0', accent: '#334155' },
    'illisible (texte clair sur fond clair)': {
      primary: '#fde047',
      secondary: '#e5e7eb',
      background: '#ffffff',
      text: '#eeeeee',
      accent: '#fef9c3',
    },
    'illisible (tout noir)': { primary: '#000000', secondary: '#111111', background: '#000000', text: '#050505', accent: '#000000' },
  };

  for (const [name, colors] of Object.entries(palettes)) {
    it(`garantit des textes lisibles : ${name}`, () => {
      const p = buildPalette(colors);
      expect(contrastRatio(p.text, p.background)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.muted, p.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.primary, p.background)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.onPrimary, p.primaryFill)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onPrimaryMuted, p.primaryFill)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
    });
  }

  it('détecte les fonds sombres', () => {
    expect(buildPalette(palettes.sombre).isDark).toBe(true);
    expect(buildPalette(palettes.clair).isDark).toBe(false);
  });
});

describe('fontStack', () => {
  it('renvoie une pile de polices avec repli', () => {
    expect(fontStack('Roboto Mono')).toContain('monospace');
    expect(fontStack('Merriweather')).toContain('serif');
  });

  it('se replie sur Inter pour une police inconnue', () => {
    expect(fontStack('Papyrus')).toContain("'Inter'");
  });
});
