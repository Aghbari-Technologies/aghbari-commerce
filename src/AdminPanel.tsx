import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CustomerTier, OrderStatus } from './domain/types';
import { formatMoney } from './domain/pricing';
import { adjustInventory, createCategory, setProductPrice, upsertProduct } from './services/admin';
import { buildImportReconciliationReport, commitProductImport, stageProductImport, type ImportReconciliationReport } from './services/importExcel';
import { getCategories, type CategoryOption } from './services/categories';
import { uploadProductImage } from './services/imagePipeline';
import { bulkTransitionOrders, getStaffOrderDetail, getStaffOrders, transitionOrder, type StaffOrderDetail, type StaffOrderSummary, type BulkTransitionResult } from './services/staffOrders';
import { supabase } from './lib/supabase';
import PurchasingPanel from './PurchasingPanel';
import ExportPanel from './ExportPanel';
import CustomerPanel from './CustomerPanel';
import InventoryPanel from './InventoryPanel';
import FinancePanel from './FinancePanel';
import ClientControlPanel from './ClientControlPanel';
import AdminExecutiveDashboard from './AdminExecutiveDashboard';
import NotificationPanel from './NotificationPanel';
import StaffOperationsPanel from './StaffOperationsPanel';
import StaffAccessPanel from './StaffAccessPanel';
import CatalogManagementPanel from './CatalogManagementPanel';
import CategoryManagementPanel from './CategoryManagementPanel';
import PurchaseReceiptHistoryPanel from './PurchaseReceiptHistoryPanel';
import InventoryHistoryPanel from './InventoryHistoryPanel';
import FinanceOperationsHistoryPanel from './FinanceOperationsHistoryPanel';
import PricingMatrixPanel from './PricingMatrixPanel';
import WarehouseDirectoryPanel from './WarehouseDirectoryPanel';
import SupplierLedgerPanel from './SupplierLedgerPanel';
import InventoryActivityPanel from './InventoryActivityPanel';
import RecordDetailDrawer from './RecordDetailDrawer';
import OfflineRecoveryPanel from './OfflineRecoveryPanel';
import AdminBoundaryCenter from './AdminBoundaryCenter';
import './admin-executive-dashboard.css';
import { adminTargetForPath, getAdminStructureForRole } from './structure/admin-structure';

