import { useCallback, useEffect, useState } from 'react';
import type { CustomerTier, OrderStatus } from './domain/types';
import { formatMoney } from './domain/pricing';
import { adjustInventory, createCategory, setProductPrice, upsertProduct } from './services/admin';
import { commitProductImport, stageProductImport } from './services/importExcel';
import { getCategories, type CategoryOption } from './services/categories';
import { uploadProductImage } from './services/imagePipeline';
import { getStaffOrders, transitionOrder, type StaffOrderSummary } from './services/staffOrders';
import { supabase } from './lib/supabase';
import PurchasingPanel from './PurchasingPanel';
import ExportPanel from './ExportPanel';
import CustomerPanel from './CustomerPanel';
import InventoryPanel from './InventoryPanel';
import FinancePanel from './FinancePanel';
import ClientControlPanel from './ClientControlPanel';
import CommandPalette from './CommandPalette';
import { allowedNextOrderStatuses, buildBulkTransitionPlan } from './domain/bulkActions';
import AdminExecutiveDashboard from './AdminExecutiveDashboard';
import './admin-executive-dashboard.css';

interface StaffProduct { id: string; sku: string; name: string; unit: string; barcode: string | null; }
interface Warehouse { id: string; name: string; }
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';
const tiers: CustomerTier[] = ['retail', 'wholesale', 'distributor'];
const STAFF_ROLES = new Set<UserRole>(['owner', 'admin', 'sales', 'warehouse']);
const STATUS_LABELS: Record<OrderStatus, string> = { draft: 'مسودة', pending: 'قيد المراجعة', confirmed: 'مؤكد', preparing: 'قيد التجهيز', ready: 'جاهز', completed: 'مكتمل', cancelled: 'ملغي' };

