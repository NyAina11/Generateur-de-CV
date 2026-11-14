import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import Preview from '../src/components/Preview';
import { createSampleCV } from '../src/data/sample';
import { createEmptyCV } from '../src/lib/cv';
import { DEFAULT_DESIGN } from '../src/lib/design';
import { CVData, DesignConfig, TemplateId } from '../src/types';

const render = (data: CVData) => renderToStaticMarkup(<Preview data={data} />);

const LAYOUTS: DesignConfig['layout'][] = ['sidebar-left', 'sidebar-right', 'single-column', 'minimal-grid', 'asymmetric'];
const HEADER_STYLES: DesignConfig['header']['style'][] = ['clean', 'banner', 'floating-box', 'underlined'];
const SECTION_STYLES: DesignConfig['sections']['style'][] = ['clean', 'cards', 'left-border', 'timeline'];
const TITLE_STYLES: DesignConfig['sections']['titleStyle'][] = ['simple', 'uppercase-bold', 'underlined', 'highlighted', 'bracketed'];
const SHAPES: DesignConfig['decorative']['shape'][] = ['none', 'dots', 'geometric', 'waves', 'tech-lines'];

describe('modèles prédéfinis', () => {
  for (const templateId of ['modern', 'classic', 'elegant'] as TemplateId[]) {
    it(`${templateId} : affiche tout le contenu du CV`, () => {
      const html = render({ ...createSampleCV(), templateId });
      for (const text of [
        'Camille Durand',
        'Cheffe de projet digital',
        'Maison Lumière',
        '2021 – Présent',
        'Master Marketing digital',
        'UX design',
        'Anglais',
        'photographie',
      ]) {
        expect(html).toContain(text);
      }
      expect(html).toContain('href="mailto:camille.durand@example.com"');
      expect(html).toContain('href="https://linkedin.com/in/camille-durand"');
    });

    it(`${templateId} : CV vide sans erreur, avec textes d’attente`, () => {
      const html = render({ ...createEmptyCV(), templateId });
      expect(html).toContain('Votre nom');
      expect(html).toContain('Titre du poste');
      expect(html).not.toContain('undefined');
      expect(html).not.toContain('[object Object]');
    });
  }

  it('n’affiche pas les entrées laissées vides', () => {
    const cv = createEmptyCV();
    cv.experience = [{ id: '1', role: '', company: '', startDate: '', endDate: '', current: false, description: '' }];
    cv.skills = [{ id: '2', name: '  ', level: 3 }];
    const html = render(cv);
    expect(html).not.toContain('Expérience professionnelle');
    expect(html).not.toContain('Compétences');
  });

  it('échappe le contenu saisi (pas d’injection HTML)', () => {
    const cv = createSampleCV();
    cv.personal.fullName = '<img src=x onerror=alert(1)>';
    expect(render(cv)).not.toContain('<img src=x');
  });
});

describe('modèle généré par l’IA', () => {
  it('rend toutes les combinaisons de disposition et de styles', () => {
    let count = 0;
    for (const layout of LAYOUTS) {
      for (const [index, style] of HEADER_STYLES.entries()) {
        const designConfig: DesignConfig = {
          ...DEFAULT_DESIGN,
          layout,
          header: { alignment: (['left', 'center', 'right'] as const)[index % 3], style, nameSize: index % 2 ? 'huge' : 'normal' },
          sections: { style: SECTION_STYLES[index], titleStyle: TITLE_STYLES[(index + count) % TITLE_STYLES.length], spacing: 'normal' },
          decorative: {
            shape: SHAPES[(index + count) % SHAPES.length],
            borderStyle: index % 2 ? 'double' : 'none',
            useIcons: index % 2 === 0,
          },
        };
        const html = render({ ...createSampleCV(), templateId: 'unique', designConfig });
        expect(html).toContain('Camille Durand');
        expect(html).toContain('Maison Lumière');
        expect(html).toContain('Anglais');
        expect(html).not.toContain('[object Object]');
        expect(html).not.toContain('undefined');
        count += 1;
      }
    }
    expect(count).toBe(20);
  });

  it('utilise un design par défaut si la configuration est absente ou corrompue', () => {
    const cv = createSampleCV();
    expect(render({ ...cv, templateId: 'unique', designConfig: undefined })).toContain('Camille Durand');
    const broken = { layout: 'nope', colors: 'x' } as unknown as DesignConfig;
    expect(render({ ...cv, templateId: 'unique', designConfig: broken })).toContain('Camille Durand');
  });

  it('reste lisible en mode sombre : le texte n’est jamais de la couleur du fond', () => {
    const designConfig: DesignConfig = {
      ...DEFAULT_DESIGN,
      layout: 'asymmetric',
      header: { alignment: 'left', style: 'floating-box', nameSize: 'large' },
      colors: { primary: '#f97316', secondary: '#a8a29e', background: '#1c1917', text: '#1c1917', accent: '#fdba74' },
    };
    const html = render({ ...createSampleCV(), templateId: 'unique', designConfig });
    // Le texte courant demandé (#1c1917) est identique au fond : il doit avoir été corrigé.
    expect(html).not.toMatch(/style="color:#1c1917/);
  });
});
