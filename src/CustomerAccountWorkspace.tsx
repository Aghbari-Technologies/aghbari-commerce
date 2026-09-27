import { useState } from 'react';
import OfflineRecoveryPanel from './OfflineRecoveryPanel';

type CustomerAccountWorkspaceProps = {
  customerName: string;
  email: string;
  phone: string;
  customerId: string | null;
  organizationName: string;
  organizationId: string | null;
  customerTier: string;
  warehouseName: string;
  warehouseId: string | null;
  sessionUserId: string | null;
  online: boolean;
  offlineSyncing: boolean;
  busy: boolean;
  accentColor: string;
  compactMode: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  onNavigate: (section: 'catalog' | 'orders' | 'finance' | 'templates') => void;
};

const TIER_LABELS: Record<string, string> = {
  retail: 'تجزئة',
  wholesale: 'جملة',
  distributor: 'توزيع',
};

const ACCOUNT_TABS = [
  { id: 'overview', label: 'نظرة عامة' },
  { id: 'profile', label: 'الملف الشخصي' },
  { id: 'company', label: 'الشركة والحساب' },
  { id: 'addresses', label: 'العناوين' },
  { id: 'settings', label: 'إعدادات الحساب' },
] as const;

type AccountTab = typeof ACCOUNT_TABS[number]['id'];

