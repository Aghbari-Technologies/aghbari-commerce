import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read=(file:string)=>readFileSync(resolve(process.cwd(),file),'utf8');

describe('record detail loading contract',()=>{
  it('supports a structural loading surface in the shared detail drawer',()=>{
    const source=read('src/RecordDetailDrawer.tsx');
    expect(source).toContain('loading?: boolean');
    expect(source).toContain('record-detail-loading-surface');
    expect(source).toContain('aria-label={loadingLabel}');
  });
  it('binds the admin order detail async state to the shared drawer',()=>{
    const source=read('src/AdminPanel.tsx');
    expect(source).toContain('loading={detailOrderLoading}');
    expect(source).toContain('loadingLabel="جارٍ تحميل تفاصيل الطلب"');
  });
  it('keeps the visual contract in the shared operations stylesheet',()=>{
    expect(read('src/operations.css')).toContain('.record-detail-loading-surface');
  });
});
