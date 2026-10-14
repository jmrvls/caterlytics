// invite-client-admin: Super Admin only.
// Creates a new catering business (tenant) and emails its owner an invitation.
// The owner clicks the link, sets their OWN password (/reset-password) and
// becomes the Owner/Manager ("client admin") of that business. The Super Admin
// never sees or sets the password.
//
// Deploy:  supabase functions deploy invite-client-admin
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

// Same allow-list idea as create-staff-user. Each origin must ALSO be in
// Authentication -> URL Configuration -> Redirect URLs.
const DEFAULT_APP_URL = 'https://caterlytics.cater-capstone.workers.dev';
const APP_URL = (Deno.env.get('APP_URL') ?? DEFAULT_APP_URL).replace(/\/$/, '');
const ALLOWED_ORIGINS = new Set<string>([DEFAULT_APP_URL, APP_URL, 'http://localhost:5173']);

function pickRedirect(requested: unknown): string {
  try {
    const u = new URL(String(requested ?? ''));
    if (ALLOWED_ORIGINS.has(u.origin)) return `${u.origin}/reset-password`;
  } catch { /* not a URL */ }
  return `${DEFAULT_APP_URL}/reset-password`;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(raw: unknown): { local: string; intl: string } | null {
  const d = String(raw ?? '').replace(/[\s-]/g, '').replace(/^\+/, '');
  let intl = '';
  if (/^09\d{9}$/.test(d)) intl = '63' + d.slice(1);
  else if (/^9\d{9}$/.test(d)) intl = '63' + d;
  else if (/^639\d{9}$/.test(d)) intl = d;
  return intl ? { local: '0' + intl.slice(-10), intl } : null;
}

function addMonths(months: number): string {
  const d = new Date();
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Not logged in.' }, 401);

    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) return json({ error: 'Not logged in.' }, 401);

    const { data: callerProfile } = await callerClient
      .from('tbl_profiles').select('role').eq('id', user.id).single();
    if (callerProfile?.role !== 'Super Admin') {
      return json({ error: 'Super Admin only.' }, 403);
    }

    const body = await req.json();
    const businessName = String(body.business_name ?? '').trim();
    const fullName = String(body.full_name ?? '').trim();
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const months = Math.floor(Number(body.subscription_months ?? 0));

    if (!businessName || businessName.length > 100) return json({ error: 'Enter the business name (max 100 characters).' }, 400);
    if (!fullName || fullName.length > 100) return json({ error: "Enter the owner's full name." }, 400);
    if (!emailPattern.test(email)) return json({ error: 'A valid email address is required.' }, 400);
    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
      return json({ error: 'Username must be 3-30 characters: letters, numbers, dot, dash or underscore only.' }, 400);
    }
    if (!Number.isFinite(months) || months < 0 || months > 24) {
      return json({ error: 'Subscription months must be between 0 and 24.' }, 400);
    }

    let phone: { local: string; intl: string } | null = null;
    if (body.contact_number) {
      phone = normalizePhone(body.contact_number);
      if (!phone) return json({ error: 'Enter a valid mobile number, e.g. 09171234567.' }, 400);
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const safeLike = username.replace(/[\\%_]/g, '\\$&');
    const { data: nameHit, error: nameErr } = await adminClient
      .from('tbl_profiles').select('id').ilike('username', safeLike).limit(1);
    if (nameErr) return json({ error: 'Server error.' }, 500);
    if (nameHit?.length) return json({ error: 'That username is already taken.' }, 409);

    if (phone) {
      const { data: phoneHit, error: phoneErr } = await adminClient.rpc('find_profiles_by_phone', { p_phone: phone.intl });
      if (phoneErr) return json({ error: 'Server error.' }, 500);
      if (phoneHit?.length) return json({ error: 'That contact number is already used by another account.' }, 409);
    }

    // 1) Send the invitation (fails fast if the email is already registered).
    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        username,
        full_name: fullName,
        role: 'Owner/Manager',
        contact_number: phone?.local ?? null,
      },
      redirectTo: pickRedirect(body.redirectTo),
    });
    if (inviteError) {
      if (/already|registered|exists/i.test(inviteError.message)) {
        return json({ error: 'That email address is already registered.' }, 409);
      }
      return json({ error: inviteError.message }, 500);
    }
    const newUserId = invited.user.id;

    const rollback = async (businessId?: string) => {
      if (businessId) await adminClient.from('tbl_business').delete().eq('business_id', businessId);
      await adminClient.auth.admin.deleteUser(newUserId);
    };

    // 2) Create the business. Active right away: the Super Admin is the one
    //    vouching for it (payment is handled manually, outside the system).
    const expiry = months > 0 ? addMonths(months) : null;
    const { data: business, error: bizError } = await adminClient
      .from('tbl_business')
      .insert({
        business_name: businessName,
        owner_id: newUserId,
        contact_email: email,
        contact_number: phone?.local ?? null,
        status: 'Active',
        subscription_expires_at: expiry,
        subscription_renewed_at: expiry ? new Date().toISOString() : null,
      })
      .select('business_id')
      .single();
    if (bizError || !business) {
      await rollback();
      return json({ error: 'Could not create the business. Please try again.' }, 500);
    }

    // 3) handle_new_user created the profile as 'Client'; make it the owner.
    const { error: updateError } = await adminClient
      .from('tbl_profiles')
      .update({ role: 'Owner/Manager', business_id: business.business_id })
      .eq('id', newUserId);
    if (updateError) {
      await rollback(business.business_id);
      return json({ error: 'Could not finish creating the account. Please try again.' }, 500);
    }

    return json({
      message: 'Business created. An invitation email has been sent to the owner.',
      business: {
        business_id: business.business_id,
        business_name: businessName,
        owner_email: email,
        owner_username: username,
        subscription_expires_at: expiry,
      },
    }, 201);
  } catch (_err) {
    return json({ error: 'Server error.' }, 500);
  }
});