interface StaffProduct { id: string; sku: string; name: string; unit: string; }
interface Warehouse { id: string; name: string; }
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];
const STAFF_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse']);
const STATUS_LABELS: Record<OrderStatus, string> = { draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي' };

function allowedNextStatuses(status: OrderStatus, role: UserRole): OrderStatus[] {
  if (status === 'pending' && ['owner', 'admin', 'sales'].includes(role)) return ['confirmed', 'cancelled'];
  if (status === 'confirmed' && ['owner', 'admin', 'warehouse'].includes(role)) return ['preparing', 'cancelled'];
  if (status === 'preparing' && ['owner', 'admin', 'warehouse'].includes(role)) return ['ready', 'cancelled'];
  if (status === 'ready' && ['owner', 'admin', 'warehouse', 'sales'].includes(role)) return ['completed'];
  return [];
}

export default function AdminPanel({ role, userId }: { role: UserRole; userId: string | null }) {
  const [products, setProducts] = useState<StaffProduct[]>([]); const [warehouses, setWarehouses] = useState<Warehouse[]>([]); const [categories, setCategories] = useState<CategoryOption[]>([]); const [orders, setOrders] = useState<StaffOrderSummary[]>([]); const [ordersLoading, setOrdersLoading] = useState(false); const [orderQuery, setOrderQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false); const [commandQuery, setCommandQuery] = useState(''); const [orderStatusFilter, setOrderStatusFilter] = useState<'all'|OrderStatus>('all'); const [orderPage, setOrderPage] = useState(1);
  const [product, setProduct] = useState({ sku: '', name: '', unit: 'كرتون', categoryId: '', description: '', barcode: '' }); const [category, setCategory] = useState({ name: '', slug: '', parentId: '' }); const [selectedProduct, setSelectedProduct] = useState(''); const [tier, setTier] = useState<CustomerTier>('wholesale'); const [price, setPrice] = useState(''); const [warehouseId, setWarehouseId] = useState(''); const [delta, setDelta] = useState(''); const [reason, setReason] = useState(''); const [imageFile, setImageFile] = useState<File | null>(null); const [importFile, setImportFile] = useState<File | null>(null); const [importJobId, setImportJobId] = useState<string | null>(null); const [lastImportResult, setLastImportResult] = useState<{ imported_rows: number; products_created: number; products_updated: number; inventory_changed: number } | null>(null); const [lastImportReconciliation, setLastImportReconciliation] = useState<ImportReconciliationReport | null>(null); const [importPreview, setImportPreview] = useState<{ rows: number; invalid: number; fingerprint: string; contractVersion: string; sourceName: string; diagnostics: { rowNumber: number; field: string; message: string }[] } | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null); const [detailOrderId, setDetailOrderId] = useState<string | null>(null); const [detailOrder, setDetailOrder] = useState<StaffOrderDetail | null>(null); const [detailOrderLoading, setDetailOrderLoading] = useState(false); const [detailOrderError, setDetailOrderError] = useState(''); const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set()); const [bulkTargetStatus, setBulkTargetStatus] = useState<OrderStatus | ''>(''); const [bulkPreviewOpen, setBulkPreviewOpen] = useState(false); const [bulkIdempotencyKey, setBulkIdempotencyKey] = useState<string | null>(null); const [bulkBusy, setBulkBusy] = useState(false);

  const reload = useCallback(async () => { if (!supabase) return; setOrdersLoading(true); try { const [{ data: productRows, error: productError }, { data: warehouseRows, error: warehouseError }, categoryRows, orderRows] = await Promise.all([supabase.from('products').select('id,sku,name,unit').eq('status', 'active').order('name').limit(200), supabase.from('warehouses').select('id,name').eq('is_active', true).order('created_at'), getCategories(), getStaffOrders(50)]); if (productError) throw productError; if (warehouseError) throw warehouseError; setProducts((productRows ?? []) as StaffProduct[]); setCategories(categoryRows); setOrders(orderRows); const nextWarehouses = (warehouseRows ?? []) as Warehouse[]; setWarehouses(nextWarehouses); setWarehouseId(current => current || nextWarehouses[0]?.id || ''); } finally { setOrdersLoading(false); } }, []);
  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل مركز التحكم.')); }, [reload]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); setCommandQuery(''); }
      if (event.key === 'Escape') setCommandOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const target = adminTargetForPath(window.location.pathname);
    if (!target) return;
    const id = window.setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => { setOrderPage(1); }, [orderQuery, orderStatusFilter]);
  async function openOrderDetail(orderId: string) {
    setDetailOrderId(orderId); setDetailOrder(null); setDetailOrderError(''); setDetailOrderLoading(true);
    try { setDetailOrder(await getStaffOrderDetail(orderId)); }
    catch (e) { setDetailOrderError(e instanceof Error ? e.message : 'تعذر تحميل تفاصيل الطلب.'); }
    finally { setDetailOrderLoading(false); }
  }
  function closeOrderDetail() { setDetailOrderId(null); setDetailOrder(null); setDetailOrderError(''); setDetailOrderLoading(false); }
  async function run(action: () => Promise<unknown>, success: string) { setBusy(true); setError(null); setMessage(null); try { await action(); setMessage(success); await reload(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); } finally { setBusy(false); } }
  async function uploadImage() { if (!selectedProduct || !imageFile) return; await run(async () => { await uploadProductImage(selectedProduct, imageFile); setImageFile(null); }, 'تم رفع الصورة ومعالجتها وتسجيلها بأمان.'); }
  async function stageImport() { if (!importFile) return; setBusy(true); setError(null); setMessage(null); setImportJobId(null); setImportPreview(null); try { const result = await stageProductImport(importFile); setImportPreview({ rows: result.rows.length, invalid: result.diagnostics.length, fingerprint: result.fingerprint, contractVersion: result.contractVersion ?? 'xlsx-v1', sourceName: importFile.name, diagnostics: result.diagnostics.slice(0, 12) }); if (result.jobId) { setImportJobId(result.jobId); setMessage('تمت المعاينة والتحقق على الخادم. يمكنك اعتماد الاستيراد الذري.'); } else setError('الملف يحتوي أخطاء ويجب إصلاحها قبل الاستيراد.'); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تجهيز ملف الاستيراد.'); } finally { setBusy(false); } }
  async function commitImport() { if (!importJobId || !warehouseId || !importPreview) return; const correlationId=importJobId; const preview=importPreview; await run(async () => { const result = await commitProductImport(correlationId, warehouseId); setLastImportResult(result); setLastImportReconciliation(buildImportReconciliationReport({ sourceName: preview.sourceName, sourceFingerprint: preview.fingerprint, correlationId, inputRows: preview.rows, invalidRows: preview.invalid, result })); setImportJobId(null); setImportFile(null); setImportPreview(null); return result; }, 'تم اعتماد الاستيراد بالكامل وتسجيل أثر المخزون والتدقيق.'); }
  async function changeOrderStatus(orderId: string, status: OrderStatus) { await run(async () => transitionOrder(orderId, status), `تم تحديث حالة الطلب إلى: ${STATUS_LABELS[status]}.`); }
  function toggleOrderSelection(orderId: string) {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (next.has(orderId)) next.delete(orderId); else next.add(orderId);
      return next;
    });
  }
  const selectedOrders = useMemo(() => orders.filter((order) => selectedOrderIds.has(order.id)), [orders, selectedOrderIds]);
  const bulkAllowedTargets = useMemo(() => {
    if (!selectedOrders.length) return [] as OrderStatus[];
    return (Object.keys(STATUS_LABELS) as OrderStatus[]).filter((candidate) =>
      selectedOrders.every((order) => allowedNextStatuses(order.status, role).includes(candidate))
    );
  }, [selectedOrders, role]);
  function openBulkPreview() {
    const target = bulkAllowedTargets[0] ?? '';
    if (!selectedOrders.length || !target) {
      setError('اختر طلبات لها انتقال مشترك مسموح به قبل المعاينة.');
      return;
    }
    setBulkTargetStatus(target);
    setBulkIdempotencyKey(crypto.randomUUID());
    setBulkPreviewOpen(true);
    setError(null);
  }
  async function executeBulkTransition() {
    if (!bulkTargetStatus || !selectedOrders.length || !bulkIdempotencyKey) return;
    setBulkBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await bulkTransitionOrders(selectedOrders.map((order) => order.id), bulkTargetStatus, bulkIdempotencyKey);
      const applied = result as BulkTransitionResult[];
      setMessage(`تم تحديث ${applied.length} طلبات ذريًا إلى: ${STATUS_LABELS[bulkTargetStatus]}.`);
      setSelectedOrderIds(new Set());
      setBulkPreviewOpen(false);
      setBulkIdempotencyKey(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية الجماعية. لم يتم اعتماد العملية جزئيًا.');
    } finally {
      setBulkBusy(false);
    }
  }
  const canCatalog = role === 'owner' || role === 'admin' || role === 'sales';
  const canCategory = role === 'owner' || role === 'admin';
  const canInventory = role === 'owner' || role === 'admin' || role === 'warehouse';
  const canOrderWorkflow = STAFF_ROLES.has(role);
  const canFinance = ['owner', 'admin', 'sales'].includes(role);
  const canAdmin = role === 'owner' || role === 'admin';
  const commands: Array<[string, string]> = getAdminStructureForRole(role)
    .flatMap((group) => group.items
      .filter((item) => item.status === 'live' && Boolean(item.target))
      .map((item) => [item.label, item.target!] as [string, string]));
  const visibleCommands = commands.filter(([label]) => label.includes(commandQuery.trim()) || !commandQuery.trim());
  const visibleOrders = useMemo(() => {
    const needle = orderQuery.trim().toLowerCase();
    return orders.filter((order) => (orderStatusFilter === 'all' || order.status === orderStatusFilter) && (!needle || String(order.order_number).includes(needle) || String(order.customer_name ?? '').toLowerCase().includes(needle) || String(STATUS_LABELS[order.status] ?? order.status).toLowerCase().includes(needle)));
  }, [orders, orderQuery, orderStatusFilter]);
  const orderPages = Math.max(1, Math.ceil(visibleOrders.length / 10));
  const activeOrderPage = Math.min(orderPage, orderPages);
  const pagedOrders = visibleOrders.slice((activeOrderPage - 1) * 10, activeOrderPage * 10);
  const pageOrderIds = pagedOrders.map((order) => order.id);
  const allPageSelected = pageOrderIds.length > 0 && pageOrderIds.every((id) => selectedOrderIds.has(id));
  function togglePageSelection() {
    setSelectedOrderIds((current) => {
      const next = new Set(current);
      if (allPageSelected) pageOrderIds.forEach((id) => next.delete(id));
      else pageOrderIds.forEach((id) => next.add(id));
      return next;
    });
  }

  return <section className="admin-panel" id="account">
    <AdminExecutiveDashboard role={role} />
      <nav className="admin-command-nav" aria-label="تنقل مركز التشغيل">
        <a href="#account">المركز</a>
        {canOrderWorkflow&&<a href="#admin-orders">الطلبات وسير العمل</a>}
        {canCatalog&&<a href="#admin-customers">العملاء</a>}
        {canCatalog&&<a href="#admin-catalog">الكتالوج والمنتجات</a>}
        {canCategory&&<a href="#admin-categories">دليل التصنيفات</a>}{canCategory&&<a href="#admin-category-create">إضافة تصنيف</a>}
        {canCatalog&&<a href="#admin-pricing">التسعير</a>}{canCatalog&&<a href="#admin-pricing-matrix">مصفوفة الأسعار</a>}
        {canCatalog&&<a href="#admin-product-image">صور المنتجات</a>}
        {canCatalog&&<a href="#admin-import">الاستيراد الآمن</a>}
        {canInventory&&<a href="#admin-inventory">المخزون</a>}
        {canInventory&&<a href="#admin-inventory-adjust">تعديل المخزون</a>}{canInventory&&<a href="#admin-inventory-history">دفتر حركة المخزون</a>}{canInventory&&<a href="#admin-inventory-activity">نشاط المخزون</a>}{canInventory&&<a href="#admin-warehouses">المستودعات والفروع</a>}
        {canInventory&&<a href="#admin-purchasing">المشتريات والموردون</a>}{canInventory&&<a href="#admin-suppliers">دليل الموردين والحساب</a>}{canInventory&&<a href="#admin-receipts">سجل الاستلام</a>}
        {canFinance&&<a href="#admin-finance">المالية</a>}{canFinance&&<a href="#admin-finance-history">السجل المالي</a>}
        {canInventory&&<a href="#admin-export">التصدير</a>}
        {canCategory&&<a href="#admin-settings">إعدادات العميل</a>}
        {canOrderWorkflow&&<a href="#admin-notifications">الإشعارات</a>}
        {canOrderWorkflow&&<a href="#admin-governance">التدقيق والتكاملات</a>}
        {userId&&<a href="#admin-recovery">التعارض والاسترداد</a>}
        {canOrderWorkflow&&<a href="#admin-access">الأدوار والصلاحيات</a>}
      </nav>
      <button type="button" className="admin-command-trigger" aria-haspopup="dialog" aria-expanded={commandOpen} onClick={() => { setCommandOpen(true); setCommandQuery(''); }}>⌘ مركز الأوامر <kbd>Ctrl K</kbd></button>
      <div className="admin-workspace-strip" aria-label="مساحات العمل السريعة">
        <div className="admin-workspace-strip-label">
          <span className="eyebrow">مساحات العمل</span>
          <strong>الوصول المباشر</strong>
          <small>كل رابط يفتح القسم الفعلي في نفس مركز التشغيل.</small>
        </div>
        <div className="admin-workspace-links">
          {getAdminStructureForRole(role).flatMap((group) => group.items.filter((item) => item.status === 'live' && item.target).map((item) => (
            <a key={item.id} href={item.target} title={item.note ?? item.label}>
              <span>{item.label}</span><i aria-hidden="true">↗</i>
            </a>
          ))).slice(0, 18)}
        </div>
      </div>
      <section className="admin-command-overview" id="admin-dashboard" aria-label="موجز مساحات العمل">
        {role !== 'viewer' && <a href="#admin-orders"><span className="workspace-overview-icon" aria-hidden="true">🧾</span><div><small>المبيعات</small><strong>الطلبات والعملاء</strong><em>متابعة الدورة اليومية</em></div><b>↗</b></a>}
        {canCatalog && <a href="#admin-catalog"><span className="workspace-overview-icon" aria-hidden="true">▣</span><div><small>الكتالوج</small><strong>الأصناف والتسعير</strong><em>تحرير ونشر بيانات البيع</em></div><b>↗</b></a>}
        {canInventory && <a href="#admin-inventory"><span className="workspace-overview-icon" aria-hidden="true">⌂</span><div><small>المخزون</small><strong>المستودعات والحركات</strong><em>تنفيذ العمليات الميدانية</em></div><b>↗</b></a>}
        {canFinance && <a href="#admin-finance"><span className="workspace-overview-icon" aria-hidden="true">◫</span><div><small>المالية</small><strong>الفواتير والتحصيل</strong><em>الحركة المالية التشغيلية</em></div><b>↗</b></a>}
        {canOrderWorkflow && <a href="#admin-governance"><span className="workspace-overview-icon" aria-hidden="true">✓</span><div><small>الحوكمة</small><strong>التدقيق والتكاملات</strong><em>سجل الأحداث وصندوق التكاملات</em></div><b>↗</b></a>}
        {canAdmin && <a href="#admin-access"><span className="workspace-overview-icon" aria-hidden="true">♙</span><div><small>الوصول</small><strong>المستخدمون والصلاحيات</strong><em>إدارة أدوار الفريق</em></div><b>↗</b></a>}
      </section>
      {commandOpen && <div className="admin-command-backdrop" role="presentation" onClick={() => setCommandOpen(false)}>
        <section className="admin-command-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-command-title" onClick={(event) => event.stopPropagation()}>
          <div className="section-heading"><div><span className="eyebrow">تشغيل سريع</span><h2 id="admin-command-title">مركز الأوامر</h2></div><button type="button" className="ghost" onClick={() => setCommandOpen(false)}>إغلاق</button></div>
          <input autoFocus aria-label="بحث أوامر الإدارة" placeholder="ابحث عن إجراء أو قسم…" value={commandQuery} onChange={(event) => setCommandQuery(event.target.value)} />
          <div className="admin-command-results">{visibleCommands.length ? visibleCommands.map(([label,target]) => <a key={target} href={target} onClick={() => setCommandOpen(false)}>{label}<span>↗</span></a>) : <div className="cart-empty">لا توجد إجراءات مطابقة.</div>}</div>
          <small>Ctrl+K أو ⌘K · تظهر فقط الإجراءات المسموح بها لدورك الحالي.</small>
        </section>
      </div>}
    <details className="admin-operations" open>
      <summary>مركز التشغيل التفصيلي وإدارة البيانات</summary>
      <div className="section-heading"><div><span className="eyebrow">إدارة التشغيل</span><h2>مركز التحكم</h2></div><span>الصلاحيات تُفرض على الخادم أيضًا</span></div>
      <div className="admin-grid">
        {canCatalog && <form className="admin-card" id="admin-product-create" onSubmit={(e) => { e.preventDefault(); void run(() => upsertProduct({ sku: product.sku, name: product.name, unit: product.unit, categoryId: product.categoryId || null, description: product.description || null, barcode: product.barcode || null }), 'تم حفظ المنتج.'); }}><h3>منتج جديد</h3><input aria-label="SKU" placeholder="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} required /><input aria-label="اسم المنتج" placeholder="اسم المنتج" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required /><input aria-label="الوحدة" placeholder="الوحدة" value={product.unit} onChange={(e) => setProduct({ ...product, unit: e.target.value })} required /><input aria-label="باركود المنتج" inputMode="numeric" autoComplete="off" maxLength={80} placeholder="الباركود (اختياري)" value={product.barcode} onChange={(e) => setProduct({ ...product, barcode: e.target.value })} /><select aria-label="تصنيف المنتج" value={product.categoryId} onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}><option value="">بدون تصنيف</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><textarea aria-label="وصف المنتج" placeholder="وصف المنتج (اختياري)" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={3} /><button disabled={busy}>حفظ المنتج</button></form>}
        {canCategory && <form className="admin-card" id="admin-category-create" onSubmit={(e) => { e.preventDefault(); void run(() => createCategory(category.name.trim(), category.slug.trim(), category.parentId || null), 'تم إنشاء التصنيف.'); }}><h3>تصنيف جديد</h3><input aria-label="اسم التصنيف" placeholder="اسم التصنيف" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} required /><input aria-label="معرف التصنيف" placeholder="slug مثل rice" value={category.slug} onChange={(e) => setCategory({ ...category, slug: e.target.value })} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><select aria-label="التصنيف الأب" value={category.parentId} onChange={(e) => setCategory({ ...category, parentId: e.target.value })}><option value="">تصنيف رئيسي</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={busy}>حفظ التصنيف</button></form>}
        {canCatalog && <form className="admin-card" id="admin-pricing" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !price) return; void run(() => setProductPrice(selectedProduct, tier, Number(price)), 'تم تحديث السعر الفعّال.'); }}><h3>تسعير حسب الفئة</h3><select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select><select aria-label="تصنيف العميل" value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)}>{tiers.map((item) => <option key={item} value={item}>{item}</option>)}</select><input aria-label="السعر" type="number" min="0" step="0.01" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} required /><button disabled={busy}>اعتماد السعر</button></form>}
        {canCatalog && <form className="admin-card" id="admin-product-image" onSubmit={(e) => { e.preventDefault(); void uploadImage(); }}><h3>صورة المنتج</h3><select aria-label="منتج الصورة" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select><input aria-label="صورة المنتج" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} required /><small>يتم التحويل إلى WebP وضغط الصورة قبل التخزين.</small><button disabled={busy || !selectedProduct || !imageFile}>رفع الصورة</button></form>}
        {canCatalog && <><form className="admin-card" id="admin-import" onSubmit={(e) => { e.preventDefault(); void stageImport(); }}><h3>استيراد Excel آمن</h3><input aria-label="ملف المنتجات" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportJobId(null); setImportPreview(null); }} required />{importPreview && <div className="import-reconciliation" aria-live="polite"><details><summary>معاينة خريطة الأعمدة والمصدر</summary><div className="import-mapping-grid"><span>SKU</span><b>sku</b><span>Name</span><b>name</b><span>Unit</span><b>unit</b><span>Category</span><b>category</b><span>Quantity</span><b>quantity</b><span>Retail Price</span><b>prices.retail</b><span>Wholesale Price</span><b>prices.wholesale</b><span>Distributor Price</span><b>prices.distributor</b></div><small>Correlation / Job ID: <code dir="ltr">{importJobId ?? 'تم الاعتماد'}</code></small></details><small>المصدر: {importPreview.sourceName} · العقد: {importPreview.contractVersion} · الصفوف: {importPreview.rows} · الأخطاء: {importPreview.invalid} · بصمة المصدر: <code dir="ltr">{importPreview.fingerprint.slice(0, 16)}…</code></small>{importPreview.diagnostics.length > 0 && <details><summary>تفاصيل أول الأخطاء</summary><ul>{importPreview.diagnostics.map((item, index) => <li key={index}>صف {item.rowNumber} · {item.field}: {item.message}</li>)}</ul></details>}</div>}{!importJobId ? <button disabled={busy || !importFile}>رفع ومعاينة</button> : <button disabled={busy || !warehouseId} onClick={(e) => { e.preventDefault(); void commitImport(); }}>اعتماد الاستيراد الذري</button>}</form>{lastImportResult && <div className="import-reconciliation" role="status"><strong>آخر عملية اعتماد</strong><div><span>صفوف: {lastImportResult.imported_rows}</span><span>منشأة: {lastImportResult.products_created}</span><span>محدثة: {lastImportResult.products_updated}</span><span>حركات مخزون: {lastImportResult.inventory_changed}</span></div></div>}{lastImportReconciliation && <div className="import-reconciliation import-reconciliation-final" role="status"><div className="section-heading"><div><span className="eyebrow">Reconciliation Report</span><h3>تقرير مصالحة الاستيراد</h3></div><button type="button" className="ghost" onClick={() => { const blob=new Blob([JSON.stringify(lastImportReconciliation,null,2)],{type:'application/json;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`aghbari-import-reconciliation-${lastImportReconciliation.correlationId}.json`; a.click(); URL.revokeObjectURL(url); }}>تنزيل التقرير</button></div><div><span>المصدر: {lastImportReconciliation.sourceName}</span><span>العقد: {lastImportReconciliation.contractVersion}</span><span>المعرف: <code dir="ltr">{lastImportReconciliation.correlationId}</code></span><span>صفوف المصدر: {lastImportReconciliation.inputRows}</span><span>أخطاء محجوزة: {lastImportReconciliation.invalidRows}</span><span>تم اعتمادها: {lastImportReconciliation.committedRows}</span><span>منشأة: {lastImportReconciliation.productsCreated}</span><span>محدثة: {lastImportReconciliation.productsUpdated}</span><span>حركات مخزون: {lastImportReconciliation.inventoryChanged}</span><span>وقت الاعتماد: {new Date(lastImportReconciliation.completedAt).toLocaleString('ar-YE')}</span></div><small>التقرير يلخص نتيجة الخادم بعد الاعتماد؛ لا يمثل مصدر حقيقة بديلًا.</small></div>}</>}
        {canInventory && <form className="admin-card" id="admin-inventory-adjust" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !warehouseId || !delta) return; void run(() => adjustInventory(warehouseId, selectedProduct, Number(delta), reason.trim()), 'تم تعديل المخزون وتسجيل الحركة.'); }}><h3>تعديل المخزون</h3><select aria-label="المستودع" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select><select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input aria-label="التغيير" type="number" step="1" placeholder="+ أو - الكمية" value={delta} onChange={(e) => setDelta(e.target.value)} required /><input aria-label="سبب التعديل" placeholder="سبب التعديل" value={reason} onChange={(e) => setReason(e.target.value)} required /><button disabled={busy}>تسجيل الحركة</button></form>}
      </div>
      {canOrderWorkflow && <div className="cart-panel" id="admin-orders"><div className="section-heading"><div><span className="eyebrow">التشغيل</span><h2>إدارة الطلبات</h2></div><span>{visibleOrders.length}/{orders.length} طلبات</span></div><div className="admin-card admin-order-filter"><label htmlFor="admin-order-search">بحث الطلبات</label><div className="order-queue-toolbar"><input id="admin-order-search" value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} placeholder="رقم الطلب أو اسم العميل أو الحالة" /><select aria-label="فلترة حالة الطلب" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as 'all'|OrderStatus)}><option value="all">كل الحالات</option>{(Object.keys(STATUS_LABELS) as OrderStatus[]).map((key) => <option key={key} value={key}>{STATUS_LABELS[key]}</option>)}</select><button type="button" className="ghost" onClick={() => { setOrderQuery(''); setOrderStatusFilter('all'); setOrderPage(1); }} disabled={!orderQuery && orderStatusFilter === 'all'}>مسح</button></div></div>{ordersLoading ? <div className="cart-empty">جارٍ تحميل الطلبات…</div> : !orders.length ? <div className="cart-empty">لا توجد طلبات تشغيلية بعد.</div> : !visibleOrders.length ? <div className="cart-empty">لا توجد نتائج مطابقة للبحث.</div> : <div className="cart-lines">
        <div className="bulk-order-toolbar" aria-label="العمليات الجماعية">
          <label className="bulk-order-select"><input type="checkbox" checked={allPageSelected} onChange={togglePageSelection} aria-label={allPageSelected ? 'إلغاء تحديد طلبات الصفحة' : 'تحديد طلبات الصفحة'} /><span>تحديد الصفحة</span></label>
          <span className="bulk-order-count">{selectedOrders.length} محددة</span>
          <select aria-label="الانتقال الجماعي" value={bulkTargetStatus} onChange={(e) => setBulkTargetStatus(e.target.value as OrderStatus | '')} disabled={!selectedOrders.length || !bulkAllowedTargets.length || bulkBusy}>
            <option value="">اختر انتقالًا مشتركًا</option>
            {bulkAllowedTargets.map((next) => <option key={next} value={next}>{STATUS_LABELS[next]}</option>)}
          </select>
          <button type="button" onClick={openBulkPreview} disabled={!selectedOrders.length || !bulkTargetStatus || !bulkAllowedTargets.includes(bulkTargetStatus) || bulkBusy}>معاينة العملية</button>
          {selectedOrders.length > 0 && <button type="button" className="ghost" onClick={() => { setSelectedOrderIds(new Set()); setBulkTargetStatus(''); setBulkPreviewOpen(false); setBulkIdempotencyKey(null); }} disabled={bulkBusy}>إلغاء التحديد</button>}
        </div>
        {pagedOrders.map((order) => <article className="cart-line" key={order.id}>
          <label className="bulk-order-row-select"><input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => toggleOrderSelection(order.id)} aria-label={`تحديد طلب #${order.order_number}`} /><span className="sr-only">تحديد</span></label>
          <div><strong>طلب #{order.order_number}</strong><small>العميل: {order.customer_name}</small></div>
          <div><strong>{formatMoney(order.total)} {order.currency}</strong><small>الحالة: {STATUS_LABELS[order.status]}</small></div>
          <div className="status-actions"><button type="button" className="ghost" onClick={() => void openOrderDetail(order.id)}>التفاصيل</button>{allowedNextStatuses(order.status, role).map((next) => <button key={next} disabled={busy || bulkBusy} onClick={() => void changeOrderStatus(order.id, next)}>{STATUS_LABELS[next]}</button>)}</div>
        </article>)}
      </div>}{visibleOrders.length > 0 && <div className="order-queue-pagination" aria-label="صفحات الطلبات"><span>صفحة {activeOrderPage} / {orderPages} · {visibleOrders.length} نتيجة</span><div><button type="button" className="ghost" onClick={() => setOrderPage(p => Math.max(1,p-1))} disabled={activeOrderPage===1}>السابق</button><button type="button" className="ghost" onClick={() => setOrderPage(p => Math.min(orderPages,p+1))} disabled={activeOrderPage===orderPages}>التالي</button></div></div>}
      {bulkPreviewOpen && <div className="admin-command-backdrop" role="presentation" onClick={() => !bulkBusy && setBulkPreviewOpen(false)}>
        <section className="admin-command-dialog bulk-order-preview" role="dialog" aria-modal="true" aria-labelledby="bulk-order-preview-title" onClick={(event) => event.stopPropagation()}>
          <div className="section-heading"><div><span className="eyebrow">قبل الاعتماد</span><h2 id="bulk-order-preview-title">معاينة العملية الجماعية</h2></div><button type="button" className="ghost" onClick={() => setBulkPreviewOpen(false)} disabled={bulkBusy}>إغلاق</button></div>
          <p>سيتم تطبيق انتقال <strong>{bulkTargetStatus ? STATUS_LABELS[bulkTargetStatus] : '—'}</strong> على {selectedOrders.length} طلبات داخل نفس المؤسسة. يتحقق الخادم مجددًا من الصلاحية والحالة والمخزون قبل أي تعديل، وتُطبق العملية في معاملة واحدة.</p>
          <div className="bulk-order-preview-list">{selectedOrders.map((order) => <div key={order.id}><strong>#{order.order_number}</strong><span>{STATUS_LABELS[order.status]} → {bulkTargetStatus ? STATUS_LABELS[bulkTargetStatus] : '—'}</span></div>)}</div>
          <div className="status-actions"><button type="button" onClick={() => void executeBulkTransition()} disabled={bulkBusy || !bulkTargetStatus || !bulkAllowedTargets.includes(bulkTargetStatus)}>{bulkBusy ? 'جارٍ الاعتماد…' : 'اعتماد العملية الذرية'}</button><button type="button" className="ghost" onClick={() => setBulkPreviewOpen(false)} disabled={bulkBusy}>إلغاء</button></div>
        </section>
      </div>}
      </div>}
      {detailOrderId && (() => {
        const order = orders.find((item) => item.id === detailOrderId);
        if (!order) return null;
        const lineSummary = detailOrder?.items.map((item, index) =>
          String(index + 1) + '. ' + item.name + ' · ' + item.sku + ' · ' + item.quantity + ' ' + item.unit + ' × ' + formatMoney(item.unit_price) + ' ' + detailOrder?.currency + ' = ' + formatMoney(item.line_total) + ' ' + detailOrder?.currency + ' · ' + item.pricing_tier
        ).join('\n') ?? '';
        const fields = [
          { label: 'العميل', value: order.customer_name },
          { label: 'الحالة', value: STATUS_LABELS[order.status] },
          { label: 'الإجمالي', value: formatMoney(detailOrder?.total ?? order.total) + ' ' + (detailOrder?.currency ?? order.currency) },
          { label: 'المعرّف', value: order.id },
          { label: 'الحركات التالية المتاحة', value: allowedNextStatuses(order.status, role).length ? allowedNextStatuses(order.status, role).map((s) => STATUS_LABELS[s]).join(' · ') : 'لا توجد حركة متاحة لهذه الصلاحية' },
          ...(detailOrderLoading ? [{ label: 'حالة التفصيل', value: 'جارٍ تحميل بنود الطلب والإجماليات والتحقق منها…', wide: true }] : []),
          ...(detailOrderError ? [{ label: 'تعذر التحميل', value: detailOrderError, wide: true }] : []),
          ...(detailOrder ? [
            { label: 'الإجمالي الفرعي', value: formatMoney(detailOrder.subtotal) + ' ' + detailOrder.currency },
            { label: 'طريقة الدفع', value: detailOrder.payment_method },
            { label: 'بنود الطلب', value: lineSummary || 'لا توجد بنود مسجلة.', wide: true, content: true },
          ] : []),
        ];
        return <RecordDetailDrawer eyebrow="Operations" title={'طلب #' + order.order_number} summary={order.customer_name + ' · ' + STATUS_LABELS[order.status]} fields={fields} onClose={closeOrderDetail}
          footer={detailOrderError
            ? <><span>فشل التحميل دون تعديل السجل.</span><button type="button" onClick={() => void openOrderDetail(order.id)} disabled={detailOrderLoading}>إعادة المحاولة</button></>
            : <><span>{detailOrderLoading ? 'قراءة السجل التشغيلي الحالي…' : 'تم التحقق من إجمالي وبنود الطلب قبل العرض.'}</span><button type="button" onClick={closeOrderDetail}>إغلاق</button></>}
        />;
      })()}

      {error && <div className="error-banner" role="alert"><span>{error}</span><button type="button" className="ghost" disabled={ordersLoading} onClick={() => void reload()}>إعادة تحميل مركز التحكم</button></div>}{message && <div className="success" role="status">{message}</div>}
      {canCatalog && <div className="admin-workspace-section" id="admin-catalog" data-label="01 · الكتالوج والمنتجات"><CatalogManagementPanel role={role} /></div>}
{canCatalog && <div className="admin-workspace-section" data-label="02 · التصنيفات وبنية الكتالوج"><CategoryManagementPanel role={role} /></div>}
{canCatalog && <div className="admin-workspace-section" id="admin-pricing-matrix" data-label="03 · التسعير وقوائم الأسعار"><PricingMatrixPanel role={role as 'owner'|'admin'|'sales'} /></div>}
{canCatalog && <div className="admin-workspace-section" data-label="04 · العملاء ودورة الحساب"><div id="admin-customers"><CustomerPanel role={role} /></div></div>}
{canInventory && <div className="admin-workspace-section" data-label="05 · المخزون والتشغيل الميداني"><div id="admin-inventory"><InventoryPanel role={role} /></div></div>}
{canInventory && <div className="admin-workspace-section" id="admin-inventory-history" data-label="06 · دفتر حركة المخزون"><InventoryHistoryPanel role={role as 'owner'|'admin'|'warehouse'} /></div>}
{canInventory && <div className="admin-workspace-section" id="admin-inventory-activity" data-label="07 · نشاط التحويلات والجرد والتسويات"><InventoryActivityPanel role={role as 'owner'|'admin'|'warehouse'} /></div>}
{canInventory && <div className="admin-workspace-section" id="admin-warehouses" data-label="08 · المستودعات والفروع"><WarehouseDirectoryPanel role={role as 'owner'|'admin'|'warehouse'} /></div>}
{canInventory && <div className="admin-workspace-section" data-label="09 · المشتريات ودورة التوريد"><div id="admin-purchasing"><PurchasingPanel role={role} /></div></div>}
{canInventory && <div className="admin-workspace-section" id="admin-receipts" data-label="10 · سجل الاستلام"><PurchaseReceiptHistoryPanel role={role as 'owner'|'admin'|'warehouse'} /></div>}
{canInventory && <div className="admin-workspace-section" id="admin-suppliers" data-label="11 · الموردون والحساب التشغيلي"><SupplierLedgerPanel role={role as 'owner'|'admin'|'warehouse'} /></div>}
{canFinance && <div className="admin-workspace-section" data-label="12 · المالية التشغيلية"><div id="admin-finance"><FinancePanel role={role} /></div></div>}
{canFinance && <div className="admin-workspace-section" data-label="13 · سجل العمليات المالية"><FinanceOperationsHistoryPanel role={role as 'owner'|'admin'|'sales'} /></div>}
{canInventory && <div className="admin-workspace-section" data-label="14 · التصدير ومركز البيانات"><div id="admin-export"><ExportPanel role={role}/></div></div>}
{canCategory && <div className="admin-workspace-section" data-label="15 · تخصيص بوابة العميل"><div id="admin-settings"><ClientControlPanel role={role}/></div></div>}
{canOrderWorkflow && <div className="admin-workspace-section" data-label="16 · الإشعارات التشغيلية"><div id="admin-notifications"><NotificationPanel audience="staff" /></div></div>}
{canOrderWorkflow && <div className="admin-workspace-section" data-label="17 · التدقيق والتكاملات"><div id="admin-governance"><StaffOperationsPanel /></div></div>}
{userId && <div className="admin-workspace-section" data-label="18 · التعارض والاسترداد"><div id="admin-recovery"><OfflineRecoveryPanel userId={userId} alwaysVisible /></div></div>}
{canOrderWorkflow && <div className="admin-workspace-section" data-label="19 · المستخدمون والأدوار والصلاحيات"><div id="admin-access"><StaffAccessPanel role={role} /></div></div>}
      <AdminBoundaryCenter role={role} />
    </details>
  </section>;
}
