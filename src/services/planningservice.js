import { supabase } from '../supabaseClient';
import { toTitleCase } from '../utils/textFormat';
import { getUnavailableStaffOnDate, getStaffScheduleConflicts } from './staffassignmentservice';

// Fixed tag list so the dietary summary counts are consistent. Anything else
// goes in the free-text "allergies" / "notes" fields.
export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Halal',
  'No Pork',
  'No Beef',
  'No Seafood',
  'Gluten-Free',
  'Lactose-Free',
  'Diabetic-Friendly',
  'Kid Meal',
];

// Structured allergens so the kitchen gets real counts ("shrimp" / "Shrimp" /
// "hipon" all land on Shellfish). Anything else goes in the free-text allergies.
export const ALLERGEN_OPTIONS = [
  'Shellfish',
  'Fish',
  'Peanuts',
  'Tree Nuts',
  'Egg',
  'Milk',
  'Soy',
  'Wheat',
  'Sesame',
];

// Mild = intolerance / avoid if possible. Severe = real allergy, keep the dish
// and utensils completely separate.
export const ALLERGY_SEVERITY = ['Mild', 'Severe'];

export const RSVP_OPTIONS = ['Pending', 'Attending', 'Declined'];

// Row-level security hides rows from a user who may not edit this plan (e.g.
// Staff, who can view but not change it). Supabase then reports success with
// 0 rows changed, so every write below checks that a row was really affected.
const NO_ACCESS_MSG = "You don't have permission to change this event's plan.";
function writeError(error, fallback) {
  if (error?.code === '42501' || error?.code === 'PGRST116') return new Error(NO_ACCESS_MSG);
  return new Error(error?.message || fallback);
}

function cleanPhone(value) {
  return String(value || '').replace(/[\s-]/g, '');
}

function validateGuest(guest) {
  if (!String(guest.full_name || '').trim()) {
    throw new Error('Guest name is required.');
  }
  const phone = cleanPhone(guest.contact_number);
  if (phone && !/^(09\d{9}|\+639\d{9})$/.test(phone)) {
    throw new Error('Enter a valid mobile number, e.g. 09171234567.');
  }
  if (guest.email && !/^\S+@\S+\.\S+$/.test(String(guest.email).trim())) {
    throw new Error('Enter a valid email address.');
  }
  if (guest.rsvp_status && !RSVP_OPTIONS.includes(guest.rsvp_status)) {
    throw new Error('Invalid RSVP status.');
  }
  if (guest.allergy_severity && !ALLERGY_SEVERITY.includes(guest.allergy_severity)) {
    throw new Error('Invalid allergy severity.');
  }
  if (String(guest.group_name || '').length > 60) {
    throw new Error('Group name is too long (max 60 characters).');
  }
}

export function hasAllergy(g) {
  return (g.allergens || []).length > 0 || !!String(g.allergies || '').trim();
}

export function hasRestriction(g) {
  return (g.dietary_preferences || []).length > 0 || hasAllergy(g);
}

function toGuestRow(guest) {
  return {
    full_name: toTitleCase(String(guest.full_name).trim()),
    contact_number: cleanPhone(guest.contact_number) || null,
    email: String(guest.email || '').trim() || null,
    rsvp_status: guest.rsvp_status || 'Pending',
    // A declined guest must not keep a seat.
    table_id: guest.rsvp_status === 'Declined' ? null : guest.table_id || null,
    dietary_preferences: (guest.dietary_preferences || []).filter((d) => DIETARY_OPTIONS.includes(d)),
    allergies: String(guest.allergies || '').trim() || null,
    allergens: (guest.allergens || []).filter((a) => ALLERGEN_OPTIONS.includes(a)),
    // Severity only means something when there is an allergy. Default to Mild.
    allergy_severity: hasAllergy(guest) ? guest.allergy_severity || 'Mild' : null,
    group_name: String(guest.group_name || '').trim() || null,
    notes: String(guest.notes || '').trim() || null,
  };
}

