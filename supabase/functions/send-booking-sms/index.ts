// send-admin-booking-sms: texts the business's CONTACT NUMBER (the one the
// Admin/Owner set in Settings > Business) that a CLIENT just made a new
// booking request. Only if that number is missing/invalid does it fall back to
// the owner's and Admin accounts' own profile numbers.
//
// Called only by the database trigger (public.notify_admin_new_booking) with
// the x-webhook-secret header (secret lives in Vault, same as the email
// functions). POST { booking_id }  ->  { sent: n } | { skipped, reason }
// Sent once per booking (tbl_bookings.admin_sms_sent_at). Every attempt is
// logged in public.tbl_sms_log.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { normalizePhone, sendSms } from '../_shared/philsms.ts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const STAFF_SIDE_ROLES = ['Admin', 'Owner/Manager', 'Staff', 'Super Admin'];

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
      .select('booking_id, booking_status, client_name, event_date, event_time, guest_count, business_id, created_by, admin_sms_sent_at')
      .eq('booking_id', bookingId).maybeSingle();
    if (bErr) throw new Error(`load booking: ${bErr.message}`);
    if (!booking) return json({ skipped: true, reason: 'not_found' });
    if (booking.admin_sms_sent_at) return json({ skipped: true, reason: 'already_sent' });
    if (booking.booking_status !== 'Pending') return json({ skipped: true, reason: 'not_pending' });

    // Only text for bookings made by clients (not walk-ins keyed in by the team).
    let creatorBusinessId: string | null = null;
    if (booking.created_by) {
      const { data: creator } = await admin.from('tbl_profiles').select('role, business_id').eq('id', booking.created_by).maybeSingle();
      if (creator && STAFF_SIDE_ROLES.includes(creator.role)) return json({ skipped: true, reason: 'created_by_team' });
      creatorBusinessId = creator?.business_id ?? null;
    }

    const businessId = booking.business_id ?? creatorBusinessId;
    if (!businessId) return json({ skipped: true, reason: 'no_business' });

    const { data: biz } = await admin.from('tbl_business').select('business_name, owner_id, contact_number').eq('business_id', businessId).maybeSingle();

    // Recipient: the contact number the Admin/Owner set in Settings > Business.
    const phones = new Map<string, string>(); // normalized -> normalized
    const addPhone = (raw: unknown) => { const n = normalizePhone(raw); if (n) phones.set(n, n); };

    addPhone(biz?.contact_number);

    // Fallback only when the business number is missing/invalid: owner + Admin profile numbers.
    if (phones.size === 0) {
      if (biz?.owner_id) {
        const { data: o } = await admin.from('tbl_profiles').select('contact_number').eq('id', biz.owner_id).maybeSingle();
        addPhone(o?.contact_number);
      }
      const { data: admins } = await admin.from('tbl_profiles')
        .select('contact_number')
        .eq('business_id', businessId)
        .in('role', ['Admin', 'Owner/Manager']);
      for (const a of admins ?? []) addPhone(a.contact_number);
    }

    if (phones.size === 0) {
      await logSms({ booking_id: bookingId, recipient: '', ok: false, error: 'no_admin_phone' });
      return json({ skipped: true, reason: 'no_admin_phone' });
    }

    // Claim first so a retry can't text the admin twice.
    const { data: claimed } = await admin.from('tbl_bookings')
      .update({ admin_sms_sent_at: new Date().toISOString() })
      .eq('booking_id', bookingId).is('admin_sms_sent_at', null).select('booking_id');
    if (!claimed?.length) return json({ skipped: true, reason: 'already_sent' });
    claimedId = bookingId;

    const bizName = String(biz?.business_name ?? 'your catering').trim();
    const shortBiz = bizName.length > 28 ? bizName.slice(0, 27) + '…' : bizName;
    const client = String(booking.client_name ?? 'A client').replace(/[\r\n]+/g, ' ').trim().slice(0, 30) || 'A client';
    const when = formatDate(booking.event_date) + (booking.event_time ? ` ${String(booking.event_time).slice(0, 5)}` : '');
    const guests = booking.guest_count ? `, ${booking.guest_count} guests` : '';
    const message = `New booking request for ${shortBiz}: ${client} on ${when}${guests}. Open Caterlytics to review.`;

    let sent = 0;
    let lastError = '';
    for (const to of phones.values()) {
      try {
        const res = await sendSms(to, message);
        sent++;
        await logSms({ booking_id: bookingId, recipient: to, message, ok: true, provider_status: String(res?.status ?? 'unknown'), provider_response: res ?? null });
      } catch (e) {
        lastError = (e as Error).message;
        console.error('send-admin-booking-sms failed for a recipient:', lastError);
        await logSms({ booking_id: bookingId, recipient: to, message, ok: false, provider_status: 'error', error: lastError });
      }
    }

    // Nobody got the text -> release the claim so it can be retried.
    if (sent === 0) {
      await admin.from('tbl_bookings').update({ admin_sms_sent_at: null }).eq('booking_id', claimedId);
      return json({ sent: 0, error: lastError }, 500);
    }
    return json({ sent });
  } catch (e) {
    if (claimedId) await admin.from('tbl_bookings').update({ admin_sms_sent_at: null }).eq('booking_id', claimedId);
    console.error('send-admin-booking-sms failed:', (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});