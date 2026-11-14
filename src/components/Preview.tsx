import { useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { PAGE_HEIGHT_MM, PAGE_WIDTH_MM, countPages, pageBreakOffsetMm } from '../lib/page';
import { CVData } from '../types';
import { ClassicTemplate, classicBackground } from './templates/ClassicTemplate';
import { ElegantTemplate, elegantBackground } from './templates/ElegantTemplate';
import { ModernTemplate, modernBackground } from './templates/ModernTemplate';
import { UniqueDecor, UniqueTemplate, uniqueBackground } from './templates/UniqueTemplate';

interface PreviewProps {
  data: CVData;
  /** Référence vers la page, utilisée par le panneau d'aperçu pour la mise à l'échelle. */
  pageRef?: Ref<HTMLDivElement>;
  /** Appelé quand le nombre de pages A4 nécessaires change. */
  onPageCountChange?: (pages: number) => void;
}

interface TemplateParts {
  content: ReactNode;
  background: string;
  decor?: ReactNode;
}

function templateParts(data: CVData): TemplateParts {
  switch (data.templateId) {
    case 'classic':
      return { content: <ClassicTemplate data={data} />, background: classicBackground() };
    case 'elegant':
      return { content: <ElegantTemplate data={data} />, background: elegantBackground(data) };
    case 'unique':
      return { content: <UniqueTemplate data={data} />, background: uniqueBackground(data), decor: <UniqueDecor data={data} /> };
    case 'modern':
    default:
      return { content: <ModernTemplate data={data} />, background: modernBackground() };
  }
}

/**
 * Feuille A4 du CV. Le fond (aplats, barre latérale) est peint par la feuille
 * elle-même et sa hauteur est toujours un nombre entier de pages : un CV de deux
 * pages garde ainsi ses couleurs jusqu'en bas de la dernière page imprimée.
 */
export default function Preview({ data, pageRef, onPageCountChange }: PreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const { content, background, decor } = templateParts(data);

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      setPages(countPages(element.offsetHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    onPageCountChange?.(pages);
  }, [pages, onPageCountChange]);

  // À l'impression, le fond du CV est aussi appliqué au document entier : chaque page
  // du PDF est ainsi colorée bord à bord, même la dernière si elle n'est pas remplie.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--cv-print-background', background);
    return () => {
      root.style.removeProperty('--cv-print-background');
    };
  }, [background]);

  return (
    <div
      id="cv-preview"
      ref={pageRef}
      className="cv-page"
      // 1 px de moins qu'un multiple exact de 297 mm : évite une page blanche due aux arrondis.
      style={{ width: `${PAGE_WIDTH_MM}mm`, minHeight: `calc(${pages * PAGE_HEIGHT_MM}mm - 1px)`, background }}
    >
      {decor && (
        <div className="cv-decor" aria-hidden="true">
          {decor}
        </div>
      )}
      <div className="cv-flow">
        <div className="cv-flow-head" aria-hidden="true">
          <div />
        </div>
        <div className="cv-flow-body">
          <div ref={contentRef} className="cv-flow-content">
            {content}
          </div>
        </div>
      </div>
      {Array.from({ length: pages - 1 }, (_, index) => (
        <div key={index} className="cv-page-break" style={{ top: `${pageBreakOffsetMm(index + 2)}mm` }} aria-hidden="true">
          <span>Page {index + 2}</span>
        </div>
      ))}
    </div>
  );
}
