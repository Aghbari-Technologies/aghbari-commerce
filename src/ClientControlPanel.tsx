import { useEffect, useState } from 'react';
import { getOrCreateReportingAttempt, type ReportingAttempt } from './domain/reportingGateway';
import { supabase } from './lib/supabase';

type ClientUiConfig = {
  showSearch: boolean; showCategories: boolean; showExcel: boolean; showCredit: boolean; showTemplates: boolean; showInventory: boolean; showRetailPrice: boolean; showQuickOrder: boolean; accentColor: string; compactLayout: boolean;
  requireQuantityConfirmation: boolean; showTieredPricing: boolean; showSavingsCalculator: boolean; showImageSearch: boolean; showVoiceSearch: boolean; showPaymentMethods: boolean;
  paymentOnCredit: boolean; paymentCash: boolean; paymentTransfer: boolean; minOrderValue: number; maxOrderValue: number; maxTemplates: number;
};
const DEFAULT_CONFIG: ClientUiConfig = {
  showSearch:true, showCategories:true, showExcel:true, showCredit:true, showTemplates:true, showInventory:true, showRetailPrice:false, showQuickOrder:true, accentColor:'#0d91a5', compactLayout:false,
  requireQuantityConfirmation:true, showTieredPricing:true, showSavingsCalculator:true, showImageSearch:false, showVoiceSearch:false, showPaymentMethods:true,
  paymentOnCredit:true, paymentCash:true, paymentTransfer:true, minOrderValue:0, maxOrderValue:0, maxTemplates:50
};
const BOOLEAN_LABELS: Array<[keyof ClientUiConfig, string, string]> = [
  ['showSearch','شريط البحث','البحث بالاسم وSKU والباركود'],['showCategories','التصنيفات','فلاتر التصنيفات في الكتالوج'],['showExcel','رفع Excel','الطلب الجماعي من ملف Excel'],['showQuickOrder','الطلب السريع','إدخال SKU والكمية بسرعة'],
  ['showTemplates','القوالب','قوائم الطلبات المتكررة'],['showCredit','المركز المالي','الائتمان وكشف الحساب'],['showInventory','إظهار المخزون','حالة التوفر والكمية'],
  ['requireQuantityConfirmation','اعتماد الكمية','إلزام العميل بتأكيد الكمية قبل الإرسال'],['showTieredPricing','شرائح أسعار الجملة','إظهار مستويات السعر حسب الكمية'],['showSavingsCalculator','حاسبة التوفير','إظهار المتبقي للشريحة التالية'],
  ['showPaymentMethods','وسائل الدفع','إظهار خيارات الدفع المتاحة']
];
const PAYMENT_LABELS: Array<[keyof ClientUiConfig, string]> = [['paymentOnCredit','آجل / ائتمان'],['paymentCash','نقدي'],['paymentTransfer','حوالة']];