export default function AdminPanel({ role }: { role: UserRole }) {
  const [products, setProducts] = useState<StaffProduct[]>([]); const [warehouses, setWarehouses] = useState<Warehouse[]>([]); const [categories, setCategories] = useState<CategoryOption[]>([]); const [orders, setOrders] = useState<StaffOrderSummary[]>([]); const [ordersLoading, setOrdersLoading] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false); const [orderQuery, setOrderQuery] = useState(''); const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all'); const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set()); const [bulkPreviewStatus, setBulkPreviewStatus] = useState<OrderStatus | null>(null); const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<StaffOrderSummary | null>(null); const [selectedOrderLines, setSelectedOrderLines] = useState<Array<{id:string;quantity:number;unit_price:number;line_total:number;product_name:string;sku:string;unit:string}>>([]); const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [product, setProduct] = useState({ sku: '', name: '', unit: 'كرتون', barcode: '', categoryId: '', description: '' }); const [productQuery, setProductQuery] = useState(''); const [catalogMode, setCatalogMode] = useState<'directory'|'create'>('directory'); const [editingProductId, setEditingProductId] = useState<string | null>(null); const [category, setCategory] = useState({ name: '', slug: '', parentId: '' }); const [selectedProduct, setSelectedProduct] = useState(''); const [tier, setTier] = useState<CustomerTier>('wholesale'); const [price, setPrice] = useState(''); const [warehouseId, setWarehouseId] = useState(''); const [delta, setDelta] = useState(''); const [reason, setReason] = useState(''); const [imageFile, setImageFile] = useState<File | null>(null); const [importFile, setImportFile] = useState<File | null>(null); const [importJobId, setImportJobId] = useState<string | null>(null); const [importPreview, setImportPreview] = useState<{ rows: number; invalid: number } | null>(null); const [importResult, setImportResult] = useState<{ imported_rows: number; products_created: number; products_updated: number; inventory_changed: number } | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => { if (!supabase) return; setOrdersLoading(true); try { const [{ data: productRows, error: productError }, { data: warehouseRows, error: warehouseError }, categoryRows, orderRows] = await Promise.all([supabase.from('products').select('id,sku,name,unit,barcode').eq('status', 'active').order('name').limit(200), supabase.from('warehouses').select('id,name').eq('is_active', true).order('created_at'), getCategories(), getStaffOrders(50)]); if (productError) throw productError; if (warehouseError) throw warehouseError; setProducts((productRows ?? []) as StaffProduct[]); setCategories(categoryRows); setOrders(orderRows); const nextWarehouses = (warehouseRows ?? []) as Warehouse[]; setWarehouses(nextWarehouses); if (!warehouseId && nextWarehouses[0]) setWarehouseId(nextWarehouses[0].id); } finally { setOrdersLoading(false); } }, [warehouseId]);
  useEffect(() => { void reload().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل مركز التحكم.')); }, [reload]);
  async function run(action: () => Promise<unknown>, success: string) { setBusy(true); setError(null); setMessage(null); try { await action(); setMessage(success); await reload(); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تنفيذ العملية.'); } finally { setBusy(false); } }
  async function beginProductEdit(productId: string) {
    if (!supabase) return;
    setError(null);
    try {
      const { data, error: productError } = await supabase.from('products').select('id,sku,name,unit,barcode,category_id,description,status').eq('id', productId).maybeSingle();
      if (productError) throw productError;
      if (!data) throw new Error('الصنف غير متاح للحساب الإداري الحالي.');
      setEditingProductId(data.id);
      setCatalogMode('create');
      setProduct({ sku:data.sku ?? '', name:data.name ?? '', unit:data.unit ?? '', barcode:data.barcode ?? '', categoryId:data.category_id ?? '', description:data.description ?? '' });
      requestAnimationFrame(() => document.getElementById('admin-product-create')?.scrollIntoView({ behavior:'smooth', block:'center' }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر فتح الصنف للتحرير.');
    }
  }
  async function uploadImage() { if (!selectedProduct || !imageFile) return; await run(async () => { await uploadProductImage(selectedProduct, imageFile); setImageFile(null); }, 'تم رفع الصورة ومعالجتها وتسجيلها بأمان.'); }
  async function stageImport() { if (!importFile) return; setBusy(true); setError(null); setMessage(null); setImportJobId(null); setImportPreview(null); setImportResult(null); try { const result = await stageProductImport(importFile); setImportPreview({ rows: result.rows.length, invalid: result.diagnostics.length }); if (result.jobId) { setImportJobId(result.jobId); setMessage('تمت المعاينة والتحقق على الخادم. يمكنك اعتماد الاستيراد الذري.'); } else setError('الملف يحتوي أخطاء ويجب إصلاحها قبل الاستيراد.'); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تجهيز ملف الاستيراد.'); } finally { setBusy(false); } }
  async function commitImport() { if (!importJobId || !warehouseId) return; await run(async () => { const result = await commitProductImport(importJobId, warehouseId); setImportJobId(null); setImportFile(null); setImportPreview(null); setImportResult(result); return result; }, 'تم اعتماد الاستيراد بالكامل وتسجيل أثر المخزون والتدقيق.'); }
  async function changeOrderStatus(orderId: string, status: OrderStatus) { await run(async () => transitionOrder(orderId, status), `تم تحديث حالة الطلب إلى: ${STATUS_LABELS[status]}.`); }
  async function openOrderDetails(order: StaffOrderSummary) { if (!supabase || orderDetailsLoading) return; setSelectedOrderForDetails(order); setSelectedOrderLines([]); setOrderDetailsLoading(true); setError(null); try { const { data: owned, error: ownedError } = await supabase.from('orders').select('id').eq('id', order.id).maybeSingle(); if (ownedError) throw ownedError; if (!owned) throw new Error('الطلب غير متاح للحساب الإداري الحالي.'); const { data: items, error: itemsError } = await supabase.from('order_items').select('id,quantity,unit_price,line_total,product_id,products(name,sku,unit)').eq('order_id', order.id).order('created_at', { ascending: true }); if (itemsError) throw itemsError; setSelectedOrderLines((items ?? []).map((item) => { const row = item as { id:string; quantity:number; unit_price:number; line_total:number; product_id:string; products?: { name?:string; sku?:string; unit?:string } | null }; return { id:row.id, quantity:Number(row.quantity), unit_price:Number(row.unit_price), line_total:Number(row.line_total), product_name:row.products?.name ?? 'صنف', sku:row.products?.sku ?? '—', unit:row.products?.unit ?? '—' }; })); } catch (e) { setSelectedOrderForDetails(null); setError(e instanceof Error ? e.message : 'تعذر تحميل تفاصيل الطلب.'); } finally { setOrderDetailsLoading(false); } }
  const visibleOrders = orders.filter((order) => { const needle = orderQuery.trim().toLocaleLowerCase('ar'); const matchesQuery = !needle || [`${order.order_number}`, order.customer_name].join(' ').toLocaleLowerCase('ar').includes(needle); const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter; return matchesQuery && matchesStatus; });
  const hasOrderFilters = Boolean(orderQuery.trim()) || orderStatusFilter !== 'all';
  function clearOrderFilters() { setOrderQuery(''); setOrderStatusFilter('all'); setSelectedOrderIds(new Set()); }
  const selectableIds = new Set(visibleOrders.map((order) => order.id));
  const allVisibleSelected = visibleOrders.length > 0 && visibleOrders.every((order) => selectedOrderIds.has(order.id));
  const bulkStatuses: OrderStatus[] = ['confirmed','preparing','ready','completed','cancelled'];
  const bulkAllowedStatuses = bulkStatuses.filter((status) => { const selected = orders.filter((order) => selectedOrderIds.has(order.id)); return selected.length > 0 && selected.every((order) => allowedNextOrderStatuses(order.status, role).includes(status)); });
  const bulkPreview = bulkPreviewStatus ? buildBulkTransitionPlan(orders, selectedOrderIds, role, bulkPreviewStatus) : null;
  async function bulkChangeOrderStatus(status: OrderStatus) { const plan = buildBulkTransitionPlan(orders, selectedOrderIds, role, status); if (!plan.selected.length || plan.blocked.length || !bulkAllowedStatuses.includes(status)) return; const ids = plan.eligible.map((order) => order.id); setBusy(true); setError(null); setMessage(null); let successCount = 0; const failures: string[] = []; try { for (const orderId of ids) { try { await transitionOrder(orderId, status); successCount += 1; } catch (error) { failures.push(error instanceof Error ? error.message : 'فشل غير محدد'); } } await reload(); setSelectedOrderIds(new Set()); setBulkPreviewStatus(null); setMessage(failures.length ? `تم تنفيذ ${successCount} من ${ids.length} عمليات؛ ${failures.length} تحتاج مراجعة.` : `تم تحديث ${successCount} طلبات إلى: ${STATUS_LABELS[status]}.`); if (failures.length) setError(`تعذر تنفيذ بعض العمليات: ${failures[0]}`); } finally { setBusy(false); } }
  const canCatalog = role === 'owner' || role === 'admin' || role === 'sales'; const canCategory = role === 'owner' || role === 'admin'; const canInventory = role === 'owner' || role === 'admin' || role === 'warehouse'; const canOrderWorkflow = STAFF_ROLES.has(role); const canFinance = ['owner', 'admin', 'sales'].includes(role);
  const commandActions = [
    ...(canCatalog ? [
      { id: 'product-create', label: 'إضافة منتج', hint: 'فتح نموذج إنشاء المنتج', icon: '+', onSelect: () => document.getElementById('admin-product-create')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['منتج', 'sku'] },
      { id: 'pricing', label: 'تحديث الأسعار', hint: 'إدارة السعر حسب فئة العميل', icon: 'ر.ي', onSelect: () => document.getElementById('admin-pricing')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['سعر', 'تسعير'] },
      { id: 'import', label: 'مركز الاستيراد', hint: 'رفع ومعاينة ملف المنتجات', icon: '⇧', onSelect: () => document.getElementById('admin-import')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['excel', 'استيراد'] },
    ] : []),
    ...(canCategory ? [{ id: 'category', label: 'إضافة تصنيف', hint: 'إنشاء تصنيف جديد', icon: '▦', onSelect: () => document.getElementById('admin-category-create')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['تصنيف'] }] : []),
    ...(canInventory ? [
      { id: 'inventory', label: 'تعديل المخزون', hint: 'فتح حركة المخزون الآمنة', icon: '◫', onSelect: () => document.getElementById('admin-inventory-adjust')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['مخزون', 'مستودع'] },
      { id: 'purchasing', label: 'المشتريات والاستلام', hint: 'فتح دورة الشراء والاستلام', icon: '↘', onSelect: () => document.getElementById('admin-purchasing')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['شراء', 'مورد'] },
    ] : []),
    ...(canOrderWorkflow ? [{ id: 'orders', label: 'إدارة الطلبات', hint: 'طلبات العملاء وحالاتها', icon: '↗', onSelect: () => document.getElementById('admin-orders')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['طلبات', 'تجهيز', 'شحن'] }] : []),
    ...(canCatalog ? [{ id: 'customers', label: 'إدارة العملاء', hint: 'فتح ملفات العملاء', icon: '👥', onSelect: () => document.getElementById('admin-customers')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['عملاء'] }] : []),
    ...(canFinance ? [{ id: 'finance', label: 'المركز المالي', hint: 'الكشوف والحركات التشغيلية', icon: '◍', onSelect: () => document.getElementById('admin-finance')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['مالية', 'كشف'] }] : []),
    ...(canCategory ? [{ id: 'settings', label: 'إعدادات بوابة العميل', hint: 'هوية الواجهة والخيارات التشغيلية', icon: '⚙', onSelect: () => document.getElementById('admin-settings')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), keywords: ['إعدادات', 'واجهة', 'ثيم'] }] : []),
  ];
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, []);
  const filteredProducts = products.filter((item) => {
    const needle = productQuery.trim().toLocaleLowerCase('ar');
    if (!needle) return true;
    return [item.name, item.sku, item.barcode ?? ''].join(' ').toLocaleLowerCase('ar').includes(needle);
  });
  const orderPulse = {
    total: orders.length,
    pending: orders.filter((order) => order.status === 'pending').length,
    active: orders.filter((order) => ['confirmed','preparing','ready'].includes(order.status)).length,
    completed: orders.filter((order) => order.status === 'completed').length,
  };
  const workspaceSections = [
    { id:'admin-orders', icon:'↗', title:'المبيعات والطلبات', hint:'متابعة الطلبات واعتماد انتقالاتها', meta:orderPulse.pending + ' قيد المراجعة', tone:'orders' },
    { id:'admin-customers', icon:'♙', title:'العملاء', hint:'حسابات العملاء والدعوات والفئات', meta:orders.length + ' طلب مرتبط', tone:'customers' },
    { id:'admin-catalog-directory', icon:'▦', title:'كتالوج الأصناف', hint:'فهرس الأصناف والوصول السريع للتسعير والصور', meta:products.length + ' صنف', tone:'catalog' },
    { id:'admin-inventory', icon:'□', title:'المخزون والمستودعات', hint:'النقل والجرد والحدود التشغيلية', meta:warehouses.length + ' مستودع', tone:'inventory' },
    { id:'admin-purchasing', icon:'↘', title:'المشتريات والتوريد', hint:'الموردون وأوامر الشراء والاستلام', meta:'دورة التوريد', tone:'purchasing' },
    { id:'admin-finance', icon:'◫', title:'المالية التشغيلية', hint:'الفواتير والتحصيل والمصروفات', meta:'حسابات وحركات', tone:'finance' },
    { id:'admin-export', icon:'⇧', title:'البيانات والتصدير', hint:'ملفات البيانات ونقاط التصدير', meta:'مركز البيانات', tone:'data' },
    { id:'admin-settings', icon:'⚙', title:'واجهة العميل', hint:'الهوية والكثافة والدفع وحدود الطلب', meta:'نشر فوري', tone:'settings' },
  ];

  return <section className="admin-panel staff-console" id="account">
    <section className="staff-hero" aria-label="مركز تشغيل الأغبري">
      <div className="staff-hero-copy">
        <span className="eyebrow">الأغبري · مركز التشغيل</span>
        <h1>كل قرار تجاري، في مساحة عمل واحدة.</h1>
        <p>تنقل بين المبيعات، الكتالوج، المخزون، التوريد، والمالية من دون فقدان السياق. الأرقام أدناه مأخوذة من الحالة التشغيلية الحالية وليست مؤشرات وهمية.</p>
        <div className="staff-hero-meta">
          <span><i></i> الصلاحيات فعّالة على الخادم</span>
          <span>{ordersLoading ? 'جارٍ تحديث البيانات' : 'البيانات التشغيلية محدثة'}</span>
          <span>الدور: {role}</span>
        </div>
      </div>
      <div className="staff-hero-pulse" aria-label="نبض التشغيل الحالي">
        <div><small>الطلبات</small><strong>{orderPulse.total}</strong><span>{orderPulse.pending} قيد المراجعة</span></div>
        <div><small>نشطة</small><strong>{orderPulse.active}</strong><span>{orderPulse.completed} مكتملة</span></div>
        <div><small>الأصناف</small><strong>{products.length}</strong><span>{warehouses.length} مستودع</span></div>
      </div>
    </section>
    <section className="workspace-map" aria-label="خريطة مساحات العمل">
      <div className="workspace-map-head">
        <div><span className="eyebrow">خريطة المنتج</span><h2>مساحات الأغبري</h2><p>الوصول المباشر إلى كل منطقة تشغيلية بدون البحث بين نماذج طويلة.</p></div>
        <button type="button" className="workspace-map-command" onClick={() => setCommandOpen(true)}>⚡ افتح الأوامر</button>
      </div>
      <div className="workspace-map-grid">
        {workspaceSections.map((item) => (
          <button type="button" className={"workspace-tile "+item.tone} key={item.id} onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior:'smooth', block:'start' })}>
            <span className="workspace-tile-icon" aria-hidden="true">{item.icon}</span>
            <span className="workspace-tile-copy"><strong>{item.title}</strong><small>{item.hint}</small><em>{item.meta}</em></span>
            <span className="workspace-tile-arrow" aria-hidden="true">←</span>
          </button>
        ))}
      </div>
    </section>
    <div className="staff-commandbar"><div><span className="eyebrow">مركز التشغيل</span><strong>وصول سريع للمهام</strong><small>Ctrl/⌘ K</small></div><button type="button" onClick={() => setCommandOpen(true)}>⚡ أوامر الأغبري</button></div>
    <AdminExecutiveDashboard role={role} />
    <nav className="staff-section-rail" aria-label="اختصارات مركز التشغيل">
      {commandActions.filter((action) => ['product-create','import','inventory','purchasing','orders','customers','finance','settings'].includes(action.id)).map((action) => (
        <button type="button" key={action.id} onClick={action.onSelect}>
          <span aria-hidden="true">{action.icon}</span><strong>{action.label}</strong><small>{action.hint}</small>
        </button>
      ))}
    </nav>
    <details className="admin-operations" open>
      <summary><span><b>مركز التشغيل التفصيلي</b><small>النماذج، الحالات، والعمليات الحساسة</small></span><em>يفتح مساحات التشغيل بالترتيب الإداري</em></summary>
      <div className="section-heading"><div><span className="eyebrow">إدارة التشغيل</span><h2>مركز التحكم</h2></div><span>الصلاحيات تُفرض على الخادم أيضًا</span></div>
      <div className="admin-grid">
        {canCatalog && <form className="admin-card" id="admin-product-create" onSubmit={(e) => { e.preventDefault(); void run(() => upsertProduct({ productId: editingProductId, sku: product.sku, name: product.name, unit: product.unit, barcode: product.barcode || null, categoryId: product.categoryId || null, description: product.description || null }), editingProductId ? 'تم تحديث بيانات المنتج.' : 'تم إنشاء المنتج.').then(() => { setEditingProductId(null); setProduct({ sku:'', name:'', unit:'كرتون', barcode:'', categoryId:'', description:'' }); }); }}><div className="form-card-heading"><div><span className="eyebrow">{editingProductId ? "تحرير الصنف" : "كتالوج"}</span><h3>{editingProductId ? "تعديل المنتج" : "منتج جديد"}</h3></div>{editingProductId && <button type="button" className="ghost compact-action" onClick={() => { setEditingProductId(null); setProduct({ sku:"", name:"", unit:"كرتون", barcode:"", categoryId:"", description:"" }); }}>إلغاء التعديل</button>}</div><input aria-label="SKU" placeholder="SKU" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} required /><input aria-label="الباركود" placeholder="الباركود (اختياري)" value={product.barcode} onChange={(e) => setProduct({ ...product, barcode: e.target.value })} /><input aria-label="اسم المنتج" placeholder="اسم المنتج" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required /><input aria-label="الوحدة" placeholder="الوحدة" value={product.unit} onChange={(e) => setProduct({ ...product, unit: e.target.value })} required /><select aria-label="تصنيف المنتج" value={product.categoryId} onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}><option value="">بدون تصنيف</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><textarea aria-label="وصف المنتج" placeholder="وصف المنتج (اختياري)" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={3} /><button disabled={busy}>{editingProductId ? "حفظ التعديلات" : "حفظ المنتج"}</button></form>}
        {canCategory && <form className="admin-card" id="admin-category-create" onSubmit={(e) => { e.preventDefault(); void run(() => createCategory(category.name.trim(), category.slug.trim(), category.parentId || null), 'تم إنشاء التصنيف.'); }}><h3>تصنيف جديد</h3><input aria-label="اسم التصنيف" placeholder="اسم التصنيف" value={category.name} onChange={(e) => setCategory({ ...category, name: e.target.value })} required /><input aria-label="معرف التصنيف" placeholder="slug مثل rice" value={category.slug} onChange={(e) => setCategory({ ...category, slug: e.target.value })} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><select aria-label="التصنيف الأب" value={category.parentId} onChange={(e) => setCategory({ ...category, parentId: e.target.value })}><option value="">تصنيف رئيسي</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={busy}>حفظ التصنيف</button></form>}
        {canCatalog && <form className="admin-card" id="admin-pricing" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !price) return; void run(() => setProductPrice(selectedProduct, tier, Number(price)), 'تم تحديث السعر الفعّال.'); }}><h3>تسعير حسب الفئة</h3><select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select><select aria-label="تصنيف العميل" value={tier} onChange={(e) => setTier(e.target.value as CustomerTier)}>{tiers.map((item) => <option key={item} value={item}>{item}</option>)}</select><input aria-label="السعر" type="number" min="0" step="0.01" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} required /><button disabled={busy}>اعتماد السعر</button></form>}
        {canCatalog && <form className="admin-card" id="admin-product-image" onSubmit={(e) => { e.preventDefault(); void uploadImage(); }}><h3>صورة المنتج</h3><select aria-label="منتج الصورة" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر منتجًا</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.sku}</option>)}</select><input aria-label="صورة المنتج" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} required /><small>يتم التحويل إلى WebP وضغط الصورة قبل التخزين.</small><button disabled={busy || !selectedProduct || !imageFile}>رفع الصورة</button></form>}
        {canCatalog && <form className="admin-card" id="admin-import" onSubmit={(e) => { e.preventDefault(); void stageImport(); }}><h3>استيراد Excel آمن</h3><input aria-label="ملف المنتجات" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { setImportFile(e.target.files?.[0] ?? null); setImportJobId(null); setImportPreview(null); setImportResult(null); }} required />{importPreview && <small>الصفوف: {importPreview.rows} · الأخطاء: {importPreview.invalid}</small>}{!importJobId ? <button disabled={busy || !importFile}>رفع ومعاينة</button> : <button disabled={busy || !warehouseId} onClick={(e) => { e.preventDefault(); void commitImport(); }}>اعتماد الاستيراد الذري</button>}</form>}
        {importResult && <section className="admin-card import-reconciliation" aria-label="تقرير نتيجة الاستيراد">
          <div className="section-heading"><div><span className="eyebrow">أثر العملية</span><h3>تقرير اعتماد الاستيراد</h3></div><span>نتيجة خادمية معتمدة</span></div>
          <div className="bulk-preview-stats">
            <strong>الصفوف: {importResult.imported_rows}</strong>
            <span>منتجات جديدة: {importResult.products_created}</span>
            <span>منتجات محدثة: {importResult.products_updated}</span>
          </div>
          <small>تغييرات المخزون المسجلة: {importResult.inventory_changed}. المصدر لا يصبح جزءًا من الحقيقة التشغيلية إلا بعد الاعتماد الذري.</small>
        </section>}
        {canInventory && <form className="admin-card" id="admin-inventory-adjust" onSubmit={(e) => { e.preventDefault(); if (!selectedProduct || !warehouseId || !delta) return; void run(() => adjustInventory(warehouseId, selectedProduct, Number(delta), reason.trim()), 'تم تعديل المخزون وتسجيل الحركة.'); }}><h3>تعديل المخزون</h3><select aria-label="المستودع" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required><option value="">اختر المستودع</option>{warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select><select aria-label="المنتج" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} required><option value="">اختر المنتج</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input aria-label="التغيير" type="number" step="1" placeholder="+ أو - الكمية" value={delta} onChange={(e) => setDelta(e.target.value)} required /><input aria-label="سبب التعديل" placeholder="سبب التعديل" value={reason} onChange={(e) => setReason(e.target.value)} required /><button disabled={busy}>تسجيل الحركة</button></form>}
      </div>

      {canCatalog && <section className="cart-panel catalog-directory" id="admin-catalog-directory">
        <div className="section-heading catalog-directory-heading">
          <div><span className="eyebrow">كتالوج الأصناف</span><h2>فهرس الأصناف التنفيذي</h2><p>ابحث بالاسم أو SKU أو الباركود، ثم انتقل مباشرة إلى التسعير أو إدارة الصورة.</p></div>
          <div className="catalog-directory-actions">
            <button type="button" className={catalogMode==='directory'?'active':''} onClick={() => setCatalogMode('directory')}>الفهرس</button>
            <button type="button" className={catalogMode==='create'?'active':''} onClick={() => { setCatalogMode('create'); document.getElementById('admin-product-create')?.scrollIntoView({behavior:'smooth',block:'center'}); }}>إضافة صنف</button>
          </div>
        </div>
        <div className="catalog-directory-toolbar">
          <label className="catalog-directory-search"><span aria-hidden="true">⌕</span><input value={productQuery} onChange={(e)=>setProductQuery(e.target.value)} placeholder="ابحث في الأصناف…" aria-label="البحث في فهرس الأصناف" /><kbd>/</kbd></label>
          <span>{filteredProducts.length} نتيجة</span>
          {productQuery && <button type="button" onClick={()=>setProductQuery('')}>مسح</button>}
        </div>
        {!filteredProducts.length ? <div className="empty-state">لا توجد أصناف مطابقة. استخدم بحثًا مختلفًا أو أضف صنفًا جديدًا.</div> : <div className="catalog-directory-list">
          {filteredProducts.slice(0,80).map((item) => (
            <article className="catalog-directory-row" key={item.id}>
              <div className="catalog-directory-main">
                <span className="catalog-directory-mark" aria-hidden="true">{item.name.slice(0,1)}</span>
                <div><strong>{item.name}</strong><small>{item.sku}{item.barcode ? ' · ' + item.barcode : ''} · {item.unit}</small></div>
              </div>
              <div className="catalog-directory-actions-row">
                <button type="button" onClick={() => void beginProductEdit(item.id)}>تحرير</button>
                <button type="button" onClick={() => { setSelectedProduct(item.id); document.getElementById('admin-pricing')?.scrollIntoView({behavior:'smooth',block:'center'}); }}>التسعير</button>
                <button type="button" onClick={() => { setSelectedProduct(item.id); document.getElementById('admin-product-image')?.scrollIntoView({behavior:'smooth',block:'center'}); }}>الصورة</button>
                <button type="button" className="ghost" onClick={() => navigator.clipboard?.writeText(item.sku).then(()=>setMessage('تم نسخ SKU: ' + item.sku)).catch(()=>setMessage('SKU: ' + item.sku))}>نسخ SKU</button>
              </div>
            </article>
          ))}
        </div>}
        {filteredProducts.length > 80 && <small className="catalog-directory-limit">يتم عرض أول 80 نتيجة للحفاظ على سرعة لوحة التشغيل؛ استخدم البحث للوصول إلى بقية الأصناف.</small>}
      </section>
      {canOrderWorkflow && <div className="cart-panel" id="admin-orders"><div className="section-heading"><div><span className="eyebrow">التشغيل</span><h2>إدارة الطلبات</h2></div><span>{hasOrderFilters ? `إظهار ${visibleOrders.length} من ${orders.length}` : `إجمالي ${orders.length} طلب`}</span></div><div className="admin-order-tools"><input aria-label="البحث في الطلبات" value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} placeholder="رقم الطلب أو اسم العميل…"/><select aria-label="تصفية حالة الطلب" value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | 'all')}><option value="all">كل الحالات</option>{Object.entries(STATUS_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select><button type="button" onClick={() => setSelectedOrderIds(allVisibleSelected ? new Set([...selectedOrderIds].filter((id) => !selectableIds.has(id))) : new Set([...selectedOrderIds, ...selectableIds]))}>{allVisibleSelected ? 'إلغاء تحديد الظاهر' : 'تحديد الظاهر'}</button>{hasOrderFilters && <button type="button" onClick={clearOrderFilters}>مسح التصفية</button>}{selectedOrderIds.size > 0 && <span className="selection-count">محدد: {selectedOrderIds.size}</span>}{bulkAllowedStatuses.map((status) => <button type="button" className="bulk-action" key={status} disabled={busy} onClick={() => setBulkPreviewStatus(status)}>{STATUS_LABELS[status]} للمحدد</button>)}</div>{ordersLoading ? <div className="cart-empty">جارٍ تحميل الطلبات…</div> : !visibleOrders.length ? <div className="cart-empty">لا توجد طلبات مطابقة للبحث أو التصفية.</div> : <div className="cart-lines">{visibleOrders.map((order) => <article className="cart-line" key={order.id}><label className="order-select"><input type="checkbox" aria-label={`تحديد طلب #${order.order_number}`} checked={selectedOrderIds.has(order.id)} onChange={(e) => setSelectedOrderIds((current) => { const next = new Set(current); if (e.target.checked) next.add(order.id); else next.delete(order.id); return next; })}/></label><div><strong>طلب #{order.order_number}</strong><small>العميل: {order.customer_name}</small><button type="button" className="inline-detail-button" onClick={() => void openOrderDetails(order)} disabled={orderDetailsLoading}>عرض التفاصيل</button></div><div><strong>{formatMoney(order.total)} {order.currency}</strong><small>الحالة: {STATUS_LABELS[order.status]}</small></div><div className="status-actions">{allowedNextOrderStatuses(order.status, role).map((next) => <button key={next} disabled={busy} onClick={() => void changeOrderStatus(order.id, next)}>{STATUS_LABELS[next]}</button>)}</div></article>)}</div>}</div>}
      {selectedOrderForDetails && <div className="modal-backdrop" role="presentation" onClick={() => !orderDetailsLoading && setSelectedOrderForDetails(null)}><section className="modal staff-order-detail-modal" role="dialog" aria-modal="true" aria-labelledby="staff-order-detail-title" onClick={(event) => event.stopPropagation()}><div className="modal-head"><div><span className="eyebrow">تفاصيل الطلب</span><h3 id="staff-order-detail-title">طلب #{selectedOrderForDetails.order_number}</h3></div><button type="button" aria-label="إغلاق تفاصيل الطلب الإداري" disabled={orderDetailsLoading} onClick={() => setSelectedOrderForDetails(null)}>×</button></div><div className="staff-order-detail-head"><div><strong>{selectedOrderForDetails.customer_name}</strong><small>عميل مسجل ضمن المؤسسة الحالية</small></div><div><strong>{formatMoney(selectedOrderForDetails.total)} {selectedOrderForDetails.currency}</strong><span>{STATUS_LABELS[selectedOrderForDetails.status]}</span></div></div>{orderDetailsLoading ? <div className="cart-empty">جارٍ تحميل بنود الطلب…</div> : selectedOrderLines.length ? <div className="staff-order-lines">{selectedOrderLines.map((line) => <div className="staff-order-line" key={line.id}><div><strong>{line.product_name}</strong><small>{line.sku} · {line.unit}</small></div><span>{line.quantity} × {formatMoney(line.unit_price)} {selectedOrderForDetails.currency}</span><b>{formatMoney(line.line_total)} {selectedOrderForDetails.currency}</b></div>)}</div> : <div className="cart-empty">لا توجد بنود متاحة لهذا الطلب.</div>}<div className="staff-order-detail-footer"><span>إجمالي الطلب</span><strong>{formatMoney(selectedOrderForDetails.total)} {selectedOrderForDetails.currency}</strong></div></section></div>}
      {bulkPreview && <div className="modal-backdrop" role="presentation" onMouseDown={() => setBulkPreviewStatus(null)}>
        <section className="modal bulk-preview-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-preview-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-head">
            <div><span className="eyebrow">مراجعة قبل الاعتماد</span><h3 id="bulk-preview-title">تحديث {STATUS_LABELS[bulkPreview.target]} للمحدد</h3></div>
            <button type="button" aria-label="إغلاق المراجعة" onClick={() => setBulkPreviewStatus(null)}>×</button>
          </div>
          <p>سيتم فحص جميع الطلبات المحددة مرة أخرى قبل التنفيذ. لا يتم اعتماد أي طلب من هذه النافذة دون اجتياز صلاحية الانتقال الحالية.</p>
          <div className="bulk-preview-stats">
            <strong>المحدد: {bulkPreview.selected.length}</strong><span>جاهز: {bulkPreview.eligible.length}</span><span>محجوب: {bulkPreview.blocked.length}</span>
          </div>
          {bulkPreview.blocked.length > 0 ? <div className="error-banner" role="alert">يوجد طلبات لا تسمح حالتها أو صلاحيات الدور الحالي بهذا الانتقال. لم يتم تنفيذ أي عملية.</div> : <div className="success" role="status">فحص مسبق ناجح: {bulkPreview.eligible.length} طلبًا مؤهلًا للانتقال.</div>}
          <div className="modal-actions"><button type="button" onClick={() => setBulkPreviewStatus(null)} disabled={busy}>إلغاء</button><button type="button" onClick={() => void bulkChangeOrderStatus(bulkPreview.target)} disabled={busy || bulkPreview.blocked.length > 0 || bulkPreview.eligible.length === 0}>اعتماد التنفيذ</button></div>
        </section>
      </div>}
      {error && <div className="error-banner" role="alert">{error}</div>}{message && <div className="success" role="status">{message}</div>}
      {canCatalog && <div id="admin-customers"><CustomerPanel role={role} /></div>}
      {canInventory && <div id="admin-inventory"><InventoryPanel role={role} /></div>}
      {canInventory && <div id="admin-purchasing"><PurchasingPanel role={role} /></div>}
      {canFinance && <div id="admin-finance"><FinancePanel role={role} /></div>}
      {canInventory && <div id="admin-export"><ExportPanel role={role}/></div>}
      {canCategory && <div id="admin-settings"><ClientControlPanel role={role}/></div>} 
    </details>
    <nav className="staff-bottom-nav" aria-label="تنقل الإدارة على الهاتف">
      <button type="button" onClick={() => document.getElementById('admin-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>⌂</span><small>الرئيسية</small></button>
      {canOrderWorkflow && <button type="button" onClick={() => document.getElementById('admin-orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>↗</span><small>الطلبات</small></button>}
      {canInventory && <button type="button" onClick={() => document.getElementById('admin-inventory')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>□</span><small>المخزون</small></button>}
      {canCatalog && <button type="button" onClick={() => document.getElementById('admin-customers')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>♙</span><small>العملاء</small></button>}
      {canFinance && <button type="button" onClick={() => document.getElementById('admin-finance')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>◫</span><small>المالية</small></button>}
      {canCategory && <button type="button" onClick={() => document.getElementById('admin-settings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><span>⚙</span><small>الإعدادات</small></button>}
    </nav>
    <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} actions={commandActions} title="أوامر مركز الإدارة" />
  </section>;
}