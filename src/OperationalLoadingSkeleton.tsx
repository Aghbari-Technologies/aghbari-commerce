import type { ReactNode } from 'react';

function Block({ className = '' }: { className?: string }) {
  return <i className={'operational-skeleton-block ' + className} aria-hidden="true" />;
}

export default function OperationalLoadingSkeleton({ variant }: { variant: 'inventory' | 'purchasing' }) {
  const cards = variant === 'inventory' ? ['search', 'form', 'form', 'table'] : ['form', 'form', 'table', 'receive'];
  return (
    <div className={'operational-loading-skeleton operational-loading-skeleton-' + variant} role="status" aria-label={variant === 'inventory' ? 'جارٍ تحميل بيانات المخزون' : 'جارٍ تحميل بيانات المشتريات'}>
      <div className="operational-skeleton-metrics">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="operational-skeleton-metric" key={index}>
            <Block className="w-34" />
            <Block className="w-62 h-24" />
            <Block className="w-80" />
          </div>
        ))}
      </div>
      <div className="operational-skeleton-grid">
        {cards.map((card, index) => (
          <article className={'operational-skeleton-card operational-skeleton-card-' + card} key={card + '-' + index}>
            <div className="operational-skeleton-head"><Block className="w-28 h-12" /><Block className="w-16 h-12" /></div>
            <Block className="w-48 h-14" />
            {card === 'table' ? (
              <div className="operational-skeleton-rows">
                {Array.from({ length: 5 }).map((_, row) => (
                  <div key={row}><Block className="w-20" /><Block className="w-52" /><Block className="w-28" /><Block className="w-14 h-28" /></div>
                ))}
              </div>
            ) : card === 'search' ? (
              <><Block className="w-100 h-42" /><Block className="w-58 h-32" /></>
            ) : (
              <><Block className="w-100 h-42" /><Block className="w-76 h-42" /><Block className="w-42 h-36" /></>
            )}
          </article>
        ))}
      </div>
      <span className="operational-loading-skeleton-text">يتم تجهيز مساحة التشغيل…</span>
    </div>
  );
}