// ---------- Bookings eligible for planning ----------
// Pending + Confirmed events from today onward (RLS already scopes to the
// caller's business / own bookings).
export async function getPlannableBookings(fromDate) {
  const { data, error } = await supabase
    .from('tbl_bookings')
    .select('booking_id, client_name, event_date, event_location, guest_count, booking_status')
    .in('booking_status', ['Pending', 'Confirmed'])
    .gte('event_date', fromDate)
    .order('event_date', { ascending: true });

  if (error) throw new Error('Failed to load bookings.');
  return data || [];
}

// ---------- Guests ----------
export async function getGuests(bookingId) {
  const { data, error } = await supabase
    .from('tbl_event_guests')
    .select('*')
    .eq('booking_id', bookingId)
    .order('full_name', { ascending: true });

  if (error) throw new Error('Failed to load guest list.');
  return data || [];
}

export async function addGuest(bookingId, guest) {
  validateGuest(guest);
  const { data, error } = await supabase
    .from('tbl_event_guests')
    .insert({ booking_id: bookingId, ...toGuestRow(guest) })
    .select()
    .single();

  if (error) throw writeError(error, 'Failed to add guest.');
  return data;
}

export async function updateGuest(guestId, guest) {
  validateGuest(guest);
  const { data, error } = await supabase
    .from('tbl_event_guests')
    .update(toGuestRow(guest))
    .eq('guest_id', guestId)
    .select()
    .single();

  if (error) throw writeError(error, 'Failed to update guest.');
  return data;
}

export async function deleteGuest(guestId) {
  const { data, error } = await supabase
    .from('tbl_event_guests')
    .delete()
    .eq('guest_id', guestId)
    .select('guest_id');
  if (error) throw new Error('Failed to remove guest.');
  if (!data || data.length === 0) throw new Error(NO_ACCESS_MSG);
}

// Bulk add from pasted text: one guest per line. Format: "Name" or
// "Name, 09171234567". Returns the inserted rows.
export async function importGuests(bookingId, rawText) {
  const rows = String(rawText || '')
    .split(/\r?\n/)
    .map((line, i) => ({ line: line.trim(), n: i + 1 }))
    .filter((x) => x.line)
    .map(({ line, n }) => {
      // Only the LAST comma part counts as a mobile number, and only if it
      // looks like one. So "Dela Cruz, Juan" stays one name instead of
      // treating "Juan" as a phone number.
      const parts = line.split(',').map((x) => x.trim());
      const last = parts[parts.length - 1];
      const hasPhone = parts.length > 1 && /^\+?[\d\s-]+$/.test(last);
      return {
        full_name: (hasPhone ? parts.slice(0, -1) : parts).join(', '),
        contact_number: hasPhone ? last : '',
        _line: n
      };
    });

  if (rows.length === 0) throw new Error('Nothing to import.');
  rows.forEach((r) => {
    try {
      validateGuest(r);
    } catch (e) {
      throw new Error(`Line ${r._line}: ${e.message}`);
    }
  });

  const { data, error } = await supabase
    .from('tbl_event_guests')
    .insert(rows.map((r) => ({ booking_id: bookingId, ...toGuestRow(r) })))
    .select();

  if (error) throw writeError(error, 'Failed to import guests.');
  return data || [];
}

// ---------- Tables / seating ----------
export async function getTables(bookingId) {
  const { data, error } = await supabase
    .from('tbl_event_tables')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) throw new Error('Failed to load tables.');
  return data || [];
}

export async function addTable(bookingId, label, capacity) {
  const cap = Number(capacity);
  if (!String(label || '').trim()) throw new Error('Table name is required.');
  if (!Number.isInteger(cap) || cap < 1 || cap > 50) {
    throw new Error('Capacity must be a whole number from 1 to 50.');
  }
  const { data, error } = await supabase
    .from('tbl_event_tables')
    .insert({ booking_id: bookingId, label: String(label).trim(), capacity: cap })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A table with that name already exists.');
    throw writeError(error, 'Failed to add table.');
  }
  return data;
}

