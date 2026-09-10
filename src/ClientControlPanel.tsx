import { useEffect, useState } from 'react';
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
  ['showTemplates','المسحات','قوائم الطلبات المتكررة'],['showCredit','المركز المالي','الائتمان وكشف الحساب'],['showInventory','إظهار المخزون','حالة التوفر والكمية'],['showRetailPrice','إظهار سعر التجزئة','عرض سعر التجزئة للعميل'],
  ['requireQuantityConfirmation','اعتماد الكمية','إلزام العميل بتأكيد الكمية قبل الإرسال'],['showTieredPricing','شرائح أسعار الجملة','إظهار مستويات السعر حسب الكمية'],['showSavingsCalculator','حاسبة التوفير','إظهار المتبقي للشريحة التالية'],
  ['showImageSearch','البحث بالصور','تفعيل نقطة البحث بالصور'],['showVoiceSearch','البحث الصوتي','تفعيل نقطة البحث الصوتي'],['showPaymentMethods','وسائل الدفع','إظهار خيارات الدفع المتاحة']
];
const PAYMENT_LABELS: Array<[keyof ClientUiConfig, string]> = [['paymentOnCredit','آجل / ائتمان'],['paymentCash','نقدي'],['paymentTransfer','حوالة']];
export default function ClientControlPanel({ role }: { role: string }) {
  const [config,setConfig]=useState(DEFAULT_CONFIG); const [organizationId,setOrganizationId]=useState<string|null>(null); const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false);
  useEffect(()=>{if(!supabase||!['owner','admin'].includes(role))return;void(async()=>{const session=await supabase!.auth.getSession();const userId=session.data.session?.user.id;if(!userId)return;const {data:profile}=await supabase!.from('profiles').select('organization_id').eq('id',userId).maybeSingle();if(!profile?.organization_id)return;setOrganizationId(profile.organization_id);const {data}=await supabase!.from('client_ui_settings').select('config').eq('organization_id',profile.organization_id).maybeSingle();if(data?.config)setConfig({...DEFAULT_CONFIG,...(data.config as Partial<ClientUiConfig>)});})();},[role]);
  if(!['owner','admin'].includes(role))return null;
  async function save(){if(!supabase||!organizationId)return;setBusy(true);setMessage('');try{const {error}=await supabase.from('client_ui_settings').upsert({organization_id:organizationId,config,updated_at:new Date().toISOString()},{onConflict:'organization_id'});setMessage(error?'تعذر حفظ إعدادات الواجهة.':'تم حفظ إعدادات واجهة العميل فورياً.');}finally{setBusy(false);}}
  function updateBoolean(key:keyof ClientUiConfig,checked:boolean){setConfig(current=>({...current,[key]:checked}));}
  function updateNumber(key:keyof ClientUiConfig,value:string){const parsed=Number(value);setConfig(current=>({...current,[key]:Number.isFinite(parsed)&&parsed>=0?parsed:0}));}
  return <section className="admin-panel client-control-panel"><div className="section-heading"><div><span className="eyebrow">Dynamic CMS</span><h2>التحكم الديناميكي بتطبيق العميل</h2></div><span>كل تغيير محفوظ في الإعدادات الموحدة دون تعديل الكود</span></div>
    <div className="admin-grid">{BOOLEAN_LABELS.map(([key,label,description])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)}/><span><strong>{label}</strong><small>{description} · {config[key]?'مفعّل':'معطّل'}</small></span></label>)}</div>
    <div className="admin-grid"><div className="admin-card"><h3>وسائل الدفع</h3>{PAYMENT_LABELS.map(([key,label])=><label className="control-toggle" key={key}><input type="checkbox" checked={Boolean(config[key])} onChange={e=>updateBoolean(key,e.target.checked)} disabled={!config.showPaymentMethods}/><span><strong>{label}</strong><small>{config[key]?'متاح للعميل':'موقوف'}</small></span></label>)}</div>
      <div className="admin-card"><h3>حدود الطلب</h3><label>الحد الأدنى لقيمة الطلب<input type="number" min="0" step="1" value={config.minOrderValue} onChange={e=>updateNumber('minOrderValue',e.target.value)}/></label><label>الحد الأعلى لقيمة الطلب<input type="number" min="0" step="1" value={config.maxOrderValue} onChange={e=>updateNumber('maxOrderValue',e.target.value)}/></label><small>القيمة 0 تعني عدم تطبيق حد.</small></div>
      <div className="admin-card"><h3>المسحات</h3><label>الحد الأعلى للمسحات<input type="number" min="0" step="1" value={config.maxTemplates} onChange={e=>updateNumber('maxTemplates',e.target.value)}/></label><small>حد مركزي قابل للتغيير من الإدارة.</small></div></div>
    <button className="checkout" onClick={()=>void save()} disabled={!organizationId||busy}>{busy?'جارٍ الحفظ…':'حفظ ونشر الإعدادات فورياً'}</button>{message&&<div className="success" role="status">{message}</div>}</section>;
}
