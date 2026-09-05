export type OptimizedImage = { blob: Blob; width: number; height: number; mimeType: 'image/webp'; byteSize: number };

export async function optimizeProductImage(file: File, maxDimension = 1600, quality = 0.82): Promise<OptimizedImage> {
  if (!file.type.startsWith('image/')) throw new Error('INVALID_IMAGE_TYPE');
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('IMAGE_CANVAS_UNAVAILABLE');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('IMAGE_ENCODE_FAILED')), 'image/webp', quality));
  return { blob, width, height, mimeType: 'image/webp', byteSize: blob.size };
}