export async function updateTable(tableId, label, capacity) {
  const cap = Number(capacity);
  if (!String(label || '').trim()) throw new Error('Table name is required.');
  if (!Number.isInteger(cap) || cap < 1 || cap > 50) {
    throw new Error('Capacity must be a whole number from 1 to 50.');
  }
  // Never let a table shrink below the guests already seated at it.
  const { count: seatedNow, error: cErr } = await supabase
    .from('tbl_event_guests')
    .select('guest_id', { count: 'exact', head: true })
    .eq('table_id', tableId)
    .neq('rsvp_status', 'Declined');
  if (!cErr && (seatedNow || 0) > cap) {
    throw new Error(`${seatedNow} guests are already seated here. Unseat some before lowering the seats to ${cap}.`);
  }

  const { data, error } = await supabase
    .from('tbl_event_tables')
    .update({ label: String(label).trim(), capacity: cap })
    .eq('table_id', tableId)
    .select('table_id');

  if (error) {
    if (error.code === '23505') throw new Error('A table with that name already exists.');
    if (String(error.message).startsWith('CAPACITY_TOO_LOW')) {
      throw new Error(String(error.message).replace('CAPACITY_TOO_LOW: ', ''));
    }
    throw new Error('Failed to update table.');
  }
  if (!data || data.length === 0) throw new Error(NO_ACCESS_MSG);
}

// Guests seated here become unassigned (FK is ON DELETE SET NULL).
export async function deleteTable(tableId) {
  const { data, error } = await supabase
    .from('tbl_event_tables')
    .delete()
    .eq('table_id', tableId)
    .select('table_id');
  if (error) throw new Error('Failed to delete table.');
  if (!data || data.length === 0) throw new Error(NO_ACCESS_MSG);
}

// tableId = null unseats the guest. Capacity is enforced here (counts only
// guests who haven't declined) so a table can't be overfilled.
export async function seatGuest(guestId, tableId) {
  if (tableId) {
    const [{ data: table, error: tErr }, { data: seated, error: sErr }] = await Promise.all([
      supabase.from('tbl_event_tables').select('capacity, label').eq('table_id', tableId).single(),
      supabase
        .from('tbl_event_guests')
        .select('guest_id')
        .eq('table_id', tableId)
        .neq('rsvp_status', 'Declined')
        .neq('guest_id', guestId),
    ]);
    if (tErr || sErr) throw new Error('Failed to check table capacity.');
    if ((seated || []).length >= table.capacity) {
      throw new Error(`${table.label} is full (${table.capacity} seats).`);
    }
  }

  const { data, error } = await supabase
    .from('tbl_event_guests')
    .update({ table_id: tableId || null })
    .eq('guest_id', guestId)
    .select('guest_id');

  if (error) {
    // The database also guards capacity (two admins seating at the same time).
    if (String(error.message).startsWith('TABLE_FULL')) {
      throw new Error(String(error.message).replace('TABLE_FULL: ', ''));
    }
    throw writeError(error, 'Failed to seat guest.');
  }
  if (!data || data.length === 0) throw new Error(NO_ACCESS_MSG);
}

// Seat many guests in ONE request (used by Auto-seat). All or nothing: if any
// seat turns out to be full, nothing is saved. assignments = [{ guest_id, table_id }]
export async function seatGuestsBulk(assignments) {
  if (!assignments || assignments.length === 0) return 0;
  const { data, error } = await supabase.rpc('seat_guests_bulk', { p_assignments: assignments });
  if (error) {
    if (String(error.message).startsWith('TABLE_FULL')) {
      throw new Error(String(error.message).replace('TABLE_FULL: ', ''));
    }
    if (error.code === '42883' || error.code === 'PGRST202') {
      throw new Error('Auto-seat needs the latest database update (event_planning_upgrade.sql).');
    }
    throw writeError(error, 'Failed to auto-seat guests.');
  }
  return data || 0;
}

