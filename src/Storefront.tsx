import type { ReactNode } from 'react';

interface StorefrontProps {
  onLogin: () => void;
}

function StoreFeature({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  return (
    <article className="storefront-feature">
      <span className="storefront-feature-icon" aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        <p>{copy}</p>
      </div>
    </article>
  );
}

function StorePill({ children }: { children: ReactNode }) {
  return <span className="storefront-pill">{children}</span>;
}

export default function Storefront({ onLogin }: StorefrontProps) {
  const goToLogin = () => onLogin();

  return (
    <div className="storefront" dir="rtl">
      <header className="storefront-header">
        <a className="storefront-brand" href="/" aria-label="الأغبري، الصفحة الرئيسية">
          <span className="storefront-brand-mark"><img src="/icons/aghbari-192.svg" alt="" /></span>
          <span><b>الأغبري</b><small>Aghbari Commerce</small></span>
        </a>

        <nav className="storefront-nav" aria-label="التنقل الرئيسي">
          <a className="active" href="#store-home">الرئيسية</a>
          <a href="#store-catalog" onClick={(event) => { event.preventDefault(); goToLogin(); }}>الكتالوج</a>
          <a href="#store-how" >كيف يعمل</a>
          <a href="#store-about">عن الأغبري</a>
        </nav>

        <div className="storefront-header-actions">
          <button type="button" className="storefront-icon-button" aria-label="البحث" onClick={goToLogin}>⌕</button>
          <button type="button" className="storefront-cart-button" onClick={goToLogin}>
            <span aria-hidden="true">🛒</span>
            <span>السلة</span>
            <b>0</b>
          </button>
          <button type="button" className="storefront-login-button" onClick={goToLogin}>دخول الحساب</button>
        </div>
      </header>

      <main id="store-home">
        <section className="storefront-hero">
          <div className="storefront-hero-copy">
            <StorePill>تجارة B2B • الأغبري</StorePill>
            <h1>متجرك التجاري،<br /><em>بطريقة أبسط.</em></h1>
            <p>
              كتالوج واضح، أسعار مرتبطة بحسابك، وكميات جاهزة للطلب.
              ابدأ من المتجر ثم أكمل الشراء بعد تسجيل الدخول إلى مؤسستك.
            </p>
            <div className="storefront-hero-actions">
              <button type="button" className="storefront-primary" onClick={goToLogin}>ابدأ التسوق <span>←</span></button>
              <a className="storefront-secondary" href="#store-how">اعرف كيف يعمل <span>↓</span></a>
            </div>
            <div className="storefront-trust-row" aria-label="مزايا المتجر">
              <span><i aria-hidden="true">✓</i> أسعار مخصصة للحساب</span>
              <span><i aria-hidden="true">✓</i> طلبات وكميات حقيقية</span>
              <span><i aria-hidden="true">✓</i> متابعة الطلبات بعد الشراء</span>
            </div>
          </div>

          <div className="storefront-hero-visual" aria-label="معاينة المتجر">
            <div className="storefront-orb storefront-orb-one" aria-hidden="true" />
            <div className="storefront-orb storefront-orb-two" aria-hidden="true" />
            <div className="storefront-showcase">
              <div className="storefront-showcase-top">
                <span>الأغبري</span>
                <span>متجر الجملة</span>
              </div>
              <div className="storefront-showcase-search">
                <span aria-hidden="true">⌕</span>
                <span>ابحث عن صنف، SKU أو باركود…</span>
              </div>
              <div className="storefront-showcase-categories">
                <span>كل المنتجات</span><span>الأكثر طلبًا</span><span>كتالوج شركتك</span>
              </div>
              <div className="storefront-showcase-grid">
                <div className="storefront-demo-card"><div className="storefront-demo-image">أ</div><b>المنتج</b><small>السعر يظهر حسب الحساب</small><button type="button" onClick={goToLogin}>عرض التفاصيل</button></div>
                <div className="storefront-demo-card"><div className="storefront-demo-image">ب</div><b>المنتج</b><small>المخزون والصلاحية حقيقيان</small><button type="button" onClick={goToLogin}>إضافة للسلة</button></div>
              </div>
              <div className="storefront-showcase-cart">
                <span><i aria-hidden="true">🛒</i> السلة</span><b>الدخول لإضافة المنتجات</b>
              </div>
            </div>
          </div>
        </section>

        <section className="storefront-category-band" id="store-catalog">
          <div className="storefront-section-heading">
            <div><StorePill>كتالوج الشراء</StorePill><h2>ابدأ من المنتجات، لا من لوحة التحكم</h2></div>
            <button type="button" className="storefront-text-link" onClick={goToLogin}>الدخول إلى الكتالوج الكامل ←</button>
          </div>
          <div className="storefront-entry-grid">
            <button type="button" onClick={goToLogin}><span>◫</span><strong>كتالوج مؤسستك</strong><small>أصناف وأسعار حسب صلاحية حسابك</small><b>←</b></button>
            <button type="button" onClick={goToLogin}><span>↗</span><strong>طلب سريع</strong><small>إدخال SKU والكمية عند الدخول</small><b>←</b></button>
            <button type="button" onClick={goToLogin}><span>♡</span><strong>المحفوظات</strong><small>مفضلة وأصناف تعود إليها كثيرًا</small><b>←</b></button>
            <button type="button" onClick={goToLogin}><span>🧾</span><strong>طلباتك</strong><small>تتبع الطلبات وإعادة الطلب</small><b>←</b></button>
          </div>
        </section>

        <section className="storefront-how" id="store-how">
          <div className="storefront-how-lead">
            <StorePill>تجربة الشراء</StorePill>
            <h2>من التصفح إلى الطلب<br />بدون تعقيد.</h2>
            <p>المتجر العام يعرّفك بالتجربة، وعند الدخول تظهر المنتجات والأسعار والمخزون المصرّح بها لحساب مؤسستك.</p>
          </div>
          <div className="storefront-features">
            <StoreFeature icon="01" title="تصفح" copy="واجهة متجر واضحة مع بحث وفئات ونتائج مرتبة." />
            <StoreFeature icon="02" title="راجع" copy="تفاصيل الصنف والكمية والسعر المتاح للحساب." />
            <StoreFeature icon="03" title="اطلب" copy="سلة وCheckout ثم إنشاء الطلب عبر المسار الحقيقي." />
          </div>
        </section>

        <section className="storefront-about" id="store-about">
          <div><StorePill>الأغبري B2B</StorePill><h2>التجربة التي تراها هنا هي واجهة البيع، لا لوحة التشغيل.</h2><p>لوحة الإدارة مخصصة للموظفين والتشغيل. المتجر مخصص للمشتري، مع بقاء المخزون والأسعار والصلاحيات ومصدر الحقيقة التجاري على النظام.</p></div>
          <button type="button" className="storefront-primary" onClick={goToLogin}>دخول وفتح المتجر <span>←</span></button>
        </section>
      </main>

      <footer className="storefront-footer">
        <div className="storefront-brand"><span className="storefront-brand-mark"><img src="/icons/aghbari-192.svg" alt="" /></span><span><b>الأغبري</b><small>Aghbari Commerce</small></span></div>
        <span>متجر تجارة الجملة • واجهة عربية RTL</span>
        <button type="button" onClick={goToLogin}>دخول الحساب ←</button>
      </footer>
    </div>
  );
}
