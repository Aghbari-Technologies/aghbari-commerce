import type { OrderTemplate } from './services/orderTemplates';

export type TemplateViewSort = 'updated' | 'name' | 'largest' | 'smallest';

export function filterAndSortTemplates(
  templates: readonly OrderTemplate[],
  query: string,
  sort: TemplateViewSort,
): OrderTemplate[] {
  const needle = query.trim().toLocaleLowerCase();
  return [...templates]
    .filter((template) => {
      if (!needle) return true;
      const haystack = [
        template.name,
        template.branchLabel,
        ...template.lines.flatMap((line) => [line.name, line.sku]),
      ].join(' ').toLocaleLowerCase();
      return haystack.includes(needle);
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sort === 'largest') return b.lines.length - a.lines.length || b.updatedAt.localeCompare(a.updatedAt);
      if (sort === 'smallest') return a.lines.length - b.lines.length || b.updatedAt.localeCompare(a.updatedAt);
      return b.updatedAt.localeCompare(a.updatedAt);
    });
}

export function paginateTemplates(
  templates: readonly OrderTemplate[],
  page: number,
  pageSize: number,
): { page: number; pages: number; items: OrderTemplate[] } {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const pages = Math.max(1, Math.ceil(templates.length / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), pages);
  return {
    page: safePage,
    pages,
    items: templates.slice((safePage - 1) * safePageSize, safePage * safePageSize),
  };
}