// ---------- Pure helpers (no DB) ----------
// Counts per dietary tag and allergen among guests who haven't declined — this
// is the headcount the kitchen actually prepares for.
// opts.includePending (default true): false = confirmed (Attending) guests only.
export function summarizeDietary(guests, opts = {}) {
  const includePending = opts.includePending !== false;
  const active = guests.filter(
    (g) => g.rsvp_status === 'Attending' || (includePending && g.rsvp_status === 'Pending')
  );
  const counts = {};
  for (const tag of DIETARY_OPTIONS) counts[tag] = 0;
  const allergenCounts = {};
  for (const a of ALLERGEN_OPTIONS) allergenCounts[a] = 0;

  for (const g of active) {
    for (const tag of g.dietary_preferences || []) {
      if (tag in counts) counts[tag] += 1;
    }
    for (const a of g.allergens || []) {
      if (a in allergenCounts) allergenCounts[a] += 1;
    }
  }

  const withAllergies = active
    .filter(hasAllergy)
    // Severe allergies first so they are the first thing the kitchen reads.
    .sort((a, b) => (b.allergy_severity === 'Severe') - (a.allergy_severity === 'Severe'));
  const special = active.filter(hasRestriction).length;

  return {
    total: active.length,
    counts,
    allergenCounts,
    withAllergies,
    severeCount: withAllergies.filter((g) => g.allergy_severity === 'Severe').length,
    withRestrictions: special,
    // Unique guests: someone who is Vegan AND Gluten-Free is ONE special meal.
    specialMeals: special,
    standardMeals: active.length - special,
    withNotes: active.filter((g) => String(g.notes || '').trim()),
  };
}

// Short dietary breakdown for one table (for the waiters / table card).
// Returns [{ label, count, severe }] sorted with severe allergies first.
export function tableDietaryBreakdown(guestsAtTable) {
  const tally = new Map();
  const bump = (label, severe) => {
    const cur = tally.get(label) || { label, count: 0, severe: false };
    cur.count += 1;
    cur.severe = cur.severe || severe;
    tally.set(label, cur);
  };
  for (const g of guestsAtTable) {
    const severe = g.allergy_severity === 'Severe';
    for (const tag of g.dietary_preferences || []) bump(tag, false);
    for (const a of g.allergens || []) bump(`${a} allergy`, severe);
    if (String(g.allergies || '').trim()) bump(`Allergy: ${String(g.allergies).trim()}`, severe);
  }
  return [...tally.values()].sort((a, b) => Number(b.severe) - Number(a.severe) || b.count - a.count);
}

