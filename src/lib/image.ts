const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Ce fichier n'est pas une image lisible."));
    image.src = src;
  });
}

/**
 * Redimensionne et compresse une photo avant de l'intégrer au CV. Une photo de
 * téléphone pèse plusieurs Mo : sans cela, la sauvegarde locale échouerait et le
 * PDF serait inutilement lourd.
 */
export async function fileToCompressedDataUrl(file: File, maxSize = 640, quality = 0.86): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choisissez un fichier image (JPG, PNG ou WebP).');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Cette image est trop lourde (20 Mo maximum).');
  }

  const source = await readAsDataUrl(file);
  const image = await loadImage(source);
  const ratio = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return source;

  // Fond blanc : le JPEG ne gère pas la transparence des PNG.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
