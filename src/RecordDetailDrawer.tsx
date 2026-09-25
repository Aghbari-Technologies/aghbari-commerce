import { useEffect, useRef, type ReactNode } from 'react';

export interface RecordDetailField {
  label: string;
  value: ReactNode;
  wide?: boolean;
}

interface RecordDetailDrawerProps {
  eyebrow: string;
  title: string;
  summary?: ReactNode;
  fields: RecordDetailField[];
  onClose: () => void;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function RecordDetailDrawer({
  eyebrow,
  title,
  summary,
  fields,
  onClose,
}: RecordDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    previousActiveRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key !== 'Tab') return;
      const root = drawerRef.current;
      if (!root) return;
      const focusables = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((node) => node.offsetParent !== null);
      if (!focusables.length) { event.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousActiveRef.current?.focus();
    };
  }, []);

  return (
    <div className="record-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        ref={drawerRef}
        className="record-detail-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="record-detail-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h3 id="record-detail-title">{title}</h3>
            {summary && <div className="record-detail-summary">{summary}</div>}
          </div>
          <button ref={closeRef} type="button" className="ghost" aria-label="إغلاق التفاصيل" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="record-detail-fields">
          {fields.map((field) => (
            <div className={field.wide ? 'record-detail-field wide' : 'record-detail-field'} key={field.label}>
              <span>{field.label}</span>
              <strong>{field.value}</strong>
            </div>
          ))}
        </div>

        <div className="record-detail-footer">
          <span>قراءة من السجل التشغيلي الحالي</span>
          <button type="button" onClick={onClose}>إغلاق</button>
        </div>
      </aside>
    </div>
  );
}
