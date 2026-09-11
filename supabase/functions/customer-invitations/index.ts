import { createClient } from 'npm:@supabase/supabase-js@2';

type InvitationContext = { invitation_id: string; organization_id: string; customer_id: string; recipient_email: string; expires_at: string };
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const siteUrl = (Deno.env.get('SITE_URL') ?? supabaseUrl).replace(/\/$/, '');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const resendFrom = Deno.env.get('RESEND_FROM');
const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } }); }
function bearer(request: Request) { const value = request.headers.get('authorization') ?? ''; return value.startsWith('Bearer ') ? value.slice(7).trim() : null; }
async function requireStaff(request: Request) {
  const token = bearer(request); if (!token) throw new Error('authentication required');
  const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) throw new Error('authentication required');
  const { data: profile, error: profileError } = await admin.from('profiles').select('organization_id,role').eq('id', user.id).single();
  if (profileError || !profile || !['owner', 'admin', 'sales'].includes(String(profile.role))) throw new Error('customer invitation access required');
  return { user, profile, client };
}
async function sendInvitationEmail(email: string, invitationUrl: string, customerId: string) {
  if (!resendApiKey || !resendFrom) return { dispatched: false, reason: 'RESEND_NOT_CONFIGURED' };
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: resendFrom, to: [email], subject: 'دعوة الدخول إلى بوابة الأغبري التجارية', html: `<div dir="rtl"><h2>دعوة إلى بوابة الأغبري التجارية</h2><p>تم إنشاء دعوة لحسابك التجاري.</p><p><a href="${invitationUrl}">قبول الدعوة وتفعيل الحساب</a></p><p>تنتهي الدعوة خلال 48 ساعة.</p></div>`, tags: [{ name: 'customer_id', value: customerId }] }) });
  if (!response.ok) throw new Error(`invitation email dispatch failed: ${response.status}`);
  return { dispatched: true, reason: undefined as string | undefined };
}
Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return json({ ok: true });
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return json({ error: 'invalid_payload' }, 422);
    const action = String((body as Record<string, unknown>).action ?? '');
    if (action === 'create') {
      const { user, client } = await requireStaff(request);
      const customerId = typeof body.customer_id === 'string' ? body.customer_id : '';
      const email = typeof body.email === 'string' ? body.email : '';
      if (!customerId || !email) return json({ error: 'customer_id_and_email_required' }, 422);
      const { data, error } = await client.rpc('create_customer_invitation', { p_customer_id: customerId, p_email: email });
      if (error) throw error;
      const invitation = (data as Array<{ invitation_id: string; recipient_email: string; expires_at: string; token: string }> | null)?.[0];
      if (!invitation) return json({ error: 'invitation_not_created' }, 500);
      const invitationUrl = `${siteUrl}/?invite=${encodeURIComponent(invitation.token)}`;
      const dispatch = await sendInvitationEmail(invitation.recipient_email, invitationUrl, customerId);
      return json({ invitation_id: invitation.invitation_id, recipient_email: invitation.recipient_email, expires_at: invitation.expires_at, invitation_url: invitationUrl, dispatched: dispatch.dispatched, dispatch_reason: dispatch.reason, created_by: user.id });
    }
    if (action === 'accept') {
      const token = typeof body.token === 'string' ? body.token.trim().toLowerCase() : '';
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      if (!/^[0-9a-f]{64}$/.test(token) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || password.length > 256) return json({ error: 'invalid_acceptance_payload' }, 422);
      const { data: invitationRows, error: invitationError } = await admin.rpc('get_customer_invitation_for_acceptance', { p_token: token });
      if (invitationError) return json({ error: 'invitation_invalid_or_expired' }, 403);
      const invitation = (invitationRows as InvitationContext[] | null)?.[0];
      if (!invitation || invitation.recipient_email.toLowerCase() !== email) return json({ error: 'invitation_recipient_mismatch' }, 403);
      const { data: created, error: createError } = await admin.auth.admin.createUser({ email: invitation.recipient_email, password, email_confirm: true });
      if (createError || !created.user) return json({ error: 'account_creation_failed' }, 409);
      const { error: consumeError } = await admin.rpc('consume_customer_invitation', { p_token: token, p_user_id: created.user.id });
      if (consumeError) {
        await admin.auth.admin.deleteUser(created.user.id);
        if (consumeError.code === '23505') return json({ error: 'invitation_already_used' }, 409);
        return json({ error: 'invitation_acceptance_failed' }, 409);
      }
      return json({ ok: true, email: invitation.recipient_email, user_id: created.user.id, customer_id: invitation.customer_id, organization_id: invitation.organization_id });
    }
    return json({ error: 'unknown_action' }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unexpected_error';
    const status = /authentication required|access required/.test(message) ? 403 : 400;
    return json({ error: message }, status);
  }
});
