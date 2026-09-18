import { filterCommandActions } from './domain/commandPalette';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';

export type CommandPaletteAction = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string[];
  icon?: ReactNode;
  onSelect: () => void;
};

export default function CommandPalette({
  open,
  onClose,
  actions,
  title = 'أوامر الأغبري',
}: {
  open: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
  title?: string;
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const filtered = useMemo(() => filterCommandActions(actions, query), [actions, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  if (!open) return null;
  const handleCommandKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!filtered.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const action = filtered[activeIndex];
      if (action) { action.onSelect(); onClose(); }
    }
  };

  return (
    <div className="command-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="command-head">
          <div>
            <span className="eyebrow">الأغبري</span>
            <h2>{title}</h2>
          </div>
          <button type="button" className="command-close" onClick={onClose} aria-label="إغلاق">
            ×
          </button>
        </div>
        <label className="command-search">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن إجراء…"
            aria-label="البحث في الأوامر"
            onKeyDown={handleCommandKeyDown}
          />
          <kbd>Esc</kbd>
        </label>
        <div className="command-list" role="menu">
          {filtered.length ? (
            filtered.map((action, index) => (
              <button
                type="button"
                role="menuitem"
                className={`command-item ${index === activeIndex ? 'active' : ''}`}
                key={action.id}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => {
                  action.onSelect();
                  onClose();
                }}
              >
                <span className="command-icon" aria-hidden="true">{action.icon ?? '↗'}</span>
                <span className="command-copy">
                  <strong>{action.label}</strong>
                  {action.hint && <small>{action.hint}</small>}
                </span>
                <span className="command-arrow" aria-hidden="true">←</span>
              </button>
            ))
          ) : (
            <div className="command-empty">لا توجد أوامر مطابقة. جرّب كلمة أخرى.</div>
          )}
        </div>
      </section>
    </div>
  );
}
