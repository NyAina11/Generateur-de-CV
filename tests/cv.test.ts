import { describe, expect, it } from 'vitest';
import { createSampleCV } from '../src/data/sample';
import {
  buildSummaryContext,
  createEmptyCV,
  documentTitle,
  emailHref,
  exportFileName,
  formatPeriod,
  isCVEmpty,
  moveItem,
  parseImportedCV,
  phoneHref,
  sanitizeCVData,
  serializeCV,
  splitInterests,
  websiteHref,
} from '../src/lib/cv';
import { countPages, pageBreakOffsetMm, PAGE_HEIGHT_PX } from '../src/lib/page';

describe('sanitizeCVData', () => {
  it('rejette ce qui ne ressemble pas à un CV', () => {
    for (const value of [null, 'x', 12, [], {}, { hello: 1 }]) {
      expect(sanitizeCVData(value)).toBeNull();
    }
  });

  it('laisse intact un CV valide (aller-retour)', () => {
    const cv = createSampleCV();
    expect(sanitizeCVData(JSON.parse(JSON.stringify(cv)))).toEqual(cv);
  });

  it('migre un CV enregistré par une ancienne version', () => {
    const legacy = {
      personal: { fullName: 'Ada', jobTitle: 'Dev', email: '', phone: '', location: '', website: '', summary: '' },
      experience: [{ id: 'a', company: 'X', role: 'Y', startDate: '2020', endDate: '2021', current: false, description: '' }],
      education: [],
      skills: [{ id: 's', name: 'JS', level: 9 }],
      themeColor: '#2563eb',
      templateId: 'modern',
    };
    const cv = sanitizeCVData(legacy)!;
    expect(cv.languages).toEqual([]);
    expect(cv.interests).toBe('');
    expect(cv.personal.photo).toBe('');
    expect(cv.skills[0].level).toBe(5);
  });

  it('écarte les valeurs invalides', () => {
    const cv = sanitizeCVData({
      personal: { fullName: 42, photo: 'https://example.com/tracker.png' },
      experience: [null, 'x', { role: 'Dev', current: 'yes' }],
      skills: [
        { name: 'A', level: 'abc' },
        { name: 'B', level: -3 },
      ],
      themeColor: 'javascript:alert(1)',
      templateId: 'unique',
    })!;
    expect(cv.personal.fullName).toBe('');
    expect(cv.personal.photo).toBe('');
    expect(cv.experience).toHaveLength(1);
    expect(cv.experience[0].current).toBe(false);
    expect(cv.experience[0].id).toBeTruthy();
    expect(cv.skills.map((s) => s.level)).toEqual([3, 1]);
    expect(cv.themeColor).toBe('#2563eb');
    // Modèle « unique » sans design valide : retour au modèle par défaut.
    expect(cv.templateId).toBe('modern');
    expect(cv.designConfig).toBeUndefined();
  });

  it('accepte une photo en data URL', () => {
    const photo = 'data:image/jpeg;base64,/9j/4AAQ';
    expect(sanitizeCVData({ personal: { photo } })!.personal.photo).toBe(photo);
  });
});

describe('import / export', () => {
  it('relit un fichier exporté', () => {
    const cv = createSampleCV();
    expect(parseImportedCV(serializeCV(cv))).toEqual(cv);
  });

  it('refuse un JSON invalide ou étranger', () => {
    expect(parseImportedCV('pas du json')).toBeNull();
    expect(parseImportedCV('{"hello":1}')).toBeNull();
    expect(parseImportedCV('[]')).toBeNull();
  });

  it('nomme le fichier d’après la personne', () => {
    const cv = createEmptyCV();
    expect(exportFileName(cv)).toBe('cv-sans-nom.json');
    cv.personal.fullName = '  Zoé  Éléonore d’Arçy ';
    expect(exportFileName(cv)).toBe('cv-zoe-eleonore-d-arcy.json');
  });
});

describe('utilitaires', () => {
  it('isCVEmpty', () => {
    expect(isCVEmpty(createEmptyCV())).toBe(true);
    expect(isCVEmpty(createSampleCV())).toBe(false);
    expect(isCVEmpty({ ...createEmptyCV(), interests: 'Lecture' })).toBe(false);
  });

  it('formatPeriod', () => {
    expect(formatPeriod({ startDate: '2019', endDate: '2021', current: false })).toBe('2019 – 2021');
    expect(formatPeriod({ startDate: '2021', endDate: '2023', current: true })).toBe('2021 – Présent');
    expect(formatPeriod({ startDate: ' 2020 ', endDate: '', current: false })).toBe('2020');
    expect(formatPeriod({ startDate: '', endDate: '', current: false })).toBe('');
  });

  it('splitInterests', () => {
    expect(splitInterests(' Lecture, basket ;  \n cuisine,, ')).toEqual(['Lecture', 'basket', 'cuisine']);
    expect(splitInterests('')).toEqual([]);
  });

  it('websiteHref n’autorise que des URL http(s)', () => {
    expect(websiteHref('linkedin.com/in/ada')).toBe('https://linkedin.com/in/ada');
    expect(websiteHref('http://exemple.fr')).toBe('http://exemple.fr/');
    expect(websiteHref('javascript:alert(1)')).toBeNull();
    expect(websiteHref('data:text/html,<script>')).toBeNull();
    expect(websiteHref('mon site perso')).toBeNull();
    expect(websiteHref('localhost')).toBeNull();
    expect(websiteHref('')).toBeNull();
  });

  it('emailHref / phoneHref', () => {
    expect(emailHref(' ada@exemple.fr ')).toBe('mailto:ada@exemple.fr');
    expect(emailHref('pas un mail')).toBeNull();
    expect(phoneHref('+33 6 12 34 56 78')).toBe('tel:+33612345678');
    expect(phoneHref('n/a')).toBeNull();
  });

  it('documentTitle', () => {
    expect(documentTitle(createEmptyCV())).toContain('CV Forge AI');
    expect(documentTitle(createSampleCV())).toBe('CV Camille Durand');
  });

  it('buildSummaryContext reprend le contenu du CV', () => {
    const context = buildSummaryContext(createSampleCV());
    expect(context).toContain('Compétences : Gestion de projet agile');
    expect(context).toContain('Cheffe de projet digital chez Maison Lumière (2021 – Présent)');
    expect(context).toContain('Langues : Français (Langue maternelle)');
    expect(buildSummaryContext(createEmptyCV())).toBe('');
  });

  it('moveItem', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 2, -1)).toEqual(['a', 'c', 'b']);
    const list = ['a', 'b'];
    expect(moveItem(list, 0, -1)).toBe(list);
    expect(moveItem(list, 1, 1)).toBe(list);
  });
});

describe('pagination A4', () => {
  it('compte les pages nécessaires', () => {
    expect(countPages(0)).toBe(1);
    expect(countPages(PAGE_HEIGHT_PX * 0.9)).toBe(1);
    // Le contenu touche presque le bas de la feuille : la marge basse impose une 2e page.
    expect(countPages(PAGE_HEIGHT_PX - 5)).toBe(2);
    expect(countPages(PAGE_HEIGHT_PX * 1.5)).toBe(2);
    expect(countPages(PAGE_HEIGHT_PX * 2.2)).toBe(3);
  });

  it('place les sauts de page', () => {
    expect(pageBreakOffsetMm(2)).toBe(297);
    expect(pageBreakOffsetMm(3)).toBe(584);
  });
});
