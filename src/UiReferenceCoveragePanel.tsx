import { UI_REFERENCE_PACKS, UI_REFERENCE_TOTAL, type UiReferencePackStatus } from './structure/ui-reference-packs';

const STATUS_LABEL: Record<UiReferencePackStatus, string> = {
  live: 'حي',
  mixed: 'مختلط',
  boundary: 'حد نطاق',
};

export default function UiReferenceCoveragePanel() {
  const live = UI_REFERENCE_PACKS.filter((pack) => pack.status === 'live').reduce((sum, pack) => sum + pack.references.length, 0);
  const boundary = UI_REFERENCE_PACKS.filter((pack) => pack.status === 'boundary').reduce((sum, pack) => sum + pack.references.length, 0);
  const mixed = UI_REFERENCE_TOTAL - live - boundary;

  return (
    <section className="ui-reference-coverage" id="admin-ui-reference" aria-labelledby="ui-reference-title">
      <header className="ui-reference-coverage-head">
        <div>
          <span className="eyebrow">P0 · Visual Reference Coverage</span>
          <h2 id="ui-reference-title">حزمة المراجع البصرية للأغبري</h2>
          <p>كل مرجع حالي مربوط بحزمة تنفيذ واحدة؛ الحزم غير المتعاقدة تظهر كحدود نطاق بدل واجهات وهمية.</p>
        </div>
        <div className="ui-reference-coverage-total">
          <strong>{UI_REFERENCE_TOTAL}</strong>
          <span>مرجعًا</span>
        </div>
      </header>

      <div className="ui-reference-coverage-metrics" aria-label="حالة التغطية">
        <article><strong>{UI_REFERENCE_PACKS.length}</strong><span>حزم تنفيذ</span></article>
        <article className="is-live"><strong>{live}</strong><span>مرجع حي</span></article>
        <article className="is-mixed"><strong>{mixed}</strong><span>مرجع بحالة مختلطة</span></article>
        <article className="is-boundary"><strong>{boundary}</strong><span>مرجع ضمن Boundary</span></article>
      </div>

      <div className="ui-reference-pack-grid">
        {UI_REFERENCE_PACKS.map((pack) => (
          <details className={`ui-reference-pack is-${pack.status}`} key={pack.id} open={pack.status !== 'boundary'}>
            <summary>
              <span className="ui-reference-pack-marker" aria-hidden="true" />
              <span className="ui-reference-pack-title"><strong>{pack.title}</strong><small>{pack.area}</small></span>
              <span className="ui-reference-pack-count">{pack.references.length} مرجع</span>
              <span className="ui-reference-pack-status">{STATUS_LABEL[pack.status]}</span>
            </summary>
            <div className="ui-reference-pack-body">
              <p>{pack.note}</p>
              <div className="ui-reference-pack-actions">
                <a href={pack.target}>فتح مساحة العمل ↗</a>
                <code dir="ltr">{pack.target}</code>
              </div>
              <div className="ui-reference-ref-list" aria-label={`مراجع ${pack.title}`}>
                {pack.references.map((reference, index) => (
                  <span key={reference} title={reference}>
                    <b>{String(index + 1).padStart(2, '0')}</b>
                    <small>{reference}</small>
                  </span>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>

      <footer className="ui-reference-coverage-footer">
        <span>التصنيف لا يُعامل كإثبات بصري نهائي.</span>
        <span>الإثبات النهائي يظل مرتبطًا بالحالة والـviewport والـSHA ونتيجة المتصفح.</span>
      </footer>
    </section>
  );
}
