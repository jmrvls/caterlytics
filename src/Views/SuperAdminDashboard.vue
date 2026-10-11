<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

    <!-- TOP BAR -->
    <header class="bg-gray-900 dark:bg-black border-b border-gray-800 sticky top-0 z-30" style="padding-top: env(safe-area-inset-top)">
      <div class="w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <img :src="logoUrl" alt="Logo" class="w-8 h-8 object-contain flex-shrink-0" />
          <div class="min-w-0">
            <p class="font-bold text-white leading-tight truncate">Caterlytics</p>
            <p class="text-[11px] sm:text-xs text-indigo-200 leading-tight tracking-wide uppercase truncate">Super Admin<span class="hidden sm:inline"> &middot; Platform Console</span></p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-3 flex-shrink-0">
          <NotificationBell />
          <button
            @click="router.push('/super-admin/audit-log')"
            title="Platform Audit Log"
            class="flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-none text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <svg class="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span class="hidden sm:inline">Audit Log</span>
          </button>
          <button
            @click="router.push('/settings')"
            title="Settings"
            aria-label="Settings"
            class="p-2.5 sm:p-2 rounded-none text-gray-300 hover:text-white hover:bg-white/10 transition"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <span class="hidden sm:inline text-sm text-gray-300">{{ userName }}</span>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-none text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Log Out"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>
    </header>

    <main class="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8">

      <!-- STATS: status cards (click to filter) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
        <button
          type="button"
          @click="statusFilter = 'All'; lifecycleFilter = ''"
          class="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-6 transition hover:border-gray-400 dark:hover:border-gray-500"
        >
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Total businesses</p>
          <p class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">{{ isLoading ? '…' : stats.total_businesses }}</p>
        </button>
        <button
          type="button"
          @click="statusFilter = 'Pending'; lifecycleFilter = ''"
          :aria-pressed="statusFilter === 'Pending'"
          class="text-left bg-white dark:bg-gray-800 border rounded-none p-4 sm:p-6 transition hover:border-amber-400 dark:hover:border-amber-600 border-b-4"
          :class="[
            stats.pending_businesses > 0 ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700',
            statusFilter === 'Pending' ? 'border-b-amber-500' : 'border-b-transparent',
          ]"
        >
          <p class="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Pending approval</p>
          <p class="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{{ isLoading ? '…' : stats.pending_businesses }}</p>
        </button>
        <button
          type="button"
          @click="statusFilter = 'Active'; lifecycleFilter = ''"
          :aria-pressed="statusFilter === 'Active'"
          class="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-6 transition hover:border-emerald-400 dark:hover:border-emerald-600 border-b-4"
          :class="statusFilter === 'Active' ? 'border-b-emerald-500' : 'border-b-transparent'"
        >
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Active tenants</p>
          <p class="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{{ isLoading ? '…' : stats.active_businesses }}</p>
        </button>
        <button
          type="button"
          @click="statusFilter = 'Suspended'; lifecycleFilter = ''"
          :aria-pressed="statusFilter === 'Suspended'"
          class="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-6 transition hover:border-red-400 dark:hover:border-red-600 border-b-4"
          :class="statusFilter === 'Suspended' ? 'border-b-red-500' : 'border-b-transparent'"
        >
          <p class="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Suspended</p>
          <p class="text-2xl sm:text-3xl font-black text-red-500 dark:text-red-400 mt-1">{{ isLoading ? '…' : stats.suspended_businesses }}</p>
        </button>
      </div>

      <!-- PEOPLE + TRENDS: one compact strip instead of three more big cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5 mb-6 sm:mb-8">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-5 grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
          <div class="pr-3">
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{{ isLoading ? '…' : stats.total_owners }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Owners</p>
          </div>
          <div class="px-3">
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{{ isLoading ? '…' : stats.total_staff }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Staff &amp; admins</p>
          </div>
          <div class="pl-3">
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{{ isLoading ? '…' : stats.total_clients }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Clients</p>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-5 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-300">New tenants this month</p>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ isLoading ? '…' : tenantTrend[tenantTrend.length - 1].value }}</p>
            <p class="text-xs mt-0.5" :class="trendDeltaClass(tenantTrend.map(m => m.value))">{{ trendDelta(tenantTrend.map(m => m.value)) }}</p>
          </div>
          <svg class="w-24 h-8 shrink-0 text-emerald-500" viewBox="0 0 96 28" role="img" :aria-label="'New tenants, last 6 months: ' + tenantTrend.map(m => m.value).join(', ')">
            <title>New tenants per month (last 6 months)</title>
            <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" :points="sparkPoints(tenantTrend.map(m => m.value))" />
            <circle :cx="sparkLast(tenantTrend.map(m => m.value)).x" :cy="sparkLast(tenantTrend.map(m => m.value)).y" r="2.5" fill="currentColor" />
          </svg>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none p-4 sm:p-5 flex items-center justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold text-gray-600 dark:text-gray-300">Bookings this month</p>
            <template v-if="bookingsTrend">
              <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{{ bookingsTrend[bookingsTrend.length - 1].value }}</p>
              <p class="text-xs mt-0.5" :class="trendDeltaClass(bookingsTrend.map(m => m.value))">{{ trendDelta(bookingsTrend.map(m => m.value)) }}</p>
            </template>
            <template v-else>
              <p class="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-300 dark:text-gray-500 mt-1">—</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Trend not available yet</p>
            </template>
          </div>
          <svg v-if="bookingsTrend" class="w-24 h-8 shrink-0 text-sky-500" viewBox="0 0 96 28" role="img" :aria-label="'Bookings, last 6 months: ' + bookingsTrend.map(m => m.value).join(', ')">
            <title>Bookings per month (last 6 months)</title>
            <polyline fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" :points="sparkPoints(bookingsTrend.map(m => m.value))" />
            <circle :cx="sparkLast(bookingsTrend.map(m => m.value)).x" :cy="sparkLast(bookingsTrend.map(m => m.value)).y" r="2.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <!-- MAIN TABS -->
      <div role="tablist" class="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 overflow-x-auto no-scrollbar">
        <button
          v-for="t in ['Tenants', 'Compliance', 'Analytics', 'Config', 'Communication']" :key="t"
          type="button"
          role="tab"
          :aria-selected="mainTab === t"
          @click="mainTab = t"
          :class="mainTab === t
            ? 'border-emerald-500 text-gray-900 dark:text-white bg-emerald-50/60 dark:bg-emerald-400/10'
            : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'"
          class="px-5 py-3 sm:py-3.5 text-sm font-bold border-b-[3px] -mb-px transition whitespace-nowrap"
        >{{ t === 'Analytics' ? 'Platform Analytics' : t === 'Config' ? 'Global Config' : t === 'Communication' ? 'Communication Hub' : t }}<span v-if="t === 'Compliance' && licensePending" class="ml-2 inline-block min-w-[1.25rem] px-1.5 py-0.5 text-[11px] leading-none font-bold text-white bg-blue-600 rounded-full text-center">{{ licensePending }}</span></button>
      </div>

      <template v-if="mainTab === 'Tenants'">
      <!-- NEEDS ATTENTION: only takes space when something actually needs action -->
      <div
        v-if="!isLoading && attentionItems.length"
        class="mb-6 sm:mb-8 bg-amber-50 dark:bg-amber-900/15 border border-amber-300 dark:border-amber-700/70 rounded-none p-4 sm:p-5"
      >
        <div class="flex items-center gap-2 mb-3">
          <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <h2 class="font-bold text-amber-900 dark:text-amber-200 text-sm sm:text-base">Needs attention</h2>
        </div>
        <div class="flex flex-wrap gap-2 sm:gap-3">
          <button
            v-for="item in attentionItems" :key="item.key"
            type="button"
            @click="item.run()"
            class="flex items-center gap-3 text-left bg-white dark:bg-gray-800 border px-3 py-2.5 sm:px-4 transition hover:shadow-sm"
            :class="item.border"
          >
            <span class="text-xl sm:text-2xl font-black leading-none" :class="item.text">{{ item.count }}</span>
            <span class="min-w-0">
              <span class="block text-sm font-semibold text-gray-900 dark:text-gray-100">{{ item.label }}</span>
              <span class="block text-xs text-gray-600 dark:text-gray-300">{{ item.hint }}</span>
            </span>
          </button>
        </div>
      </div>
      <p v-else-if="!isLoading" class="mb-6 sm:mb-8 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <svg class="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        All clear: no approvals, renewals, or inactive tenants need action.
      </p>

      <p v-if="lifecycleFilter" class="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Showing tenants that are <span class="font-semibold text-gray-900 dark:text-gray-100">{{ lifecycleFilter.toLowerCase() }}</span> &middot;
        <button type="button" @click="lifecycleFilter = ''" class="underline font-semibold">clear</button>
      </p>

      <!-- BUSINESSES -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none overflow-hidden">
        <div class="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 class="font-bold text-gray-900 dark:text-gray-100">Registered businesses (tenants)</h2>
          <div class="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
            <button
              v-for="f in FILTERS" :key="f"
              type="button"
              @click="statusFilter = f"
              :class="statusFilter === f ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'"
              class="shrink-0 text-xs font-semibold px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-none transition"
            >
              {{ f }}<span class="ml-1.5 opacity-70">{{ statusCounts[f] }}</span>
            </button>
            <span class="hidden sm:block w-px h-5 bg-gray-200 dark:bg-gray-600 mx-1" aria-hidden="true"></span>
            <button
              type="button"
              @click="exportPDF()"
              class="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-none bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
            <button
              type="button"
              @click="exportCSV()"
              class="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-none border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18M10 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        <!-- SEARCH + SORT -->
        <div class="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center gap-3">
          <div class="relative flex-1 sm:max-w-sm">
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              v-model="businessSearch"
              aria-label="Search businesses"
              placeholder="Search business, owner, email…"
              class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
          <div class="flex items-center gap-2">
            <label for="tenant-sort" class="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Sort by</label>
            <select
              id="tenant-sort"
              v-model="sortSelect"
              class="flex-1 sm:flex-none px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option v-for="o in SORT_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
            </select>
          </div>
        </div>

        <!-- BULK ACTION BAR -->
        <div v-if="selectedIds.length" class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 sm:px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-200 dark:border-emerald-800">
          <p class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            {{ selectedIds.length }} selected
            <button
              v-if="pageAllSelected && sortedBusinesses.length > pagedBusinesses.length && selectedIds.length < sortedBusinesses.length"
              type="button"
              @click="selectAllMatching"
              class="ml-2 text-xs font-semibold underline"
            >Select all {{ sortedBusinesses.length }} matching</button>
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              @click="openBulkRenew"
              :disabled="!bulkRenewable.length"
              class="text-xs font-bold px-3 py-1.5 rounded-none bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
              :title="bulkRenewable.length ? '' : 'None of the selected businesses can be renewed'"
            >Renew{{ bulkRenewable.length ? ` (${bulkRenewable.length})` : '' }}</button>
            <button type="button" @click="exportPDF(true)" class="text-xs font-bold px-3 py-1.5 rounded-none bg-emerald-600 text-white hover:bg-emerald-700">Export PDF</button>
            <button type="button" @click="exportCSV(true)" class="text-xs font-bold px-3 py-1.5 rounded-none border border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40">Export CSV</button>
            <button type="button" @click="clearSelection" class="text-xs font-semibold px-3 py-1.5 text-gray-700 dark:text-gray-200 underline">Clear</button>
          </div>
        </div>

        <div v-if="errorMessage" class="p-4 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20">{{ errorMessage }}</div>

        <div v-if="isLoading" class="p-8 text-center text-gray-600 dark:text-gray-300 text-sm">Loading businesses…</div>

        <!-- EMPTY STATE -->
        <div v-else-if="sortedBusinesses.length === 0" class="p-10 text-center">
          <p class="font-semibold text-gray-900 dark:text-gray-100">No businesses found</p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {{ hasActiveFilters ? 'Nothing matches your current filter or search.' : 'No businesses have registered yet.' }}
          </p>
          <button
            v-if="hasActiveFilters"
            type="button"
            @click="clearFilters"
            class="mt-4 text-sm font-bold px-4 py-2 rounded-none bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
          >Clear filters</button>
        </div>

        <!-- DESKTOP TABLE -->
        <div v-else class="hidden md:block overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 dark:bg-gray-900/40 text-left text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
              <tr>
                <th class="w-10 pl-4 md:pl-6 pr-0 py-4">
                  <input
                    type="checkbox"
                    :checked="pageAllSelected"
                    :indeterminate.prop="pageSomeSelected && !pageAllSelected"
                    @change="togglePage"
                    aria-label="Select all rows on this page"
                    class="h-4 w-4 accent-emerald-600 cursor-pointer"
                  />
                </th>
                <th class="px-4 md:px-5 py-4 font-semibold" :aria-sort="ariaSort('business')">
                  <button type="button" @click="toggleSort('business')" class="inline-flex items-center gap-1 uppercase tracking-wide font-semibold hover:text-gray-900 dark:hover:text-white">Business<span aria-hidden="true" :class="sortKey === 'business' ? '' : 'opacity-40'">{{ sortIcon('business') }}</span></button>
                </th>
                <th class="px-4 md:px-5 py-4 font-semibold">Owner</th>
                <th class="px-4 md:px-5 py-4 font-semibold hidden xl:table-cell">Contact</th>
                <th class="px-4 md:px-5 py-4 font-semibold text-center hidden lg:table-cell">Staff</th>
                <th class="px-4 md:px-5 py-4 font-semibold text-center hidden lg:table-cell">Packages</th>
                <th class="px-4 md:px-5 py-4 font-semibold text-center" :aria-sort="ariaSort('bookings')">
                  <button type="button" @click="toggleSort('bookings')" class="inline-flex items-center gap-1 uppercase tracking-wide font-semibold hover:text-gray-900 dark:hover:text-white">Bookings<span aria-hidden="true" :class="sortKey === 'bookings' ? '' : 'opacity-40'">{{ sortIcon('bookings') }}</span></button>
                </th>
                <th class="px-4 md:px-5 py-4 font-semibold hidden xl:table-cell" :aria-sort="ariaSort('registered')">
                  <button type="button" @click="toggleSort('registered')" class="inline-flex items-center gap-1 uppercase tracking-wide font-semibold hover:text-gray-900 dark:hover:text-white">Registered<span aria-hidden="true" :class="sortKey === 'registered' ? '' : 'opacity-40'">{{ sortIcon('registered') }}</span></button>
                </th>
                <th class="px-4 md:px-5 py-4 font-semibold">Status</th>
                <th v-if="lifecycleReady" class="px-4 md:px-5 py-4 font-semibold whitespace-nowrap" :aria-sort="ariaSort('expiry')">
                  <button type="button" @click="toggleSort('expiry')" class="inline-flex items-center gap-1 uppercase tracking-wide font-semibold hover:text-gray-900 dark:hover:text-white">Subscription<span aria-hidden="true" :class="sortKey === 'expiry' ? '' : 'opacity-40'">{{ sortIcon('expiry') }}</span></button>
                </th>
                <th v-if="lifecycleReady" class="px-4 md:px-5 py-4 font-semibold whitespace-nowrap hidden 2xl:table-cell" :aria-sort="ariaSort('activity')">
                  <button type="button" @click="toggleSort('activity')" class="inline-flex items-center gap-1 uppercase tracking-wide font-semibold hover:text-gray-900 dark:hover:text-white">Last activity<span aria-hidden="true" :class="sortKey === 'activity' ? '' : 'opacity-40'">{{ sortIcon('activity') }}</span></button>
                </th>
                <th class="px-4 md:px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr
                v-for="b in pagedBusinesses" :key="b.business_id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700/40"
                :class="selectedSet.has(b.business_id) ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''"
              >
                <td class="w-10 pl-4 md:pl-6 pr-0 py-5">
                  <input
                    type="checkbox"
                    :checked="selectedSet.has(b.business_id)"
                    @change="toggleSelect(b.business_id)"
                    :aria-label="'Select ' + b.business_name"
                    class="h-4 w-4 accent-emerald-600 cursor-pointer"
                  />
                </td>
                <td class="px-4 md:px-5 py-5 font-semibold text-gray-900 dark:text-gray-100 max-w-[240px]">
                  <span class="block">{{ b.business_name }}</span>
                  <button
                    v-if="contactMain(b)"
                    type="button"
                    @click="copyText(contactMain(b))"
                    :title="contactMain(b) + ' (click to copy)'"
                    class="xl:hidden mt-0.5 block max-w-full truncate text-left text-xs font-normal text-gray-600 dark:text-gray-300 hover:underline"
                  >{{ contactMain(b) }}</button>
                </td>
                <td class="px-4 md:px-5 py-5 text-gray-800 dark:text-gray-200">
                  {{ b.owner_full_name || '—' }}
                  <span v-if="b.owner_username" class="block text-xs text-gray-600 dark:text-gray-300">@{{ b.owner_username }}</span>
                </td>
                <td class="px-4 md:px-5 py-5 hidden xl:table-cell max-w-[220px]">
                  <button
                    v-if="contactMain(b)"
                    type="button"
                    @click="copyText(contactMain(b))"
                    :title="contactMain(b) + ' (click to copy)'"
                    class="block max-w-full truncate text-left text-xs text-gray-800 dark:text-gray-100 hover:underline"
                  >{{ contactMain(b) }}</button>
                  <span v-else class="text-xs text-gray-600 dark:text-gray-300">—</span>
                  <span v-if="b.address" class="mt-1 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300" :title="b.address">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span class="truncate">{{ b.address }}</span>
                  </span>
                </td>
                <td class="px-4 md:px-5 py-5 text-center text-gray-800 dark:text-gray-200 hidden lg:table-cell">{{ b.staff_count }}</td>
                <td class="px-4 md:px-5 py-5 text-center text-gray-800 dark:text-gray-200 hidden lg:table-cell">{{ b.packages_count }}</td>
                <td class="px-4 md:px-5 py-5 text-center text-gray-800 dark:text-gray-200">{{ b.bookings_count }}</td>
                <td class="px-4 md:px-5 py-5 text-xs text-gray-700 dark:text-gray-300 hidden xl:table-cell whitespace-nowrap">{{ formatDate(b.created_at) }}</td>
                <td class="px-4 md:px-5 py-5">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" :class="statusBadgeClass(b.status)">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(b.status)"></span>{{ b.status }}
                  </span>
                </td>
                <td v-if="lifecycleReady" class="px-4 md:px-5 py-5 text-xs">
                  <template v-if="b.subscription_expires_at">
                    <span class="block text-gray-800 dark:text-gray-200 whitespace-nowrap">{{ formatDateOnly(b.subscription_expires_at) }}</span>
                    <span class="inline-block mt-1 px-2 py-0.5 rounded-full font-bold whitespace-nowrap" :class="expiryBadgeClass(b)">{{ expiryLabel(b) }}</span>
                  </template>
                  <button
                    v-else-if="isLiveTenant(b)"
                    type="button"
                    @click="openRenew([b], true)"
                    class="inline-flex items-center gap-1 px-2 py-1 font-bold whitespace-nowrap bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                    No expiry · Set expiry
                  </button>
                  <span v-else class="text-gray-600 dark:text-gray-300">—</span>
                  <span v-if="isInactive(b)" class="block mt-1 text-amber-700 dark:text-amber-300 2xl:hidden">Inactive {{ b.days_inactive }} days</span>
                </td>
                <td v-if="lifecycleReady" class="px-4 md:px-5 py-5 text-xs hidden 2xl:table-cell whitespace-nowrap" :title="b.last_activity_at ? formatDate(b.last_activity_at) : ''">
                  <span :class="isInactive(b) ? 'text-amber-700 dark:text-amber-300 font-semibold' : 'text-gray-700 dark:text-gray-300'">{{ lastActivityLabel(b) }}</span>
                </td>
                <td class="px-4 md:px-6 py-5">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      v-if="b.status === 'Pending'"
                      type="button"
                      @click="changeStatus(b, 'Active')"
                      :disabled="pendingActionId === b.business_id"
                      class="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-none bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                    >Approve</button>
                    <button
                      type="button"
                      @click="openDetails(b)"
                      class="whitespace-nowrap text-xs font-bold px-3 py-1.5 rounded-none bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
                    >Details</button>
                    <button
                      v-if="rowMenuItems(b).length"
                      type="button"
                      @click.stop="openMenu(b, $event)"
                      aria-haspopup="menu"
                      :aria-expanded="menu?.business.business_id === b.business_id"
                      :aria-label="'More actions for ' + b.business_name"
                      class="p-1.5 rounded-none text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOBILE: one card per tenant -->
        <ul v-if="!isLoading && pagedBusinesses.length" class="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          <li v-for="b in pagedBusinesses" :key="'m-' + b.business_id" class="p-4" :class="selectedSet.has(b.business_id) ? 'bg-emerald-50/60 dark:bg-emerald-900/10' : ''">
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                :checked="selectedSet.has(b.business_id)"
                @change="toggleSelect(b.business_id)"
                :aria-label="'Select ' + b.business_name"
                class="mt-1 h-5 w-5 accent-emerald-600 shrink-0"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 dark:text-gray-100 leading-snug">{{ b.business_name }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      {{ b.owner_full_name || '—' }}<span v-if="b.owner_username"> &middot; @{{ b.owner_username }}</span>
                    </p>
                  </div>
                  <span class="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap" :class="statusBadgeClass(b.status)">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(b.status)"></span>{{ b.status }}
                  </span>
                </div>

                <button
                  v-if="contactMain(b)"
                  type="button"
                  @click="copyText(contactMain(b))"
                  class="mt-1.5 block max-w-full truncate text-left text-xs text-gray-700 dark:text-gray-200"
                >{{ contactMain(b) }}</button>
                <p v-if="b.address" class="mt-0.5 flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span class="truncate">{{ b.address }}</span>
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-300 mt-0.5">Registered {{ formatDate(b.created_at) }}</p>

                <div class="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div class="bg-gray-50 dark:bg-gray-900/40 py-2">
                    <p class="text-base font-bold text-gray-900 dark:text-gray-100">{{ b.staff_count }}</p>
                    <p class="text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">Staff</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-900/40 py-2">
                    <p class="text-base font-bold text-gray-900 dark:text-gray-100">{{ b.packages_count }}</p>
                    <p class="text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">Packages</p>
                  </div>
                  <div class="bg-gray-50 dark:bg-gray-900/40 py-2">
                    <p class="text-base font-bold text-gray-900 dark:text-gray-100">{{ b.bookings_count }}</p>
                    <p class="text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">Bookings</p>
                  </div>
                </div>

                <div v-if="lifecycleReady" class="mt-3 text-xs flex flex-wrap items-center gap-x-2 gap-y-1">
                  <template v-if="b.subscription_expires_at">
                    <span class="text-gray-600 dark:text-gray-300">Subscription:</span>
                    <span class="text-gray-800 dark:text-gray-200">{{ formatDateOnly(b.subscription_expires_at) }}</span>
                    <span class="inline-block px-2 py-0.5 rounded-full font-bold whitespace-nowrap" :class="expiryBadgeClass(b)">{{ expiryLabel(b) }}</span>
                  </template>
                  <button
                    v-else-if="isLiveTenant(b)"
                    type="button"
                    @click="openRenew([b], true)"
                    class="inline-flex items-center gap-1 px-2 py-1 font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                  >No expiry · Set expiry</button>
                  <span v-else class="text-gray-600 dark:text-gray-300">Subscription: —</span>
                  <span class="w-full text-gray-600 dark:text-gray-300" :class="isInactive(b) ? 'text-amber-700 dark:text-amber-300 font-semibold' : ''">Last activity: {{ lastActivityLabel(b) }}</span>
                </div>

                <div class="flex gap-2 mt-3">
                  <button
                    v-if="b.status === 'Pending'"
                    type="button"
                    @click="changeStatus(b, 'Active')"
                    :disabled="pendingActionId === b.business_id"
                    class="flex-1 min-h-[44px] text-sm font-bold px-3 rounded-none bg-emerald-600 text-white active:bg-emerald-700 disabled:opacity-50"
                  >Approve</button>
                  <button
                    type="button"
                    @click="openDetails(b)"
                    class="flex-1 min-h-[44px] text-sm font-bold px-3 rounded-none bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  >Details</button>
                  <button
                    v-if="rowMenuItems(b).length"
                    type="button"
                    @click.stop="openMenu(b, $event)"
                    aria-haspopup="menu"
                    :aria-label="'More actions for ' + b.business_name"
                    class="min-h-[44px] w-11 flex items-center justify-center rounded-none border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>

        <!-- PAGINATION -->
        <div v-if="!isLoading && sortedBusinesses.length" class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-gray-700">
          <p class="text-xs text-gray-700 dark:text-gray-300">Showing {{ rangeStart }}–{{ rangeEnd }} of {{ sortedBusinesses.length }}</p>
          <div class="flex items-center gap-3">
            <label class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
              Rows
              <select v-model.number="pageSize" class="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-xs text-gray-900 dark:text-gray-100">
                <option v-for="n in PAGE_SIZES" :key="n" :value="n">{{ n }}</option>
              </select>
            </label>
            <div class="flex items-center gap-1">
              <button type="button" @click="page--" :disabled="page <= 1" class="px-3 py-1.5 text-xs font-semibold rounded-none border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
              <span class="px-2 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">Page {{ page }} of {{ totalPages }}</span>
              <button type="button" @click="page++" :disabled="page >= totalPages" class="px-3 py-1.5 text-xs font-semibold rounded-none border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        </div>
      </div>

      <p class="text-xs text-gray-600 dark:text-gray-300 mt-4">
        A newly self-registered business starts as <span class="font-semibold">Pending</span> and its owner cannot log in
        until you approve it here. Suspending an active business blocks that owner, their staff, and their business admin
        from logging in until it's reactivated. Rejected and Closed businesses can also be reactivated.
      </p>
      </template>

      <!-- ============ PLATFORM ANALYTICS ============ -->
      <div v-else-if="mainTab === 'Analytics'">
        <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 class="font-bold text-gray-900 dark:text-gray-100">Multi-Tenant Analytics</h2>
            <p class="text-xs text-gray-500 dark:text-gray-300">Bookings and collected revenue per catering business. Months follow the event date.</p>
          </div>
          <div class="flex gap-1 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
            <button
              v-for="r in ANALYTICS_RANGES" :key="r.key"
              type="button"
              @click="analyticsRange = r.key"
              :class="analyticsRange === r.key ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              class="shrink-0 text-xs font-semibold px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-none transition whitespace-nowrap"
            >{{ r.label }}</button>
          </div>
        </div>

        <div v-if="analyticsError" class="p-4 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20">{{ analyticsError }}</div>
        <div v-else-if="analyticsLoading && !analyticsLoaded" class="p-8 text-center text-gray-500 dark:text-gray-300 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Loading analytics…</div>

        <template v-else>
          <!-- KPI cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Total bookings</p>
              <p class="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 mt-1">{{ analyticsTotals.bookings }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{{ analyticsTotals.completed }} completed · {{ analyticsTotals.cancelled }} cancelled</p>
            </div>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Revenue collected</p>
              <p class="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{{ peso(analyticsTotals.revenue) }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{{ analyticsTotals.guests.toLocaleString('en-PH') }} guests served</p>
            </div>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Peak month</p>
              <p class="text-2xl sm:text-3xl font-black text-amber-500 mt-1">{{ peakMonth ? peakMonth.label : '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{{ peakMonth ? `${peakMonth.bookings} bookings · ${peso(peakMonth.revenue)}` : 'No bookings in this range' }}</p>
            </div>
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wide">Top tenant</p>
              <p class="text-lg font-black text-gray-900 dark:text-gray-100 mt-2 truncate">{{ topTenant ? topTenant.business_name : '—' }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-300 mt-0.5">{{ topTenant ? `${peso(topTenant.revenue)} · ${topTenant.bookings} bookings` : 'No data yet' }}</p>
            </div>
          </div>

          <!-- Monthly trend -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-sm">Platform trend by month</h3>
              <div class="flex gap-1">
                <button
                  v-for="m in [{ k: 'bookings', l: 'Bookings' }, { k: 'revenue', l: 'Revenue' }]" :key="m.k"
                  type="button"
                  @click="trendMetric = m.k"
                  :class="trendMetric === m.k ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
                  class="text-xs font-semibold px-3.5 py-2 sm:px-3 sm:py-1 rounded-none"
                >{{ m.l }}</button>
              </div>
            </div>
            <div class="overflow-x-auto">
              <div class="flex items-end gap-2 h-44 min-w-max px-1">
                <div v-for="m in monthlyTrend" :key="m.key" class="flex flex-col items-center justify-end h-full w-10 sm:w-12" :title="`${m.label}: ${m.bookings} bookings, ${peso(m.revenue)}`">
                  <span class="text-[11px] text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap">{{ trendMetric === 'bookings' ? m.bookings : peso(m.revenue, true) }}</span>
                  <div
                    class="w-full rounded-none transition-all"
                    :class="peakMonth && peakMonth.key === m.key ? 'bg-amber-400' : (trendMetric === 'bookings' ? 'bg-emerald-500' : 'bg-sky-500')"
                    :style="{ height: barHeight(m) }"
                  ></div>
                </div>
              </div>
              <div class="flex gap-2 min-w-max px-1 mt-1">
                <span v-for="m in monthlyTrend" :key="m.key" class="w-10 sm:w-12 text-center text-[11px] text-gray-500 dark:text-gray-300 whitespace-nowrap">{{ m.label }}</span>
              </div>
            </div>
            <p class="text-[11px] text-gray-500 dark:text-gray-300 mt-3">The highlighted bar is the platform's busiest month in this range.</p>
          </div>

          <!-- Tenant comparison -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div class="flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 class="font-bold text-gray-900 dark:text-gray-100 text-sm">Tenant comparison</h3>
              <div class="flex items-center gap-2">
                <label class="text-xs text-gray-500 dark:text-gray-300">Sort by</label>
                <select v-model="tenantSort" class="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-xs text-gray-900 dark:text-gray-100">
                  <option value="revenue">Revenue</option>
                  <option value="bookings">Bookings</option>
                  <option value="completed">Completed</option>
                  <option value="guests">Guests</option>
                </select>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900/40 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-gray-300">
                  <tr>
                    <th class="px-4 py-3 font-semibold">#</th>
                    <th class="px-4 py-3 font-semibold">Business</th>
                    <th class="px-4 py-3 font-semibold text-center">Bookings</th>
                    <th class="px-4 py-3 font-semibold text-center hidden sm:table-cell">Completed</th>
                    <th class="px-4 py-3 font-semibold text-center hidden sm:table-cell">Cancelled</th>
                    <th class="px-4 py-3 font-semibold text-center hidden md:table-cell">Guests</th>
                    <th class="px-4 py-3 font-semibold">Revenue</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="(t, i) in tenantStats" :key="t.business_id" class="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                    <td class="pl-3 pr-1 sm:px-4 py-3 text-gray-500 dark:text-gray-300 text-xs">{{ i + 1 }}</td>
                    <td class="px-2 sm:px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                      {{ t.business_name }}
                      <span v-if="t.status !== 'Active'" class="ml-1 text-[11px] font-bold px-1.5 py-0.5" :class="statusBadgeClass(t.status)">{{ t.status }}</span>
                      <span class="sm:hidden block text-[11px] font-normal text-gray-500 dark:text-gray-300">{{ t.completed }} done &middot; {{ t.cancelled }} cancelled</span>
                    </td>
                    <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{{ t.bookings }}</td>
                    <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ t.completed }}</td>
                    <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300 hidden sm:table-cell">{{ t.cancelled }}</td>
                    <td class="px-4 py-3 text-center text-gray-600 dark:text-gray-300 hidden md:table-cell">{{ t.guests.toLocaleString('en-PH') }}</td>
                    <td class="px-3 sm:px-4 py-3 min-w-[130px] sm:min-w-[160px]">
                      <span class="font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">{{ peso(t.revenue) }}</span>
                      <div class="h-1.5 bg-gray-100 dark:bg-gray-700 mt-1">
                        <div class="h-1.5 bg-emerald-500" :style="{ width: revenueShare(t) + '%' }"></div>
                      </div>
                      <span class="text-[11px] text-gray-500 dark:text-gray-300">{{ revenueShare(t, true) }}% of platform revenue</span>
                    </td>
                  </tr>
                  <tr v-if="tenantStats.length === 0">
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-300 text-sm">No businesses yet.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p class="text-xs text-gray-500 dark:text-gray-300 mt-3">Revenue counts payments actually recorded (amount paid), not unpaid balances. Cancelled bookings are included in the booking count.</p>
        </template>
      </div>

      <!-- ============ COMMUNICATION HUB ============ -->
      <LicenseVerificationPanel v-else-if="mainTab === 'Compliance'" @pending-count="licensePending = $event" />

      <GlobalConfigPanel v-else-if="mainTab === 'Config'" />

      <AnnouncementsPanel v-else-if="mainTab === 'Communication'" />
    </main>

    <!-- BUSINESS DETAILS / AUDIT TRAIL MODAL -->
    <div v-if="detailsBusiness" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div @click="closeDetails" class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <div class="sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 class="font-bold text-gray-900 dark:text-gray-100">{{ detailsBusiness.business_name }}</h3>
          <button @click="closeDetails" aria-label="Close" class="w-10 h-10 -mr-2 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none">&times;</button>
        </div>

        <div class="p-4 space-y-4">
          <!-- Basic info -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Status</p>
              <span class="inline-block mt-1 px-2 py-1 rounded-none text-xs font-bold" :class="statusBadgeClass(detailsBusiness.status)">{{ detailsBusiness.status }}</span>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Registered</p>
              <p class="text-gray-700 dark:text-gray-300 mt-1">{{ formatDate(detailsBusiness.created_at) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Owner</p>
              <p class="text-gray-700 dark:text-gray-300 mt-1">
                {{ detailsBusiness.owner_full_name || '—' }}
                <span v-if="detailsBusiness.owner_username" class="block text-xs text-gray-500 dark:text-gray-300">@{{ detailsBusiness.owner_username }}</span>
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Contact</p>
              <p class="text-gray-700 dark:text-gray-300 mt-1">{{ detailsBusiness.contact_email || detailsBusiness.contact_number || detailsBusiness.owner_contact_number || '—' }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Address</p>
              <p class="text-gray-700 dark:text-gray-300 mt-1">{{ detailsBusiness.address || '—' }}</p>
            </div>
            <button
              type="button"
              @click="toggleDrillDown('staff')"
              class="text-left rounded-none"
              :class="drillDownTab === 'staff' ? 'text-emerald-700 dark:text-emerald-400' : ''"
            >
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Staff</p>
              <p class="mt-1 underline decoration-dotted underline-offset-2" :class="drillDownTab === 'staff' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'">{{ detailsBusiness.staff_count }}</p>
            </button>
            <button
              type="button"
              @click="toggleDrillDown('packages')"
              class="text-left rounded-none"
            >
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Packages</p>
              <p class="mt-1 underline decoration-dotted underline-offset-2" :class="drillDownTab === 'packages' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'">{{ detailsBusiness.packages_count }}</p>
            </button>
            <button
              type="button"
              @click="toggleDrillDown('bookings')"
              class="text-left rounded-none"
            >
              <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold">Bookings</p>
              <p class="mt-1 underline decoration-dotted underline-offset-2" :class="drillDownTab === 'bookings' ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'">{{ detailsBusiness.bookings_count }}</p>
            </button>
          </div>

          <!-- Drill-down list (Staff / Packages / Bookings) -->
          <div v-if="drillDownTab" class="pt-3 border-t border-gray-100 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold mb-2">
              {{ { staff: 'Staff', packages: 'Packages', bookings: 'Bookings' }[drillDownTab] }} List
            </p>

            <div v-if="isLoadingDrillDown" class="text-sm text-gray-500 dark:text-gray-300">Loading…</div>
            <div v-else-if="drillDownError" class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-none">
              {{ drillDownError }}
            </div>
            <div v-else-if="drillDownRows.length === 0" class="text-sm text-gray-500 dark:text-gray-300">Nothing here yet.</div>

            <ul v-else class="space-y-2 max-h-48 overflow-y-auto">
              <template v-if="drillDownTab === 'staff'">
                <li v-for="row in drillDownRows" :key="row.id" class="text-sm flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <span class="font-semibold text-gray-800 dark:text-gray-100 truncate block">{{ row.full_name || row.username || '—' }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-300">{{ row.role }}{{ row.position ? ' · ' + row.position : '' }}</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap">{{ row.availability }}</span>
                </li>
              </template>
              <template v-else-if="drillDownTab === 'packages'">
                <li v-for="row in drillDownRows" :key="row.package_id" class="text-sm flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <span class="font-semibold text-gray-800 dark:text-gray-100 truncate block">{{ row.package_name }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-300 truncate">{{ row.description || '—' }}</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap">₱{{ Number(row.price_per_head).toLocaleString('en-PH') }}/head</span>
                </li>
              </template>
              <template v-else-if="drillDownTab === 'bookings'">
                <li v-for="row in drillDownRows" :key="row.booking_id" class="text-sm flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <span class="font-semibold text-gray-800 dark:text-gray-100 truncate block">{{ row.client_name }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-300">{{ formatDateOnly(row.event_date) }} · {{ row.guest_count }} guests · {{ row.package_name || '—' }}</span>
                  </div>
                  <span class="text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap">{{ row.booking_status }}</span>
                </li>
              </template>
            </ul>
          </div>

          <!-- Audit trail -->
          <div class="pt-3 border-t border-gray-100 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-300 uppercase font-semibold mb-2">Status History</p>

            <div v-if="isLoadingAudit" class="text-sm text-gray-500 dark:text-gray-300">Loading history…</div>

            <div v-else-if="auditError" class="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-none">
              {{ auditError }}
            </div>

            <div v-else-if="auditTrail.length === 0" class="text-sm text-gray-500 dark:text-gray-300">No status changes recorded yet.</div>

            <ul v-else class="space-y-2">
              <li v-for="entry in auditTrail" :key="entry.audit_id" class="text-sm flex items-start justify-between gap-3">
                <div>
                  <span class="font-semibold text-gray-800 dark:text-gray-100">
                    {{ entry.old_status || 'New' }} → {{ entry.new_status }}
                  </span>
                  <span class="block text-xs text-gray-500 dark:text-gray-300">by {{ entry.changed_by_name || 'Unknown' }}</span>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-300 whitespace-nowrap">{{ formatDate(entry.created_at) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- ROW ACTIONS MENU (kebab). Fixed-position so the table's overflow never clips it. -->
    <template v-if="menu">
      <div class="fixed inset-0 z-40" @click="closeMenu"></div>
      <div
        role="menu"
        class="fixed z-50 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-lg py-1"
        :style="{ left: menu.left + 'px', top: menu.top != null ? menu.top + 'px' : 'auto', bottom: menu.bottom != null ? menu.bottom + 'px' : 'auto' }"
      >
        <p class="px-3 pt-1.5 pb-1 text-xs text-gray-600 dark:text-gray-300 truncate">{{ menu.business.business_name }}</p>
        <button
          v-for="item in rowMenuItems(menu.business)" :key="item.key"
          type="button"
          role="menuitem"
          @click="runMenu(item)"
          class="w-full text-left px-3 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700"
          :class="item.danger ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'"
        >{{ item.label }}</button>
      </div>
    </template>

    <!-- RENEW SUBSCRIPTION MODAL (single tenant or a bulk selection) -->
    <div v-if="renewState" class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-black/50" @click="closeRenew"></div>
      <div class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none w-full sm:max-w-sm p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto">
        <h3 class="font-bold text-gray-900 dark:text-gray-100">{{ renewState.targets.length > 1 ? 'Renew subscriptions' : (renewState.focusDate ? 'Set expiry date' : 'Renew subscription') }}</h3>
        <template v-if="renewState.targets.length === 1">
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ renewState.targets[0].business_name }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            Current expiry:
            {{ renewState.targets[0].subscription_expires_at ? formatDateOnly(renewState.targets[0].subscription_expires_at) : 'not set' }}
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">{{ renewState.targets.length }} businesses</p>
          <p v-if="renewState.skipped" class="text-xs text-amber-700 dark:text-amber-300 mt-1">{{ renewState.skipped }} selected business(es) skipped: only Active, Suspended, or Closed tenants can be renewed.</p>
          <ul class="mt-2 max-h-24 overflow-y-auto text-xs text-gray-600 dark:text-gray-300 list-disc pl-4">
            <li v-for="t in renewState.targets" :key="t.business_id">{{ t.business_name }}</li>
          </ul>
        </template>

        <div class="flex gap-2 mt-4">
          <button
            v-for="m in [1, 3, 6, 12]" :key="m"
            type="button"
            @click="renewState.months = m; renewState.exactDate = ''"
            :class="!renewState.exactDate && renewState.months === m ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'"
            class="flex-1 text-xs font-bold py-3 sm:py-2 rounded-none"
          >{{ m }} mo</button>
        </div>
        <p class="text-xs text-gray-600 dark:text-gray-300 mt-2">Counted from the current expiry (or today if it already lapsed).</p>

        <div class="mt-4">
          <label for="renew-exact" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Or set an exact expiry date</label>
          <input
            id="renew-exact"
            type="date"
            v-model="renewState.exactDate"
            class="w-full p-2 bg-gray-50 dark:bg-gray-900 border rounded-none text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            :class="renewState.focusDate ? 'border-emerald-500' : 'border-gray-200 dark:border-gray-700'"
          />
        </div>

        <p v-if="renewState.error" class="text-xs text-red-600 dark:text-red-400 mt-3 whitespace-pre-line">{{ renewState.error }}</p>

        <div class="flex justify-end gap-2 mt-5">
          <button
            type="button"
            @click="closeRenew"
            class="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-none text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >Cancel</button>
          <button
            type="button"
            @click="submitRenew"
            :disabled="renewState.saving"
            class="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-none text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition"
          >{{ renewState.saving ? 'Saving…' : (renewState.exactDate ? 'Set date' : 'Renew') }}</button>
        </div>
      </div>
    </div>

    <!-- CONFIRM ACTION MODAL (themed replacement for window.confirm), with optional reason -->
    <div v-if="confirmState" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div class="absolute inset-0 bg-black/50"></div>
      <div class="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none w-full sm:max-w-sm p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[90vh] overflow-y-auto">
        <h3 class="font-bold text-gray-900 dark:text-gray-100 mb-2">Please confirm</h3>
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">{{ confirmState.message }}</p>

        <div v-if="confirmState.reason" class="mb-5">
          <label for="confirm-reason" class="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Reason {{ confirmState.reason === 'required' ? '(required)' : '(optional)' }}
          </label>
          <textarea
            id="confirm-reason"
            v-model="confirmState.reasonText"
            rows="3"
            maxlength="300"
            placeholder="e.g. Unpaid subscription, duplicate registration…"
            class="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          ></textarea>
          <p v-if="confirmState.error" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ confirmState.error }}</p>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">Saved to the platform audit log.</p>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            @click="resolveConfirm(false)"
            class="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-none text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="resolveConfirm(true)"
            class="flex-1 sm:flex-none px-4 py-3 sm:py-2 rounded-none text-sm font-bold text-white transition"
            :class="confirmState.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'"
          >
            {{ confirmState.actionLabel || (confirmState.danger ? 'Yes, proceed' : 'Approve') }}
          </button>
        </div>
      </div>
    </div>

    <!-- TOAST (copy confirmations, bulk results) -->
    <div
      v-if="toast"
      role="status"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] max-w-[90vw] px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold shadow-lg"
      style="margin-bottom: env(safe-area-inset-bottom)"
    >{{ toast }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoUrl from '../Assets/logofinal.png'
import NotificationBell from '../Components/SuperAdminBell.vue'
import AnnouncementsPanel from '../Components/AnnouncementsPanel.vue'
import GlobalConfigPanel from '../Components/GlobalConfigPanel.vue'
import LicenseVerificationPanel from '../Components/Licenseverificationpanel.vue'
import { logoutUser } from '../services/authService'
import { logActivity } from '../services/activitylogservice'
import { localToday, formatDateOnly } from '../utils/date'
import { supabase } from '../supabaseClient'
import { resetNotifications, refreshPendingBusinesses } from '../composables/useNotifications'
import {
  getPlatformStats, getPlatformBusinesses, setBusinessStatus, getBusinessStatusAudit,
  getBusinessStaffList, getBusinessPackagesList, getBusinessBookingsList,
  getTenantLifecycle, renewBusinessSubscription, setBusinessExpiry, getTenantAnalytics,
  getLicenseQueue,
} from '../services/superAdminService'

const FILTERS = ['All', 'Pending', 'Active', 'Suspended', 'Rejected', 'Closed']
const router = useRouter()
const route = useRoute()

const userName = ref('')
const isLoading = ref(true)
const errorMessage = ref('')
const statusFilter = ref(FILTERS.includes(route.query.filter) ? route.query.filter : 'All')
const pendingActionId = ref(null)
const businessSearch = ref('')

// Clicking "View Pending Businesses" in the bell while already on this page
// only changes the query string -- the component isn't re-created, so the
// filter above (read once at setup) never updated. Watch it.
watch(() => route.query.filter, (f) => {
  if (FILTERS.includes(f)) statusFilter.value = f
  else if (f === undefined) statusFilter.value = 'All'
})

// The reverse direction: when a chip / stat card changes the filter, mirror it
// into the URL. Without this the URL kept the old ?filter=Pending, so clicking
// "View Pending Businesses" in the bell after switching chips pushed the SAME
// location (a no-op) and the table never switched back to Pending.
watch(statusFilter, (f) => {
  const current = route.query.filter
  if (f === 'All') {
    if (current === undefined) return
    const { filter, ...rest } = route.query
    router.replace({ query: rest })
  } else if (current !== f) {
    router.replace({ query: { ...route.query, filter: f } })
  }
})

const stats = ref({
  total_businesses: 0, pending_businesses: 0, active_businesses: 0,
  suspended_businesses: 0, rejected_businesses: 0, closed_businesses: 0,
  total_owners: 0, total_staff: 0, total_clients: 0,
})
const businesses = ref([])

// ---------- Platform analytics (bookings + revenue per tenant, peak months) ----------
const MAIN_TABS = ['Tenants', 'Compliance', 'Analytics', 'Config', 'Communication']
const mainTab = ref(MAIN_TABS.includes(route.query.tab) ? route.query.tab : 'Tenants') // 'Tenants' | 'Compliance' | 'Analytics' | 'Config' | 'Communication'
// Licenses waiting for review (badge on the Compliance tab). The panel keeps it
// up to date once it is open; this is the initial load.
const licensePending = ref(0)
// The bell's license alerts link here with ?tab=Compliance (also works while already on this page).
watch(() => route.query.tab, (t) => { if (MAIN_TABS.includes(t)) mainTab.value = t })
getLicenseQueue()
  .then((rows) => { licensePending.value = (rows || []).filter((d) => d.verification_status === 'Pending').length })
  .catch(() => {})
const ANALYTICS_RANGES = [
  { key: '6M', label: 'Last 6 months' },
  { key: '12M', label: 'Last 12 months' },
  { key: 'YTD', label: 'This year' },
  { key: 'ALL', label: 'All time' },
]
const analyticsRange = ref('12M')
const analyticsRows = ref([])
const analyticsLoading = ref(false)
const analyticsLoaded = ref(false)
const analyticsError = ref('')
const trendMetric = ref('bookings') // 'bookings' | 'revenue'
const tenantSort = ref('revenue')

function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function rangeDates(key) {
  const now = new Date()
  const to = ymd(now)
  if (key === '6M') return { from: ymd(new Date(now.getFullYear(), now.getMonth() - 5, 1)), to }
  if (key === 'YTD') return { from: ymd(new Date(now.getFullYear(), 0, 1)), to }
  if (key === 'ALL') return { from: '2000-01-01', to }
  return { from: ymd(new Date(now.getFullYear(), now.getMonth() - 11, 1)), to } // 12M
}

let analyticsToken = 0
async function loadAnalytics() {
  const token = ++analyticsToken
  analyticsLoading.value = true
  analyticsError.value = ''
  try {
    const { from, to } = rangeDates(analyticsRange.value)
    const rows = await getTenantAnalytics(from, to)
    if (token !== analyticsToken) return
    if (rows === null) {
      analyticsError.value = 'Analytics is not set up yet. Run tenant_analytics.sql in the Supabase SQL Editor.'
      return
    }
    analyticsRows.value = rows
    analyticsLoaded.value = true
  } catch (error) {
    if (token === analyticsToken) analyticsError.value = error?.message || 'Failed to load analytics.'
  } finally {
    if (token === analyticsToken) analyticsLoading.value = false
  }
}
watch(mainTab, (t) => { if (t === 'Analytics') loadAnalytics() })
watch(analyticsRange, () => { if (mainTab.value === 'Analytics') loadAnalytics() })

function peso(n, short = false) {
  const v = Number(n) || 0
  if (short && Math.abs(v) >= 1000) return `₱${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`
  return `₱${v.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`
}

// Per-tenant totals. Every registered business is listed, even with no bookings.
const tenantStats = computed(() => {
  const byId = new Map()
  for (const b of businesses.value) {
    byId.set(b.business_id, { business_id: b.business_id, business_name: b.business_name, status: b.status, bookings: 0, completed: 0, cancelled: 0, guests: 0, revenue: 0 })
  }
  for (const r of analyticsRows.value) {
    const t = byId.get(r.business_id)
    if (!t) continue
    t.bookings += r.bookings; t.completed += r.completed; t.cancelled += r.cancelled
    t.guests += r.guests; t.revenue += r.revenue
  }
  const key = tenantSort.value
  return [...byId.values()].sort((a, b) => b[key] - a[key] || b.bookings - a.bookings || a.business_name.localeCompare(b.business_name))
})

const analyticsTotals = computed(() => tenantStats.value.reduce(
  (acc, t) => ({
    bookings: acc.bookings + t.bookings, completed: acc.completed + t.completed,
    cancelled: acc.cancelled + t.cancelled, guests: acc.guests + t.guests, revenue: acc.revenue + t.revenue,
  }),
  { bookings: 0, completed: 0, cancelled: 0, guests: 0, revenue: 0 },
))

const topTenant = computed(() => {
  const t = [...tenantStats.value].sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)[0]
  return t && (t.bookings > 0 || t.revenue > 0) ? t : null
})

function revenueShare(t, rounded = false) {
  const total = analyticsTotals.value.revenue
  if (!total) return 0
  const pct = (t.revenue / total) * 100
  return rounded ? Math.round(pct) : Math.max(pct, t.revenue > 0 ? 2 : 0)
}

// Platform totals per month, with empty months filled in so the chart has no gaps.
const monthlyTrend = computed(() => {
  const map = new Map()
  for (const r of analyticsRows.value) {
    const key = String(r.month).slice(0, 7)
    const m = map.get(key) || { key, bookings: 0, revenue: 0 }
    m.bookings += r.bookings; m.revenue += r.revenue
    map.set(key, m)
  }
  const now = new Date()
  const endKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  let startKey
  if (analyticsRange.value === 'ALL') startKey = [...map.keys()].sort()[0] || endKey
  else startKey = rangeDates(analyticsRange.value).from.slice(0, 7)

  const out = []
  let [y, mo] = startKey.split('-').map(Number)
  const [ey, emo] = endKey.split('-').map(Number)
  while (y < ey || (y === ey && mo <= emo)) {
    const key = `${y}-${String(mo).padStart(2, '0')}`
    const m = map.get(key) || { key, bookings: 0, revenue: 0 }
    out.push({ ...m, label: new Date(y, mo - 1, 1).toLocaleDateString('en-PH', { month: 'short', year: '2-digit' }) })
    mo++; if (mo > 12) { mo = 1; y++ }
    if (out.length > 120) break
  }
  return out
})

const peakMonth = computed(() => {
  let best = null
  for (const m of monthlyTrend.value) {
    if (m.bookings > 0 && (!best || m.bookings > best.bookings || (m.bookings === best.bookings && m.revenue > best.revenue))) best = m
  }
  return best
})

function barHeight(m) {
  const k = trendMetric.value
  const max = Math.max(...monthlyTrend.value.map((x) => x[k]), 0)
  if (!max) return '2px'
  return `${Math.max((m[k] / max) * 100, m[k] > 0 ? 4 : 0)}%`
}

// ---------- Tenant lifecycle (subscription expiry / inactivity) ----------
const EXPIRY_WARN_DAYS = 30   // "expiring soon" window
const INACTIVE_DAYS = 60      // no booking activity for this long = inactive
const lifecycleReady = ref(false) // false until tenant_lifecycle.sql has been run
const LIFECYCLE_FILTERS = ['Expiring', 'Expired', 'Inactive']
const lifecycleFilter = ref(LIFECYCLE_FILTERS.includes(route.query.lifecycle) ? route.query.lifecycle : '')   // '' | 'Expiring' | 'Expired' | 'Inactive'
// Clicking a subscription/inactivity alert in the bell lands here with ?lifecycle=...
watch(() => route.query.lifecycle, (f) => {
  if (LIFECYCLE_FILTERS.includes(f)) {
    mainTab.value = 'Tenants'
    statusFilter.value = 'All'
    lifecycleFilter.value = f
  }
})

function isLiveTenant(b) { return b.status === 'Active' || b.status === 'Suspended' }
function isExpiring(b) {
  return isLiveTenant(b) && b.days_left != null && b.days_left >= 0 && b.days_left <= EXPIRY_WARN_DAYS
}
function isExpired(b) { return isLiveTenant(b) && b.days_left != null && b.days_left < 0 }
function isInactive(b) { return b.status === 'Active' && Number(b.days_inactive) >= INACTIVE_DAYS }

const lifecycleCounts = computed(() => ({
  expiring: businesses.value.filter(isExpiring).length,
  expired: businesses.value.filter(isExpired).length,
  inactive: businesses.value.filter(isInactive).length,
}))

function toggleLifecycleFilter(kind) {
  lifecycleFilter.value = lifecycleFilter.value === kind ? '' : kind
  if (lifecycleFilter.value) statusFilter.value = 'All'
}

function expiryLabel(b) {
  if (b.days_left == null) return ''
  if (b.days_left < 0) return `Expired ${Math.abs(b.days_left)}d ago`
  if (b.days_left === 0) return 'Expires today'
  return `${b.days_left}d left`
}
function expiryBadgeClass(b) {
  // green -> amber -> red as the expiry gets closer
  if (b.days_left <= 7) return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  if (b.days_left <= EXPIRY_WARN_DAYS) return 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
  return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
}

// Renew / set-expiry modal (one tenant, or a bulk selection)
function canRenew(b) { return ['Active', 'Suspended', 'Closed'].includes(b.status) }
const renewState = ref(null)
function openRenew(targets, focusDate = false) {
  const list = (Array.isArray(targets) ? targets : [targets]).filter(canRenew)
  if (!list.length) return
  let exactDate = ''
  if (focusDate && list.length === 1 && !list[0].subscription_expires_at) {
    // sensible starting point for a tenant that has no expiry yet: one month from today
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    exactDate = ymd(d)
  }
  renewState.value = { targets: list, skipped: 0, months: 1, exactDate, focusDate, saving: false, error: '' }
}
function openBulkRenew() {
  const eligible = selectedBusinesses.value.filter(canRenew)
  if (!eligible.length) return
  openRenew(eligible)
  if (renewState.value) renewState.value.skipped = selectedBusinesses.value.length - eligible.length
}
function closeRenew() { renewState.value = null }
async function submitRenew() {
  const st = renewState.value
  if (!st || st.saving) return
  st.saving = true
  st.error = ''
  const failed = []
  let done = 0
  for (const t of st.targets) {
    try {
      if (st.exactDate) await setBusinessExpiry(t.business_id, st.exactDate)
      else await renewBusinessSubscription(t.business_id, st.months)
      done++
    } catch (error) {
      failed.push({ t, message: error?.message || 'Failed to renew.' })
    }
  }
  if (done) {
    logActivity('UPDATE', 'Tenant Subscription',
      `${st.exactDate ? `Set expiry to ${st.exactDate}` : `Renewed ${st.months} month(s)`} for ${done} business(es): ${st.targets.filter((t) => !failed.some((f) => f.t === t)).map((t) => t.business_name).join(', ')}`.slice(0, 500))
    await loadData({ silent: true })
  }
  if (failed.length) {
    // keep the modal open on just the ones that failed so they can retry
    st.targets = failed.map((f) => f.t)
    st.error = failed.map((f) => `${f.t.business_name}: ${f.message}`).join('\n')
    st.saving = false
    return
  }
  renewState.value = null
  clearSelection()
  showToast(done > 1 ? `Updated ${done} subscriptions` : 'Subscription updated')
}

const filteredBusinesses = computed(() => {
  let list = statusFilter.value === 'All'
    ? businesses.value
    : businesses.value.filter(b => b.status === statusFilter.value)

  if (lifecycleFilter.value === 'Expiring') list = list.filter(isExpiring)
  else if (lifecycleFilter.value === 'Expired') list = list.filter(isExpired)
  else if (lifecycleFilter.value === 'Inactive') list = list.filter(isInactive)

  const q = businessSearch.value.trim().toLowerCase()
  if (!q) return list

  return list.filter(b => [
    b.business_name, b.owner_full_name, b.owner_username,
    b.contact_email, b.contact_number, b.owner_contact_number, b.address,
  ].some(field => (field || '').toLowerCase().includes(q)))
})

// ---------- Sorting, pagination, selection ----------
const SORT_OPTIONS = [
  { value: '', label: 'Default order' },
  { value: 'expiry:asc', label: 'Expiring soonest' },
  { value: 'registered:desc', label: 'Newest registered' },
  { value: 'registered:asc', label: 'Oldest registered' },
  { value: 'bookings:desc', label: 'Most bookings' },
  { value: 'activity:asc', label: 'Least recently active' },
  { value: 'business:asc', label: 'Business A–Z' },
]
const DEFAULT_SORT_DIR = { business: 'asc', bookings: 'desc', registered: 'desc', expiry: 'asc', activity: 'asc' }
const PAGE_SIZES = [10, 25, 50]
const pageSize = ref(10)
const page = ref(1)
const sortKey = ref('')
const sortDir = ref('asc')

const sortSelect = computed({
  get: () => (sortKey.value ? `${sortKey.value}:${sortDir.value}` : ''),
  set: (v) => {
    if (!v) { sortKey.value = ''; sortDir.value = 'asc'; return }
    const [k, d] = v.split(':')
    sortKey.value = k
    sortDir.value = d
  },
})
function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = DEFAULT_SORT_DIR[key] || 'asc' }
}
function sortIcon(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}
function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

function sortValue(b, key) {
  switch (key) {
    case 'business': return (b.business_name || '').toLowerCase()
    case 'bookings': return Number(b.bookings_count) || 0
    case 'registered': return b.created_at ? Date.parse(b.created_at) : null
    case 'expiry': return b.days_left == null ? null : Number(b.days_left)
    // never active = oldest possible, so "least recently active" lists them first
    case 'activity': return b.last_activity_at ? Date.parse(b.last_activity_at) : -Infinity
    default: return null
  }
}

const sortedBusinesses = computed(() => {
  const key = sortKey.value
  if (!key) return filteredBusinesses.value
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredBusinesses.value].sort((a, b) => {
    const va = sortValue(a, key)
    const vb = sortValue(b, key)
    // rows with no value (e.g. no expiry set) always sink to the bottom
    if (va === null && vb === null) return 0
    if (va === null) return 1
    if (vb === null) return -1
    if (va < vb) return -1 * dir
    if (va > vb) return 1 * dir
    return (a.business_name || '').localeCompare(b.business_name || '')
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(sortedBusinesses.value.length / pageSize.value)))
const pagedBusinesses = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return sortedBusinesses.value.slice(start, start + pageSize.value)
})
const rangeStart = computed(() => (sortedBusinesses.value.length ? (page.value - 1) * pageSize.value + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, sortedBusinesses.value.length))

const hasActiveFilters = computed(() => statusFilter.value !== 'All' || !!lifecycleFilter.value || !!businessSearch.value.trim())
function clearFilters() {
  statusFilter.value = 'All'
  lifecycleFilter.value = ''
  businessSearch.value = ''
}

const statusCounts = computed(() => {
  const counts = { All: businesses.value.length }
  for (const f of FILTERS) if (f !== 'All') counts[f] = businesses.value.filter((b) => b.status === f).length
  return counts
})

const selectedIds = ref([])
const selectedSet = computed(() => new Set(selectedIds.value))
const selectedBusinesses = computed(() => businesses.value.filter((b) => selectedSet.value.has(b.business_id)))
const pageAllSelected = computed(() => pagedBusinesses.value.length > 0 && pagedBusinesses.value.every((b) => selectedSet.value.has(b.business_id)))
const pageSomeSelected = computed(() => pagedBusinesses.value.some((b) => selectedSet.value.has(b.business_id)))
const bulkRenewable = computed(() => selectedBusinesses.value.filter(canRenew))

function toggleSelect(id) {
  selectedIds.value = selectedSet.value.has(id) ? selectedIds.value.filter((x) => x !== id) : [...selectedIds.value, id]
}
function togglePage() {
  const pageIds = pagedBusinesses.value.map((b) => b.business_id)
  if (pageAllSelected.value) selectedIds.value = selectedIds.value.filter((id) => !pageIds.includes(id))
  else selectedIds.value = [...new Set([...selectedIds.value, ...pageIds])]
}
function selectAllMatching() { selectedIds.value = sortedBusinesses.value.map((b) => b.business_id) }
function clearSelection() { selectedIds.value = [] }

// Back to page 1 whenever the result set changes shape; drop selection that is no longer in view.
watch([statusFilter, lifecycleFilter, businessSearch, sortKey, sortDir, pageSize], () => { page.value = 1 })
watch([statusFilter, lifecycleFilter, businessSearch], () => { clearSelection() })
watch(totalPages, (n) => { if (page.value > n) page.value = n })
watch(businesses, (list) => {
  const ids = new Set(list.map((b) => b.business_id))
  if (selectedIds.value.some((id) => !ids.has(id))) selectedIds.value = selectedIds.value.filter((id) => ids.has(id))
})

// ---------- Small helpers used by the table ----------
function contactMain(b) { return b.contact_email || b.contact_number || b.owner_contact_number || '' }

const toast = ref('')
let toastTimer = null
function showToast(msg) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = '' }, 2500)
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast(`Copied ${text}`)
  } catch {
    showToast("Couldn't copy. Select the text and copy it manually.")
  }
}