export default function ClientControlPanel({ role }: { role: string }) {
  const [config,setConfig]=useState(DEFAULT_CONFIG); const [organizationId,setOrganizationId]=useState<string|null>(null); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const [analysisBusy,setAnalysisBusy]=useState(false); const [analysisAttempt,setAnalysisAttempt]=useState<ReportingAttempt|null>(null);
  useEffect(()=>{if(!supabase||!['owner','admin'].includes(role))return;void(async()=>{const session=await supabase!.auth.getSession();const userId=session.data.session?.user.id;if(!userId)return;const {data:profile}=await supabase!.from('profiles').select('organization_id').eq('id',userId).maybeSingle();if(!profile?.organization_id)return;setOrganizationId(profile.organization_id);const {data}=await supabase!.from('client_ui_settings').select('config').eq('organization_id',profile.organization_id).maybeSingle();if(data?.config)setConfig({...DEFAULT_CONFIG,...(data.config as Partial<ClientUiConfig>)});})();},[role]);
  if(!['owner','admin'].includes(role))return null;
  async function save(){if(!supabase||!organizationId)return;setBusy(true);setMessage('');setError('');try{const {error}=await supabase.from('client_ui_settings').upsert({organization_id:organizationId,config,updated_at:new Date().toISOString()},{onConflict:'organization_id'});if(error)throw error;setMessage('تم حفظ إعدادات واجهة العميل فورياً.');}catch(e){setError(e instanceof Error?e.message:'تعذر حفظ إعدادات الواجهة.');}finally{setBusy(false);}}
  async function requestAnalysis(){
    if(!supabase){setError('خدمة البيانات غير متاحة.');return;}
    const periodStart=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10);
    const periodEnd=new Date().toISOString().slice(0,10);
    const attempt=getOrCreateReportingAttempt(analysisAttempt,periodStart,periodEnd,()=>crypto.randomUUID());
    setAnalysisAttempt(attempt);setAnalysisBusy(true);setMessage('');setError('');
    try{
      const {data,error:invokeError}=await supabase.functions.invoke('reporting-gateway',{body:{source_dataset_id:'commerce-'+periodEnd,source_version:'0.1.0',schema_version:'1.0',idempotency_key:attempt.idempotencyKey,data_period_start:attempt.periodStart,data_period_end:attempt.periodEnd}});
      if(invokeError)throw invokeError;
      if(!data?.ok)throw new Error(String(data?.reason??data?.error??'تعذر إرسال بيانات المتجر إلى بوابة التقارير.'));
      setAnalysisAttempt(null);
      setMessage('تم تمرير لقطة بيانات المتجر إلى بوابة التقارير بنجاح، مع بقاء Commerce مصدر الحقيقة التشغيلي.');
    }catch(e){const raw=e instanceof Error?e.message:'بوابة التقارير غير متاحة حالياً؛ لم يتم تعديل بيانات التشغيل.';setError(/not found|404|function.*not.*found|FunctionsFetchError/i.test(raw)?'بوابة التقارير غير مفعّلة على بيئة التشغيل الحالية؛ لم يتم تعديل بيانات Commerce.':raw);}
    finally{setAnalysisBusy(false);}
  }
  function updateBoolean(key:keyof ClientUiConfig,checked:boolean){setConfig(current=>({...current,[key]:checked}));}
  function updateNumber(key:keyof ClientUiConfig,value:string){const parsed=Number(value);setConfig(current=>({...current,[key]:Number.isFinite(parsed)&&parsed>=0?parsed:0}));}
  return <section className="admin-panel client-control-panel"><div className="section-heading"><div><span className="eyebrow">إدارة الواجهة</span><h2>التحكم الديناميكي بتطبيق العميل</h2></div><span>كل تغيير محفوظ في الإعدادات الموحدة دون تعديل الكود</span></div>
    <div className="admin-card"><div className="section-heading"><div><span className="eyebrow">بوابة التقارير</span><h3>إرسال بيانات التقارير</h3></div><span>تحليل أحادي الاتجاه؛ Commerce يبقى مصدر الحقيقة</span></div><p>يُنشئ الطلب لقطة تحليلية مرتبطة بجهة المتجر ويرفض الإرسال عند غياب إعدادات الوجهة أو فشل جودة البيانات.</p><button className="checkout" type="button" onClick={()=>void requestAnalysis()} disabled={analysisBusy||busy}>{analysisBusy?'جارٍ تمرير البيانات بأمان…':'إرسال إلى بوابة التقارير'}</button></div>
    <div className="admin-grid">{BOOLEAN_LABELS.map(([key,label,description])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)}/><span><strong>{label}</strong><small>{description} · {config[key]?'مفعّل':'معطّل'}</small></span></label>)}</div>
    <div className="admin-grid"><div className="admin-card"><h3>الهوية والمظهر</h3><label>لون الواجهة الرئيسي<input aria-label="لون الواجهة الرئيسي" type="color" value={config.accentColor} onChange={e=>setConfig(current=>({...current,accentColor:e.target.value}))}/></label><label className="control-toggle"><input type="checkbox" checked={config.compactLayout} onChange={e=>updateBoolean('compactLayout',e.target.checked)}/><span><strong>كثافة مدمجة</strong><small>تقليل المسافات للعمليات السريعة والشاشات الصغيرة</small></span></label></div><div className="admin-card"><h3>وسائل الدفع</h3>{PAYMENT_LABELS.map(([key,label])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)} disabled={!config.showPaymentMethods}/><span><strong>{label}</strong><small>{config[key]?'متاح للعميل':'موقوف'}</small></span></label>)}</div>
      <div className="admin-card"><h3>حدود الطلب</h3><label>الحد الأدنى لقيمة الطلب<input type="number" min="0" step="1" value={config.minOrderValue} onChange={e=>updateNumber('minOrderValue',e.target.value)}/></label><label>الحد الأعلى لقيمة الطلب<input type="number" min="0" step="1" value={config.maxOrderValue} onChange={e=>updateNumber('maxOrderValue',e.target.value)}/></label><small>القيمة 0 تعني عدم تطبيق حد.</small></div>
      <div className="admin-card"><h3>قوالب الطلبات</h3><label>الحد الأعلى للقوالب<input type="number" min="0" step="1" value={config.maxTemplates} onChange={e=>updateNumber('maxTemplates',e.target.value)}/></label><small>حد مركزي قابل للتغيير من الإدارة.</small></div></div>
    <button className="checkout" type="button" onClick={()=>void save()} disabled={!organizationId||busy||analysisBusy}>{busy?'جارٍ الحفظ…':'حفظ ونشر الإعدادات فورياً'}</button>{error&&<div className="error-banner" role="alert">{error}</div>}{message&&<div className="success" role="status">{message}</div>}</section>;
}