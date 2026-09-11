import { supabase } from '../lib/supabase';

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
  if (!Array.isArray(value)) throw new Error('بيانات المسحة غير صالحة.');
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
  return {
    id: row.id,
    name: row.name,
    branchLabel: row.branch_label ?? 'الفرع الرئيسي',
    lines: parseLines(row.lines),
    updatedAt: row.updated_at,
  };
}

export async function getOrderTemplates(): Promise<OrderTemplate[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('order_templates')
    .select('id,name,branch_label,lines,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((row) => mapTemplate(row as DbTemplate));
}

export async function createOrderTemplate(input: {
  name: string;
  branchLabel?: string;
  lines: TemplateLine[];
}): Promise<OrderTemplate> {
  if (!supabase) throw new Error('قاعدة البيانات غير متاحة.');
  const name = input.name.trim();
  if (!name || name.length > 120) throw new Error('اسم المسحة يجب أن يكون بين 1 و120 حرفًا.');
  if (!input.lines.length || input.lines.length > 100) throw new Error('المسحة يجب أن تحتوي على أصناف صحيحة.');
  const lines = parseLines(input.lines);
  const { data, error } = await supabase
    .from('order_templates')
    .insert({ name, branch_label: input.branchLabel?.trim() || 'الفرع الرئيسي', lines })
    .select('id,name,branch_label,lines,updated_at')
    .single();
  if (error) throw error;
  return mapTemplate(data as DbTemplate);
}

export async function deleteOrderTemplate(id: string): Promise<void> {
  if (!supabase) throw new Error('قاعدة البيانات غير متاحة.');
  if (!id) throw new Error('معرف المسحة غير صالح.');
  const { error } = await supabase.from('order_templates').delete().eq('id', id);
  if (error) throw error;
}