// Suggest seats for everyone who is still unseated. Pure function: it only
// returns a plan, the caller saves it.
//  - guests with the same group_name are kept at the SAME table when it fits
//  - bigger groups are placed first, so they are not left to be split up
//  - a group goes to a table where its members already sit, if there is room
//  - guests without a group but with the same dietary needs are seated together
//    (easier for the waiters to serve)
// Returns { assignments: [{ guest_id, table_id }], unplaced: [guest], splitGroups: [name] }
export function suggestSeating(guests, tables) {
  const active = guests.filter((g) => g.rsvp_status !== 'Declined');
  const free = new Map();
  for (const t of tables) {
    const used = active.filter((g) => g.table_id === t.table_id).length;
    free.set(t.table_id, Math.max(0, Number(t.capacity) - used));
  }

  const unseated = active.filter((g) => !g.table_id);
  const byGroup = new Map();
  const singles = [];
  for (const g of unseated) {
    const name = String(g.group_name || '').trim().toLowerCase();
    if (!name) {
      singles.push(g);
      continue;
    }
    if (!byGroup.has(name)) byGroup.set(name, { name: g.group_name.trim(), members: [] });
    byGroup.get(name).members.push(g);
  }

  const dietKey = (g) =>
    [...(g.dietary_preferences || [])].sort().join('|') + '#' + [...(g.allergens || [])].sort().join('|');
  singles.sort((a, b) => dietKey(b).localeCompare(dietKey(a)) || a.full_name.localeCompare(b.full_name));

  // Guests with the exact same dietary needs form a small cluster, so e.g. all
  // the vegetarians sit together. Guests with no special needs stay individual.
  const singleUnits = [];
  const clusters = new Map();
  for (const g of singles) {
    const k = dietKey(g);
    if (k === '#') {
      singleUnits.push({ name: null, members: [g] });
      continue;
    }
    if (!clusters.has(k)) clusters.set(k, { name: null, members: [] });
    clusters.get(k).members.push(g);
  }

  const units = [
    ...[...byGroup.values()].sort((a, b) => b.members.length - a.members.length),
    ...[...clusters.values()].sort((a, b) => b.members.length - a.members.length),
    ...singleUnits,
  ];

  const assignments = [];
  const unplaced = [];
  const splitGroups = [];
  const take = (tableId, guest) => {
    assignments.push({ guest_id: guest.guest_id, table_id: tableId });
    free.set(tableId, free.get(tableId) - 1);
  };

  for (const unit of units) {
    const size = unit.members.length;
    let target = null;

    // Prefer a table that already seats someone from this group.
    if (unit.name) {
      const wanted = unit.name.toLowerCase();
      target = tables.find(
        (t) =>
          free.get(t.table_id) >= size &&
          active.some(
            (g) => g.table_id === t.table_id && String(g.group_name || '').trim().toLowerCase() === wanted
          )
      );
    }
    // Otherwise the tightest table the whole unit still fits in.
    if (!target) {
      target = tables
        .filter((t) => free.get(t.table_id) >= size)
        .sort((a, b) => free.get(a.table_id) - free.get(b.table_id))[0];
    }

    if (target) {
      unit.members.forEach((g) => take(target.table_id, g));
      continue;
    }

    // Nothing fits the whole group: split it, filling the roomiest tables first.
    if (unit.name && size > 1) splitGroups.push(unit.name);
    for (const g of unit.members) {
      const t = [...tables].sort((a, b) => free.get(b.table_id) - free.get(a.table_id))[0];
      if (t && free.get(t.table_id) > 0) take(t.table_id, g);
      else unplaced.push(g);
    }
  }

  return { assignments, unplaced, splitGroups };
}

export function rsvpSummary(guests) {
  const out = { Pending: 0, Attending: 0, Declined: 0 };
  for (const g of guests) out[g.rsvp_status] = (out[g.rsvp_status] || 0) + 1;
  return out;
}

// ---------- Event overview (landing cards) ----------
// One query per table for ALL listed events, so the landing page does not
// fire a request per card. Returns { [booking_id]: { added, seated, crew } }
// where "added" / "seated" ignore guests who declined.
export async function getEventOverview(bookingIds) {
  const out = {};
  if (!bookingIds || bookingIds.length === 0) return out;
  for (const id of bookingIds) out[id] = { added: 0, seated: 0, crew: 0 };

  const [guestRes, crewRes] = await Promise.all([
    supabase.from('tbl_event_guests').select('booking_id, rsvp_status, table_id').in('booking_id', bookingIds),
    supabase.from('tbl_booking_staff').select('booking_id').in('booking_id', bookingIds),
  ]);
  // The cards are a convenience. If either lookup fails, show zeros instead of blocking the page.
  for (const g of guestRes.data || []) {
    if (!out[g.booking_id] || g.rsvp_status === 'Declined') continue;
    out[g.booking_id].added += 1;
    if (g.table_id) out[g.booking_id].seated += 1;
  }
  for (const c of crewRes.data || []) {
    if (out[c.booking_id]) out[c.booking_id].crew += 1;
  }
  return out;
}

