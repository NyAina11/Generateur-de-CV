/** Géométrie d'une page A4, partagée entre l'aperçu à l'écran et l'export PDF. */

const MM_TO_PX = 96 / 25.4;

export const PAGE_WIDTH_MM = 210;
export const PAGE_HEIGHT_MM = 297;

/** Dimensions d'une page A4 en pixels CSS (96 dpi). */
export const PAGE_WIDTH_PX = PAGE_WIDTH_MM * MM_TO_PX;
export const PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX;

/** Marge minimale conservée en bas de page avant de passer à la page suivante. */
export const BOTTOM_MARGIN_MM = 6;

/**
 * Marge haute ajoutée à l'impression sur les pages 2 et suivantes (voir `.cv-flow`
 * dans index.css). Doit rester identique à la variable CSS `--cv-next-page-margin`.
 */
export const NEXT_PAGE_MARGIN_MM = 10;

/** Hauteur utile des pages 2 et suivantes. */
export const FOLLOWING_PAGE_MM = PAGE_HEIGHT_MM - NEXT_PAGE_MARGIN_MM;

/** Nombre de pages A4 nécessaires pour une hauteur de contenu donnée (en pixels CSS). */
export function countPages(contentHeightPx: number): number {
  const needed = contentHeightPx / MM_TO_PX + BOTTOM_MARGIN_MM;
  if (!(needed > PAGE_HEIGHT_MM)) return 1;
  return 1 + Math.ceil((needed - PAGE_HEIGHT_MM) / FOLLOWING_PAGE_MM);
}

/** Position verticale (en mm) du saut de page qui précède la page `pageNumber` (≥ 2). */
export function pageBreakOffsetMm(pageNumber: number): number {
  return PAGE_HEIGHT_MM + (pageNumber - 2) * FOLLOWING_PAGE_MM;
}
