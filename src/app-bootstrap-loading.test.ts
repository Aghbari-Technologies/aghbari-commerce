import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read=(file:string)=>readFileSync(resolve(process.cwd(),file),'utf8');

describe('application bootstrap loading contract',()=>{
  it('uses the shared structural skeleton at app and admin startup',()=>{
    const source=read('src/AppV3Fixed.tsx');
    expect(source).toContain('<OperationalLoadingSkeleton variant="app" />');
    expect(source).not.toContain('جارٍ تجهيز بوابة الأغبري…');
    expect(source).not.toContain('جارٍ تحميل مركز الإدارة…');
  });
  it('defines a responsive app bootstrap skeleton in the shared component',()=>{
    expect(read('src/OperationalLoadingSkeleton.tsx')).toContain("variant: 'inventory' | 'purchasing' | 'collection' | 'app'");
    expect(read('src/operational-loading-skeleton.css')).toContain('.operational-loading-skeleton-app');
  });
});
