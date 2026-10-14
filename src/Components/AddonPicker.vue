<template>
  <div class="space-y-3">
    <!-- Search + category tabs -->
    <div class="space-y-2">
      <div class="relative">
        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
        </svg>
        <input
          v-model="search"
          type="search"
          placeholder="Search add-ons (e.g. salmon, palabok)"
          class="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
          @keydown.enter.prevent
        />
      </div>
      <div v-if="categories.length > 2" class="flex gap-2 overflow-x-auto pb-1">
        <button
          v-for="c in categories"
          :key="c.name"
          type="button"
          @click="category = c.name"
          :class="category === c.name ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:border-emerald-400'"
          class="flex-shrink-0 text-xs font-semibold px-3 py-1.5 border rounded-full transition"
        >{{ c.name }} <span class="opacity-70">({{ c.count }})</span></button>
      </div>
    </div>

    <p v-if="!visibleGroups.length" class="text-sm text-gray-500 dark:text-gray-400 text-center py-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700">
      No add-ons match your search.
    </p>

    <!-- Grouped cards -->
    <div v-else class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700">
      <div v-for="g in visibleGroups" :key="g.key" class="p-3 sm:p-4">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-1.5">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">{{ g.base }}</p>
              <span v-if="g.bestSeller" class="text-[10px] font-bold uppercase tracking-wide bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full">★ Best seller</span>
              <span v-if="g.tag" class="text-[10px] font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">{{ g.tag }}</span>
            </div>
            <p v-if="active(g).note" class="text-xs text-gray-600 dark:text-gray-300 mt-1">{{ active(g).note }}</p>
          </div>

          <!-- Stepper for the currently selected size -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button type="button" @click="change(active(g), -1)" :disabled="!qty(active(g))" aria-label="Decrease quantity"
              class="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 flex items-center justify-center text-lg font-bold">−</button>
            <span class="w-7 text-center text-sm font-bold text-gray-900 dark:text-gray-100">{{ qty(active(g)) }}</span>
            <button type="button" @click="change(active(g), 1)" aria-label="Increase quantity"
              class="w-10 h-10 rounded-lg border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center text-lg font-bold">+</button>
          </div>
        </div>

        <!-- Size chips (only when there is more than one size) -->
        <div v-if="g.variants.length > 1" class="flex flex-wrap gap-2 mt-3">
          <button
            v-for="v in g.variants"
            :key="v.addon_id"
            type="button"
            @click="chosen[g.key] = v.addon_id"
            :class="active(g).addon_id === v.addon_id ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200' : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:border-emerald-400'"
            class="relative text-left border rounded-lg px-3 py-1.5 transition"
          >
            <span class="block text-xs font-semibold">{{ v.size || v.unit_label }}</span>
            <span class="block text-xs opacity-80">₱{{ money(v.price) }}</span>
            <span v-if="qty(v)" class="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">{{ qty(v) }}</span>
          </button>
        </div>
        <p v-else class="text-xs text-gray-600 dark:text-gray-300 mt-1">₱{{ money(active(g).price) }} · {{ active(g).unit_label }}</p>
      </div>
    </div>

    <button v-if="hiddenCount > 0" type="button" @click="showAll = true"
      class="w-full text-sm font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-600/40 rounded-xl py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
      Show all {{ groups.length }} add-ons ({{ hiddenCount }} more)
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// addons: rows from tbl_addons. quantities: { [addon_id]: number }.
// The database has no category column, so groups are derived from the data the
// owner already types in: the name ("Baked Salmon Teriyaki - Full Tray (4-6 pax)")
// and the description ("Food Tray · Seafood · Full tray, good for 4-6 pax").
// Client-facing tabs: Seafood, Pork, Beef, Chicken, Pasta, Noodles, Bento Meals,
// Sets, Special Orders (see categorize() below).
const props = defineProps({
  addons: { type: Array, default: () => [] },
  quantities: { type: Object, default: () => ({}) },
  collapsedCount: { type: Number, default: 8 }
})
const emit = defineEmits(['update'])

const search = ref('')
const category = ref('All')
const showAll = ref(false)
const chosen = ref({}) // { [groupKey]: addon_id }

const money = (n) => Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const qty = (a) => Number(props.quantities[a.addon_id]) || 0

// Tabs the client sees, in this order. Anything else is appended after these.
const CATEGORY_ORDER = ['Seafood', 'Pork', 'Beef', 'Chicken', 'Pasta', 'Noodles', 'Bento Meals', 'Sets', 'Special Orders']

