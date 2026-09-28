import { useCallback, useEffect, useState, type FormEvent } from 'react';
import OfflineRecoveryPanel from './OfflineRecoveryPanel';
import { createCustomerAddress, deleteCustomerAddress, getCustomerAddresses, updateCustomerAddress, type CustomerAddress } from './services/customerAddresses';
import { updateCustomerSelfProfile } from './services/customerProfile';

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
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [addressBusyKey, setAddressBusyKey] = useState('');
  const [addressLoadError, setAddressLoadError] = useState('');
  const [addressActionError, setAddressActionError] = useState('');
  const [addressMessage, setAddressMessage] = useState('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileForm, setProfileForm] = useState({ name: props.customerName ?? '', phone: props.phone ?? '' });
  const [addressForm, setAddressForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    notes: '',
    isDefault: false,
  });

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

  function startProfileEdit() {
    setProfileEditing(true);
    setProfileError('');
    setProfileMessage('');
    setProfileForm({ name: props.customerName ?? '', phone: props.phone ?? '' });
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (profileBusy || !props.online) return;
    setProfileBusy(true);
    setProfileError('');
    setProfileMessage('');
    try {
      await updateCustomerSelfProfile({ name: profileForm.name, phone: profileForm.phone });
      setProfileMessage('تم تحديث الملف الشخصي.');
      setProfileEditing(false);
      props.onRefresh();
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'تعذر تحديث الملف الشخصي.');
    } finally {
      setProfileBusy(false);
    }
  }

  const refreshAddresses = useCallback(async () => {
    if (!props.customerId || !props.online) {
      setAddresses([]);
      setAddressesLoading(false);
      if (!props.online) setAddressLoadError('الاتصال بالخادم مطلوب لقراءة عناوين التسليم وإدارتها.');
      return;
    }
    setAddressesLoading(true);
    setAddressLoadError('');
    try {
      setAddresses(await getCustomerAddresses(100));
    } catch (error) {
      setAddressLoadError(error instanceof Error ? error.message : 'تعذر تحميل عناوين التسليم.');
    } finally {
      setAddressesLoading(false);
    }
  }, [props.customerId, props.online]);

  useEffect(() => {
    if (tab === 'addresses') void refreshAddresses();
  }, [tab, refreshAddresses]);

  function resetAddressForm() {
    setEditingAddressId(null);
    setConfirmDeleteId(null);
    setAddressForm({
      label: '',
      recipientName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      district: '',
      notes: '',
      isDefault: addresses.length === 0,
    });
  }

  function startAddressEdit(address: CustomerAddress) {
    setEditingAddressId(address.id);
    setConfirmDeleteId(null);
    setAddressActionError('');
    setAddressMessage('');
    setAddressForm({
      label: address.label,
      recipientName: address.recipient_name,
      phone: address.phone,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 ?? '',
      city: address.city,
      district: address.district ?? '',
      notes: address.notes ?? '',
      isDefault: address.is_default,
    });
  }

  async function submitAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!props.online || addressBusyKey) return;
    setAddressBusyKey(editingAddressId ? `save:${editingAddressId}` : 'save:new');
    setAddressActionError('');
    setAddressMessage('');
    try {
      const input = {
        label: addressForm.label,
        recipientName: addressForm.recipientName,
        phone: addressForm.phone,
        addressLine1: addressForm.addressLine1,
        addressLine2: addressForm.addressLine2,
        city: addressForm.city,
        district: addressForm.district,
        notes: addressForm.notes,
        isDefault: addressForm.isDefault,
      };
      if (editingAddressId) {
        await updateCustomerAddress(editingAddressId, input);
        setAddressMessage('تم تحديث عنوان التسليم.');
      } else {
        await createCustomerAddress(input);
        setAddressMessage('تم حفظ عنوان التسليم.');
      }
      resetAddressForm();
      await refreshAddresses();
    } catch (error) {
      setAddressActionError(error instanceof Error ? error.message : 'تعذر حفظ عنوان التسليم.');
    } finally {
      setAddressBusyKey('');
    }
  }

  async function deleteAddress(address: CustomerAddress) {
    if (!props.online || addressBusyKey) return;
    if (confirmDeleteId !== address.id) {
      setConfirmDeleteId(address.id);
      setAddressActionError('');
      setAddressMessage('اضغط حذف مرة أخرى لتأكيد الحذف.');
      return;
    }
    setAddressBusyKey(`delete:${address.id}`);
    setAddressActionError('');
    setAddressMessage('');
    try {
      await deleteCustomerAddress(address.id);
      setAddressMessage('تم حذف عنوان التسليم.');
      setConfirmDeleteId(null);
      if (editingAddressId === address.id) resetAddressForm();
      await refreshAddresses();
    } catch (error) {
      setAddressActionError(error instanceof Error ? error.message : 'تعذر حذف عنوان التسليم.');
    } finally {
      setAddressBusyKey('');
    }
  }

  async function makeDefaultAddress(address: CustomerAddress) {
    if (!props.online || addressBusyKey || address.is_default) return;
    setAddressBusyKey(`default:${address.id}`);
    setAddressActionError('');
    setAddressMessage('');
    try {
      await updateCustomerAddress(address.id, {
        label: address.label,
        recipientName: address.recipient_name,
        phone: address.phone,
        addressLine1: address.address_line1,
        addressLine2: address.address_line2,
        city: address.city,
        district: address.district,
        notes: address.notes,
        isDefault: true,
      });
      setAddressMessage('تم تعيين العنوان كافتراضي.');
      await refreshAddresses();
    } catch (error) {
      setAddressActionError(error instanceof Error ? error.message : 'تعذر تعيين العنوان الافتراضي.');
    } finally {
      setAddressBusyKey('');
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
          <div className="surface-heading">
            <div><span className="eyebrow">الهوية</span><h3>الملف الشخصي</h3><p>بيانات العرض التي يمكن للعميل تعديلها بنفسه دون الوصول إلى بيانات المؤسسة أو الفئة السعرية.</p></div>
            {!profileEditing && <button type="button" className="ghost" onClick={startProfileEdit} disabled={!props.online}>تعديل الملف</button>}
          </div>
          {profileEditing ? (
            <form className="customer-profile-edit-form" onSubmit={submitProfile} noValidate>
              <div className="customer-profile-edit-grid">
                <label>اسم العميل<input value={profileForm.name} onChange={e=>setProfileForm(v=>({...v,name:e.target.value}))} maxLength={200} required autoComplete="name" /></label>
                <label>رقم الهاتف<input value={profileForm.phone} onChange={e=>setProfileForm(v=>({...v,phone:e.target.value}))} maxLength={40} inputMode="tel" autoComplete="tel" /></label>
                <label>البريد الإلكتروني<div className="profile-readonly-field" dir="ltr">{props.email || '—'}</div></label>
                <label>الفئة السعرية<div className="profile-readonly-field">{tierLabel}</div></label>
              </div>
              <div className="account-read-note"><strong>الحماية</strong><span>التعديل الذاتي يقتصر على الاسم والهاتف. البريد الإلكتروني والفئة السعرية وحالة الحساب ليست ضمن هذا العقد.</span></div>
              {profileError && <div className="error-banner" role="alert">{profileError}</div>}
              <div className="customer-profile-actions"><button type="button" className="ghost" onClick={()=>setProfileEditing(false)} disabled={profileBusy}>إلغاء</button><button type="submit" disabled={profileBusy || !props.online}>{profileBusy ? 'جارٍ الحفظ…' : 'حفظ الملف'}</button></div>
            </form>
          ) : (
            <>
              <div className="customer-profile-grid">
                <div><span>اسم العميل</span><strong>{props.customerName || '—'}</strong></div>
                <div><span>البريد الإلكتروني</span><strong dir="ltr">{props.email || '—'}</strong></div>
                <div><span>رقم الهاتف</span><strong dir="ltr">{props.phone || 'غير مسجل'}</strong></div>
                <div><span>الفئة السعرية</span><strong>{tierLabel}</strong></div>
              </div>
              {profileMessage && <div className="success" role="status">{profileMessage}</div>}
              {!props.online && <div className="customer-address-offline" role="status"><strong>تعديل الملف متوقف دون اتصال</strong><span>الحفظ يتطلب الاتصال بمصدر Commerce.</span></div>}
            </>
          )}
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
        <div className="customer-account-surface customer-addresses-surface">
          <div className="surface-heading">
            <div>
              <span className="eyebrow">التسليم</span>
              <h3>عناوين التسليم</h3>
              <p>احفظ مواقع التسليم الخاصة بحسابك مع عنوان افتراضي واحد. الحفظ والتعديل والحذف تمر عبر عقد Commerce المحمي على الخادم.</p>
            </div>
            <span className="address-source-badge">{props.online ? 'مصدر الخادم' : 'غير متصل'}</span>
          </div>

          {!props.online && <div className="customer-address-offline" role="status"><strong>إدارة العناوين متوقفة دون اتصال</strong><span>لا يتم عرض بيانات محلية غير موثوقة ولا تنفيذ تغييرات مؤجلة للعناوين.</span><button type="button" className="ghost" onClick={() => void refreshAddresses()}>إعادة المحاولة بعد الاتصال</button></div>}

          {props.online && (
            <div className="customer-address-layout">
              <form className="customer-address-form" onSubmit={submitAddress}>
                <div className="address-form-head">
                  <div><span className="eyebrow">{editingAddressId ? 'تعديل' : 'جديد'}</span><h4>{editingAddressId ? 'تعديل عنوان التسليم' : 'إضافة عنوان تسليم'}</h4></div>
                  {editingAddressId && <button type="button" className="ghost" onClick={resetAddressForm} disabled={Boolean(addressBusyKey)}>إلغاء التعديل</button>}
                </div>
                <div className="customer-address-form-grid">
                  <label>اسم العنوان<input value={addressForm.label} onChange={e=>setAddressForm(v=>({...v,label:e.target.value}))} maxLength={80} placeholder="الرئيسي" required /></label>
                  <label>اسم المستلم<input value={addressForm.recipientName} onChange={e=>setAddressForm(v=>({...v,recipientName:e.target.value}))} maxLength={120} placeholder="اسم المستلم" required /></label>
                  <label>هاتف المستلم<input value={addressForm.phone} onChange={e=>setAddressForm(v=>({...v,phone:e.target.value}))} maxLength={40} inputMode="tel" placeholder="رقم الهاتف" required /></label>
                  <label>المدينة<input value={addressForm.city} onChange={e=>setAddressForm(v=>({...v,city:e.target.value}))} maxLength={100} placeholder="صنعاء" required /></label>
                  <label>المنطقة / الحي<input value={addressForm.district} onChange={e=>setAddressForm(v=>({...v,district:e.target.value}))} maxLength={120} placeholder="الحي" /></label>
                  <label className="address-form-span-2">العنوان التفصيلي<input value={addressForm.addressLine1} onChange={e=>setAddressForm(v=>({...v,addressLine1:e.target.value}))} maxLength={240} placeholder="الشارع، المبنى، العلامة المميزة" required /></label>
                  <label className="address-form-span-2">تفاصيل إضافية<textarea value={addressForm.addressLine2} onChange={e=>setAddressForm(v=>({...v,addressLine2:e.target.value}))} maxLength={240} rows={2} placeholder="الطابق، المتجر، المدخل..." /></label>
                  <label className="address-form-span-2">ملاحظات التسليم<textarea value={addressForm.notes} onChange={e=>setAddressForm(v=>({...v,notes:e.target.value}))} maxLength={300} rows={2} placeholder="ملاحظات اختيارية للسائق أو فريق التسليم" /></label>
                </div>
                <label className="address-default-toggle"><input type="checkbox" checked={addressForm.isDefault} onChange={e=>setAddressForm(v=>({...v,isDefault:e.target.checked}))} /><span><strong>اجعل هذا العنوان افتراضيًا</strong><small>سيستبدل العنوان الافتراضي الحالي لهذا الحساب بشكل ذري.</small></span></label>
                <button className="checkout" type="submit" disabled={Boolean(addressBusyKey)}>{addressBusyKey.startsWith('save:') ? 'جارٍ الحفظ…' : editingAddressId ? 'حفظ التعديلات' : 'حفظ العنوان'}</button>
              </form>

              <div className="customer-address-list">
                {addressesLoading ? <div className="customer-address-loading-skeleton" role="status" aria-label="جارٍ تحميل عناوين التسليم">{Array.from({length:3}).map((_,index)=><article key={index}><div><i/><i/></div><span/><span/></article>)}</div> :
                  addressLoadError ? <div className="customer-address-list-state error-state" role="alert"><strong>تعذر تحميل عناوين التسليم</strong><span>{addressLoadError}</span><button type="button" className="ghost" onClick={() => void refreshAddresses()} disabled={Boolean(addressBusyKey)}>إعادة المحاولة</button></div> :
                  !addresses.length ? <div className="customer-address-list-state"><strong>لا توجد عناوين محفوظة بعد.</strong><span>أضف أول عنوان لتجهيز حساب التسليم.</span><button type="button" onClick={() => { setAddressActionError(''); setAddressMessage(''); }}>البدء بإضافة عنوان</button></div> :
                  <div className="customer-address-cards">{addresses.map(address=><article key={address.id} className={address.is_default?'customer-address-card is-default':'customer-address-card'}>
                    <div className="customer-address-card-head"><div><span className="eyebrow">{address.label}</span><h4>{address.recipient_name}</h4></div>{address.is_default&&<span className="customer-address-default">افتراضي</span>}</div>
                    <div className="customer-address-card-body">
                      <div><span>الهاتف</span><strong dir="ltr">{address.phone}</strong></div>
                      <div><span>الموقع</span><strong>{address.city}{address.district ? ` · ${address.district}` : ''}</strong></div>
                      <div className="wide"><span>العنوان</span><strong>{address.address_line1}{address.address_line2 ? `، ${address.address_line2}` : ''}</strong></div>
                      {address.notes&&<div className="wide"><span>ملاحظات</span><strong>{address.notes}</strong></div>}
                    </div>
                    <div className="customer-address-card-actions">
                      {!address.is_default&&<button type="button" className="ghost" onClick={()=>void makeDefaultAddress(address)} disabled={Boolean(addressBusyKey)}>تعيين افتراضي</button>}
                      <button type="button" className="ghost" onClick={()=>startAddressEdit(address)} disabled={Boolean(addressBusyKey)}>تعديل</button>
                      <button type="button" className={confirmDeleteId===address.id?'danger-button':'ghost'} onClick={()=>void deleteAddress(address)} disabled={Boolean(addressBusyKey)}>{addressBusyKey===`delete:${address.id}` ? 'جارٍ الحذف…' : confirmDeleteId===address.id ? 'تأكيد الحذف' : 'حذف'}</button>
                    </div>
                  </article>)}</div>
                }
              </div>
            </div>
          )}

          {addressActionError && <div className="error-banner" role="alert">{addressActionError}<button type="button" className="ghost" onClick={() => setAddressActionError('')}>إغلاق</button></div>}
          {addressMessage && <div className="success" role="status">{addressMessage}</div>}
          <div className="account-read-note"><strong>حدود التكامل</strong><span>العناوين أصبحت مصدرًا محفوظًا لحساب العميل نفسه. لم يتم افتراض ربطها تلقائيًا بفاتورة أو طلب قائم؛ أي ربط تشغيلي مع دورة الشحن يجب أن يضاف عبر عقد Commerce مستقل واختباراته.</span></div>
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
