import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

type ClientUiConfig = {
  showSearch: boolean;
  showCategories: boolean;
  showExcel: boolean;
  showCredit: boolean;
  showTemplates: boolean;
  showInventory: boolean;
  showRetailPrice: boolean;
  showQuickOrder: boolean;
};

const DEFAULT_CONFIG: ClientUiConfig = {
  showSearch: true,
  showCategories: true,
  showExcel: true,
  showCredit: true,
  showTemplates: true,
  showInventory: true,
  showRetailPrice: false,
  showQuickOrder: true
};

export default function ClientControlPanel({ role }: { role: string }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase || !['owner','admin'].includes(role)) return;
    void (async () => {
      const session = await supabase!.auth.getSession();
      const userId = session.data.session?.user.id;
      if (!userId) return;
      const { data: profile } = await supabase!.from('profiles').select('organization_id').eq('id', userId).maybeSingle();
      if (!profile?.organization_id) return;
      setOrganizationId(profile.organization_id);
      const { data } = await supabase!.from('client_ui_settings').select('config').eq('organization_id', profile.organization_id).maybeSingle();
      if (data?.config) setConfig({ ...DEFAULT_CONFIG, ...(data.config as Partial<ClientUiConfig>) });
    })();
  }, [role]);

  if (!['owner','admin'].includes(role)) return null;

  async function save() {
    if (!supabase || !organizationId) return;
    const { error } = await supabase.from('client_ui_settings').upsert({ organization_id: organizationId, config, updated_at: new Date().toISOString() }, { onConflict: 'organization_id' });
    setMessage(error ? 'تعذر حفظ إعدادات الواجهة.' : 'تم حفظ إعدادات واجهة العميل.');
  }

  const labels: Array<[keyof ClientUiConfig, string]> = [
    ['showSearch','شريط البحث'], ['showCategories','التصنيفات'], ['showExcel','رفع Excel'], ['showQuickOrder','الطلب السريع'],
    ['showTemplates','المسحات'], ['showCredit','المركز المالي'], ['showInventory','إظهار المخزون'], ['showRetailPrice','إظهار سعر التجزئة']
  ];

  return <section className="admin-panel client-control-panel">
    <div className="section-heading"><div><span className="eyebrow">Dynamic CMS</span><h2>تحكم واجهة تطبيق العميل</h2></div><span>تغييرات الواجهة من لوحة الإدارة</span></div>
    <div className="client-control-grid">
      {labels.map(([key,label]) => <label className="control-toggle" key={key}><input type="checkbox" checked={config[key]} onChange={(e) => setConfig((current) => ({ ...current, [key]: e.target.checked }))}/><span><strong>{label}</strong><small>{config[key] ? 'ظاهر للعملاء' : 'مخفي عن العملاء'}</small></span></label>)}
    </div>
    <button className="checkout" onClick={() => void save()} disabled={!organizationId}>حفظ إعدادات واجهة العميل</button>
    {message && <div className="success" role="status">{message}</div>}
  </section>;
}
