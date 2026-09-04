import { FormEvent, useMemo, useState } from 'react';
import { useAuth } from './lib/auth';
import { useProducts } from './lib/supabase';

function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(null);
    try { await signIn(email.trim(), password); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تسجيل الدخول'); } finally { setBusy(false); }
  }
  return <main className="auth-shell"><form className="auth-card" onSubmit={submit}>
    <div className="eyebrow">بوابة الأغبري للمواد الغذائية</div><h1>تسجيل الدخول</h1><p>الدخول مطلوب قبل الوصول إلى البيانات التشغيلية والأسعار.</p>
    <label>البريد الإلكتروني<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
    <label>كلمة المرور<input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
    {error && <div className="state error">تعذر تسجيل الدخول: {error}</div>}
    <button className="primary-button" disabled={busy}>{busy ? 'جاري الدخول…' : 'دخول آمن'}</button>
  </form></main>;
}

export default function App() {
  const { session, loading: authLoading, signOut } = useAuth();
  const { products, loading, error } = useProducts(Boolean(session));
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.sku}`.toLocaleLowerCase('ar').includes(query.toLocaleLowerCase('ar'))), [products, query]);
  const cartCount = Object.values(cart).reduce((a,b) => a+b, 0);

  if (authLoading) return <main className="auth-shell"><div className="state">جاري التحقق من الجلسة…</div></main>;
  if (!session) return <Login />;

  return <main className="app-shell">
    <header className="topbar"><div><div className="eyebrow">بوابة الأغبري للمواد الغذائية</div><h1>المتجر التجاري</h1></div><div className="topbar-actions"><div className="cart-pill" aria-label={`السلة ${cartCount}`}>السلة · {cartCount}</div><button className="secondary-button" type="button" onClick={() => signOut()}>خروج</button></div></header>
    <section className="hero"><div><span className="status-dot" /> تشغيل تشغيلي<h2>اطلب بضاعتك بسرعة، بالسعر المصرح لك.</h2><p>واجهة تشغيلية عربية سريعة، مع فصل كامل بين بيانات العملاء والأسعار والمخزون.</p></div><div className="search-box"><label htmlFor="product-search">بحث عن منتج</label><input id="product-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="الاسم أو SKU أو الباركود" /></div></section>
    <section className="section-head"><div><h3>المنتجات</h3><span>{filtered.length} منتج</span></div></section>
    {loading && <div className="state">جاري تحميل المنتجات…</div>}{error && <div className="state error">تعذر تحميل المنتجات: {error}</div>}{!loading&&!error&&filtered.length===0&&<div className="state">لا توجد نتائج مطابقة.</div>}
    <section className="product-grid" aria-live="polite">{filtered.map((product)=><article className="product-card" key={product.id}><div className="product-media">{product.image_path?<img src={product.image_path} alt="" loading="lazy"/>:<span>صورة المنتج</span>}</div><div className="product-body"><span className="sku">{product.sku}</span><h4>{product.name}</h4><p>{product.description||'منتج تجاري متاح للطلب.'}</p><div className="product-footer"><span>الوحدة: {product.unit}</span><button type="button" onClick={()=>setCart((c)=>({...c,[product.id]:(c[product.id]??0)+1}))}>أضف للسلة</button></div></div></article>)}</section>
  </main>;
}
