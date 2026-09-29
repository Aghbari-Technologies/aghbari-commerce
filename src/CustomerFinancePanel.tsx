import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateInvoicePaid, getCustomerInvoiceItems, getCustomerInvoicePayments, getCustomerInvoices, getCustomerStatement, type CustomerInvoiceItem, type CustomerInvoiceSummary, type CustomerPayment, type CustomerPaymentHistoryItem, type CustomerStatementLine, type CustomerStatementTotal } from './services/customerFinance';
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

export default function CustomerFinancePanel({ customerId, online, openFirstInvoiceRequest = 0 }: { customerId: string | null; online: boolean; openFirstInvoiceRequest?: number }) {
  const [invoices, setInvoices] = useState<CustomerInvoiceSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | CustomerInvoiceSummary['status']>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CustomerInvoiceSummary | null>(null);
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [items, setItems] = useState<CustomerInvoiceItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [view, setView] = useState<'invoices' | 'statement' | 'payments'>('invoices');
  const [statementLines, setStatementLines] = useState<CustomerStatementLine[]>([]);
  const [statementTotals, setStatementTotals] = useState<CustomerStatementTotal[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);
  const [statementError, setStatementError] = useState('');
  const [paymentRows, setPaymentRows] = useState<CustomerPaymentHistoryItem[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'all' | string>('all');

  const load = useCallback(async () => {
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
  }, [customerId, online]);

  useEffect(() => { setPage(1); }, [query, status, sort]);
  useEffect(() => { void load(); }, [load]);

  const loadStatement = useCallback(async () => {
    if (!customerId || !online) return;
    setStatementLoading(true);
    setStatementError('');
    try {
      const statement = await getCustomerStatement(customerId, 100);
      setStatementLines(statement.lines);
      setStatementTotals(statement.totals);
    } catch (e) {
      setStatementLines([]);
      setStatementTotals([]);
      setStatementError(e instanceof Error ? e.message : 'تعذر تحميل كشف الحساب.');
    } finally {
      setStatementLoading(false);
    }
  }, [customerId, online]);

  useEffect(() => {
    if (view === 'statement') void loadStatement();
  }, [view, loadStatement]);

  const loadPayments = useCallback(async () => {
    if (!customerId || !online) return;
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const finance = await getCustomerStatement(customerId, 100);
      setPaymentRows(finance.payments);
    } catch (e) {
      setPaymentRows([]);
      setPaymentError(e instanceof Error ? e.message : 'تعذر تحميل سجل الدفعات.');
    } finally {
      setPaymentLoading(false);
    }
  }, [customerId, online]);

  useEffect(() => {
    if (view === 'payments') void loadPayments();
  }, [view, loadPayments]);

  const handledInvoiceRequest = useRef(0);
  useEffect(() => {
    if (!openFirstInvoiceRequest || handledInvoiceRequest.current === openFirstInvoiceRequest || !invoices.length || !online) return;
    handledInvoiceRequest.current = openFirstInvoiceRequest;
    void openInvoice(invoices[0]);
  }, [openFirstInvoiceRequest, invoices, online]);

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

  const filteredPayments = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return [...paymentRows]
      .filter((row) =>
        (paymentMethod === 'all' || row.payment.method === paymentMethod) &&
        (!needle ||
          String(row.invoice.invoice_number).includes(needle) ||
          (row.payment.reference ?? '').toLocaleLowerCase().includes(needle) ||
          row.payment.method.toLocaleLowerCase().includes(needle))
      )
      .sort((a, b) => {
        if (sort === 'highest') return b.payment.amount - a.payment.amount;
        if (sort === 'lowest') return a.payment.amount - b.payment.amount;
        const delta = new Date(b.payment.paid_at).getTime() - new Date(a.payment.paid_at).getTime();
        return sort === 'oldest' ? -delta : delta;
      });
  }, [paymentRows, query, paymentMethod, sort]);

  const paymentTotals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    for (const row of paymentRows) byCurrency.set(row.invoice.currency, (byCurrency.get(row.invoice.currency) ?? 0) + row.payment.amount);
    return { count: paymentRows.length, totals: Array.from(byCurrency.entries()), latest: paymentRows[0]?.payment.paid_at ?? null };
  }, [paymentRows]);

  const filteredStatement = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return [...statementLines]
      .filter((line) =>
        (status === 'all' || line.invoice.status === status) &&
        (!needle || String(line.invoice.invoice_number).includes(needle) || line.invoice.order_id.toLocaleLowerCase().includes(needle))
      )
      .sort((a, b) => {
        if (sort === 'highest') return b.invoice.total - a.invoice.total;
        if (sort === 'lowest') return a.invoice.total - b.invoice.total;
        const delta = new Date(b.invoice.created_at).getTime() - new Date(a.invoice.created_at).getTime();
        return sort === 'oldest' ? -delta : delta;
      });
  }, [statementLines, query, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const statementPages = Math.max(1, Math.ceil(filteredStatement.length / PAGE_SIZE));
  const paymentPages = Math.max(1, Math.ceil(filteredPayments.length / PAGE_SIZE));
  const activePage = Math.min(page, pages);
  const activeStatementPage = Math.min(page, statementPages);
  const activePaymentPage = Math.min(page, paymentPages);
  const visible = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const totals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    invoices.forEach((invoice) => byCurrency.set(invoice.currency, (byCurrency.get(invoice.currency) ?? 0) + invoice.total));
    return {
      count: invoices.length,
      open: invoices.filter((invoice) => invoice.status === 'issued' || invoice.status === 'partially_paid').length,
      totals: Array.from(byCurrency.entries())
    };
  }, [invoices]);

  async function openInvoice(invoice: CustomerInvoiceSummary) {
    if (!customerId) return;
    setSelected(invoice);
    setPayments([]);
    setItems([]);
    setDetailError('');
    setDetailLoading(true);
    try {
      const [nextPayments, nextItems] = await Promise.all([
        getCustomerInvoicePayments(customerId, invoice.id),
        getCustomerInvoiceItems(customerId, invoice.id)
      ]);
      setPayments(nextPayments);
      setItems(nextItems);
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'تعذر تحميل دفعات الفاتورة.');
    } finally {
      setDetailLoading(false);
    }
  }

  function clearFilters() {
    setQuery('');
    setStatus('all');
    setPaymentMethod('all');
    setSort('newest');
    setPage(1);
  }

  function downloadCurrentView() {
    const rows = view === 'payments'
      ? filteredPayments.map((row) => [
          new Date(row.payment.paid_at).toLocaleString('ar-YE'),
          row.invoice.invoice_number,
          row.payment.amount,
          PAYMENT_LABELS[row.payment.method] ?? row.payment.method,
          row.payment.reference ?? '',
        ])
      : view === 'statement'
        ? filteredStatement.map((line) => [
            line.invoice.invoice_number,
            new Date(line.invoice.created_at).toLocaleDateString('ar-YE'),
            line.invoice.total,
            line.paid,
            line.outstanding,
            STATUS_LABELS[line.invoice.status],
            line.invoice.due_at ? new Date(line.invoice.due_at).toLocaleDateString('ar-YE') : '',
          ])
        : filtered.map((invoice) => [
            invoice.invoice_number,
            new Date(invoice.created_at).toLocaleDateString('ar-YE'),
            invoice.total,
            STATUS_LABELS[invoice.status],
            invoice.due_at ? new Date(invoice.due_at).toLocaleDateString('ar-YE') : '',
          ]);
    if (!rows.length) return;
    const headers = view === 'payments'
      ? ['التاريخ','الفاتورة','المبلغ','طريقة الدفع','المرجع']
      : view === 'statement'
        ? ['الفاتورة','التاريخ','الإجمالي','المدفوع','المتبقي','الحالة','الاستحقاق']
        : ['الفاتورة','تاريخ الإصدار','الإجمالي','الحالة','الاستحقاق'];
    const csv = '\ufeff' + [headers, ...rows]
      .map((row) => row.map((value) => '"' + String(value ?? '').replaceAll('"', '""') + '"').join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'aghbari-finance-' + view + '-' + new Date().toISOString().slice(0, 10) + '.csv';
    anchor.click();
    URL.revokeObjectURL(url);
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
    <section className="content-card customer-finance-panel" aria-busy={loading || statementLoading || paymentLoading}>
      <div className="section-title">
        <div>
          <span className="eyebrow">المستندات المالية</span>
          <h2>الفواتير والمدفوعات</h2>
          <p>سجل تشغيلي مرتبط مباشرة بحساب شركتك، للقراءة فقط.</p>
        </div>
        <div className="customer-finance-head-actions">
          <button className="ghost" type="button" onClick={downloadCurrentView} disabled={loading || statementLoading || paymentLoading || (view === 'statement' ? !filteredStatement.length : view === 'payments' ? !filteredPayments.length : !filtered.length)}>
            تنزيل العرض
          </button>
          <button className="ghost" type="button" onClick={() => { if (view === 'statement') void loadStatement(); else if (view === 'payments') void loadPayments(); else void load(); }} disabled={loading || statementLoading || paymentLoading}>
            {loading || statementLoading || paymentLoading ? 'جارٍ التحديث…' : 'تحديث'}
          </button>
        </div>
      </div>

      <div className="history-tabs" role="tablist" aria-label="العرض المالي">
        <button type="button" role="tab" aria-selected={view === 'invoices'} className={view === 'invoices' ? 'active' : ''} onClick={() => setView('invoices')}>الفواتير والمدفوعات</button>
        <button type="button" role="tab" aria-selected={view === 'statement'} className={view === 'statement' ? 'active' : ''} onClick={() => setView('statement')}>كشف الحساب</button>
        <button type="button" role="tab" aria-selected={view === 'payments'} className={view === 'payments' ? 'active' : ''} onClick={() => setView('payments')}>سجل الدفعات</button>
      </div>

      <div className="customer-finance-summary" aria-label={view === 'invoices' ? 'ملخص المستندات المالية' : view === 'payments' ? 'ملخص الدفعات' : 'ملخص كشف الحساب'}>
        {view === 'invoices' ? (
          <>
            <article><small>إجمالي الفواتير</small><strong>{totals.count.toLocaleString('ar')}</strong><span>المستندات المتاحة للحساب</span></article>
            <article><small>المفتوحة</small><strong>{totals.open.toLocaleString('ar')}</strong><span>تحتاج متابعة أو سداد</span></article>
            <article><small>القيمة الإجمالية</small><strong>{totals.totals.length ? totals.totals.map(([currency, total]) => money(total, currency)).join(' · ') : '—'}</strong><span>{totals.totals.length > 1 ? 'مجمعة حسب العملة' : 'للفواتير المحملة'}</span></article>
          </>
        ) : view === 'payments' ? (
          <>
            <article><small>إجمالي الدفعات</small><strong>{paymentTotals.totals.map(([currency, total]) => money(total, currency)).join(' · ') || '—'}</strong><span>الدفعات المسجلة للحساب</span></article>
            <article><small>عدد الدفعات</small><strong>{paymentTotals.count.toLocaleString('ar')}</strong><span>العمليات المحملة</span></article>
            <article><small>آخر دفعة</small><strong>{paymentTotals.latest ? new Date(paymentTotals.latest).toLocaleDateString('ar-YE') : '—'}</strong><span>أحدث عملية مسجلة</span></article>
          </>
        ) : (
          <>
            <article><small>إجمالي الفواتير</small><strong>{statementTotals.map((item) => money(item.invoiced, item.currency)).join(' · ') || '—'}</strong><span>القيمة الإجمالية للمستندات</span></article>
            <article><small>إجمالي المدفوع</small><strong>{statementTotals.map((item) => money(item.paid, item.currency)).join(' · ') || '—'}</strong><span>الدفعات المسجلة للحساب</span></article>
            <article><small>الرصيد المتبقي</small><strong>{statementTotals.map((item) => money(item.outstanding, item.currency)).join(' · ') || '—'}</strong><span>المبلغ المفتوح حسب العملة</span></article>
          </>
        )}
      </div>

      <div className="customer-finance-toolbar" role="search">
        <label><span>بحث</span><input aria-label={view === "payments" ? "بحث الدفعات" : "بحث الفواتير"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={view === "payments" ? "رقم الفاتورة أو المرجع أو طريقة الدفع" : "رقم الفاتورة أو الطلب"} disabled={loading || statementLoading || paymentLoading} /></label>
        {view === 'payments' ? (
          <label><span>طريقة الدفع</span><select aria-label="فلترة طريقة الدفع" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} disabled={paymentLoading}><option value="all">كل الطرق</option>{Object.entries(PAYMENT_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        ) : (
          <label><span>الحالة</span><select aria-label="فلترة حالة الفاتورة" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} disabled={loading || statementLoading}><option value="all">كل الحالات</option>{Object.entries(STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        )}
        <label><span>الترتيب</span><select aria-label={view === "payments" ? "ترتيب الدفعات" : "ترتيب الفواتير"} value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} disabled={loading || statementLoading || paymentLoading}><option value="newest">الأحدث أولًا</option><option value="oldest">الأقدم أولًا</option><option value="highest">الأعلى قيمة</option><option value="lowest">الأقل قيمة</option></select></label>
        <button className="ghost" type="button" onClick={clearFilters} disabled={loading || statementLoading || paymentLoading || (!query && status === 'all' && paymentMethod === 'all' && sort === 'newest')}>مسح</button>
      </div>

      {view === 'payments' ? (
        paymentLoading ? (
          <div className="customer-statement-loading" role="status" aria-label="جارٍ تحميل سجل الدفعات">{Array.from({length:5}).map((_,index)=><article key={index}><i/><i/><i/><i/></article>)}</div>
        ) : paymentError ? (
          <div className="error-banner" role="alert"><span>{paymentError}</span><button className="ghost" type="button" onClick={() => void loadPayments()}>إعادة المحاولة</button></div>
        ) : !paymentRows.length ? (
          <div className="empty-state"><strong>لا توجد دفعات مسجلة</strong><span>ستظهر الدفعات المسجلة للحساب هنا عند توفرها.</span></div>
        ) : !filteredPayments.length ? (
          <div className="empty-state"><strong>لا توجد دفعات مطابقة</strong><span>غيّر البحث أو طريقة الدفع ثم أعد المحاولة.</span><button type="button" onClick={clearFilters}>مسح الفلاتر</button></div>
        ) : (
          <>
            <div className="customer-payment-table" role="table" aria-label="سجل دفعات العميل">
              <div className="customer-payment-row payment-head" role="row"><span>التاريخ</span><span>الفاتورة</span><span>المبلغ</span><span>الطريقة</span><span>المرجع</span><span>التفاصيل</span></div>
              {filteredPayments.slice((activePaymentPage - 1) * PAGE_SIZE, activePaymentPage * PAGE_SIZE).map((row) => (
                <button type="button" className="customer-payment-row" role="row" key={row.payment.id} onClick={() => void openInvoice(row.invoice)}>
                  <span>{new Date(row.payment.paid_at).toLocaleString('ar-YE')}</span><span>#{row.invoice.invoice_number}</span><strong>{money(row.payment.amount, row.invoice.currency)}</strong><span>{PAYMENT_LABELS[row.payment.method] ?? row.payment.method}</span><span>{row.payment.reference ?? 'دون مرجع'}</span><span>فتح الفاتورة</span>
                </button>
              ))}
            </div>
            <div className="directory-pagination" aria-label="صفحات الدفعات">
              <span>صفحة {activePaymentPage} / {paymentPages} · عرض {filteredPayments.length ? ((activePaymentPage - 1) * PAGE_SIZE) + 1 : 0}–{Math.min(activePaymentPage * PAGE_SIZE, filteredPayments.length)} من {filteredPayments.length}</span>
              <div><button className="ghost" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={activePaymentPage === 1}>السابق</button><button className="ghost" type="button" onClick={() => setPage((value) => Math.min(paymentPages, value + 1))} disabled={activePaymentPage === paymentPages}>التالي</button></div>
            </div>
          </>
        )
      ) : view === 'statement' ? (

        statementLoading ? (
          <div className="customer-statement-loading" role="status" aria-label="جارٍ تحميل كشف الحساب">{Array.from({length:5}).map((_,index)=><article key={index}><i/><i/><i/><i/></article>)}</div>
        ) : statementError ? (
          <div className="error-banner" role="alert"><span>{statementError}</span><button className="ghost" type="button" onClick={() => void loadStatement()}>إعادة المحاولة</button></div>
        ) : !statementLines.length ? (
          <div className="empty-state"><strong>لا يوجد كشف حساب متاح بعد</strong><span>سيظهر هنا سجل الفواتير والدفعات عند توفر مستندات مالية للحساب.</span></div>
        ) : !filteredStatement.length ? (
          <div className="empty-state"><strong>لا توجد نتائج مطابقة</strong><span>غيّر البحث أو فلتر الحالة ثم أعد المحاولة.</span><button type="button" onClick={clearFilters}>مسح الفلاتر</button></div>
        ) : (
          <>
            <div className="customer-statement-table" role="table" aria-label="كشف حساب العميل">
              <div className="customer-statement-row statement-head" role="row"><span>الفاتورة</span><span>التاريخ</span><span>الإجمالي</span><span>المدفوع</span><span>المتبقي</span><span>الحالة</span><span>الاستحقاق</span><span>تفاصيل</span></div>
              {filteredStatement.slice((activeStatementPage - 1) * PAGE_SIZE, activeStatementPage * PAGE_SIZE).map((line) => (
                <button type="button" className="customer-statement-row" role="row" key={line.invoice.id} onClick={() => void openInvoice(line.invoice)}>
                  <span>#{line.invoice.invoice_number}</span>
                  <span>{new Date(line.invoice.created_at).toLocaleDateString('ar-YE')}</span>
                  <strong>{money(line.invoice.total, line.invoice.currency)}</strong>
                  <strong>{money(line.paid, line.invoice.currency)}</strong>
                  <strong>{money(line.outstanding, line.invoice.currency)}</strong>
                  <span className={'finance-status finance-status-' + line.invoice.status}>{STATUS_LABELS[line.invoice.status]}</span>
                  <span>{line.invoice.due_at ? new Date(line.invoice.due_at).toLocaleDateString('ar-YE') : '—'}</span>
                  <span>فتح التفاصيل</span>
                </button>
              ))}
            </div>
            <div className="directory-pagination" aria-label="صفحات كشف الحساب">
              <span>صفحة {activeStatementPage} / {statementPages} · عرض {filteredStatement.length ? ((activeStatementPage - 1) * PAGE_SIZE) + 1 : 0}–{Math.min(activeStatementPage * PAGE_SIZE, filteredStatement.length)} من {filteredStatement.length}</span>
              <div><button className="ghost" type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={activeStatementPage === 1}>السابق</button><button className="ghost" type="button" onClick={() => setPage((value) => Math.min(statementPages, value + 1))} disabled={activeStatementPage === statementPages}>التالي</button></div>
            </div>
          </>
        )
      ) : (
        loading ? (
        <div className="customer-finance-loading-skeleton" role="status" aria-label="جارٍ تحميل الفواتير">{Array.from({length:4}).map((_,index)=><article key={index}><div><i/><i/></div><i/><i/><i/><span/></article>)}</div>
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
      )
      )}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="modal customer-invoice-modal" role="dialog" aria-modal="true" aria-labelledby="customer-invoice-title" onClick={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div><span className="eyebrow">المستند المالي</span><h2 id="customer-invoice-title">فاتورة #{selected.invoice_number}</h2><small>طلب #{selected.order_id}</small></div>
              <button type="button" autoFocus aria-label="إغلاق الفاتورة" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="invoice-detail-summary">
              <div><small>الحالة</small><strong>{STATUS_LABELS[selected.status]}</strong></div>
              <div><small>الإجمالي</small><strong>{money(selected.total, selected.currency)}</strong></div>
              <div><small>المدفوع</small><strong>{money(calculateInvoicePaid(payments), selected.currency)}</strong></div>
              <div><small>المتبقي</small><strong>{money(Math.max(0, selected.total - calculateInvoicePaid(payments)), selected.currency)}</strong></div>
            </div>
            {detailLoading ? (
              <div className="invoice-detail-loading-skeleton" role="status" aria-label="جارٍ تحميل بنود ومدفوعات الفاتورة"><div><i/><i/><i/></div><div className="invoice-detail-loading-table">{Array.from({length:4}).map((_,index)=><article key={index}><i/><i/><i/><i/></article>)}</div></div>
            ) : detailError ? (
              <div className="error-banner" role="alert"><span>{detailError}</span><button className="ghost" type="button" onClick={() => void openInvoice(selected)}>إعادة المحاولة</button></div>
            ) : (
              <>
                {items.length ? (
                  <div className="invoice-items-list">
                    <div className="invoice-items-head"><span>البند</span><span>الكمية</span><span>السعر</span><span>الإجمالي</span></div>
                    {items.map((item) => (
                      <article key={item.id}>
                        <div><strong>{item.description}</strong><small dir="ltr">{item.product_id}</small></div>
                        <span>{item.quantity.toLocaleString('ar-YE')}</span>
                        <span>{money(item.unit_price, selected.currency)}</span>
                        <strong>{money(item.line_total, selected.currency)}</strong>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state"><strong>لا توجد بنود فاتورة مسجلة</strong><span>لا توجد بنود متاحة للعرض في هذا المستند.</span></div>
                )}
                {payments.length ? (
                  <div className="invoice-payment-list">
                    <div className="invoice-payment-heading"><strong>المدفوعات المسجلة</strong><span>{payments.length.toLocaleString('ar-YE')}</span></div>
                    {payments.map((payment) => (
                      <article key={payment.id}>
                        <div><strong>{money(payment.amount, selected.currency)}</strong><small>{PAYMENT_LABELS[payment.method] ?? payment.method}</small></div>
                        <div><span>{payment.reference ?? 'دون مرجع'}</span><small>{new Date(payment.paid_at).toLocaleString('ar-YE')}</small></div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state"><strong>لا توجد دفعات مسجلة</strong><span>لم تُسجل مدفوعات على هذه الفاتورة حتى الآن.</span></div>
                )}
              </>
            )}
            <div className="order-detail-actions"><button className="ghost" type="button" onClick={() => setSelected(null)}>إغلاق</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
