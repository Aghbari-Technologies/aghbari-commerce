import { useMemo, useState } from 'react';
import type { CartLine, CustomerTier, Product } from './domain/types';
import { calculateClientPreviewTotal } from './domain/order';
import { formatMoney } from './domain/pricing';
import './styles.css';

const products: Product[] = [
  { id: 'p-001', sku: 'FOOD-001', name: 'أرز بسمتي 10 كجم', unit: 'كيس', category: 'الأرز', availableQuantity: 120, status: 'active' },
  { id: 'p-002', sku: 'FOOD-002', name: 'سكر أبيض 50 كجم', unit: 'كيس', category: 'السكر', availableQuantity: 75, status: 'active' },
  { id: 'p-003', sku: 'FOOD-003', name: 'زيت دوار الشمس 1.5 لتر', unit: 'كرتون', category: 'الزيوت', availableQuantity: 48, status: 'active' },
  { id: 'p-004', sku: 'FOOD-004', name: 'دقيق أبيض 50 كجم', unit: 'كيس', category: 'الدقيق', availableQuantity: 63, status: 'active' },
  { id: 'p-005', sku: 'FOOD-005', name: 'حليب بودرة 2.5 كجم', unit: 'كرتون', category: 'الألبان', availableQuantity: 31, status: 'active' },
  { id: 'p-006', sku: 'FOOD-006', name: 'مكرونة 400 جم', unit: 'كرتون', category: 'المعكرونة', availableQuantity: 96, status: 'active' }
];

const displayPrices: Record<CustomerTier, Record<string, number>> = {
  retail: { 'p-001': 18500, 'p-002': 14500, 'p-003': 7200, 'p-004': 12500, 'p-005': 16800, 'p-006': 6100 },
  wholesale: { 'p-001': 17600, 'p-002': 13750, 'p-003': 6850, 'p-004': 11800, 'p-005': 15900, 'p-006': 5800 },
  distributor: { 'p-001': 16800, 'p-002': 13100, 'p-003': 6500, 'p-004': 11200, 'p-005': 15100, 'p-006': 5500 }
};

export default function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('الكل');
  const [tier] = useState<CustomerTier>('wholesale');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const categories = useMemo(() => ['الكل', ...new Set(products.map((p) => p.category))], []);
  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = product.name.includes(query) || product.sku.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'الكل' || product.category === category;
    return matchesQuery && matchesCategory;
  }), [category, query]);

  const total = calculateClientPreviewTotal(cart);

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((line) => line.product.id === product.id);
      if (existing) {
        return current.map((line) => line.product.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, product.availableQuantity) } : line);
      }
      return [...current, { product, quantity: 1, unitPrice: displayPrices[tier][product.id] ?? 0 }];
    });
    setSubmitted(false);
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => current.map((line) => line.product.id === productId ? { ...line, quantity } : line).filter((line) => line.quantity > 0));
  }

  function submitOrder() {
    if (!cart.length) return;
    setSubmitted(true);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">أ</span><div><strong>بوابة الأغبري</strong><small>للمواد الغذائية</small></div></div>
        <nav aria-label="التنقل الرئيسي"><a className="active" href="#catalog">المنتجات</a><a href="#orders">طلباتي</a><a href="#account">حسابي</a></nav>
        <button className="cart-button" onClick={() => document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth' })} aria-label="فتح السلة">السلة <b>{cart.length}</b></button>
      </header>

      <main>
        <section className="hero" id="catalog">
          <div><span className="eyebrow">تجارة جملة أسرع</span><h1>اطلب احتياج متجرك<br />بخطوات بسيطة.</h1><p>ابحث عن الأصناف، راجع السعر المتاح لحسابك، وعدّل الكميات مباشرة.</p></div>
          <div className="hero-card"><span>حالة الخدمة</span><strong>متصل</strong><small>الأسعار والمخزون النهائيان يحددهما الخادم عند الطلب.</small></div>
        </section>

        <section className="toolbar" aria-label="أدوات البحث والتصنيف">
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو SKU..." aria-label="بحث المنتجات" /></label>
          <div className="chips">{categories.map((item) => <button key={item} className={item === category ? 'chip selected' : 'chip'} onClick={() => setCategory(item)}>{item}</button>)}</div>
        </section>

        <section className="catalog-grid">
          {filtered.map((product) => <article className="product-card" key={product.id}>
            <div className="product-image" aria-hidden="true">{product.name.slice(0, 1)}</div>
            <div className="product-meta"><span>{product.category}</span><code>{product.sku}</code></div>
            <h2>{product.name}</h2><p className="unit">الوحدة: {product.unit} · المتاح: {product.availableQuantity}</p>
            <div className="product-footer"><strong>{formatMoney(displayPrices[tier][product.id] ?? 0)}</strong><button onClick={() => addToCart(product)}>أضف للسلة</button></div>
          </article>)}
          {!filtered.length && <div className="empty">لا توجد أصناف مطابقة لبحثك.</div>}
        </section>

        <section className="cart-panel" id="cart">
          <div className="section-heading"><div><span className="eyebrow">مسودة الطلب</span><h2>السلة</h2></div><span>{cart.length} أصناف</span></div>
          {!cart.length ? <div className="cart-empty">السلة فارغة. أضف الأصناف التي تريد طلبها.</div> : <>
            <div className="cart-lines">{cart.map((line) => <div className="cart-line" key={line.product.id}><div><strong>{line.product.name}</strong><small>{formatMoney(line.unitPrice)} / {line.product.unit}</small></div><div className="quantity"><button onClick={() => updateQuantity(line.product.id, line.quantity - 1)} aria-label="إنقاص">−</button><span>{line.quantity}</span><button onClick={() => updateQuantity(line.product.id, line.quantity + 1)} aria-label="زيادة">+</button></div><strong>{formatMoney(line.unitPrice * line.quantity)}</strong></div>)}</div>
            <div className="cart-total"><span>الإجمالي التقديري</span><strong>{formatMoney(total)}</strong></div>
            <button className="checkout" onClick={submitOrder}>إرسال الطلب</button>
            {submitted && <div className="success">تم تجهيز الطلب كمسودة. الإرسال النهائي يجب أن يمر عبر API الخادم مع التحقق من الهوية والسعر والمخزون ومفتاح idempotency.</div>}
          </>}
        </section>
      </main>
      <footer>بوابة الأغبري · النظام التشغيلي للتجارة</footer>
    </div>
  );
}
