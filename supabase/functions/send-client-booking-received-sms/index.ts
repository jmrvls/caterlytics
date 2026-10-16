// send-client-booking-received-sms: texts the CLIENT right after they submit a
// booking request, so they know it was received and is still Pending.
//
// Called only by the database trigger (public.notify_client_booking_received)
// with the x-webhook-secret header (secret lives in Vault, same as the email
// functions). POST { booking_id }  ->  { sent: true } | { skipped, reason }
// Sent once per booking (tbl_bookings.received_sms_sent_at). Every attempt is
// logged in public.tbl_sms_log.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { normalizePhone, sendSms } from '../_shared/philsms.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

function formatDate(d: string) {
  const dt = new Date(`${String(d).slice(0, 10)}T00:00:00Z`);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

async function logSms(row: Record<string, unknown>) {
  try {
    await admin.from('tbl_sms_log').insert(row);
  } catch (e) {
    console.error('sms log insert failed:', (e as Error).message);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);

  // Only our own database trigger may call this.
  const { data: secret, error: secretErr } = await admin.rpc('get_webhook_secret');
  if (secretErr || !secret) return json({ error: 'Webhook secret not configured.' }, 500);
  if (req.headers.get('x-webhook-secret') !== secret) return json({ error: 'Unauthorized' }, 401);

  let claimedId: number | string | null = null;
  try {
    const body = await req.json().catch(() => ({}));
    const bookingId = body?.booking_id;
    if (!bookingId) return json({ error: 'booking_id is required.' }, 400);

    const { data: booking, error: bErr } = await admin.from('tbl_bookings')
      .select('booking_id, booking_status, client_name, client_contact_number, event_date, business_id, created_by, received_sms_sent_at')
      .eq('booking_id', bookingId).maybeSingle();
    if (bErr) throw new Error(`load booking: ${bErr.message}`);
    if (!booking) return json({ skipped: true, reason: 'not_found' });
    if (booking.received_sms_sent_at) return json({ skipped: true, reason: 'already_sent' });
    if (booking.booking_status !== 'Pending') return json({ skipped: true, reason: 'not_pending' });

    // Client's number (fall back to their profile, same as the confirmation SMS).
    let rawPhone: unknown = booking.client_contact_number;
    let creatorBusinessId: string | null = null;
    if (booking.created_by) {
      const { data: creator } = await admin.from('tbl_profiles').select('contact_number, business_id').eq('id', booking.created_by).maybeSingle();
      creatorBusinessId = creator?.business_id ?? null;
      if (!normalizePhone(rawPhone) && creator?.contact_number) rawPhone = creator.contact_number;
    }
    const to = normalizePhone(rawPhone);
    if (!to) {
      await logSms({ booking_id: bookingId, recipient: String(rawPhone ?? ''), ok: false, error: 'invalid_phone' });
      return json({ skipped: true, reason: 'invalid_phone' });
    }

    // Claim first so a retry can't text the client twice (and charge twice).
    const { data: claimed } = await admin.from('tbl_bookings')
      .update({ received_sms_sent_at: new Date().toISOString() })
      .eq('booking_id', bookingId).is('received_sms_sent_at', null).select('booking_id');
    if (!claimed?.length) return json({ skipped: true, reason: 'already_sent' });
    claimedId = bookingId;

    let bizName = 'Caterlytics';
    const businessId = booking.business_id ?? creatorBusinessId;
    if (businessId) {
      const { data: biz } = await admin.from('tbl_business').select('business_name').eq('business_id', businessId).maybeSingle();
      if (biz?.business_name) bizName = biz.business_name;
    }

    const firstName = String(booking.client_name ?? '').replace(/[\r\n]+/g, ' ').trim().split(/\s+/)[0] || 'there';
    const shortBiz = bizName.trim().length > 60 ? bizName.trim().slice(0, 57) + '...' : bizName.trim();
    const message = `Hi ${firstName}, ${shortBiz} received your booking request for ${formatDate(booking.event_date)}. Status: PENDING. We'll text you once it's confirmed.`;

    try {
      const res = await sendSms(to, message);
      await logSms({ booking_id: bookingId, recipient: to, message, ok: true, provider_status: String(res?.status ?? 'unknown'), provider_response: res ?? null });
      claimedId = null;
      return json({ sent: true });
    } catch (e) {
      const msg = (e as Error).message;
      console.error('send-client-booking-received-sms failed:', msg);
      await logSms({ booking_id: bookingId, recipient: to, message, ok: false, provider_status: 'error', error: msg });
      // Release the claim so it can be retried.
      await admin.from('tbl_bookings').update({ received_sms_sent_at: null }).eq('booking_id', claimedId);
      claimedId = null;
      return json({ sent: false, error: msg }, 500);
    }
  } catch (e) {
    if (claimedId) await admin.from('tbl_bookings').update({ received_sms_sent_at: null }).eq('booking_id', claimedId);
    console.error('send-client-booking-received-sms failed:', (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});