import { useMemo, useState } from 'react';
import { useProducts } from './lib/supabase';

export default function App() {
  const { products, loading, error } = useProducts();
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.sku}`.toLocaleLowerCase('ar').includes(query.toLocaleLowerCase('ar'))), [products, query]);
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">بوابة الأغبري للمواد الغذائية</div>
          <h1>المتجر التجاري</h1>
        </div>
        <div className="cart-pill" aria-label={`السلة ${cartCount}`}>السلة · {cartCount}</div>
      </header>

      <section className="hero">
        <div>
          <span className="status-dot" /> تشغيل تشغيلي
          <h2>اطلب بضاعتك بسرعة، بالسعر المصرح لك.</h2>
          <p>واجهة تشغيلية عربية سريعة، مع فصل كامل بين بيانات العملاء والأسعار والمخزون.</p>
        </div>
        <div className="search-box">
          <label htmlFor="product-search">بحث عن منتج</label>
          <input id="product-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="الاسم أو SKU أو الباركود" />
        </div>
      </section>

      <section className="section-head">
        <div><h3>المنتجات</h3><span>{filtered.length} منتج</span></div>
      </section>

      {loading && <div className="state">جاري تحميل المنتجات…</div>}
      {error && <div className="state error">{error}</div>}
      {!loading && !error && filtered.length === 0 && <div className="state">لا توجد نتائج مطابقة.</div>}

      <section className="product-grid" aria-live="polite">
        {filtered.map((product) => (
          <article className="product-card" key={product.id}>
            <div className="product-media">{product.image_path ? <img src={product.image_path} alt="" loading="lazy" /> : <span>صورة المنتج</span>}</div>
            <div className="product-body">
              <span className="sku">{product.sku}</span>
              <h4>{product.name}</h4>
              <p>{product.description || 'منتج تجاري متاح للطلب.'}</p>
              <div className="product-footer">
                <span>الوحدة: {product.unit}</span>
                <button type="button" onClick={() => setCart((c) => ({ ...c, [product.id]: (c[product.id] ?? 0) + 1 }))}>أضف للسلة</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
