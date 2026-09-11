import { requireSupabase } from '../lib/supabase';

export type TemplateLine = {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
};

export type OrderTemplate = {
  id: string;
  name: string;
  branchLabel: string;
  lines: TemplateLine[];
  updatedAt: string;
};

type DbTemplate = {
  id: string;
  name: string;
  branch_label: string | null;
  lines: unknown;
  updated_at: string;
};

function parseLines(value: unknown): TemplateLine[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) throw new Error('بيانات المسحة غير صالحة.');
  return value.map((line) => {
    if (!line || typeof line !== 'object') throw new Error('بيانات أصناف المسحة غير صالحة.');
    const item = line as Record<string, unknown>;
    const productId = typeof item.productId === 'string' ? item.productId : '';
    const sku = typeof item.sku === 'string' ? item.sku : '';
    const name = typeof item.name === 'string' ? item.name : '';
    const unit = typeof item.unit === 'string' ? item.unit : '';
    const quantity = Number(item.quantity);
    if (!productId || !sku || !name || !unit || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('بيانات أصناف المسحة غير صالحة.');
    }
    return { productId, sku, name, unit, quantity };
  });
}

function mapTemplate(row: DbTemplate): OrderTemplate {
  return { id: row.id, name: row.name, branchLabel: row.branch_label ?? 'الفرع الرئيسي', lines: parseLines(row.lines), updatedAt: row.updated_at };
}

async function currentCustomerId(): Promise<string> {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error('يجب تسجيل الدخول لإدارة المسحات.');
  const { data, error } = await client.from('profiles').select('customer_id').eq('id', userData.user.id).single();
  if (error) throw error;
  if (!data?.customer_id) throw new Error('الحساب الحالي غير مرتبط بعميل.');
  return data.customer_id;
}

export async function getOrderTemplates(): Promise<OrderTemplate[]> {
  const client = requireSupabase();
  const { data, error } = await client.from('order_templates').select('id,name,branch_label,lines,updated_at').order('updated_at', { ascending: false }).limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapTemplate(row as DbTemplate));
}

export async function createOrderTemplate(input: { name: string; branchLabel?: string; lines: TemplateLine[] }): Promise<OrderTemplate> {
  const client = requireSupabase();
  const name = input.name.trim();
  if (!name || name.length > 120) throw new Error('اسم المسحة يجب أن يكون بين 1 و120 حرفًا.');
  const lines = parseLines(input.lines);
  const customerId = await currentCustomerId();
  const { data, error } = await client.from('order_templates').insert({ customer_id: customerId, name, branch_label: input.branchLabel?.trim() || 'الفرع الرئيسي', lines }).select('id,name,branch_label,lines,updated_at').single();
  if (error) throw error;
  return mapTemplate(data as DbTemplate);
}

export async function applyOrderTemplate(id: string): Promise<void> {
  const client = requireSupabase();
  if (!id) throw new Error('معرف المسحة غير صالح.');
  const { error } = await client.rpc('apply_order_template', { p_template_id: id });
  if (error) throw error;
}

export async function deleteOrderTemplate(id: string): Promise<void> {
  const client = requireSupabase();
  if (!id) throw new Error('معرف المسحة غير صالح.');
  const { error } = await client.from('order_templates').delete().eq('id', id);
  if (error) throw error;
}
