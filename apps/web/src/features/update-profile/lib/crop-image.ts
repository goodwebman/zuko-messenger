import type { Area } from 'react-easy-crop';

/** Аватар везде показывается не крупнее 80px — 512 хватает с запасом под retina. */
const OUTPUT_SIZE = 512;
const OUTPUT_TYPE = 'image/jpeg';
const OUTPUT_QUALITY = 0.9;
/** Подложка под прозрачные PNG: JPEG альфу не хранит, иначе фон станет чёрным. */
const MATTE_COLOR = '#121317';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image), { once: true });
    image.addEventListener('error', () => reject(new Error('Не удалось прочитать изображение')), {
      once: true,
    });
    image.src = src;
  });
}

/**
 * Вырезает выбранную область в квадрат фиксированного размера и отдаёт готовый
 * к заливке File. `area` — croppedAreaPixels из react-easy-crop: координаты уже
 * в пикселях исходника, поэтому идут в drawImage как есть.
 *
 * @throws Error с текстом для пользователя — вызывающий показывает его как есть
 */
export async function cropImageToFile(
  src: string,
  area: Area,
  fileName = 'avatar.jpg',
): Promise<File> {
  const image = await loadImage(src);

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Браузер не поддерживает обработку изображений');

  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = MATTE_COLOR;
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  // Клампим область: округления в кроппере могут дать пиксель за границей исходника.
  const sx = Math.max(0, Math.round(area.x));
  const sy = Math.max(0, Math.round(area.y));
  const sw = Math.min(Math.round(area.width), image.naturalWidth - sx);
  const sh = Math.min(Math.round(area.height), image.naturalHeight - sy);
  if (sw <= 0 || sh <= 0) throw new Error('Не удалось обрезать изображение');

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY);
  });
  if (!blob) throw new Error('Не удалось обработать изображение');

  return new File([blob], fileName, { type: OUTPUT_TYPE });
}
