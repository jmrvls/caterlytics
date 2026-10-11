import { reactive } from 'vue';
import { supabase } from '../supabaseClient';
import { cleanItemForm, isLowStock, roundQty } from '../utils/inventory';
import { getBookingsPage } from './bookingService';
import { getKitchenPrepList } from './kitchenservice';

// Turns a Supabase/Postgres error into an Error whose .message is safe to show.
// (The old code threw raw errors, and the view read `error.response.data.error`
// -- an axios shape that Supabase never produces -- so users always saw the
// generic "Something went wrong".)
// Flags the UI can show so a missing database migration is never silent.
//   historyMissing : inventory_fixes.sql not run -> adjustments still work but
//                    the reason / note are NOT saved.
//   setCountLegacy : inventory_set_stock.sql not run -> "Set Count" falls back
//                    to read-then-adjust, which is NOT atomic.
export const inventoryStatus = reactive({ historyMissing: false, setCountLegacy: false });

const warned = new Set();
function warnOnce(key, message) {
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}

function friendly(error, fallback) {
  let message = error?.message || fallback;
  switch (error?.code) {
    case '23505':
      message = 'An item with that name already exists.';
      break;
    case '23503':
      message = 'This item is still used by a package or dish. Remove it from their ingredients first.';
      break;
    case '23514':
      message = 'Invalid value: quantity, threshold and cost cannot be negative.';
      break;
    default:
      break;
  }
  const err = new Error(message);
  err.code = error?.code;
  return err;
}

export async function getAllInventory() {
  const { data, error } = await supabase
    .from('tbl_inventory')
    .select('*')
    .order('item_name', { ascending: true });

  if (error) throw friendly(error, 'Failed to load inventory.');
  return data || [];
}

export async function getInventoryItem(id) {
  const { data, error } = await supabase
    .from('tbl_inventory')
    .select('*')
    .eq('item_id', id)
    .single();

  if (error) throw friendly(error, 'Item not found.');
  return data;
}

export async function createInventoryItem(itemData) {
  const payload = cleanItemForm(itemData); // validates + trims

  const { data, error } = await supabase
    .from('tbl_inventory')
    .insert(payload)
    .select()
    .single();

  if (error) throw friendly(error, 'Failed to create item.');
  return data;
}

// NOTE: quantity is intentionally NOT sent here. Stock changes go through
// adjustInventoryStock / setInventoryStock so a stale edit form can never
// overwrite a deduction that happened while the modal was open (e.g. a
// booking got confirmed and auto-deducted stock).
export async function updateInventoryItem(id, itemData) {
  const payload = cleanItemForm(itemData, { includeQuantity: false });

  const { data, error } = await supabase
    .from('tbl_inventory')
    .update(payload)
    .eq('item_id', id)
    .select()
    .single();

  if (error) throw friendly(error, 'Failed to update item.');
  return data;
}

function isMissingFunction(error) {
  return (
    error?.code === '42883' ||
    error?.code === 'PGRST202' ||
    /could not find the function|does not exist/i.test(error?.message || '')
  );
}

// Shared by adjustInventoryStock (whole numbers only, validated there) and the
// legacy Set Count fallback (which may need a fractional delta when the current
// stock is fractional, e.g. after a booking deducted 0.15 kg x guests).
async function applyDelta(id, delta, reason, note) {
  const logged = await supabase.rpc('adjust_inventory_stock_logged', {
    p_item_id: id,
    p_adjustment: delta,
    p_reason: reason,
    p_note: note,
  });

  if (!logged.error) return logged.data;
  if (!isMissingFunction(logged.error)) {
    throw friendly(logged.error, 'Failed to update stock. Item may not exist or stock is insufficient.');
  }

  // Fallback: original RPC (no history, no reason). Surface this to the UI
  // instead of silently dropping the reason/note the user typed.
  inventoryStatus.historyMissing = true;
  warnOnce(
    'history',
    '[inventory] adjust_inventory_stock_logged is missing -- run inventory_fixes.sql. Reasons/notes are not being saved.'
  );

  const { data, error } = await supabase.rpc('adjust_inventory_stock', {
    p_item_id: id,
    p_adjustment: delta,
  });
  if (error) throw friendly(error, 'Failed to update stock. Item may not exist or stock is insufficient.');
  return data;
}

// Adds (positive) or removes (negative) stock atomically in the database.
// Uses adjust_inventory_stock_logged (also writes a movement-history row) when
// inventory_fixes.sql has been run; falls back to the original RPC otherwise
// (and sets inventoryStatus.historyMissing so the UI can say so).
export async function adjustInventoryStock(id, adjustment, reason = null, note = null) {
  const delta = roundQty(adjustment);
  if (!Number.isInteger(delta) || delta === 0) throw new Error('Enter a whole number greater than 0.');
  return applyDelta(id, delta, reason, note);
}

// "Set exact count" (physical count / correction).
//
// FIXED (race): this used to read the current quantity, compute a delta in JS,
// then apply it -- so a booking confirmed between those two steps left the
// stock wrong. It now calls set_inventory_stock, which locks the row and sets
// the value inside ONE database transaction (see inventory_set_stock.sql).
//
// FIXED (decimals): the old delta went through adjustInventoryStock's
// whole-number check, so a fractional current stock made a perfectly valid
// whole-number count fail with "Enter a whole number greater than 0.".
// The new RPC receives the target itself, so no delta is involved.
export async function setInventoryStock(id, targetQty, note = null) {
  const target = roundQty(targetQty);
  if (!Number.isInteger(target) || target < 0) throw new Error('Count must be a whole number, 0 or more.');

  const { data, error } = await supabase.rpc('set_inventory_stock', {
    p_item_id: id,
    p_target: target,
    p_note: note,
  });

  if (!error) return data;
  if (!isMissingFunction(error)) throw friendly(error, 'Failed to set the count.');

  // inventory_set_stock.sql hasn't been run yet -> old behaviour, but with the
  // fractional-delta problem fixed. Still racy, so flag it.
  inventoryStatus.setCountLegacy = true;
  warnOnce(
    'setcount',
    '[inventory] set_inventory_stock is missing -- run inventory_set_stock.sql. Set Count is using a non-atomic fallback.'
  );

  const current = await getInventoryItem(id);
  const delta = roundQty(target - Number(current.quantity));
  if (delta === 0) return current;
  return applyDelta(id, delta, 'Physical count', note);
}

