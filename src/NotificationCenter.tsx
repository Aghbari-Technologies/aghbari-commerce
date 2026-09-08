import { useCallback, useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import './notification-center.css';

type NotificationItem = { id: string; title: string; body: string; kind: string; read_at: string | null; created_at: string };
type UserRole = 'owner' | 'admin' | 'sales' | 'warehouse' | 'viewer';

export default function NotificationCenter({ role }: { role: UserRole }) {
  const [items, setItems] = useState<NotificationItem[]>([]); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState<string | null>(null);
  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error: queryError } = await supabase.from('notifications').select('id,title,body,kind,read_at,created_at').order('created_at', { ascending: false }).limit(12);
    if (queryError) throw queryError; setItems((data ?? []) as NotificationItem[]); setError(null);
  }, []);
  useEffect(() => { void load().catch((e) => setError(e instanceof Error ? e.message : 'تعذر تحميل التنبيهات.')); if (!supabase) return; const channel = supabase.channel(`aghbari-notifications-${role}`).on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => void load()).subscribe(); return () => { void supabase.removeChannel(channel); }; }, [load, role]);
  async function markRead(id: string) { if (!supabase || busy) return; setBusy(id); setError(null); try { const { error: mutationError } = await supabase.rpc('mark_notification_read', { p_notification_id: id }); if (mutationError) throw mutationError; setItems((current) => current.map((item) => item.id === id ? { ...item, read_at: new Date().toISOString() } : item)); } catch (e) { setError(e instanceof Error ? e.message : 'تعذر تحديث التنبيه.'); } finally { setBusy(null); } }
  const unread = items.filter((item) => !item.read_at).length;
  return <section className="admin-live-card notification-center" id="notifications"><div className="section-heading"><div><span className="eyebrow">التنبيهات</span><h3>مركز الإشعارات</h3></div><span>{unread} غير مقروء</span></div>{error && <div className="error-banner" role="alert">{error}</div>}{!items.length ? <p>لا توجد تنبيهات جديدة.</p> : <div className="notification-list">{items.map((item) => <article key={item.id} className={item.read_at ? 'notification read' : 'notification unread'}><div><strong>{item.title}</strong><small>{item.body}</small><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString('ar-YE')}</time></div>{!item.read_at && <button disabled={busy === item.id} onClick={() => void markRead(item.id)}>تحديد كمقروء</button>}</article>)}</div>}</section>;
}
