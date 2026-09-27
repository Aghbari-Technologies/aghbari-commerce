import { useEffect, useMemo, useState } from 'react';
import { calculateInvoicePaid, getCustomerInvoicePayments, getCustomerInvoices, type CustomerInvoiceSummary, type CustomerPayment } from './services/customerFinance';
import { formatMoney } from './domain/pricing';
import './customer-finance.css';

const PAGE_SIZE = 8;
const STATUS_LABELS: Record<CustomerInvoiceSummary['status'], string> = {
  issued: 'مصدرة',
  partially_paid: 'مدفوعة جزئيًا',
  paid: 'مسددة',
  void: 'ملغاة'
};
const PAYMENT_LABELS: Record<string, string> = {
  cash: 'نقدي',
  bank_transfer: 'حوالة بنكية',
  card: 'بطاقة',
  other: 'أخرى'
};

function money(value: number, currency: string) {
  return formatMoney(value) + ' ' + (currency === 'YER' ? 'ر.ي' : currency);
}

export default function CustomerFinancePanel({ customerId, online }: { customerId: string | null; online: boolean }) {
  const [invoices, setInvoices] = useState<CustomerInvoiceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | CustomerInvoiceSummary['status']>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerInvoiceSummary | null>(null);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  async function load() {
    if (!customerId || !online) return;
    setLoading(true);
    setError('');
    try {
      setInvoices(await getCustomerInvoices(customerId, 50));
    } catch (e) {
      setInvoices([]);
      setError(e instanceof Error ? e.message : 'تعذر تحميل الفواتير.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { setPage(1); }, [query, status, sort]);
  useEffect(() => { void load(); }, [customerId, online]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return [...invoices]
      .filter((invoice) =>
        (status === 'all' || invoice.status === status) &&
        (!needle || String(invoice.invoice_number).includes(needle) || invoice.order_id.toLocaleLowerCase().includes(needle))
      )
      .sort((a, b) => {
        if (sort === 'highest') return b.total - a.total;
        if (sort === 'lowest') return a.total - b.total;
        const delta = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        return sort === 'oldest' ? -delta : delta;
      });
  }, [invoices, query, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const totals = useMemo(() => ({
    count: invoices.length,
    open: invoices.filter((invoice) => invoice.status === 'issued' || invoice.status === 'partially_paid').length,
    total: invoices.reduce((sum, invoice) => sum + invoice.total, 0)
  }), [invoices]);

  async function openInvoice(invoice: CustomerInvoiceSummary) {
    if (!customerId) return;
    setSelected(invoice);
    setPayments([]);
    setDetailError('');
    setDetailLoading(true);
    try {
      setPayments(await getCustomerInvoicePayments(customerId, invoice.id));
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'تعذر تحميل دفعات الفاتورة.');
    } finally {
      setDetailLoading(false);
    }
  }

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setSort('newest');
    setPage(1);
  }

  if (!customerId) return null;

  if (!online) {
    return (
      <section className="content-card customer-finance-panel">
        <div className="empty-state">
          <strong>المستندات المالية مؤجلة دون اتصال</strong>
          <span>البيانات المالية تُقرأ من الخادم فقط عند توفر اتصال موثوق.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="content-card customer-finance-panel" aria-busy={loading}>
      <div className="section-title">
        <div>
          <span className="eyebrow">المستندات المالية</span>
          <h2>الفواتير والمدفوعات</h2>
          <p>سجل تشغيلي مرتبط مباشرة بحساب شركتك، للقراءة فقط.</p>
        </div>
        <button className="ghost" type="button" onClick={() => void load()} disabled={loading}>
          {loading ? 'جارٍ التحديث…' : 'تحديث'}
        </button>
      </div>

      <div className="customer-finance-summary" aria-label="ملخص المستندات المالية">
        <article><small>إجمالي الفواتير</small><strong>{totals.count.toLocaleString('ar')}</strong><span>المستندات المتاحة للحساب</span></article>
        <article><small>المفتوحة</small><strong>{totals.open.toLocaleString('ar')}</strong><span>تحتاج متابعة أو سداد</span></article>
        <article><small>القيمة الإجمالية</small><strong>{money(totals.total, invoices[0]?.currency ?? 'YER')}</strong><span>للفواتير المحملة</span></article>
      </div>

      <div className="customer-finance-toolbar" role="search">
        <label><span>بحث</span><input aria-label="بحث الفواتير" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="رقم الفاتورة أو الطلب" disabled={loading} /></label>
        <label><span>الحالة</span><select aria-label="فلترة حالة الفاتورة" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} disabled={loading}><option value="all">كل الحالات</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label><span>الترتيب</span><select aria-label="ترتيب الفواتير" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} disabled={loading}><option value="newest">الأحدث أولًا</option><option value="oldest">الأقدم أولًا</option><option value="highest">الأعلى قيمة</option><option value="lowest">الأقل قيمة</option></select></label>
        <button className="ghost" type="button" onClick={clearFilters} disabled={loading || (!query && status === 'all' && sort === 'newest')}>مسح</button>
      </div>

      {loading ? (
        <div className="portal-loading" role="status">جارٍ تحميل الفواتير…</div>
      ) : error ? (
        <div className="error-banner" role="alert"><span>{error}</span><button className="ghost" type="button" onClick={() => void load()}>إعادة المحاولة</button></div>
      ) : !invoices.length ? (
        <div className="empty-state"><strong>لا توجد فواتير متاحة</strong><span>ستظهر الفواتير التشغيلية هنا عند إصدارها للحساب.</span></div>
      ) : !filtered.length ? (
        <div className="empty-state"><strong>لا توجد نتائج مطابقة</strong><span>غيّر البحث أو فلتر الحالة ثم أعد المحاولة.</span><button type="button" onClick={clearFilters}>مسح الفلاتر</button></div>
      ) : (
        <>
          <div className="customer-invoice-grid">
            {visible.map((invoice) => (
              <article className="customer-invoice-card" key={invoice.id}>
                <div className="invoice-card-head">
                  <div><span className="eyebrow">فاتورة</span><strong>#{invoice.invoice_number}</strong><small>طلب #{invoice.order_id.slice(0, 8)}</small></div>
                  <span className={'finance-status finance-status-' + invoice.status}>{STATUS_LABELS[invoice.status]}</span>
                </div>
                <div className="invoice-card-total"><small>الإجمالي</small><strong>{money(invoice.total, invoice.currency)}</strong></div>
                <div className="invoice-card-meta"><span>الإصدار {new Date(invoice.created_at).toLocaleDateString('ar-YE')}</span><span>{invoice.due_at ? 'الاستحقاق ' + new Date(invoice.due_at).toLocaleDateString('ar-YE') : 'دون تاريخ استحقاق'}</span></div>
                {(invoice.status === 'issued' || invoice.status === 'partially_paid') && <span className="invoice-open-note">مستند مفتوح</span>}
                <button type="button" onClick={() => void openInvoice(invoice)}>التفاصيل والمدفوعات</button>
              </article>
            ))}
          </div>
          <div className="directory-pagination" aria-label="صفحات الفواتير">
            <span>صفحة {activePage} / {pages} · عرض {((activePage - 1) * PAGE_SIZE) + 1}–{Math.min(activePage * PAGE_SIZE, filtered.length)} من {filtered.length}</span>
            <div><button className="ghost" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={activePage === 1}>السابق</button><button className="ghost" type="button" onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={activePage === pages}>التالي</button></div>
          </div>
        </>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="modal customer-invoice-modal" role="dialog" aria-modal="true" aria-labelledby="customer-invoice-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">المستند المالي</span><h2 id="customer-invoice-title">فاتورة #{selected.invoice_number}</h2><small>طلب #{selected.order_id}</small></div>
              <button type="button" aria-label="إغلاق الفاتورة" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="invoice-detail-summary">
              <div><small>الحالة</small><strong>{STATUS_LABELS[selected.status]}</strong></div>
              <div><small>الإجمالي</small><strong>{money(selected.total, selected.currency)}</strong></div>
              <div><small>المدفوع</small><strong>{money(calculateInvoicePaid(payments), selected.currency)}</strong></div>
              <div><small>المتبقي</small><strong>{money(Math.max(0, selected.total - calculateInvoicePaid(payments)), selected.currency)}</strong></div>
            </div>
            {detailLoading ? (
              <div className="portal-loading" role="status">جارٍ تحميل دفعات الفاتورة…</div>
            ) : detailError ? (
              <div className="error-banner" role="alert"><span>{detailError}</span><button className="ghost" type="button" onClick={() => void openInvoice(selected)}>إعادة المحاولة</button></div>
            ) : !payments.length ? (
              <div className="empty-state"><strong>لا توجد دفعات مسجلة</strong><span>لم تُسجل مدفوعات على هذه الفاتورة حتى الآن.</span></div>
            ) : (
              <div className="invoice-payment-list">
                {payments.map((payment) => (
                  <article key={payment.id}>
                    <div><strong>{money(payment.amount, selected.currency)}</strong><small>{PAYMENT_LABELS[payment.method] ?? payment.method}</small></div>
                    <div><span>{payment.reference ?? 'دون مرجع'}</span><small>{new Date(payment.paid_at).toLocaleString('ar-YE')}</small></div>
                  </article>
                ))}
              </div>
            )}
            <div className="order-detail-actions"><button className="ghost" type="button" onClick={() => setSelected(null)}>إغلاق</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
