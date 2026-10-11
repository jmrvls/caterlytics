// create-staff-user: invite link goes to the site the admin is actually using
// (if it is on the allow-list), Admin can't create Owner/Manager, rollback on
// failure, friendly 409 messages.
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

// The live site. An optional APP_URL secret may override it.
const DEFAULT_APP_URL = 'https://caterlytics.cater-capstone.workers.dev';
const APP_URL = (Deno.env.get('APP_URL') ?? DEFAULT_APP_URL).replace(/\/$/, '');

// Origins an invite link may point to. Each must ALSO be in
// Authentication -> URL Configuration -> Redirect URLs.
const ALLOWED_ORIGINS = new Set<string>([
  DEFAULT_APP_URL,
  APP_URL,
  'http://localhost:5173',
]);

function pickRedirect(requested: unknown): string {
  try {
    const u = new URL(String(requested ?? ''));
    if (ALLOWED_ORIGINS.has(u.origin)) return `${u.origin}/reset-password`;
  } catch { /* not a URL */ }
  return `${DEFAULT_APP_URL}/reset-password`;
}

const ALLOWED_CALLER_ROLES = ['Admin', 'Owner/Manager'];
// Who may create which role. Change here if Admins should be able to create Owner/Managers.
const ROLES_CALLER_MAY_CREATE: Record<string, string[]> = {
  'Owner/Manager': ['Admin', 'Staff', 'Owner/Manager'],
  Admin: ['Admin', 'Staff'],
};

const allowedAvailability = ['Available', 'On Leave', 'Unavailable'];
const allowedPositions = ['Cook', 'Server', 'Driver', 'Coordinator', 'Other'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 09171234567 / +639171234567 / 9171234567 -> { local: '09171234567', intl: '639171234567' }
function normalizePhone(raw: unknown): { local: string; intl: string } | null {
  const d = String(raw ?? '').replace(/\D/g, '');
  let intl: string | null = null;
  if (/^09\d{9}$/.test(d)) intl = '63' + d.slice(1);
  else if (/^9\d{9}$/.test(d)) intl = '63' + d;
  else if (/^639\d{9}$/.test(d)) intl = d;
  return intl ? { local: '0' + intl.slice(-10), intl } : null;
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
      .from('tbl_profiles')
      .select('role, business_id')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !ALLOWED_CALLER_ROLES.includes(callerProfile.role)) {
      return json({ error: 'Admins and Owner/Managers only.' }, 403);
    }
    if (!callerProfile.business_id) {
      return json({ error: 'Your account is not linked to a business.' }, 400);
    }

    const body = await req.json();
    const username = String(body.username ?? '').trim();
    const fullName = String(body.full_name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const role = String(body.role ?? '');

    if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
      return json({ error: 'Username must be 3-30 characters: letters, numbers, dot, dash or underscore only.' }, 400);
    }
    if (!fullName || fullName.length > 100) return json({ error: 'Please enter a full name.' }, 400);
    if (!emailPattern.test(email)) return json({ error: 'A valid email address is required.' }, 400);

    if (!(ROLES_CALLER_MAY_CREATE[callerProfile.role] ?? []).includes(role)) {
      return json({ error: `${callerProfile.role}s can't create a ${role || 'user'} account.` }, 403);
    }

    let phone: { local: string; intl: string } | null = null;
    if (body.contact_number) {
      phone = normalizePhone(body.contact_number);
      if (!phone) return json({ error: 'Enter a valid mobile number, e.g. 09171234567.' }, 400);
    }

    const safeAvailability = allowedAvailability.includes(body.availability) ? body.availability : 'Available';
    const safePosition = role === 'Staff' && allowedPositions.includes(body.position) ? body.position : null;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Username is UNIQUE but case-sensitive in older data; block case-insensitive duplicates.
    const safeLike = username.replace(/[\\%_]/g, '\\$&');
    const { data: nameHit, error: nameErr } = await adminClient
      .from('tbl_profiles').select('id').ilike('username', safeLike).limit(1);
    if (nameErr) return json({ error: 'Server error.' }, 500);
    if (nameHit?.length) return json({ error: 'That username is already taken.' }, 409);

    // One phone number = one account (same rule phone-otp applies at sign-up).
    if (phone) {
      const { data: phoneHit, error: phoneErr } = await adminClient.rpc('find_profiles_by_phone', { p_phone: phone.intl });
      if (phoneErr) return json({ error: 'Server error.' }, 500);
      if (phoneHit?.length) return json({ error: 'That contact number is already used by another account.' }, 409);
    }

    const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        username,
        full_name: fullName,
        role,
        contact_number: phone?.local ?? null,
        availability: safeAvailability,
        position: safePosition,
      },
      redirectTo: pickRedirect(body.redirectTo),
    });

    if (inviteError) {
      if (/already|registered|exists/i.test(inviteError.message)) {
        return json({ error: 'That email address is already registered.' }, 409);
      }
      return json({ error: inviteError.message }, 500);
    }

    // handle_new_user creates the profile as 'Client'; set the real role + this business now.
    // If that fails, remove the half-created account.
    const { error: updateError } = await adminClient
      .from('tbl_profiles')
      .update({ role, position: safePosition, business_id: callerProfile.business_id })
      .eq('id', invited.user.id);

    if (updateError) {
      await adminClient.auth.admin.deleteUser(invited.user.id);
      return json({ error: 'Could not finish creating the account. Please try again.' }, 500);
    }

    return json({
      message: 'Account created. An invitation email has been sent.',
      user: {
        user_id: invited.user.id,
        username,
        email,
        full_name: fullName,
        role,
        contact_number: phone?.local ?? null,
        availability: safeAvailability,
        position: safePosition,
      },
    }, 201);
  } catch (_err) {
    return json({ error: 'Server error.' }, 500);
  }
});