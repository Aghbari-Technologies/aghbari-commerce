import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type ClientUiConfig = {
  showSearch: boolean; showCategories: boolean; showExcel: boolean; showCredit: boolean; showTemplates: boolean; showInventory: boolean; showRetailPrice: boolean; showQuickOrder: boolean;
  requireQuantityConfirmation: boolean; showTieredPricing: boolean; showSavingsCalculator: boolean; showImageSearch: boolean; showVoiceSearch: boolean; showPaymentMethods: boolean;
  paymentOnCredit: boolean; paymentCash: boolean; paymentTransfer: boolean; minOrderValue: number; maxOrderValue: number; maxTemplates: number;
};
const DEFAULT_CONFIG: ClientUiConfig = {
  showSearch:true, showCategories:true, showExcel:true, showCredit:true, showTemplates:true, showInventory:true, showRetailPrice:false, showQuickOrder:true,
  requireQuantityConfirmation:true, showTieredPricing:true, showSavingsCalculator:true, showImageSearch:false, showVoiceSearch:false, showPaymentMethods:true,
  paymentOnCredit:true, paymentCash:true, paymentTransfer:true, minOrderValue:0, maxOrderValue:0, maxTemplates:50
};
const BOOLEAN_LABELS: Array<[keyof ClientUiConfig, string, string]> = [
  ['showSearch','شريط البحث','البحث بالاسم وSKU والباركود'],['showCategories','التصنيفات','فلاتر التصنيفات في الكتالوج'],['showExcel','رفع Excel','الطلب الجماعي من ملف Excel'],['showQuickOrder','الطلب السريع','إدخال SKU والكمية بسرعة'],
  ['showTemplates','المسحات','قوائم الطلبات المتكررة'],['showCredit','المركز المالي','الائتمان وكشف الحساب'],['showInventory','إظهار المخزون','حالة التوفر والكمية'],
  ['requireQuantityConfirmation','اعتماد الكمية','إلزام العميل بتأكيد الكمية قبل الإرسال'],['showTieredPricing','شرائح أسعار الجملة','إظهار مستويات السعر حسب الكمية'],['showSavingsCalculator','حاسبة التوفير','إظهار المتبقي للشريحة التالية'],
  ['showPaymentMethods','وسائل الدفع','إظهار خيارات الدفع المتاحة']
];
const PAYMENT_LABELS: Array<[keyof ClientUiConfig, string]> = [['paymentOnCredit','آجل / ائتمان'],['paymentCash','نقدي'],['paymentTransfer','حوالة']];

