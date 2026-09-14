import { requireSupabase } from '../lib/supabase';

export type TemplateLine = { productId: string; sku: string; name: string; unit: string; quantity: number };
export type OrderTemplate = { id: string; name: string; branchLabel: string; lines: TemplateLine[]; updatedAt: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i;

function validateLines(lines: TemplateLine[]) {
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 100) throw new Error('يجب أن تحتوي المسحة على 1 إلى 100 صنف.');
  const seen = new Set<string>();
  for (const line of lines) {
    if (!UUID.test(line.productId) || !line.sku || !line.name || !line.unit || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 1_000_000) throw new Error('بيانات أصناف المسحة غير صالحة.');
    if (seen.has(line.productId)) throw new Error('لا يمكن تكرار الصنف داخل المسحة.');
    seen.add(line.productId);
  }
  return lines;
}

export async function getOrderTemplates(): Promise<OrderTemplate[]> {
  const client = requireSupabase();
  const { data: templates, error } = await client.from('order_templates').select('id,name,branch_label,updated_at').order('updated_at', { ascending: false }).limit(100);
  if (error) throw error;
  if (!templates?.length) return [];
  const ids = templates.map((t) => t.id);
  const { data: lines, error: linesError } = await client.from('order_template_lines').select('template_id,product_id,quantity').in('template_id', ids).order('created_at');
  if (linesError) throw linesError;
  const productIds = [...new Set((lines ?? []).map((line) => line.product_id))];
  const { data: products, error: productsError } = productIds.length ? await client.from('products').select('id,sku,name,unit').in('id', productIds) : { data: [], error: null };
  if (productsError) throw productsError;
  const byProduct = new Map((products ?? []).map((p) => [p.id, p]));
  const byTemplate = new Map<string, TemplateLine[]>();
  for (const line of lines ?? []) {
    const product = byProduct.get(line.product_id);
    if (!product) continue;
    const target = byTemplate.get(line.template_id) ?? [];
    target.push({ productId: line.product_id, sku: product.sku, name: product.name, unit: product.unit, quantity: Number(line.quantity) });
    byTemplate.set(line.template_id, target);
  }
  return templates.map((row) => ({ id: row.id, name: row.name, branchLabel: row.branch_label ?? 'الفرع الرئيسي', lines: byTemplate.get(row.id) ?? [], updatedAt: row.updated_at }));
}

export async function createOrderTemplate(input: { name: string; branchLabel?: string; lines: TemplateLine[] }): Promise<OrderTemplate> {
  const client = requireSupabase();
  const name = input.name.trim();
  if (!name || name.length > 120) throw new Error('اسم المسحة يجب أن يكون بين 1 و120 حرفًا.');
  const lines = validateLines(input.lines);
  const { data, error } = await client.rpc('save_order_template', { p_name: name, p_branch_label: input.branchLabel?.trim() || 'الفرع الرئيسي', p_lines: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })) });
  if (error) throw error;
  if (typeof data !== 'string' || !UUID.test(data)) throw new Error('تعذر إثبات حفظ المسحة.');
  const templates = await getOrderTemplates();
  const created = templates.find((template) => template.id === data);
  if (!created) throw new Error('تم حفظ المسحة لكن تعذر قراءتها بعد الحفظ.');
  return created;
}

export async function applyOrderTemplate(id: string, warehouseId: string, idempotencyKey = crypto.randomUUID()): Promise<void> {
  if (!UUID.test(id) || !UUID.test(warehouseId)) throw new Error('معرّف المسحة أو المستودع غير صالح.');
  const { error } = await requireSupabase().rpc('apply_order_template', { p_template_id: id, p_warehouse_id: warehouseId, p_idempotency_key: idempotencyKey });
  if (error) throw error;
}

export async function deleteOrderTemplate(id: string): Promise<void> {
  if (!UUID.test(id)) throw new Error('معرّف المسحة غير صالح.');
  const { error } = await requireSupabase().from('order_templates').delete().eq('id', id);
  if (error) throw error;
}
