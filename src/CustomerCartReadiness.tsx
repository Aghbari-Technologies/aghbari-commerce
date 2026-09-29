
export default function CustomerCartReadiness({online,quantitiesConfirmed,minOrderValue,total,cartCount,cartLines,validLines,showPaymentMethods,paymentAvailable}:{online:boolean;quantitiesConfirmed:boolean;minOrderValue:number;total:number;cartCount:number;cartLines:number;validLines:boolean;showPaymentMethods:boolean;paymentAvailable:boolean}){
 const checks=[
  {ok:online,label:'اتصال الخادم',hint:online?'متصل ومتاح للإرسال':'الإرسال متوقف حتى عودة الاتصال'},
  {ok:cartLines>0,label:'السلة',hint:cartLines?cartLines+' أصناف · '+cartCount+' وحدة':'السلة فارغة'},
  {ok:quantitiesConfirmed,label:'الكميات',hint:quantitiesConfirmed?'الكميات معتمدة':'توجد كميات تحتاج اعتمادًا'},
  {ok:validLines,label:'البيانات',hint:validLines?'الخطوط الحالية صالحة محليًا للطلب':'راجع السعر/المخزون قبل الإرسال'},
  ...(showPaymentMethods?[{ok:paymentAvailable,label:'الدفع',hint:paymentAvailable?'طريقة الدفع متاحة':'طريقة الدفع المختارة غير متاحة'}]:[]),
  ...(minOrderValue>0?[{ok:total>=minOrderValue,label:'الحد الأدنى',hint:total>=minOrderValue?'تم بلوغ الحد الأدنى':'ينقص '+new Intl.NumberFormat('ar-YE',{maximumFractionDigits:0}).format(minOrderValue-total)+' ر.ي'}]:[])
 ];
 const satisfied=checks.filter(x=>x.ok).length;
 return <section className="customer-cart-readiness" aria-label="جاهزية الطلب"><div className="customer-cart-readiness-head"><div><span className="eyebrow">ORDER READINESS</span><strong>جاهزية الاعتماد</strong></div><b>{satisfied}/{checks.length}</b></div><div className="customer-cart-readiness-bar" aria-hidden="true"><i style={{width:(satisfied/checks.length*100)+'%'}}/></div><div className="customer-cart-readiness-grid">{checks.map(check=><div className={check.ok?'is-ok':'is-blocked'} key={check.label}><span>{check.ok?'✓':'!'}</span><div><strong>{check.label}</strong><small>{check.hint}</small></div></div>)}</div><small className="customer-cart-readiness-note">هذه مؤشرات جاهزية على الواجهة؛ الخادم يظل صاحب القرار النهائي عند إنشاء الطلب.</small></section>;
}
