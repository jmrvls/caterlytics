import { supabase } from '../supabaseClient';

// ---------- Add-Ons Catalog (Admin/Owner side) ----------
// A business's list of extra items/services sold on top of a package
// (e.g. "Extra Lechon", "Extra Waiter", "Photobooth"). Scoped to the
// caller's own business by RLS — no business_id filter needed here, same
// convention as getAllMenuItems() in packageService.js.

export async function getMyAddons() {
  const { data, error } = await supabase
    .from('tbl_addons')
    .select('*')
    .order('addon_name', { ascending: true });

  if (error) throw new Error('Failed to load add-ons.');
  return data || [];
}

function validateAddon(addon) {
  if (!String(addon.addon_name || '').trim()) throw new Error('Add-on name is required.');
  const price = Number(addon.price);
  if (!Number.isFinite(price) || price < 0) throw new Error('Price must be 0 or more.');
}

export async function createAddon(addon) {
  validateAddon(addon);
  const { data, error } = await supabase
    .from('tbl_addons')
    .insert({
      addon_name: addon.addon_name,
      description: addon.description || null,
      price: addon.price,
      unit_label: addon.unit_label || 'per booking',
      is_active: addon.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create add-on.');
  return data;
}

export async function updateAddon(addonId, addon) {
  validateAddon(addon);
  const { data, error } = await supabase
    .from('tbl_addons')
    .update({
      addon_name: addon.addon_name,
      description: addon.description || null,
      price: addon.price,
      unit_label: addon.unit_label || 'per booking',
      is_active: addon.is_active ?? true,
    })
    .eq('addon_id', addonId)
    .select()
    .single();

  if (error) throw new Error('Failed to update add-on.');
  return data;
}

export async function deleteAddon(addonId) {
  const { error } = await supabase.from('tbl_addons').delete().eq('addon_id', addonId);
  if (error) throw new Error('Failed to delete add-on.');
  return { message: 'Add-on deleted successfully' };
}

// How many bookings use each add-on, as { [addon_id]: count }. Best effort:
// if the table can't be read the modal just doesn't show counts.
export async function getAddonUsageCounts() {
  const { data, error } = await supabase.from('tbl_booking_addons').select('addon_id');
  if (error) return {};
  const counts = {};
  for (const row of data || []) counts[row.addon_id] = (counts[row.addon_id] || 0) + 1;
  return counts;
}

// ---------- Browsing (Client side) ----------
// Active add-ons offered by one specific business, shown while the client
// is filling out a booking for that business.

export async function getBusinessAddons(businessId) {
  const { data, error } = await supabase
    .from('tbl_addons')
    .select('addon_id, addon_name, description, price, unit_label')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('addon_name', { ascending: true });

  if (error) throw new Error('Failed to load add-ons.');
  return data || [];
}

// ---------- Per-Booking Selections ----------

// The add-ons currently attached to one booking, with quantity + snapshot price.
export async function getBookingAddons(bookingId) {
  const { data, error } = await supabase
    .from('tbl_booking_addons')
    .select('booking_addon_id, addon_id, addon_name, unit_price, quantity, subtotal')
    .eq('booking_id', bookingId)
    .order('booking_addon_id', { ascending: true });

  if (error) throw new Error('Failed to load booking add-ons.');
  return data || [];
}

// Add-ons for many bookings at once (admin booking list), as
// { [booking_id]: [{ addon_id, addon_name, unit_price, quantity, subtotal }] }.
export async function getAddonsForBookings(bookingIds) {
  const ids = [...new Set(bookingIds || [])];
  if (!ids.length) return {};
  const { data, error } = await supabase
    .from('tbl_booking_addons')
    .select('booking_id, addon_id, addon_name, unit_price, quantity, subtotal')
    .in('booking_id', ids);

  if (error) throw new Error('Failed to load booking add-ons.');
  const map = {};
  for (const row of data || []) (map[row.booking_id] ||= []).push(row);
  return map;
}

// Replace a booking's whole add-on list atomically. Price is snapshotted
// server-side from tbl_addons (never trusts a client-supplied price), and
// the RPC itself enforces that only the booking's own client, while it's
// still Pending, may call this.
// addons = [{ addon_id, quantity }, ...]
export async function setBookingAddons(bookingId, addons) {
  const { data, error } = await supabase.rpc('set_booking_addons', {
    p_booking_id: bookingId,
    p_addons: addons,
  });

  if (error) throw new Error(error.message || 'Failed to save add-ons.');
  return data || [];
}

// Convenience: total ₱ across a list of booking add-ons (as returned by
// getBookingAddons), used wherever an Est. Total needs to include them.
export function sumAddons(addons) {
  return (addons || []).reduce((sum, a) => sum + Number(a.subtotal ?? a.unit_price * a.quantity), 0);
}