// How many package / dish ingredient rows use this item. Needed because
// deleting an item that recipes depend on would silently shrink (or break)
// the stock deduction of future bookings, and changing its unit would make
// every "quantity per guest" wrong by 1000x.
export async function getItemUsage(id) {
  const [pk, dish] = await Promise.all([
    supabase.from('tbl_package_ingredients').select('id', { count: 'exact', head: true }).eq('item_id', id),
    supabase.from('tbl_menu_item_ingredients').select('inventory_item_id', { count: 'exact', head: true }).eq('inventory_item_id', id),
  ]);
  if (pk.error) throw friendly(pk.error, 'Failed to check item usage.');
  if (dish.error) throw friendly(dish.error, 'Failed to check item usage.');
  const packages = pk.count || 0;
  const dishes = dish.count || 0;
  return { packages, dishes, total: packages + dishes };
}

export async function deleteInventoryItem(id) {
  const usage = await getItemUsage(id);
  if (usage.total > 0) {
    throw new Error(
      `Can't delete: used in ${usage.packages} package ingredient(s) and ${usage.dishes} dish ingredient(s). Remove it from those first.`
    );
  }

  const { error } = await supabase
    .from('tbl_inventory')
    .delete()
    .eq('item_id', id);

  if (error) throw friendly(error, 'Failed to delete item.');
  return { message: 'Item deleted successfully' };
}

// Latest stock movements for one item. Returns null if the history table
// hasn't been created yet (inventory_fixes.sql not run) so the UI can just
// hide the history section instead of erroring.
export async function getInventoryMovements(id, limit = 10) {
  const { data, error } = await supabase
    .from('tbl_inventory_movements')
    .select('movement_id, delta, reason, note, created_at')
    .eq('item_id', id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return null;
  return data || [];
}

// Items at or below their low_stock_threshold. Used by the notification
// bell (see useNotifications.js) to alert Admin/Owner in real time, per the
// study's objective of generating low-stock notifications (1.2.2).
// Only fetches the columns the bell needs.
export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('tbl_inventory')
    .select('item_id, item_name, quantity, low_stock_threshold, unit');

  if (error) throw friendly(error, 'Failed to load low-stock items.');
  return (data || []).filter(isLowStock);
}

// When each item's stock last changed (newest movement), for the "updated 3d ago"
// hint. Best effort: returns {} if the history table isn't available.
export async function getLastMovementDates() {
  const { data, error } = await supabase
    .from('tbl_inventory_movements')
    .select('item_id, created_at')
    .order('created_at', { ascending: false })
    .limit(2000);

  if (error) return {};
  const last = {};
  for (const m of data || []) {
    if (!(m.item_id in last)) last[m.item_id] = m.created_at;
  }
  return last;
}

// What the UPCOMING PENDING events still need from the storeroom.
//
// Only Pending bookings count: a Confirmed booking has already had its
// ingredients deducted from stock (see confirm_booking_with_stock_check), so
// counting it again would double count. The numbers come from the same
// get_kitchen_prep_list() function the kitchen uses, so they always match.
//
// Events are processed soonest-first and each one "uses up" stock, so if two
// events compete for the same Beef the later one is the one flagged short.
export async function getUpcomingNeeds({ limit = 20 } = {}) {
  const { rows, total } = await getBookingsPage({ status: 'Pending', when: 'upcoming', limit });

  const settled = await Promise.allSettled(rows.map((b) => getKitchenPrepList(b.booking_id)));

  const remaining = new Map(); // item_id -> stock left after earlier events
  const perItem = new Map();   // item_id -> { item_id, name, unit, needed, in_stock }
  const events = [];
  let failed = 0;

  settled.forEach((res, idx) => {
    const b = rows[idx];
    if (res.status !== 'fulfilled') { failed += 1; return; }
    const totals = res.value.totals || [];

    const lines = totals.map((t) => {
      const needed = Number(t.total) || 0;
      const inStock = Number(t.in_stock) || 0;
      if (!remaining.has(t.item_id)) remaining.set(t.item_id, inStock);
      const left = remaining.get(t.item_id);
      remaining.set(t.item_id, left - needed);

      const agg = perItem.get(t.item_id) || { item_id: t.item_id, name: t.name, unit: t.unit, needed: 0, in_stock: inStock };
      agg.needed += needed;
      perItem.set(t.item_id, agg);

      return { item_id: t.item_id, name: t.name, unit: t.unit, needed, short_by: Math.max(0, needed - Math.max(0, left)) };
    });

    events.push({
      booking_id: b.booking_id,
      client_name: b.client_name,
      event_date: b.event_date,
      guest_count: b.guest_count,
      package_name: b.package_name,
      hasRecipe: lines.length > 0,
      lines,
      shortLines: lines.filter((l) => l.short_by > 0),
    });
  });

  const items = [...perItem.values()]
    .map((i) => ({ ...i, short_by: Math.max(0, i.needed - i.in_stock) }))
    .sort((a, b) => (b.short_by > 0) - (a.short_by > 0) || a.name.localeCompare(b.name));

  return { events, items, failed, totalPending: total, shown: rows.length };
}