function statusDotClass(status) {
  switch (status) {
    case 'Active': return 'bg-emerald-500'
    case 'Pending': return 'bg-amber-500'
    case 'Suspended': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

function lastActivityLabel(b) {
  if (!b.last_activity_at) return 'No bookings yet'
  const days = Math.floor((Date.now() - Date.parse(b.last_activity_at)) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} mo ago`
  return `${Math.floor(days / 365)} yr ago`
}

// ---------- "Needs attention" banner (only renders when something is > 0) ----------
const attentionItems = computed(() => {
  const items = []
  const pending = Number(stats.value.pending_businesses) || 0
  if (pending > 0) {
    items.push({
      key: 'pending', count: pending, label: 'Pending approval', hint: 'Review now',
      border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-600 dark:text-amber-400',
      run: () => { lifecycleFilter.value = ''; statusFilter.value = 'Pending' },
    })
  }
  if (lifecycleReady.value) {
    const c = lifecycleCounts.value
    if (c.expired > 0) items.push({
      key: 'expired', count: c.expired, label: 'Expired', hint: 'Subscription already ended',
      border: 'border-red-300 dark:border-red-700', text: 'text-red-600 dark:text-red-400',
      run: () => { statusFilter.value = 'All'; lifecycleFilter.value = 'Expired' },
    })
    if (c.expiring > 0) items.push({
      key: 'expiring', count: c.expiring, label: `Expiring in ${EXPIRY_WARN_DAYS} days`, hint: 'Renew before they lapse',
      border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-600 dark:text-amber-400',
      run: () => { statusFilter.value = 'All'; lifecycleFilter.value = 'Expiring' },
    })
    if (c.inactive > 0) items.push({
      key: 'inactive', count: c.inactive, label: `Inactive (${INACTIVE_DAYS}+ days)`, hint: 'Active, but no bookings',
      border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-700 dark:text-gray-200',
      run: () => { statusFilter.value = 'All'; lifecycleFilter.value = 'Inactive' },
    })
  }
  return items
})

// ---------- Trends (sparklines) ----------
const lastSixMonths = computed(() => {
  const now = new Date()
  const out = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: d.toLocaleDateString('en-PH', { month: 'short' }) })
  }
  return out
})
function monthKeyOf(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
const tenantTrend = computed(() => {
  const counts = new Map()
  for (const b of businesses.value) {
    if (!b.created_at) continue
    const k = monthKeyOf(b.created_at)
    counts.set(k, (counts.get(k) || 0) + 1)
  }
  return lastSixMonths.value.map((m) => ({ ...m, value: counts.get(m.key) || 0 }))
})
// null until tenant_analytics.sql is available; the tile then shows "not available".
const trendRows = ref(null)
const bookingsTrend = computed(() => {
  if (!trendRows.value) return null
  const sums = new Map()
  for (const r of trendRows.value) {
    const k = String(r.month).slice(0, 7)
    sums.set(k, (sums.get(k) || 0) + (Number(r.bookings) || 0))
  }
  return lastSixMonths.value.map((m) => ({ ...m, value: sums.get(m.key) || 0 }))
})
async function loadTrendRows() {
  try {
    const { from, to } = rangeDates('6M')
    trendRows.value = await getTenantAnalytics(from, to)
  } catch {
    trendRows.value = null
  }
}
function sparkPoints(values, w = 96, h = 28) {
  const max = Math.max(...values, 1)
  const step = values.length > 1 ? w / (values.length - 1) : w
  return values.map((v, i) => `${(i * step).toFixed(1)},${(h - 3 - (v / max) * (h - 6)).toFixed(1)}`).join(' ')
}
function sparkLast(values, w = 96, h = 28) {
  const max = Math.max(...values, 1)
  const i = values.length - 1
  const step = values.length > 1 ? w / (values.length - 1) : w
  return { x: (i * step).toFixed(1), y: (h - 3 - ((values[i] || 0) / max) * (h - 6)).toFixed(1) }
}
function trendDelta(values) {
  if (values.length < 2) return ''
  const diff = values[values.length - 1] - values[values.length - 2]
  if (diff === 0) return 'Same as last month'
  return `${diff > 0 ? '+' : ''}${diff} vs last month`
}
function trendDeltaClass(values) {
  if (values.length < 2) return 'text-gray-600 dark:text-gray-300'
  const diff = values[values.length - 1] - values[values.length - 2]
  if (diff > 0) return 'text-emerald-600 dark:text-emerald-400 font-semibold'
  if (diff < 0) return 'text-red-600 dark:text-red-400 font-semibold'
  return 'text-gray-600 dark:text-gray-300'
}

// ---------- Row actions menu (kebab) ----------
const menu = ref(null) // { business, left, top, bottom }
function rowMenuItems(b) {
  const items = []
  if (b.status === 'Pending') items.push({ key: 'Rejected', label: 'Reject', danger: true })
  if (canRenew(b) && lifecycleReady.value) {
    items.push({ key: 'renew', label: 'Renew subscription' })
    items.push({ key: 'expiry', label: b.subscription_expires_at ? 'Set exact expiry date' : 'Set expiry date' })
  }
  if (b.status === 'Active') items.push({ key: 'Suspended', label: 'Suspend', danger: true })
  if (['Suspended', 'Rejected', 'Closed'].includes(b.status)) items.push({ key: 'Active', label: 'Reactivate' })
  return items
}
function openMenu(b, ev) {
  if (menu.value?.business.business_id === b.business_id) { menu.value = null; return }
  const r = ev.currentTarget.getBoundingClientRect()
  const width = 208
  const estHeight = 44 + rowMenuItems(b).length * 40
  const openUp = r.bottom + estHeight > window.innerHeight && r.top > estHeight
  menu.value = {
    business: b,
    left: Math.min(Math.max(8, r.right - width), window.innerWidth - width - 8),
    top: openUp ? null : r.bottom + 4,
    bottom: openUp ? window.innerHeight - r.top + 4 : null,
  }
}
function closeMenu() { menu.value = null }
function runMenu(item) {
  const b = menu.value?.business
  closeMenu()
  if (!b) return
  if (item.key === 'renew') openRenew([b])
  else if (item.key === 'expiry') openRenew([b], true)
  else changeStatus(b, item.key)
}

// ---------- Details / audit trail modal ----------
const detailsBusiness = ref(null)
const auditTrail = ref([])
const isLoadingAudit = ref(false)
const auditError = ref('')

// Drill-down (Staff / Packages / Bookings actual rows, not just counts)
const drillDownTab = ref(null) // 'staff' | 'packages' | 'bookings' | null
const drillDownRows = ref([])
const isLoadingDrillDown = ref(false)
const drillDownError = ref('')

let detailsToken = 0
let drillToken = 0

async function openDetails(business) {
  const token = ++detailsToken
  drillToken++
  detailsBusiness.value = business
  auditTrail.value = []
  auditError.value = ''
  isLoadingAudit.value = true
  drillDownTab.value = null
  drillDownRows.value = []
  drillDownError.value = ''
  try {
    const rows = await getBusinessStatusAudit(business.business_id)
    if (token !== detailsToken) return // another business was opened meanwhile
    auditTrail.value = rows
  } catch (error) {
    if (token !== detailsToken) return
    // Show the real reason instead of always blaming the migration -- it
    // could equally be a permissions or network error.
    auditError.value = `Couldn't load status history: ${error?.message || 'unknown error'}`
  } finally {
    if (token === detailsToken) isLoadingAudit.value = false
  }
}

function closeDetails() {
  detailsToken++
  drillToken++
  detailsBusiness.value = null
  drillDownTab.value = null
}

async function toggleDrillDown(tab) {
  if (drillDownTab.value === tab) {
    drillDownTab.value = null
    return
  }
  const token = ++drillToken
  drillDownTab.value = tab
  drillDownRows.value = []
  drillDownError.value = ''
  isLoadingDrillDown.value = true
  try {
    const businessId = detailsBusiness.value.business_id
    let rows = []
    if (tab === 'staff') rows = await getBusinessStaffList(businessId)
    else if (tab === 'packages') rows = await getBusinessPackagesList(businessId)
    else if (tab === 'bookings') rows = await getBusinessBookingsList(businessId)
    if (token !== drillToken) return // user switched tab / closed the modal
    drillDownRows.value = rows
  } catch (error) {
    if (token !== drillToken) return
    drillDownError.value = error?.message || 'Failed to load this list.'
  } finally {
    if (token === drillToken) isLoadingDrillDown.value = false
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

function statusBadgeClass(status) {
  switch (status) {
    case 'Active': return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    case 'Pending': return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    case 'Suspended': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300'
    case 'Rejected':
    case 'Closed': return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    default: return 'bg-gray-100 text-gray-600'
  }
}

// silent = background refresh: no "Loading…" flash and no wiping the error
// banner, so the table doesn't blink after every approve/suspend or poll.
let loadToken = 0
async function loadData({ silent = false } = {}) {
  // Only the newest request may update the screen. Otherwise a slow 30s poll that
  // started BEFORE an Approve/Suspend could finish AFTER it and show the old status.
  const token = ++loadToken
  if (!silent) {
    isLoading.value = true
    errorMessage.value = ''
  }
  try {
    const [s, b, lifecycle] = await Promise.all([getPlatformStats(), getPlatformBusinesses(), getTenantLifecycle()])
    if (token !== loadToken) return
    // Spread over the defaults so a missing column never renders "undefined".
    stats.value = { ...stats.value, ...s }
    // Merge subscription/inactivity info (null = tenant_lifecycle.sql not run yet).
    // getTenantLifecycle() returns null on ANY error. If the script was already
    // working, treat null as a hiccup and keep the last good data instead of
    // hiding the Subscription column and alert cards until the next poll.
    const keepOld = lifecycle === null && lifecycleReady.value
    if (!keepOld) lifecycleReady.value = lifecycle !== null
    const lifeById = new Map((keepOld ? businesses.value : (lifecycle || [])).map((row) => [row.business_id, row]))
    businesses.value = b.map((row) => {
      const life = lifeById.get(row.business_id)
      return life
        ? { ...row, subscription_expires_at: life.subscription_expires_at, days_left: life.days_left, days_inactive: life.days_inactive, last_activity_at: life.last_activity_at }
        : row
    })
    // keep the open Details modal in sync with the fresh row
    if (detailsBusiness.value) {
      const fresh = businesses.value.find((x) => x.business_id === detailsBusiness.value.business_id)
      if (fresh) detailsBusiness.value = fresh
    }
  } catch (error) {
    if (token !== loadToken) return
    // If the session expired, don't just fail quietly forever -- send the
    // user back to login. (getSession() also tries to refresh the token, so
    // this only triggers when the session is really gone.)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      resetNotifications()
      router.push('/')
      return
    }
    if (!silent) errorMessage.value = error?.message || 'Failed to load platform data.'
  } finally {
    // Any request that is still the newest one clears the spinner -- not only
    // non-silent ones. Before, a silent poll that overtook the initial load
    // discarded its result AND left "Loading…" on screen forever.
    if (token === loadToken) isLoading.value = false
  }
}

// Themed replacement for window.confirm(): opens the modal declared in the
// template and resolves once the user picks Cancel or the action button.
// reason: null | 'optional' | 'required' adds a reason box. Resolves to false
// on cancel, or { reason } when confirmed.
const confirmState = ref(null)
function askConfirm(message, danger = true, actionLabel = null, reason = null) {
  confirmState.value?.resolve(false) // never leave an earlier prompt's promise hanging
  return new Promise((resolve) => {
    confirmState.value = { message, danger, actionLabel, reason, reasonText: '', error: '', resolve }
  })
}
function resolveConfirm(result) {
  const st = confirmState.value
  if (!st) return
  if (result) {
    const text = (st.reasonText || '').trim()
    if (st.reason === 'required' && text.length < 3) {
      st.error = 'Please enter a reason (at least 3 characters).'
      return
    }
    st.resolve({ reason: text })
  } else {
    st.resolve(false)
  }
  confirmState.value = null
}

async function changeStatus(business, newStatus) {
  // "Reactivate" (Suspended/Rejected -> Active) and "Approve" (Pending ->
  // Active) both land on the same newStatus === 'Active' branch, but they
  // need different wording -- "Approve" is misleading for a business that
  // was already live before being suspended.
  const isReactivate = newStatus === 'Active' && business.status !== 'Pending'
  const confirmMsgs = {
    Active: isReactivate
      ? `Reactivate "${business.business_name}"${business.status === 'Closed' ? ' (currently Closed)' : ''}? Its owner, staff, and business admin will be able to log in again.`
      : `Approve "${business.business_name}"? Its owner and staff will be able to log in.`,
    Suspended: `Suspend "${business.business_name}"? Its owner, staff, and business admin will be locked out immediately.`,
    Rejected: `Reject "${business.business_name}"'s registration?`,
  }
  let reason = ''
  if (confirmMsgs[newStatus]) {
    const actionLabel = isReactivate ? 'Yes, reactivate' : (newStatus === 'Active' ? 'Approve' : null)
    // Suspending / rejecting must be explained; reactivating may be.
    const reasonMode = (newStatus === 'Suspended' || newStatus === 'Rejected') ? 'required' : (isReactivate ? 'optional' : null)
    const result = await askConfirm(confirmMsgs[newStatus], newStatus !== 'Active', actionLabel, reasonMode)
    if (!result) return
    reason = result.reason || ''
  }

  pendingActionId.value = business.business_id
  errorMessage.value = ''
  try {
    await setBusinessStatus(business.business_id, newStatus)
    // Best-effort: record WHY in the platform audit log.
    const verb = newStatus === 'Active' ? (business.status === 'Pending' ? 'Approved' : 'Reactivated') : newStatus
    logActivity('UPDATE', 'Tenant Status', `${verb} "${business.business_name}" (was ${business.status})${reason ? `. Reason: ${reason}` : ''}`.slice(0, 500))
    await loadData({ silent: true })
    // Update the bell's red badge right away instead of waiting for its 20s poll.
    refreshPendingBusinesses()
  } catch (error) {
    errorMessage.value = error?.message || 'Failed to update status.'
  } finally {
    pendingActionId.value = null
  }
}

// ---------- Export: platform overview + businesses table as a real PDF ----------
function loadImageAsDataURL(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

function exportRows(selectedOnly) {
  return selectedOnly && selectedBusinesses.value.length ? selectedBusinesses.value : sortedBusinesses.value
}

function csvCell(v) {
  const s = v == null ? '' : String(v)
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportCSV(selectedOnly = false) {
  const rows = exportRows(selectedOnly)
  const head = ['Business', 'Owner', 'Owner username', 'Email', 'Phone', 'Address', 'Staff', 'Packages', 'Bookings', 'Registered', 'Status', ...(lifecycleReady.value ? ['Subscription expires', 'Days left', 'Last activity'] : [])]
  const lines = [head, ...rows.map((b) => [
    b.business_name, b.owner_full_name || '', b.owner_username || '', b.contact_email || '',
    b.contact_number || b.owner_contact_number || '', b.address || '',
    b.staff_count, b.packages_count, b.bookings_count,
    b.created_at ? String(b.created_at).slice(0, 10) : '', b.status,
    ...(lifecycleReady.value ? [b.subscription_expires_at ? String(b.subscription_expires_at).slice(0, 10) : '', b.days_left ?? '', b.last_activity_at ? String(b.last_activity_at).slice(0, 10) : ''] : []),
  ])]
  // BOM so Excel opens the UTF-8 file (₱, ñ, etc.) correctly
  const csv = '\uFEFF' + lines.map((l) => l.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `caterlytics-platform-${(selectedOnly && selectedBusinesses.value.length ? 'selected' : statusFilter.value.toLowerCase())}-${localToday()}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  logActivity('EXPORT', 'Platform Console', `Exported platform CSV (${rows.length} businesses, filter: ${statusFilter.value}${lifecycleFilter.value ? ' / ' + lifecycleFilter.value : ''})`)
  showToast(`Exported ${rows.length} business${rows.length === 1 ? '' : 'es'} to CSV`)
}

async function exportPDF(selectedOnly = false) {
  const rowsToExport = exportRows(selectedOnly)
  const usingSelection = selectedOnly && selectedBusinesses.value.length > 0
  const doc = new jsPDF()

  const logoDataUrl = await loadImageAsDataURL(logoUrl)
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', 14, 9, 16, 16)
  }
  const textX = logoDataUrl ? 34 : 14

  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('Caterlytics', textX, 19)

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100)
  doc.text('Platform Console — Super Admin Report', textX, 25)
  doc.text(usingSelection
    ? `Selection: ${rowsToExport.length} business${rowsToExport.length === 1 ? '' : 'es'}`
    : `Filter: ${statusFilter.value}${lifecycleFilter.value ? `  •  ${lifecycleFilter.value}` : ''}${businessSearch.value ? `  •  Search: "${businessSearch.value}"` : ''}`, 14, 34)
  doc.text(`Generated: ${new Date().toLocaleString('en-PH')}`, 14, 39)

  doc.setDrawColor(220)
  doc.line(14, 43, 196, 43)

  autoTable(doc, {
    startY: 50,
    head: [['Metric', 'Value']],
    body: [
      ['Total Businesses', String(stats.value.total_businesses)],
      ['Pending Approval', String(stats.value.pending_businesses)],
      ['Active Tenants', String(stats.value.active_businesses)],
      ['Suspended', String(stats.value.suspended_businesses)],
      ['Rejected', String(stats.value.rejected_businesses)],
      ['Closed', String(stats.value.closed_businesses)],
      ['Owners', String(stats.value.total_owners)],
      ['Staff / Business Admins', String(stats.value.total_staff)],
      ['Clients', String(stats.value.total_clients)],
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105] },
  })

  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY ?? 100) + 10,
    head: [['Business', 'Owner', 'Contact', 'Staff', 'Packages', 'Bookings', 'Registered', 'Status', ...(lifecycleReady.value ? ['Subscription'] : [])]],
    body: rowsToExport.map((b) => [
      b.business_name,
      b.owner_full_name || '—',
      b.contact_email || b.owner_contact_number || '—',
      String(b.staff_count),
      String(b.packages_count),
      String(b.bookings_count),
      formatDate(b.created_at),
      b.status,
      ...(lifecycleReady.value ? [b.subscription_expires_at ? formatDateOnly(b.subscription_expires_at) : 'No expiry set'] : []),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105] },
    styles: { fontSize: 8 },
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' })
  }

  const dateSlug = localToday()
  doc.save(`caterlytics-platform-${usingSelection ? 'selected' : statusFilter.value.toLowerCase()}-${dateSlug}.pdf`)
  // Audit: the Super Admin's exports are recorded like tenants' are.
  logActivity('EXPORT', 'Platform Console', `Exported platform report PDF (${rowsToExport.length} businesses, filter: ${statusFilter.value}${lifecycleFilter.value ? ' / ' + lifecycleFilter.value : ''})`)
}

let refreshTimer = null

let isLoggingOut = false
const handleLogout = async () => {
  if (isLoggingOut) return // double-click guard
  isLoggingOut = true
  try {
    await logoutUser()
  } catch (error) {
    console.error('Sign-out failed:', error)
  }
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  resetNotifications()
  router.push('/')
}

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }
  let user = {}
  try {
    user = JSON.parse(storedUser) || {}
  } catch {
    router.push('/')
    return
  }
  if (user.role !== 'Super Admin') {
    router.push('/')
    return
  }
  userName.value = user.full_name || user.username || 'Super Admin'
  loadData()
  loadTrendRows()
  // Pick up newly registered businesses / changes made elsewhere without a
  // manual refresh (the bell already polls every 20s; keep the table in step).
  refreshTimer = setInterval(() => {
    if (!document.hidden) loadData({ silent: true })
  }, 30000)
  window.addEventListener('keydown', onKeydown)
  // an open row menu is positioned against the viewport, so close it if the page moves
  window.addEventListener('scroll', closeMenu, true)
  window.addEventListener('resize', closeMenu)
})

function onKeydown(e) {
  if (e.key !== 'Escape') return
  if (menu.value) closeMenu()
  else if (confirmState.value) resolveConfirm(false)
  else if (renewState.value) closeRenew()
  else if (detailsBusiness.value) closeDetails()
}

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', closeMenu, true)
  window.removeEventListener('resize', closeMenu)
  clearTimeout(toastTimer)
  // never leave an awaiting changeStatus() hanging if we leave the page mid-confirm
  confirmState.value?.resolve(false)
})
</script>

<style scoped>
</style>