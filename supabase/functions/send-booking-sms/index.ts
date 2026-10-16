// send-booking-sms: texts the CLIENT that their booking is CONFIRMED.
// Called from the admin UI (smsService.js) with the admin's login token.
// POST { booking_id, force? } -> { sent: true } | { sent: false, reason, message }
// Sent once per booking (tbl_bookings.confirmation_sms_sent_at); force=true resends.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { normalizePhone, sendSms } from '../_shared/philsms.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const ALLOWED_ROLES = ['Admin', 'Owner/Manager', 'Staff', 'Super Admin'];

function formatDate(d: string) {
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

async function logSms(row: Record<string, unknown>) {
  try { await admin.from('tbl_sms_log').insert(row); }
  catch (e) { console.error('sms log insert failed:', (e as Error).message); }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  let claimedId: number | string | null = null;
  try {
    // Who is calling? (logged-in team member of the same business)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Not logged in.' }, 401);
    const callerClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) return json({ error: 'Not logged in.' }, 401);
    const { data: caller } = await admin.from('tbl_profiles').select('role, business_id').eq('id', user.id).maybeSingle();
    if (!caller || !ALLOWED_ROLES.includes(caller.role)) return json({ error: 'Not allowed.' }, 403);

    const body = await req.json().catch(() => ({}));
    const bookingId = body?.booking_id;
    const force = body?.force === true;
    if (!bookingId) return json({ error: 'booking_id is required.' }, 400);

    const { data: booking, error: bErr } = await admin.from('tbl_bookings')
      .select('booking_id, booking_status, client_name, client_contact_number, event_date, business_id, created_by, confirmation_sms_sent_at')
      .eq('booking_id', bookingId).maybeSingle();
    if (bErr) throw new Error(`load booking: ${bErr.message}`);
    if (!booking) return json({ sent: false, reason: 'not_found', message: 'Booking not found.' });
    if (caller.role !== 'Super Admin' && booking.business_id !== caller.business_id) {
      return json({ error: 'Not allowed.' }, 403);
    }
    if (booking.booking_status !== 'Confirmed') return json({ sent: false, reason: 'not_confirmed' });
    if (booking.confirmation_sms_sent_at && !force) return json({ sent: false, reason: 'already_sent' });

    // Client's number (fall back to their profile number).
    let rawPhone: unknown = booking.client_contact_number;
    if (!normalizePhone(rawPhone) && booking.created_by) {
      const { data: creator } = await admin.from('tbl_profiles').select('contact_number').eq('id', booking.created_by).maybeSingle();
      if (creator?.contact_number) rawPhone = creator.contact_number;
    }
    const to = normalizePhone(rawPhone);
    if (!to) {
      await logSms({ booking_id: bookingId, recipient: String(rawPhone ?? ''), ok: false, error: 'invalid_phone' });
      return json({ sent: false, reason: 'invalid_phone' });
    }

    // Claim first so a double-click can't text (and charge) twice.
    if (!force) {
      const { data: claimed } = await admin.from('tbl_bookings')
        .update({ confirmation_sms_sent_at: new Date().toISOString() })
        .eq('booking_id', bookingId).is('confirmation_sms_sent_at', null).select('booking_id');
      if (!claimed?.length) return json({ sent: false, reason: 'already_sent' });
      claimedId = bookingId;
    }

    // The catering's own name.
    let bizName = 'Caterlytics';
    if (booking.business_id) {
      const { data: biz } = await admin.from('tbl_business').select('business_name').eq('business_id', booking.business_id).maybeSingle();
      if (biz?.business_name) bizName = biz.business_name;
    }
    const shortBiz = bizName.trim().length > 60 ? bizName.trim().slice(0, 57) + '...' : bizName.trim();
    const firstName = String(booking.client_name ?? '').replace(/[\r\n]+/g, ' ').trim().split(/\s+/)[0] || 'there';
    const message = `Hi ${firstName}, your booking with ${shortBiz} on ${formatDate(booking.event_date)} is CONFIRMED. Thank you!`;

    try {
      const res = await sendSms(to, message);
      await logSms({ booking_id: bookingId, recipient: to, message, ok: true, provider_status: String(res?.status ?? 'unknown'), provider_response: res ?? null });
      if (force) {
        await admin.from('tbl_bookings').update({ confirmation_sms_sent_at: new Date().toISOString() }).eq('booking_id', bookingId);
      }
      claimedId = null;
      return json({ sent: true });
    } catch (e) {
      const msg = (e as Error).message;
      console.error('send-booking-sms failed:', msg);
      await logSms({ booking_id: bookingId, recipient: to, message, ok: false, provider_status: 'error', error: msg });
      if (claimedId) await admin.from('tbl_bookings').update({ confirmation_sms_sent_at: null }).eq('booking_id', claimedId);
      claimedId = null;
      return json({ error: msg }, 500);
    }
  } catch (e) {
    if (claimedId) await admin.from('tbl_bookings').update({ confirmation_sms_sent_at: null }).eq('booking_id', claimedId);
    console.error('send-booking-sms failed:', (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});