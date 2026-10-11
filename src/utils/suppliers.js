// Shared helpers for Supplier Management. Pure functions only (no Supabase calls).
import { localISODate } from './waste';
import { stockLevel, suggestedReorderQty } from './inventory';

export { formatPeso, formatShortDate, localISODate } from './waste';

export const SUPPLIER_CATEGORIES = ['Meat & Poultry', 'Seafood', 'Produce', 'Dry Goods', 'Dairy & Eggs', 'Beverages', 'Packaging & Supplies', 'Equipment', 'Other'];
export const PAYMENT_TERMS = ['COD', 'Net 7', 'Net 15', 'Net 30'];

// Look + wording of each purchase order status.
export const PO_STATUS = {
  Draft: { label: 'Draft', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200' },
  Ordered: { label: 'Ordered', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  'Partially Received': { label: 'Partially received', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  Received: { label: 'Received', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  Cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};
export const OPEN_STATUSES = ['Ordered', 'Partially Received'];

const text = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');
const orNull = (v) => (text(v) === '' ? null : text(v));

// Validates + normalizes the supplier form. Throws an Error with a readable message.
export function cleanSupplierForm(form) {
  const name = text(form?.supplier_name);
  if (!name) throw new Error('Supplier name is required.');
  if (name.length > 120) throw new Error('Supplier name is too long (max 120 characters).');
  const phone = orNull(form?.contact_number);
  if (phone && !/^[0-9+()\-\s]{7,20}$/.test(phone)) throw new Error('Contact number looks invalid. Use digits, +, - or spaces only.');
  const email = orNull(form?.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Email address looks invalid.');
  return {
    supplier_name: name,
    category: SUPPLIER_CATEGORIES.includes(form?.category) ? form.category : 'Other',
    contact_person: orNull(form?.contact_person),
    contact_number: phone,
    email,
    address: orNull(form?.address),
    payment_terms: PAYMENT_TERMS.includes(form?.payment_terms) ? form.payment_terms : 'COD',
    notes: orNull(form?.notes),
  };
}

// Validates a purchase order form and returns the arguments save_purchase_order needs.
export function cleanPoForm(form) {
  if (!form?.supplier_id) throw new Error('Choose a supplier.');
  if (form.expected_date && form.order_date && form.expected_date < form.order_date) {
    throw new Error('Expected delivery cannot be before the order date.');
  }
  const lines = (form.lines || []).filter((l) => l.item_id || text(l.item_name) || l.quantity !== '');
  if (!lines.length) throw new Error('Add at least one item.');
  const clean = lines.map((l, i) => {
    const name = text(l.item_name);
    const qty = Number(l.quantity);
    const cost = l.unit_cost === '' || l.unit_cost == null ? 0 : Number(l.unit_cost);
    if (!name) throw new Error(`Line ${i + 1}: choose or type an item.`);
    if (!Number.isInteger(qty) || qty <= 0) throw new Error(`Line ${i + 1}: quantity must be a whole number above 0.`);
    if (!Number.isFinite(cost) || cost < 0) throw new Error(`Line ${i + 1}: unit cost cannot be negative.`);
    return { item_id: l.item_id || null, item_name: name, unit: l.unit || 'pcs', quantity: qty, unit_cost: cost };
  });
  return {
    p_po_id: form.po_id || null,
    p_supplier_id: Number(form.supplier_id),
    p_order_date: form.order_date || null,
    p_expected_date: form.expected_date || null,
    p_notes: orNull(form.notes),
    p_lines: clean,
  };
}

export const lineTotal = (l) => (Number(l.quantity) || 0) * (Number(l.unit_cost) || 0);
export const poTotal = (po) => (po?.items || po?.lines || []).reduce((s, l) => s + lineTotal(l), 0);
export const poOutstandingValue = (po) =>
  (po?.items || []).reduce((s, l) => s + Math.max((Number(l.quantity) || 0) - (Number(l.received_qty) || 0), 0) * (Number(l.unit_cost) || 0), 0);

export function isOverdue(po, today = localISODate()) {
  return OPEN_STATUSES.includes(po.status) && !!po.expected_date && po.expected_date < today;
}

// Whole days from `today` to `iso` (negative = in the past).
export function daysFrom(iso, today = localISODate()) {
  const [a, b, c] = String(iso).slice(0, 10).split('-').map(Number);
  const [x, y, z] = today.split('-').map(Number);
  return Math.round((Date.UTC(a, b - 1, c) - Date.UTC(x, y - 1, z)) / 86400000);
}

// Buckets open orders for the delivery schedule, soonest first inside each bucket.
export function buildSchedule(orders, today = localISODate()) {
  const groups = [
    { key: 'overdue', title: 'Overdue', tone: 'text-red-600 dark:text-red-400', rows: [] },
    { key: 'today', title: 'Today', tone: 'text-emerald-700 dark:text-emerald-300', rows: [] },
    { key: 'week', title: 'Next 7 days', tone: 'text-gray-800 dark:text-gray-100', rows: [] },
    { key: 'later', title: 'Later', tone: 'text-gray-800 dark:text-gray-100', rows: [] },
    { key: 'none', title: 'No delivery date set', tone: 'text-gray-500 dark:text-gray-400', rows: [] },
  ];
  const by = Object.fromEntries(groups.map((g) => [g.key, g]));
  orders.filter((o) => OPEN_STATUSES.includes(o.status)).forEach((o) => {
    if (!o.expected_date) return by.none.rows.push(o);
    const d = daysFrom(o.expected_date, today);
    (d < 0 ? by.overdue : d === 0 ? by.today : d <= 7 ? by.week : by.later).rows.push(o);
  });
  groups.forEach((g) => g.rows.sort((a, b) => String(a.expected_date || '').localeCompare(String(b.expected_date || ''))));
  return groups.filter((g) => g.rows.length);
}

// Per-supplier numbers shown in the vendor table.
export function supplierStats(orders) {
  const map = {};
  orders.forEach((o) => {
    const s = (map[o.supplier_id] ||= { orders: 0, open: 0, spent: 0 });
    if (o.status === 'Cancelled' || o.status === 'Draft') return;
    s.orders += 1;
    if (OPEN_STATUSES.includes(o.status)) s.open += 1;
    s.spent += (o.items || []).reduce((t, l) => t + (Number(l.received_qty) || 0) * (Number(l.unit_cost) || 0), 0);
  });
  return map;
}

// ---------------------------------------------------------------------------
// Suggested orders: what to reorder, grouped by supplier
// ---------------------------------------------------------------------------
// An item is suggested when it is low / running low, or short for pending events
// (needs = Map of item_id -> { short_by } from the Inventory forecast). Whatever is
// still outstanding on an open order is subtracted, so nothing gets ordered twice.
// Returns { groups, covered }: covered = items that need stock but are already on order.
const REASON_RANK = { event: 0, low: 1, near: 2 };

export function buildSuggestedOrders({ inventory = [], orders = [], needs = new Map(), suppliers = [] } = {}) {
  const onOrder = new Map();
  for (const po of orders) {
    if (!OPEN_STATUSES.includes(po.status)) continue;
    for (const l of po.items || []) {
      if (!l.item_id) continue;
      const left = Math.max((Number(l.quantity) || 0) - (Number(l.received_qty) || 0), 0);
      if (left > 0) onOrder.set(l.item_id, (onOrder.get(l.item_id) || 0) + left);
    }
  }

  const supplierById = new Map(suppliers.map((s) => [s.supplier_id, s]));
  const groups = new Map();
  let covered = 0;

  for (const item of inventory) {
    const shortBy = Number(needs.get(item.item_id)?.short_by) || 0;
    const level = stockLevel(item);
    if (level === 'ok' && shortBy <= 0) continue;

    const already = onOrder.get(item.item_id) || 0;
    const qty = Math.ceil(suggestedReorderQty(item, shortBy) - already);
    if (qty <= 0) { covered += 1; continue; }

    const reason = shortBy > 0 ? 'event' : level === 'low' ? 'low' : 'near';
    const supplier = supplierById.get(item.supplier_id) || null;
    const key = supplier ? String(supplier.supplier_id) : 'none';
    const group = groups.get(key) || {
      key,
      supplier_id: supplier ? supplier.supplier_id : null,
      name: supplier ? supplier.supplier_name : 'No supplier linked',
      inactive: supplier ? !supplier.is_active : false,
      lines: [],
      estCost: 0,
    };
    const cost = (Number(item.unit_cost) || 0) * qty;
    group.lines.push({ item, qty, reason, shortBy, onOrder: already, cost });
    group.estCost += cost;
    groups.set(key, group);
  }

  const list = [...groups.values()];
  list.forEach((g) => g.lines.sort((a, b) => REASON_RANK[a.reason] - REASON_RANK[b.reason] || String(a.item.item_name).localeCompare(String(b.item.item_name))));
  // Real suppliers first (most items first); the "no supplier" bucket goes last.
  list.sort((a, b) => (a.key === 'none') - (b.key === 'none') || b.lines.length - a.lines.length || a.name.localeCompare(b.name));
  return { groups: list, covered };
}

// ---------------------------------------------------------------------------
// Supplier scorecard (computed from completed orders, nothing extra is stored)
// ---------------------------------------------------------------------------
export const SCORECARD_MIN_ORDERS = 3; // fewer completed orders than this is not a fair rating
export const RATING_STYLE = {
  Reliable: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Fair: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Needs attention': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

// { [supplier_id]: { completed, onTimePct, fillPct, avgLateDays, avgLeadDays, rating } }
// on time = received on or before the expected date; fill rate = received / ordered quantity.
// rating stays null until there are SCORECARD_MIN_ORDERS completed orders.
export function supplierScorecards(orders) {
  const acc = {};
  for (const o of orders) {
    if (o.status !== 'Received') continue;
    const a = (acc[o.supplier_id] ||= { completed: 0, dated: 0, onTime: 0, lateDays: 0, late: 0, ordered: 0, received: 0, leadDays: 0, lead: 0 });
    a.completed += 1;
    for (const l of o.items || []) {
      a.ordered += Number(l.quantity) || 0;
      a.received += Number(l.received_qty) || 0;
    }
    if (o.received_date && o.expected_date) {
      a.dated += 1;
      const lateBy = daysFrom(o.received_date, String(o.expected_date).slice(0, 10)); // received - expected
      if (lateBy <= 0) a.onTime += 1;
      else { a.late += 1; a.lateDays += lateBy; }
    }
    if (o.received_date && o.order_date) {
      a.leadDays += Math.max(daysFrom(o.received_date, String(o.order_date).slice(0, 10)), 0);
      a.lead += 1;
    }
  }

  const out = {};
  for (const [id, a] of Object.entries(acc)) {
    const onTimePct = a.dated ? Math.round((a.onTime / a.dated) * 100) : null;
    const fillPct = a.ordered ? Math.round((a.received / a.ordered) * 100) : null;
    let rating = null;
    if (a.completed >= SCORECARD_MIN_ORDERS && onTimePct !== null && fillPct !== null) {
      rating = onTimePct >= 90 && fillPct >= 95 ? 'Reliable' : onTimePct >= 70 && fillPct >= 85 ? 'Fair' : 'Needs attention';
    }
    out[id] = {
      completed: a.completed,
      onTimePct,
      fillPct,
      avgLateDays: a.late ? Math.round((a.lateDays / a.late) * 10) / 10 : 0,
      avgLeadDays: a.lead ? Math.round((a.leadDays / a.lead) * 10) / 10 : null,
      rating,
    };
  }
  return out;
}

// ---------------------------------------------------------------------------
// Payables: what we owe suppliers, due date = date received + payment terms
// ---------------------------------------------------------------------------
export const TERM_DAYS = { COD: 0, 'Net 7': 7, 'Net 15': 15, 'Net 30': 30 };

export function addDays(iso, n) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const receivedValue = (po) =>
  (po?.items || []).reduce((s, l) => s + (Number(l.received_qty) || 0) * (Number(l.unit_cost) || 0), 0);

// null when the order is not payable yet (only fully Received orders are billed).
export function payableInfo(po, terms, today = localISODate()) {
  if (po.status !== 'Received' || !po.received_date) return null;
  const amount = receivedValue(po);
  if (amount <= 0) return null;
  const due = addDays(po.received_date, TERM_DAYS[terms] ?? 0);
  return { amount, due, days: daysFrom(due, today), terms: terms || 'COD', paidAt: po.paid_at || null, reference: po.payment_reference || null };
}

// Groups for the Payables tab plus the headline totals.
export function buildPayables(orders, supplierById, today = localISODate()) {
  const rows = [];
  for (const po of orders) {
    const info = payableInfo(po, supplierById.get(po.supplier_id)?.payment_terms, today);
    if (info) rows.push({ po, ...info });
  }
  const unpaid = rows.filter((r) => !r.paidAt).sort((a, b) => a.due.localeCompare(b.due));
  const paid = rows.filter((r) => r.paidAt).sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt))).slice(0, 10);
  const sum = (list) => list.reduce((s, r) => s + r.amount, 0);

  const overdue = unpaid.filter((r) => r.days < 0);
  const week = unpaid.filter((r) => r.days >= 0 && r.days <= 7);
  const later = unpaid.filter((r) => r.days > 7);
  const groups = [
    { key: 'overdue', title: 'Overdue', tone: 'text-red-600 dark:text-red-400', rows: overdue },
    { key: 'week', title: 'Due in the next 7 days', tone: 'text-gray-800 dark:text-gray-100', rows: week },
    { key: 'later', title: 'Due later', tone: 'text-gray-800 dark:text-gray-100', rows: later },
    { key: 'paid', title: 'Recently paid', tone: 'text-emerald-700 dark:text-emerald-300', rows: paid },
  ].filter((g) => g.rows.length);

  return {
    groups,
    unpaidTotal: sum(unpaid),
    overdueTotal: sum(overdue),
    overdueCount: overdue.length,
    weekTotal: sum(week),
  };
}