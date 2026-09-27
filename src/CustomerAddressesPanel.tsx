import { useEffect, useState, type FormEvent } from 'react';
import { getCustomerAddresses, saveCustomerAddress, deleteCustomerAddress, type CustomerAddress } from './services/customerAddresses';
import { CUSTOMER_ADDRESS_LIMITS } from './domain/customerAddresses';

type Props = { customerId: string | null; online: boolean };

type AddressForm = {
  label: string; recipientName: string; phone: string; addressLine1: string; addressLine2: string;
  city: string; district: string; notes: string; isDefault: boolean;
};

const EMPTY: AddressForm = {
  label: 'مقر المتجر', recipientName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', district: '', notes: '', isDefault: false,
};

function explain(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  if (/schema cache|relation .*customer_addresses|PGRST205/i.test(raw)) return 'عقد العناوين موجود في المصدر لكنه لم يُطبّق على البيئة الحالية بعد.';
  return raw || 'تعذر تنفيذ عملية العنوان.';
}

export default function CustomerAddressesPanel({ customerId, online }: Props) {
  const [rows, setRows] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<AddressForm>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(''); const [message, setMessage] = useState('');

  async function load() {
    if (!customerId || !online) { setRows([]); return; }
    setLoading(true); setError('');
    try { setRows(await getCustomerAddresses(customerId)); }
    catch (e) { setError(explain(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [customerId, online]);

  function edit(address: CustomerAddress) {
    setEditId(address.id);
    setForm({
      label: address.label, recipientName: address.recipient_name, phone: address.phone,
      addressLine1: address.address_line1, addressLine2: address.address_line2 ?? '',
      city: address.city, district: address.district ?? '', notes: address.notes ?? '', isDefault: address.is_default,
    });
    setError(''); setMessage('');
  }
  function reset() { setEditId(null); setForm(EMPTY); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!customerId) return setError('لا يوجد عميل مرتبط بالجلسة.');
    if (!online) return setError('لا يمكن حفظ العنوان دون اتصال.');
    setSaving(true); setError(''); setMessage('');
    try {
      await saveCustomerAddress({ ...form, id: editId, customerId });
      await load(); reset(); setMessage(editId ? 'تم تحديث عنوان التسليم.' : 'تم حفظ عنوان التسليم.');
    } catch (e) { setError(explain(e)); }
    finally { setSaving(false); }
  }

  async function remove(address: CustomerAddress) {
    if (!online) return setError('لا يمكن حذف العنوان دون اتصال.');
    if (!window.confirm(`حذف عنوان «${address.label}»؟`)) return;
    setSaving(true); setError(''); setMessage('');
    try { await deleteCustomerAddress(address.id); if (editId === address.id) reset(); await load(); setMessage('تم حذف العنوان.'); }
    catch (e) { setError(explain(e)); }
    finally { setSaving(false); }
  }

  return <div className="customer-addresses-panel">
    <div className="surface-heading">
      <div><span className="eyebrow">التسليم</span><h3>عناوين التسليم</h3><p>عناوين مرتبطة بالعميل الحالي؛ العزل والصلاحية والاعتماد النهائي على الخادم.</p></div>
      <span className={online ? 'address-connectivity is-online' : 'address-connectivity is-offline'} role="status">{online ? '● متصل' : '○ غير متصل'}</span>
    </div>
    {error && <div className="error-banner" role="alert">{error}</div>}
    {message && <div className="success" role="status">{message}</div>}
    <div className="customer-addresses-layout">
      <form className="account-address-form" onSubmit={submit}>
        <div className="account-form-heading"><div><span className="eyebrow">البيانات</span><strong>{editId ? 'تعديل عنوان التسليم' : 'إضافة عنوان تسليم'}</strong></div>{editId && <button type="button" className="ghost" onClick={reset} disabled={saving}>إلغاء</button>}</div>
        <div className="account-address-fields">
          <label>التسمية<input value={form.label} onChange={e=>setForm({...form,label:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.label} required /></label>
          <label>اسم المستلم<input value={form.recipientName} onChange={e=>setForm({...form,recipientName:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.recipientName} required /></label>
          <label>الهاتف<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.phone} inputMode="tel" required /></label>
          <label className="field-span-2">العنوان<input value={form.addressLine1} onChange={e=>setForm({...form,addressLine1:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.addressLine1} required /></label>
          <label>العنوان الإضافي<input value={form.addressLine2} onChange={e=>setForm({...form,addressLine2:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.addressLine2} /></label>
          <label>المدينة<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.city} required /></label>
          <label>الحي / المنطقة<input value={form.district} onChange={e=>setForm({...form,district:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.district} /></label>
          <label className="field-span-2">ملاحظات التسليم<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} maxLength={CUSTOMER_ADDRESS_LIMITS.notes} rows={3} /></label>
        </div>
        <label className="default-address-toggle"><input type="checkbox" checked={form.isDefault} onChange={e=>setForm({...form,isDefault:e.target.checked})} /> اجعل هذا العنوان الافتراضي</label>
        <button type="submit" disabled={saving || loading || !customerId || !online}>{saving ? 'جارٍ الحفظ…' : editId ? 'حفظ التعديل' : 'إضافة العنوان'}</button>
      </form>
      <section className="account-address-list" aria-label="العناوين المحفوظة">
        <div className="account-form-heading"><div><span className="eyebrow">المحفوظة</span><strong>عناوينك</strong></div><span>{loading ? 'جارٍ التحميل…' : `${rows.length} عنوان`}</span></div>
        {!online ? <div className="address-empty-state"><strong>العناوين تحتاج اتصالًا</strong><span>لا توجد نسخة محلية حتى لا تصبح البيانات غير موثوقة.</span></div>
        : !rows.length && !loading ? <div className="address-empty-state"><strong>لا توجد عناوين محفوظة</strong><span>أضف أول عنوان من النموذج.</span></div>
        : <div className="address-list">{rows.map(row=><article key={row.id} className={row.is_default ? 'address-card is-default' : 'address-card'}>
          <div className="address-card-heading"><div><strong>{row.label}</strong>{row.is_default && <span className="address-default-badge">افتراضي</span>}</div><span>{row.recipient_name}</span></div>
          <p>{row.address_line1}{row.address_line2 ? `، ${row.address_line2}` : ''}</p>
          <p>{[row.district,row.city].filter(Boolean).join(' · ')}</p>
          <small dir="ltr">{row.phone}</small>
          {row.notes && <small>{row.notes}</small>}
          <div className="address-card-actions"><button type="button" className="ghost" onClick={()=>edit(row)} disabled={saving}>تعديل</button><button type="button" className="danger" onClick={()=>void remove(row)} disabled={saving}>حذف</button></div>
        </article>)}</div>}
      </section>
    </div>
  </div>;
}