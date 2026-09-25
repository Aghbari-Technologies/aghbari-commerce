import { useEffect, useRef, useState, type ReactNode } from 'react';

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

function copyableText(value: ReactNode) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
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
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
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

  async function copyField(label: string, value: ReactNode) {
    const text = copyableText(value);
    if (!text || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLabel(label);
      window.setTimeout(() => setCopiedLabel((current) => current === label ? null : current), 1400);
    } catch {
      setCopiedLabel(null);
    }
  }

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
          {fields.map((field) => {
            const text = copyableText(field.value);
            return (
              <div className={field.wide ? 'record-detail-field wide' : 'record-detail-field'} key={field.label}>
                <div className="record-detail-field-label"><span>{field.label}</span>{text && <button type="button" className="record-detail-copy" onClick={() => void copyField(field.label, field.value)} aria-label={`نسخ ${field.label}`}>{copiedLabel === field.label ? 'تم النسخ' : 'نسخ'}</button>}</div>
                <strong>{field.value}</strong>
              </div>
            );
          })}
        </div>

        <div className="record-detail-footer">
          <span>قراءة من السجل التشغيلي الحالي</span>
          <button type="button" onClick={onClose}>إغلاق</button>
        </div>
      </aside>
    </div>
  );
}
