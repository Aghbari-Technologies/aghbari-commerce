import { requireSupabase } from '../lib/supabase';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCustomerUnreadNotificationCount(customerId: string): Promise<number> {
  const normalized = customerId.trim();
  if (!UUID_PATTERN.test(normalized)) throw new Error('معرّف العميل غير صالح.');
  const { count, error } = await requireSupabase()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', normalized)
    .is('read_at', null);
  if (error) throw error;
  return Math.max(0, Number(count ?? 0));
}
