// Shared inventory helpers. Before this file existed, the "is this item low
// on stock?" rule was copy-pasted in 4 places (Inventory, Dashboard, Reports,
// Notifications). Keep it here so they can never drift apart.

export const UNIT_OPTIONS = ['kg', 'g', 'L', 'mL', 'pcs', 'pack'];

// Same list the Supplier page uses, so an item's category lines up with its supplier's.
export const ITEM_CATEGORIES = ['Meat & Poultry', 'Seafood', 'Produce', 'Dry Goods', 'Dairy & Eggs', 'Beverages', 'Packaging & Supplies', 'Other'];

// "Running low" starts at 1.5x the low-stock threshold, so the warning comes
// BEFORE the item is actually low (while there is still time to reorder).
export const NEAR_LOW_FACTOR = 1.5;
// Items expiring within this many days are flagged "Expiring soon".
export const EXPIRING_SOON_DAYS = 7;

// At or below the threshold counts as low (same rule the whole app used).
export function isLowStock(item) {
  return Number(item?.quantity) <= Number(item?.low_stock_threshold);
}

// 'low' (at/below threshold), 'near' (running low), or 'ok'.
export function stockLevel(item) {
  if (isLowStock(item)) return 'low';
  const qty = Number(item?.quantity);
  const threshold = Number(item?.low_stock_threshold);
  if (threshold > 0 && qty <= threshold * NEAR_LOW_FACTOR) return 'near';
  return 'ok';
}

// 0..1 fill for the stock bar. A full bar means "3x the threshold or more".
export function stockRatio(item) {
  const qty = Number(item?.quantity) || 0;
  const threshold = Number(item?.low_stock_threshold) || 0;
  if (threshold <= 0) return qty > 0 ? 1 : 0;
  return Math.max(0, Math.min(1, qty / (threshold * 3)));
}

export function stockValue(item) {
  const v = (Number(item?.quantity) || 0) * (Number(item?.unit_cost) || 0);
  return Math.round(v * 100) / 100;
}

// "12,345.60" (peso sign is added by the caller)
export function formatMoney(value) {
  return Number(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 'YYYY-MM-DD' that is a real calendar date (rejects 2026-13-45, 2026-02-31).
function isRealDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d;
}

// Whole days from today (LOCAL date) until a 'YYYY-MM-DD' date. Negative = past.
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const parts = String(dateStr).slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  return Math.round((target - today) / 86400000);
}

// null (no expiry set) | { state: 'expired' | 'soon' | 'ok', days, label }
export function expiryInfo(item) {
  const days = daysUntil(item?.expiry_date);
  if (days === null) return null;
  if (days < 0) return { state: 'expired', days, label: days === -1 ? 'Expired yesterday' : `Expired ${-days}d ago` };
  if (days === 0) return { state: 'soon', days, label: 'Expires today' };
  if (days <= EXPIRING_SOON_DAYS) return { state: 'soon', days, label: days === 1 ? 'Expires tomorrow' : `Expires in ${days}d` };
  return { state: 'ok', days, label: `Expires in ${days}d` };
}

// How much to order: top the item back up to 3x its threshold (never less than
// one threshold's worth), and always cover what pending events still need.
export function suggestedReorderQty(item, shortBy = 0) {
  const qty = Number(item?.quantity) || 0;
  const threshold = Number(item?.low_stock_threshold) || 0;
  const topUp = Math.max(threshold * 3 - qty, threshold, 1);
  const forEvents = shortBy > 0 ? Math.ceil(shortBy) + threshold : 0;
  return Math.ceil(Math.max(topUp, forEvents));
}

// "3d ago", "5h ago", "just now"
export function timeAgo(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Round to 3 decimals so floating-point noise (0.1 + 0.2) never leaks to the UI.
export function roundQty(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 1000) / 1000 : 0;
}

// "12.5 kg" -- always show the unit next to a quantity.
export function formatQty(value, unit) {
  const s = String(roundQty(value));
  return unit ? `${s} ${unit}` : s;
}

export function formatCost(value) {
  return Number(value || 0).toFixed(2);
}

// Validates + normalizes the create/edit form. Throws an Error with a
// user-readable message when something is wrong; otherwise returns a clean
// payload (trimmed name, numbers instead of '' / null / NaN).
export function cleanItemForm(form, { includeQuantity = true } = {}) {
  const name = String(form?.item_name ?? '').trim().replace(/\s+/g, ' ');
  if (!name) throw new Error('Item name is required.');
  if (name.length > 100) throw new Error('Item name is too long (max 100 characters).');

  const unit = form?.unit || 'kg';
  if (!UNIT_OPTIONS.includes(unit)) throw new Error('Please choose a valid unit.');

  const toNum = (v, fallback) => (v === '' || v === null || v === undefined ? fallback : Number(v));

  const threshold = toNum(form?.low_stock_threshold, 0);
  const unitCost = toNum(form?.unit_cost, 0);
  if (!Number.isInteger(threshold) || threshold < 0) {
    throw new Error('Low stock threshold must be a whole number, 0 or more.');
  }
  if (!Number.isFinite(unitCost) || unitCost < 0) throw new Error('Unit cost must be 0 or more.');

  // Optional extras. Empty = not set (stored as NULL).
  const category = String(form?.category ?? '').trim();
  if (category.length > 60) throw new Error('Category is too long (max 60 characters).');

  const expiry = String(form?.expiry_date ?? '').trim();
  if (expiry && !isRealDate(expiry)) {
    throw new Error('Expiry date is not a valid date.');
  }

  const supplierRaw = form?.supplier_id;
  const supplierId = supplierRaw === '' || supplierRaw === null || supplierRaw === undefined ? null : Number(supplierRaw);
  if (supplierId !== null && !Number.isInteger(supplierId)) throw new Error('Please choose a valid supplier.');

  const payload = {
    item_name: name,
    low_stock_threshold: threshold,
    unit_cost: unitCost,
    unit,
    category: category || null,
    expiry_date: expiry || null,
    supplier_id: supplierId,
  };

  if (includeQuantity) {
    const qty = toNum(form?.quantity, 0);
    if (!Number.isInteger(qty) || qty < 0) {
      throw new Error('Quantity must be a whole number, 0 or more. (Need fractions? Count it in a smaller unit, e.g. g instead of kg.)');
    }
    payload.quantity = qty;
  }
  return payload;
}