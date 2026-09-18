import { filterCommandActions } from './domain/commandPalette';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

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

  if (!open) return null;

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
          />
          <kbd>Esc</kbd>
        </label>
        <div className="command-list" role="menu">
          {filtered.length ? (
            filtered.map((action) => (
              <button
                type="button"
                role="menuitem"
                className="command-item"
                key={action.id}
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
