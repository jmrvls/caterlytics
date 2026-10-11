import { supabase } from '../supabaseClient';
import { localToday } from '../utils/date';

// supabase.functions.invoke() puts the function's JSON reply on
// `error.context` (a fetch Response) -- NOT on `data`, and `error.context.error`
// is always undefined. The old code therefore always showed the useless
// "Edge Function returned a non-2xx status code" instead of the real reason
// (e.g. "Username already taken").
async function functionErrorMessage(error, fallback) {
  try {
    const payload = await error.context.json();
    if (payload?.error) return payload.error;
  } catch {
    // No readable body (network down, etc.)
  }
  return fallback;
}

const PROFILE_COLUMNS = 'id, username, full_name, role, contact_number, availability, position, avatar_url';

export async function getUsers() {
  const run = (cols) => supabase
    .from('tbl_profiles')
    .select(cols)
    .neq('role', 'Client')
    .order('username', { ascending: true });

  let res = await run(`${PROFILE_COLUMNS}, is_active`);
  // 42703 = column does not exist yet (staff_improvements.sql not run) -- keep the page working.
  if (res.error && res.error.code === '42703') res = await run(PROFILE_COLUMNS);

  if (res.error) throw new Error('Failed to fetch users.');
  return { users: (res.data || []).map((u) => ({ ...u, is_active: u.is_active ?? true })) };
}

export async function createStaffUser(username, email, full_name, role, contact_number, availability, position) {
  const { data, error } = await supabase.functions.invoke('create-staff-user', {
    body: {
      username,
      email,
      full_name,
      role,
      contact_number,
      availability,
      position,
      // Where the invite email's link should send them so they can set
      // their own password (see Resetpasswordview.vue).
      redirectTo: `${window.location.origin}/reset-password`,
    },
  });

  if (error) {
    throw new Error(await functionErrorMessage(error, 'Failed to create account.'));
  }
  return data;
}

// Update an existing staff/admin/owner profile's role, contact details, and
// availability. (Username/password are managed via Supabase Auth, not here.)
export async function updateStaffUser(id, { full_name, role, contact_number, availability, position }) {
  const { data, error } = await supabase
    .from('tbl_profiles')
    .update({ full_name, role, contact_number, availability, position })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    // Database rules (owner profile, role changes) raise readable messages -- show them.
    if (error.code === 'P0001' && error.message) throw new Error(error.message);
    if (error.code === '23505') throw new Error('That contact number is already used by another account.');
    if (error.code === 'PGRST116') {
      throw new Error("You don't have permission to edit staff profiles. Only Admin accounts can do this.");
    }
    throw new Error('Failed to update staff member.');
  }
  return data;
}

// Permanently delete a staff/admin/owner account (Admin only; enforced
// again server-side by the edge function). Deleting the auth user cascades
// to tbl_profiles via ON DELETE CASCADE.
export async function deleteStaffUser(userId) {
  const { data, error } = await supabase.functions.invoke('delete-staff-user', {
    body: { user_id: userId },
  });

  if (error) {
    throw new Error(await functionErrorMessage(error, 'Failed to delete account.'));
  }
  return data;
}

// ---------------------------------------------------------------------------
// Staff page extras
// ---------------------------------------------------------------------------

// Upcoming (today onward) Pending/Confirmed events for every staff member,
// grouped as { [staff_id]: [booking, ...] } and sorted nearest-first.
export async function getStaffWorkload() {
  const todayStr = localToday();
  const { data, error } = await supabase
    .from('tbl_booking_staff')
    .select('staff_id, tbl_bookings!inner(booking_id, client_name, event_date, event_time, event_location, booking_status, guest_count, package_name)')
    .gte('tbl_bookings.event_date', todayStr)
    .in('tbl_bookings.booking_status', ['Pending', 'Confirmed']);

  if (error) throw new Error('Failed to load staff workload.');

  const map = {};
  for (const row of data || []) {
    if (!row.tbl_bookings) continue;
    (map[row.staff_id] ||= []).push(row.tbl_bookings);
  }
  for (const id of Object.keys(map)) {
    map[id].sort((a, b) =>
      String(a.event_date).localeCompare(String(b.event_date)) ||
      String(a.event_time || '').localeCompare(String(b.event_time || '')));
  }
  return map;
}

// Everyone's leave dates from today onward: { [staff_id]: [{ unavailable_date, reason }] }.
export async function getUpcomingLeaveMap() {
  const { data, error } = await supabase
    .from('tbl_staff_unavailability')
    .select('staff_id, unavailable_date, reason')
    .gte('unavailable_date', localToday());

  if (error) throw new Error('Failed to load leave dates.');

  const map = {};
  for (const row of data || []) (map[row.staff_id] ||= []).push(row);
  return map;
}

// Email + "invitation not accepted yet" for each team member (needs the
// manage-staff edge function; the page just hides those bits if it's missing).
export async function getInviteStatus() {
  const { data, error } = await supabase.functions.invoke('manage-staff', { body: { action: 'status' } });
  if (error) throw new Error(await functionErrorMessage(error, 'Failed to load invite status.'));
  return data?.users || {};
}

export async function resendInvite(userId) {
  const { data, error } = await supabase.functions.invoke('manage-staff', {
    body: { action: 'resend', user_id: userId, redirectTo: `${window.location.origin}/reset-password` },
  });
  if (error) throw new Error(await functionErrorMessage(error, 'Failed to resend invitation.'));
  return data;
}

// Deactivate (active = false) or reactivate (active = true) an account.
export async function setStaffActive(userId, active) {
  const { data, error } = await supabase.functions.invoke('manage-staff', {
    body: { action: 'set_active', user_id: userId, active },
  });
  if (error) throw new Error(await functionErrorMessage(error, 'Failed to update the account.'));
  return data;
}

// Bulk: set the same availability flag on several accounts at once.
export async function bulkSetAvailability(ids, availability) {
  if (!ids || ids.length === 0) return 0;
  const { data, error } = await supabase
    .from('tbl_profiles')
    .update({ availability })
    .in('id', ids)
    .select('id');

  if (error) {
    if (error.code === 'P0001' && error.message) throw new Error(error.message);
    throw new Error('Failed to update availability.');
  }
  return (data || []).length;
}