export default function CustomerAccountWorkspace(props: CustomerAccountWorkspaceProps) {
  const [tab, setTab] = useState<AccountTab>('overview');
  const [copied, setCopied] = useState('');
  const [copyError, setCopyError] = useState('');

  async function copyValue(label: string, value: string | null) {
    if (!value) return;
    setCopyError('');
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1400);
    } catch {
      setCopyError('تعذر النسخ من المتصفح. يمكنك تحديد القيمة ونسخها يدويًا.');
    }
  }

  const tierLabel = TIER_LABELS[props.customerTier] ?? props.customerTier;
  const featureCount = [
    true,
    Boolean(props.customerId),
    Boolean(props.organizationId),
    Boolean(props.warehouseId),
    props.online,
  ].filter(Boolean).length;

  return (
    <section className="content-card customer-account-workspace" aria-labelledby="customer-account-workspace-title">
      <div className="customer-account-hero">
        <div>
          <span className="eyebrow">حساب التاجر</span>
          <h2 id="customer-account-workspace-title">مساحة حساب الأغبري</h2>
          <p>هوية الحساب، سياق الشركة، حالة الجلسة، والاسترداد دون إدخال بيانات تجارية وهمية.</p>
        </div>
        <div className="customer-account-hero-actions">
          <span className={props.online ? 'account-status is-online' : 'account-status is-offline'} role="status">
            {props.online ? '● متصل' : '○ غير متصل'}
          </span>
          <button type="button" className="ghost" onClick={props.onRefresh} disabled={props.busy}>
            {props.busy ? 'جارٍ التحديث…' : 'تحديث السياق'}
          </button>
          <button type="button" onClick={props.onLogout}>تسجيل الخروج</button>
        </div>
      </div>

      <div className="customer-account-tabs" role="tablist" aria-label="أقسام حساب التاجر">
        {ACCOUNT_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {copyError && <div className="error-banner" role="alert">{copyError}</div>}

      {tab === 'overview' && (
        <div className="customer-account-overview">
          <div className="customer-account-kpis">
            <article><small>حالة الحساب</small><strong>{props.online ? 'نشط ومتصل' : 'وضع دون اتصال'}</strong><span>{props.offlineSyncing ? 'تتم مزامنة عمليات السلة الآمنة' : 'المرجع التشغيلي هو الخادم'}</span></article>
            <article><small>نوع العميل</small><strong>{tierLabel}</strong><span>التسعير المصرح من حسابك</span></article>
            <article><small>الشركة</small><strong>{props.organizationName || '—'}</strong><span>المؤسسة التشغيلية المرتبطة</span></article>
            <article><small>التغطية</small><strong>{featureCount}/5</strong><span>سياق الهوية والربط الحالي</span></article>
          </div>
          <div className="customer-account-grid">
            <article className="account-panel">
              <div className="account-panel-heading"><div><span className="eyebrow">الهوية</span><h3>الملف التجاري</h3></div><button type="button" className="ghost" onClick={() => setTab('profile')}>فتح الملف</button></div>
              <div className="account-facts">
                <div><small>اسم العميل</small><strong>{props.customerName || '—'}</strong></div>
                <div><small>البريد</small><strong dir="ltr">{props.email || '—'}</strong></div>
                <div><small>الهاتف</small><strong dir="ltr">{props.phone || 'غير مسجل'}</strong></div>
                <div><small>الفئة السعرية</small><strong>{tierLabel}</strong></div>
              </div>
            </article>
            <article className="account-panel">
              <div className="account-panel-heading"><div><span className="eyebrow">التشغيل</span><h3>السياق الفعلي</h3></div><button type="button" className="ghost" onClick={() => setTab('company')}>فتح الشركة</button></div>
              <div className="account-facts">
                <div><small>المؤسسة</small><strong>{props.organizationName || '—'}</strong></div>
                <div><small>المستودع</small><strong>{props.warehouseName || '—'}</strong></div>
                <div><small>المعرف التجاري</small><code dir="ltr">{props.customerId || '—'}</code></div>
                <div><small>جلسة المستخدم</small><code dir="ltr">{props.sessionUserId || '—'}</code></div>
              </div>
            </article>
          </div>
          <div className="customer-account-shortcuts" aria-label="اختصارات الحساب">
            <button type="button" onClick={() => props.onNavigate('catalog')}>العودة للكتالوج <span>↗</span></button>
            <button type="button" className="ghost" onClick={() => props.onNavigate('orders')}>طلباتي <span>↗</span></button>
            <button type="button" className="ghost" onClick={() => props.onNavigate('finance')}>المركز المالي <span>↗</span></button>
            <button type="button" className="ghost" onClick={() => props.onNavigate('templates')}>المسحات الجاهزة <span>↗</span></button>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="customer-account-surface">
          <div className="surface-heading"><div><span className="eyebrow">الهوية</span><h3>الملف الشخصي</h3><p>بيانات العرض التي يملكها النظام عن حساب العميل الحالي.</p></div></div>
          <div className="customer-profile-grid">
            <div><span>اسم العميل</span><strong>{props.customerName || '—'}</strong></div>
            <div><span>البريد الإلكتروني</span><strong dir="ltr">{props.email || '—'}</strong></div>
            <div><span>رقم الهاتف</span><strong dir="ltr">{props.phone || 'غير مسجل'}</strong></div>
            <div><span>الفئة السعرية</span><strong>{tierLabel}</strong></div>
          </div>
          <div className="account-read-note"><strong>حدود التعديل</strong><span>هذه المساحة تعرض الهوية الحالية فقط. لا تُفتح حقول تعديل العميل هنا دون عقد صلاحيات وخدمة تحديث معتمدين من Commerce.</span></div>
        </div>
      )}

      {tab === 'company' && (
        <div className="customer-account-surface">
          <div className="surface-heading"><div><span className="eyebrow">السياق التشغيلي</span><h3>الشركة والحساب</h3><p>الربط بين حساب العميل والمنظمة والمستودع الذي تُبنى عليه الطلبات والأسعار والمخزون.</p></div></div>
          <div className="customer-company-grid">
            {[
              ['اسم الشركة / المنظمة', props.organizationName || '—', false, 'organization'],
              ['معرف المنظمة', props.organizationId, true, 'organizationId'],
              ['معرف العميل', props.customerId, true, 'customerId'],
              ['المستودع التشغيلي', props.warehouseName || '—', false, 'warehouse'],
              ['معرف المستودع', props.warehouseId, true, 'warehouseId'],
              ['الفئة التجارية', tierLabel, false, 'tier'],
            ].map(([label, value, mono, key]) => (
              <div key={String(key)}>
                <span>{label}</span>
                <div><strong className={mono ? 'account-mono' : ''} dir={mono ? 'ltr' : undefined}>{String(value || '—')}</strong>{mono && value && <button type="button" className="mini-copy" onClick={() => void copyValue(String(label), String(value))}>{copied === label ? '✓' : 'نسخ'}</button>}</div>
              </div>
            ))}
          </div>
          <div className="account-read-note"><strong>مصدر الحقيقة</strong><span>السعر، المخزون، صلاحيات الطلب والاعتماد النهائي تأتي من عقود Commerce المحمية على الخادم، وليس من هذه الشاشة.</span></div>
        </div>
      )}

      {tab === 'addresses' && (
        <div className="customer-account-surface">
          <div className="surface-heading"><div><span className="eyebrow">العناوين</span><h3>عناوين التسليم</h3><p>تم حجز موضع الواجهة دون اختلاق بيانات أو عمليات حفظ غير مدعومة.</p></div></div>
          <div className="customer-address-boundary" data-state="boundary">
            <span aria-hidden="true">⌖</span>
            <div><strong>لا يوجد عقد عناوين مستقل في Commerce الحالي</strong><span>المخطط التشغيلي الحالي لا يحتوي مصدر حقيقة للعناوين، لذلك لا يتم إنشاء عناوين وهمية ولا زر حفظ يوحي بتخزين غير موجود.</span><small>يمكن إغلاق هذه الفجوة لاحقًا بإضافة عقد canonical للعناوين ثم ربط القراءة والكتابة بصلاحياته واختباراته.</small></div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="customer-account-surface">
          <div className="surface-heading"><div><span className="eyebrow">الإعدادات</span><h3>إعدادات الحساب</h3><p>الحالة الفعلية لإعدادات تجربة البوابة التي تم تطبيقها على runtime الحالي.</p></div></div>
          <div className="customer-settings-grid">
            <div><span>اللون المميز</span><div className="settings-value"><i style={{ background: props.accentColor }} aria-hidden="true" /><code dir="ltr">{props.accentColor}</code></div></div>
            <div><span>كثافة الواجهة</span><strong>{props.compactMode ? 'مضغوطة' : 'مريحة'}</strong></div>
            <div><span>الاتصال</span><strong>{props.online ? 'الخادم متاح' : 'بيانات محلية محدودة'}</strong></div>
            <div><span>الاسترداد</span><strong>{props.offlineSyncing ? 'مزامنة جارية' : 'لا توجد مزامنة جارية'}</strong></div>
          </div>
          <div className="account-read-note"><strong>إدارة المظهر</strong><span>تغيير اللون والكثافة يتم عبر الإعدادات المصرح بها في مركز الإدارة، ثم يطبق على بوابة العميل. لا يتم تخزين إعدادات مكررة داخل هذه الشاشة.</span></div>
          <div className="customer-account-actions"><button type="button" className="ghost" onClick={props.onRefresh} disabled={props.busy}>{props.busy ? 'جارٍ التحديث…' : 'إعادة قراءة الإعدادات والسياق'}</button><button type="button" onClick={props.onLogout}>إنهاء الجلسة</button></div>
        </div>
      )}

      <div className="customer-account-recovery">
        <OfflineRecoveryPanel userId={props.sessionUserId} />
      </div>
    </section>
  );
}
