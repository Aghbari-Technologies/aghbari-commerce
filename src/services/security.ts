import { requireSupabase } from '../lib/supabase';

export type DeviceChangeRequest = {
  id: string;
  customer_id: string;
  current_device_id: string | null;
  requested_device_key_hash: string;
  requested_device_label: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string | null;
  created_at: string;
};

export type NotificationItem = {
  id: string;
  kind: 'order' | 'inventory' | 'security' | 'system' | 'task';
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};

async function deviceKeyHash(seed: string): Promise<string> {
  const bytes = new TextEncoder().encode(seed);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join('');
}

export async function getStableDeviceKey(): Promise<string> {
  const storageKey = 'aghbari-device-key-v1';
  const existing = localStorage.getItem(storageKey);
  if (existing && existing.length >= 32) return existing;
  const raw = `${crypto.randomUUID()}:${navigator.userAgent}:${screen.width}x${screen.height}`;
  const hash = await deviceKeyHash(raw);
  localStorage.setItem(storageKey, hash);
  return hash;
}

export async function bindCurrentCustomerDevice(label = 'هذا الجهاز') {
  const key = await getStableDeviceKey();
  const { data, error } = await requireSupabase().rpc('bind_customer_device', { p_device_key_hash: key, p_device_label: label });
  if (error) throw error;
  return data;
}

export async function requestDeviceChange(label = 'جهاز جديد', reason = 'طلب العميل تغيير الجهاز') {
  const key = await getStableDeviceKey();
  const { data, error } = await requireSupabase().rpc('request_customer_device_change', { p_device_key_hash: key, p_device_label: label, p_reason: reason });
  if (error) throw error;
  return data as DeviceChangeRequest;
}

export async function getDeviceChangeRequests(limit = 100) {
  const { data, error } = await requireSupabase().from('device_change_requests').select('id,customer_id,current_device_id,requested_device_key_hash,requested_device_label,status,reason,created_at').order('created_at', { ascending: false }).limit(Math.min(Math.max(limit, 1), 500));
  if (error) throw error;
  return (data ?? []) as DeviceChangeRequest[];
}

export async function reviewDeviceChangeRequest(id: string, approve: boolean, reason?: string) {
  const { data, error } = await requireSupabase().rpc('review_device_change_request', { p_request_id: id, p_approve: approve, p_reason: reason ?? null });
  if (error) throw error;
  return data as DeviceChangeRequest;
}

export async function getNotifications(limit = 30) {
  const { data, error } = await requireSupabase().from('notifications').select('id,kind,title,body,entity_type,entity_id,read_at,created_at').order('created_at', { ascending: false }).limit(Math.min(Math.max(limit, 1), 100));
  if (error) throw error;
  return (data ?? []) as NotificationItem[];
}

export async function markNotificationRead(id: string) {
  const { error } = await requireSupabase().rpc('mark_notification_read', { p_notification_id: id });
  if (error) throw error;
}
