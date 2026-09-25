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

export default function RecordDetailDrawer({
  eyebrow,
  title,
  summary,
  fields,
  onClose,
}: RecordDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <div className="record-detail-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
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
