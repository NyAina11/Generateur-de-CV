import { useLayoutEffect, useRef, useState } from 'react';
import { PAGE_HEIGHT_PX, PAGE_WIDTH_PX } from '../lib/page';
import { CVData } from '../types';
import Preview from './Preview';

/** Espace laissé autour de la feuille, en pixels. */
const GUTTER = 16;

interface PreviewPaneProps {
  data: CVData;
  className?: string;
}

/**
 * Zone d'aperçu : la feuille A4 est réduite pour tenir dans la largeur disponible
 * (téléphone, tablette, petit écran) sans jamais être agrandie au-delà de 100 %.
 */
export default function PreviewPane({ data, className = '' }: PreviewPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageHeight, setPageHeight] = useState(PAGE_HEIGHT_PX);
  const [pages, setPages] = useState(1);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page || typeof ResizeObserver === 'undefined') return;

    const update = () => {
      const available = container.clientWidth - GUTTER * 2;
      // Largeur nulle = panneau masqué (onglet « Éditer » sur mobile) : on garde l'échelle.
      if (available > 0) setScale(Math.min(1, available / PAGE_WIDTH_PX));
      setPageHeight(page.offsetHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(page);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`cv-desk custom-scrollbar ${className}`}>
      <div className="cv-sizer" style={{ width: PAGE_WIDTH_PX * scale, height: pageHeight * scale }}>
        <div className="cv-scaler" style={{ transform: `scale(${scale})` }}>
          <Preview data={data} pageRef={pageRef} onPageCountChange={setPages} />
        </div>
      </div>
      <p className="cv-desk-note print:hidden" aria-live="polite">
        {pages > 1 ? `Votre CV tient sur ${pages} pages A4. Les pointillés indiquent les sauts de page.` : 'Format A4, 1 page'}
      </p>
    </div>
  );
}