export default function ClientControlPanel({ role }: { role: string }) {
  const [config,setConfig]=useState(DEFAULT_CONFIG); const [organizationId,setOrganizationId]=useState<string|null>(null); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [analysisBusy,setAnalysisBusy]=useState(false); const [loading,setLoading]=useState(true);
  const reload=useCallback(async()=>{if(!supabase||!['owner','admin'].includes(role)){setLoading(false);return;}setLoading(true);setError('');try{const session=await supabase.auth.getSession();if(session.error)throw session.error;const userId=session.data.session?.user.id;if(!userId)throw new Error('جلسة الإدارة غير متاحة.');const {data:profile,error:profileError}=await supabase.from('profiles').select('organization_id').eq('id',userId).maybeSingle();if(profileError)throw profileError;if(!profile?.organization_id)throw new Error('لم يتم العثور على سياق المؤسسة.');setOrganizationId(profile.organization_id);const {data,error:settingsError}=await supabase.from('client_ui_settings').select('config').eq('organization_id',profile.organization_id).maybeSingle();if(settingsError)throw settingsError;setConfig(data?.config?{...DEFAULT_CONFIG,...(data.config as Partial<ClientUiConfig>)}:DEFAULT_CONFIG);}catch(e){setError(e instanceof Error?e.message:'تعذر تحميل إعدادات واجهة العميل.');}finally{setLoading(false);}
  },[role]);
  useEffect(()=>{void reload();},[reload]);
  if(!['owner','admin'].includes(role))return null;
  async function save(){if(!supabase||!organizationId)return;setBusy(true);setMessage('');setError('');try{const {error}=await supabase.from('client_ui_settings').upsert({organization_id:organizationId,config,updated_at:new Date().toISOString()},{onConflict:'organization_id'});if(error)throw error;setMessage('تم حفظ إعدادات واجهة العميل فورياً.');}catch(e){setError(e instanceof Error?e.message:'تعذر حفظ إعدادات الواجهة.');}finally{setBusy(false);}}
  async function requestAnalysis(){if(!supabase){setError('خدمة البيانات غير متاحة.');return;}setAnalysisBusy(true);setMessage('');setError('');try{const idempotencyKey=crypto.randomUUID();const {data,error:invokeError}=await supabase.functions.invoke('reporting-gateway',{body:{source_dataset_id:`commerce-${new Date().toISOString().slice(0,10)}`,source_version:'0.1.0',schema_version:'1.0',idempotency_key:idempotencyKey,data_period_start:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10),data_period_end:new Date().toISOString().slice(0,10)}});if(invokeError)throw invokeError;if(!data?.ok){throw new Error(String(data?.reason??data?.error??'تعذر إرسال بيانات المتجر إلى بوابة التقارير.'));}setMessage('تم تمرير لقطة بيانات المتجر إلى بوابة التقارير بنجاح، مع بقاء Commerce مصدر الحقيقة التشغيلي.');}catch(e){setError(e instanceof Error?`بوابة التقارير: ${e.message}`:'بوابة التقارير غير متاحة حالياً؛ لم يتم تعديل بيانات التشغيل.');}finally{setAnalysisBusy(false);}}
  function updateBoolean(key:keyof ClientUiConfig,checked:boolean){setConfig(current=>({...current,[key]:checked}));}
  function updateNumber(key:keyof ClientUiConfig,value:string){const parsed=Number(value);setConfig(current=>({...current,[key]:Number.isFinite(parsed)&&parsed>=0?parsed:0}));}
  return <section className="admin-panel client-control-panel" aria-busy={loading}><div className="section-heading"><div><span className="eyebrow">Dynamic CMS</span><h2>التحكم الديناميكي بتطبيق العميل</h2></div><span>كل تغيير محفوظ في الإعدادات الموحدة دون تعديل الكود</span></div>
    <div className="admin-card"><div className="section-heading"><div><span className="eyebrow">Reporting Gateway</span><h3>حلّل متجرك</h3></div><span>تحليل أحادي الاتجاه؛ Commerce يبقى مصدر الحقيقة</span></div><p>يُنشئ الطلب لقطة تحليلية tenant-bound ويرفض الإرسال عند غياب إعدادات الوجهة أو فشل جودة البيانات.</p><button className="checkout" type="button" onClick={()=>void requestAnalysis()} disabled={analysisBusy||busy}>{analysisBusy?'جارٍ تمرير البيانات بأمان…':'حلّل متجرك'}</button></div>
    <div>{loading&&<div className="portal-loading" role="status">جارٍ تحميل إعدادات واجهة العميل…</div>}</div><div className="admin-grid">{BOOLEAN_LABELS.map(([key,label,description])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)} disabled={loading||busy}/><span><strong>{label}</strong><small>{description} · {config[key]?'مفعّل':'معطّل'}</small></span></label>)}</div>
    <div className="admin-grid"><div className="admin-card"><h3>وسائل الدفع</h3>{PAYMENT_LABELS.map(([key,label])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)} disabled={loading||busy||!config.showPaymentMethods}/><span><strong>{label}</strong><small>{config[key]?'متاح للعميل':'موقوف'}</small></span></label>)}</div>
      <div className="admin-card"><h3>حدود الطلب</h3><label>الحد الأدنى لقيمة الطلب<input type="number" min="0" step="1" value={config.minOrderValue} onChange={e=>updateNumber('minOrderValue',e.target.value)} disabled={loading||busy}/></label><label>الحد الأعلى لقيمة الطلب<input type="number" min="0" step="1" value={config.maxOrderValue} onChange={e=>updateNumber('maxOrderValue',e.target.value)} disabled={loading||busy}/></label><small>القيمة 0 تعني عدم تطبيق حد.</small></div>
      <div className="admin-card"><h3>المسحات</h3><label>الحد الأعلى للمسحات<input type="number" min="0" step="1" value={config.maxTemplates} onChange={e=>updateNumber('maxTemplates',e.target.value)} disabled={loading||busy}/></label><small>حد مركزي قابل للتغيير من الإدارة.</small></div></div>
    <section className="client-portal-live-preview" aria-label="معاينة بوابة العميل">
      <div className="client-preview-head"><div><span className="eyebrow">Live Preview</span><h3>معاينة بوابة العميل</h3><p>هذه المعاينة تعكس إعداداتك الحالية قبل الحفظ والنشر.</p></div><span className="client-preview-mode">RTL · B2B</span></div>
      <div className="client-preview-window">
        <header className="client-preview-topbar"><div className="client-preview-brand"><span>أ</span><strong>بوابة الأغبري</strong></div>{config.showSearch&&<div className="client-preview-search">⌕ ابحث عن المنتج، SKU أو الباركود…</div>}<div className="client-preview-actions"><i>طلباتي</i><b>السلة 3</b></div></header>
        <div className="client-preview-body">
          <div className="client-preview-hero"><div><small>تجارة جملة أسرع</small><strong>احتياج متجرك، جاهز للطلب.</strong><p>واجهة مبسطة للأصناف والأسعار والكميات.</p></div>{config.showCredit&&<div><small>المتاح الائتماني</small><strong>125,000 ر.ي</strong></div>}</div>
          {config.showCategories&&<div className="client-preview-chips"><span className="active">الكل</span><span>مواد غذائية</span><span>منظفات</span><span>مشروبات</span></div>}
          <div className="client-preview-content">{config.showQuickOrder&&<button>⚡ طلب سريع</button>}{config.showExcel&&<button>رفع Excel</button>}{config.showTieredPricing&&<span>شرائح أسعار الجملة</span>}{config.showInventory&&<span>حالة المخزون ظاهرة</span>}</div>
          <div className="client-preview-product-grid">{[1,2,3].map((n)=><article key={n}><div className="client-preview-image">أ</div><small>SKU-00{n}</small><strong>صنف تجريبي للمعاينة</strong><span>{config.showInventory?"متوفر":"المخزون مخفي"}</span>{config.showTieredPricing&&<em>من 10 · سعر الجملة</em>}<button>{config.showQuickOrder?"إضافة للسلة":"عرض"}</button></article>)}</div>
        </div>
      </div>
    </section>
    <button className="checkout" type="button" onClick={()=>void save()} disabled={!organizationId||loading||busy||analysisBusy}>{busy?'جارٍ الحفظ…':'حفظ ونشر الإعدادات فورياً'}</button>{error&&<div className="error-banner" role="alert"><span>{error}</span><button type="button" className="ghost" onClick={()=>void reload()} disabled={loading||busy}>إعادة تحميل الإعدادات</button></div>}{message&&<div className="success" role="status">{message}</div>}</section>;
}