// Pick the client-facing category. `kind` is the first description segment
// ("Food Tray", "Party Tray", "Bento Meal", ...) and `tag` the food type ("Seafood").
function categorize(kind, tag, name) {
  if (/bento/i.test(kind)) return 'Bento Meals'
  if (/\bset\b/i.test(kind)) return 'Sets'
  if (/special\s*order/i.test(kind)) return 'Special Orders'
  if (/(food|party)\s*tray/i.test(kind)) return tag || 'Other'
  // Add-ons with a plain description (no "Kind · Type" format): guess from the name.
  if (/station|salad bar|pica-pica/i.test(name)) return 'Food Stations'
  if (/host|soundman/i.test(name)) return 'Host & Sounds'
  if (/hour|venue|led wall|van service|table|corkage/i.test(name)) return 'Venue & Extras'
  return 'Other'
}

function parseAddon(a) {
  const rawSegs = String(a.description || '').split('·').map((s) => s.trim()).filter(Boolean)
  const bestSeller = rawSegs.some((s) => /best\s*seller/i.test(s))
  const segs = rawSegs.filter((s) => !/best\s*seller/i.test(s))
  const hasCategory = rawSegs.length >= 2 && segs.length >= 1
  const kind = hasCategory ? segs[0] : ''
  const rest = hasCategory ? segs.slice(1) : segs
  const tag = rest.length >= 2 ? rest[0] : ''
  const note = rest.length ? rest[rest.length - 1] : ''
  const cat = categorize(kind, tag, String(a.addon_name || ''))

  let base = String(a.addon_name || '').trim()
  let size = ''
  let m = base.match(/^(.*?)\s*[-–]\s*((?:Full|Half)\s*Tray\s*\(.*?\))\s*$/i)
  if (m) { base = m[1].trim(); size = m[2] }
  else {
    m = base.match(/^(.*?)\s*\(\s*(\d+\s*[-–]\s*\d+\s*pax)\s*\)\s*$/i)
    if (m) { base = m[1].trim(); size = /party\s*tray/i.test(kind) ? `Party Tray (${m[2]})` : m[2] }
  }
  return { ...a, category: cat, tag, note, bestSeller, base, size }
}

// Same dish spelled slightly differently ("Meat Loaf"/"Meatloaf", "Seafood's"/"Seafood")
// still lands in one card, so Half / Full / Party sizes show up as chips of one dish.
const normalize = (s) => s.toLowerCase().replace(/['’]s\b/g, '').replace(/[^a-z0-9]/g, '')

const groups = computed(() => {
  const map = new Map()
  for (const raw of props.addons) {
    const a = parseAddon(raw)
    const key = `${a.category}|${normalize(a.base)}`
    if (!map.has(key)) map.set(key, { key, base: a.base, category: a.category, tag: a.tag, bestSeller: false, variants: [] })
    const g = map.get(key)
    g.variants.push(a)
    g.bestSeller = g.bestSeller || a.bestSeller
    if (!g.tag && a.tag) g.tag = a.tag
  }
  const list = [...map.values()]
  list.forEach((g) => g.variants.sort((x, y) => Number(x.price) - Number(y.price)))
  return list.sort((x, y) => Number(y.bestSeller) - Number(x.bestSeller) || x.base.localeCompare(y.base))
})

const categories = computed(() => {
  const counts = new Map()
  groups.value.forEach((g) => counts.set(g.category, (counts.get(g.category) || 0) + 1))
  const rank = (n) => { const i = CATEGORY_ORDER.indexOf(n); return i === -1 ? (n === 'Other' ? 1001 : 1000) : i }
  const ordered = [...counts.entries()]
    .sort((x, y) => rank(x[0]) - rank(y[0]) || x[0].localeCompare(y[0]))
    .map(([name, count]) => ({ name, count }))
  return [{ name: 'All', count: groups.value.length }, ...ordered]
})

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return groups.value.filter((g) => {
    if (category.value !== 'All' && g.category !== category.value) return false
    if (!q) return true
    return `${g.base} ${g.category} ${g.tag} ${g.variants.map((v) => v.description || '').join(' ')}`.toLowerCase().includes(q)
  })
})

const filtering = computed(() => category.value !== 'All' || !!search.value.trim())
const visibleGroups = computed(() =>
  filtering.value || showAll.value ? filtered.value : filtered.value.slice(0, props.collapsedCount)
)
const hiddenCount = computed(() => (filtering.value || showAll.value ? 0 : Math.max(0, filtered.value.length - props.collapsedCount)))

// The size currently shown for a group: the one the client tapped, else one already in
// their order, else the cheapest.
function active(g) {
  const id = chosen.value[g.key]
  return g.variants.find((v) => v.addon_id === id) || g.variants.find((v) => qty(v) > 0) || g.variants[0]
}

function change(a, delta) {
  emit('update', a.addon_id, Math.max(0, qty(a) + delta))
}
</script>