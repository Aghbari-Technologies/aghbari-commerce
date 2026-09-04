import { describe, expect, it } from 'vitest';
import { validateImageFile } from './imagePipeline';

describe('product image pipeline validation', () => {
  it('accepts supported image MIME types within the source size limit', () => {
    expect(() => validateImageFile(new File(['x'], 'product.png', { type: 'image/png' }))).not.toThrow();
    expect(() => validateImageFile(new File(['x'], 'product.webp', { type: 'image/webp' }))).not.toThrow();
  });

  it('rejects non-image uploads', () => {
    expect(() => validateImageFile(new File(['x'], 'payload.svg', { type: 'image/svg+xml' })))
      .toThrow('صيغة الصورة غير مدعومة');
    expect(() => validateImageFile(new File(['x'], 'data.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })))
      .toThrow('صيغة الصورة غير مدعومة');
  });

  it('rejects an oversized source image before processing', () => {
    const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' });
    expect(() => validateImageFile(oversized)).toThrow('10 MB');
  });
});
