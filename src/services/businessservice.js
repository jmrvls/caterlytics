import { supabase } from '../supabaseClient';
import { isValidPhMobile, normalizePhMobile } from '../utils/validators';

// Self-service: a logged-in Client account registers a brand-new catering
// business and is promoted to Owner/Manager of it. All of the actual work
// (creating the tbl_business row, checking the account doesn't already
// belong to a business, promoting the role, and attaching business_id) is
// done atomically inside the public.register_business() Postgres function —
// this just calls it. Returns the new business_id (uuid) on success.
export async function registerBusiness({ business_name, contact_email, contact_number, address }) {
  const { data, error } = await supabase.rpc('register_business', {
    p_business_name: business_name,
    p_contact_email: contact_email || null,
    p_contact_number: contact_number || null,
    p_address: address || null,
  });

  if (error) throw new Error(error.message || 'Failed to register business.');
  return data;
}

// Fetch the business the current user belongs to. RLS ("members view own
// business") scopes this to exactly the caller's own business_id, so no
// filter is needed here — any signed-in member of a business can call this.
// Returns null if the account isn't attached to any business yet (e.g. a
// Client who hasn't registered one).
export async function getMyBusiness() {
  const { data, error } = await supabase
    .from('tbl_business')
    .select('business_id, business_name, owner_id, contact_email, contact_number, address, logo_url, cover_url, created_at, max_bookings_per_day')
    .maybeSingle();

  if (error) throw new Error('Failed to load business info.');
  return data;
}

// Uploads a new business logo and updates tbl_business.logo_url. Reuses the
// same "avatars" storage bucket/RLS as user profile pictures — the folder
// segment just needs to match auth.uid(), which is true here since only the
// business owner (tbl_business.owner_id === auth.uid()) can call this.
export async function uploadBusinessLogo(ownerId, businessId, file) {
  const ext = { 'image/png': 'png', 'image/webp': 'webp' }[file.type] || 'jpg';
  const filePath = `${ownerId}/business-logo-${businessId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) throw new Error('Failed to upload logo.');

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  // Cache-bust so the new logo shows immediately instead of the browser
  // reusing a stale cached image at the same URL.
  const logo_url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { data, error } = await supabase
    .from('tbl_business')
    .update({ logo_url })
    .eq('business_id', businessId)
    .select()
    .maybeSingle();

  if (error) throw new Error('Failed to save logo.');
  if (!data) throw new Error('Only the business owner can edit these details.');
  return data;
}

// Uploads the store cover photo (the banner shown on the caterer cards) and
// saves it to tbl_business.cover_url. Same bucket/RLS as the logo.
export async function uploadBusinessCover(ownerId, businessId, file) {
  const ext = { 'image/png': 'png', 'image/webp': 'webp' }[file.type] || 'jpg';
  const filePath = `${ownerId}/business-cover-${businessId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true, cacheControl: '3600' });

  if (uploadError) throw new Error('Failed to upload cover photo.');

  const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
  const cover_url = `${publicUrlData.publicUrl}?t=${Date.now()}`;

  const { data, error } = await supabase
    .from('tbl_business')
    .update({ cover_url })
    .eq('business_id', businessId)
    .select()
    .maybeSingle();

  if (error) throw new Error('Failed to save cover photo.');
  if (!data) throw new Error('Only the business owner can edit these details.');
  return data;
}

export async function removeBusinessCover(businessId) {
  const { data, error } = await supabase
    .from('tbl_business')
    .update({ cover_url: null })
    .eq('business_id', businessId)
    .select()
    .maybeSingle();

  if (error) throw new Error('Failed to remove cover photo.');
  if (!data) throw new Error('Only the business owner can edit these details.');
  return data;
}

// Update business info. RLS ("owner update own business") only allows the
// original registrant (tbl_business.owner_id) to do this — everyone else's
// update is silently rejected by the database (0 rows affected), which we
// surface here as a clear error instead of a confusing "success".
// max_bookings_per_day = how many events this caterer can handle on the same
// date (the database trigger enforce_booking_capacity uses it as the limit).
export const MAX_BOOKINGS_PER_DAY_LIMIT = 100; // matches the DB CHECK on tbl_business (see supabase_migration_events_per_day.sql)

export async function updateMyBusiness(businessId, { business_name, contact_email, contact_number, address, max_bookings_per_day }) {
  // This number receives the "new booking" SMS, so it must be a PH mobile number
  // (09XXXXXXXXX or +639XXXXXXXXX). Blank is allowed.
  const rawNumber = String(contact_number ?? '').trim();
  if (rawNumber && !isValidPhMobile(rawNumber)) {
    throw new Error('Enter a valid mobile number, e.g. 09XXXXXXXXX. Booking text alerts are sent to this number.');
  }
  const name = String(business_name ?? '').trim();
  if (!name) throw new Error('Business name is required.');
  const updates = {
    business_name: name,
    contact_email: String(contact_email ?? '').trim(),
    contact_number: rawNumber ? normalizePhMobile(rawNumber) : rawNumber,
    address: String(address ?? '').trim(),
  };
  if (max_bookings_per_day !== undefined && max_bookings_per_day !== null && max_bookings_per_day !== '') {
    const cap = Number(max_bookings_per_day);
    if (!Number.isInteger(cap) || cap < 1 || cap > MAX_BOOKINGS_PER_DAY_LIMIT) {
      throw new Error(`Events per day must be a whole number from 1 to ${MAX_BOOKINGS_PER_DAY_LIMIT}.`);
    }
    updates.max_bookings_per_day = cap;
  }

  const { data, error } = await supabase
    .from('tbl_business')
    .update(updates)
    .eq('business_id', businessId)
    .select()
    .maybeSingle();

  if (error) throw new Error('Failed to update business info.');
  if (!data) throw new Error('Only the business owner can edit these details.');
  return data;
}

// Notifications for the caller's own business (e.g. "Your business was
// approved") -- dropped by the Super Admin approving/suspending/rejecting a
// business. Requires get_my_business_notifications() -- see
// supabase_migration_audit_notifications.sql. Returns [] (instead of
// throwing) if that migration hasn't been run yet, so the dashboard doesn't
// break for accounts that don't have it.
export async function getMyBusinessNotifications() {
  const { data, error } = await supabase.rpc('get_my_business_notifications');
  if (error) {
    console.error('Failed to load business notifications:', error.message);
    return [];
  }
  return data || [];
}

export async function markBusinessNotificationRead(notificationId) {
  const { error } = await supabase.rpc('mark_business_notification_read', {
    p_notification_id: notificationId,
  });
  if (error) throw new Error(error.message || 'Failed to mark notification as read.');
}

// The caller's own business subscription (for the "expiring soon" banner).
// Returns null if tenant_lifecycle.sql hasn't been run or no expiry is set.
export async function getMySubscription() {
  const { data, error } = await supabase.rpc('get_my_subscription');
  if (error) {
    console.error('Failed to load subscription:', error.message);
    return null;
  }
  const row = data?.[0];
  if (!row || row.subscription_expires_at == null) return null;
  return { expires_at: row.subscription_expires_at, days_left: Number(row.days_left) };
}