// ---------- Crew ----------
// Staff assigned to this event (tbl_booking_staff), with leave and
// double-booking conflicts on the event date.
export async function getEventCrew(bookingId, eventDate) {
  const { data, error } = await supabase
    .from('tbl_booking_staff')
    .select('staff_id, tbl_profiles!tbl_booking_staff_staff_id_fkey(id, full_name, contact_number, position, availability)')
    .eq('booking_id', bookingId);

  if (error) throw new Error('Failed to load the crew.');

  const crew = (data || [])
    .map((row) => row.tbl_profiles)
    .filter(Boolean)
    .sort((a, b) => String(a.full_name).localeCompare(String(b.full_name)));
  const ids = crew.map((c) => c.id);

  const [leave, clashes] = await Promise.all([
    getUnavailableStaffOnDate(eventDate, ids).catch(() => []),
    getStaffScheduleConflicts(eventDate, ids, bookingId).catch(() => []),
  ]);

  return crew.map((c) => ({
    ...c,
    onLeave: leave.find((l) => l.staff_id === c.id) || null,
    otherEvent: clashes.find((x) => x.staff_id === c.id) || null,
  }));
}

// Rule-of-thumb staffing for a buffet-style event. Adjust the ratios here,
// they are the only place that decides the suggestion.
export const STAFFING_RATIOS = {
  guestsPerServer: 20,
  guestsPerCook: 40,
  guestsPerCoordinator: 100,
};

export function suggestCrew(guestCount) {
  const n = Math.max(0, Number(guestCount) || 0);
  if (n === 0) return { Server: 0, Cook: 0, Coordinator: 0 };
  return {
    Server: Math.max(1, Math.ceil(n / STAFFING_RATIOS.guestsPerServer)),
    Cook: Math.max(1, Math.ceil(n / STAFFING_RATIOS.guestsPerCook)),
    Coordinator: Math.max(1, Math.ceil(n / STAFFING_RATIOS.guestsPerCoordinator)),
  };
}

// { Server: 3, Cook: 1, ... } for the assigned crew. Anything without a
// position (or Driver / Other) is grouped under 'Other'.
export function countCrewByPosition(crew) {
  const out = { Server: 0, Cook: 0, Coordinator: 0, Driver: 0, Other: 0 };
  for (const c of crew) {
    const key = c.position in out ? c.position : 'Other';
    out[key] += 1;
  }
  return out;
}

// ---------- Dish allergens ----------
// { [item_id]: ['Peanuts', ...] } for the given menu items (tbl_menu_items.allergens).
// A failure returns {} so the kitchen list still loads without the warnings.
export async function getMenuItemAllergens(itemIds) {
  const ids = [...new Set((itemIds || []).filter((x) => x != null))];
  if (ids.length === 0) return {};
  const { data, error } = await supabase.from('tbl_menu_items').select('item_id, allergens').in('item_id', ids);
  if (error) return {};
  const out = {};
  for (const row of data || []) out[row.item_id] = row.allergens || [];
  return out;
}

// Dishes that contain an allergen one of the (not declined) guests has ticked.
// Returns [{ item_id, name, allergens: [matched], guests: [guest] }], severe guests first.
// Only the allergen TAGS are matched. Free-text allergies need a manual check.
export function findDishAllergenConflicts(dishes, allergenMap, guests) {
  const active = (guests || []).filter((g) => g.rsvp_status !== 'Declined');
  const out = [];
  for (const d of dishes || []) {
    const dishAllergens = allergenMap?.[d.item_id] || [];
    if (dishAllergens.length === 0) continue;
    const hit = active.filter((g) => (g.allergens || []).some((a) => dishAllergens.includes(a)));
    if (hit.length === 0) continue;
    const matched = dishAllergens.filter((a) => hit.some((g) => (g.allergens || []).includes(a)));
    hit.sort((a, b) => (b.allergy_severity === 'Severe') - (a.allergy_severity === 'Severe'));
    out.push({ item_id: d.item_id, name: d.name, allergens: matched, guests: hit });
  }
  return out;
}

// ---------- Seating helpers ----------
export function totalSeats(tables) {
  return (tables || []).reduce((sum, t) => sum + (Number(t.capacity) || 0), 0);
}