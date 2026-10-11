<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900 font-sans">

    <!-- MOBILE TOP BAR -->
    <div class="lg:hidden fixed top-0 inset-x-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 py-3 print:hidden">
      <button @click="isMobileSidebarOpen = true" class="p-2 -ml-2 rounded-none text-gray-600 dark:text-gray-300">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <span class="font-bold text-gray-800 dark:text-gray-100 truncate">Caterlytics</span>
      </div>
      <NotificationBell />
    </div>

    <!-- MOBILE BACKDROP -->
    <div v-if="isMobileSidebarOpen" @click="isMobileSidebarOpen = false" class="fixed inset-0 bg-black/40 z-40 lg:hidden"></div>

    <!-- SIDEBAR -->
    <aside
      :class="[sidebarExpanded ? 'w-64' : 'w-20', isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']"
      class="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 h-screen fixed lg:sticky top-0 left-0 z-50 lg:z-auto"
    >
      <div class="flex items-center justify-between gap-2 p-4">
        <!-- COLLAPSED: logo itself is the toggle -->
        <div
          v-if="!sidebarExpanded"
          class="relative flex items-center justify-center w-8 h-8 cursor-pointer select-none rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          @mouseenter="isLogoHovered = true"
          @mouseleave="isLogoHovered = false"
          @click="toggleSidebar"
        >
          <img v-if="!isLogoHovered" :src="logoUrl" alt="Logo" class="w-8 h-8 object-contain flex-shrink-0" />
          <svg v-else class="w-6 h-6 flex-shrink-0 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke-width="1.5" />
            <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" stroke-width="1.5" />
          </svg>

          <div v-if="isLogoHovered" class="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-[60] pointer-events-none">
            Open sidebar
          </div>
        </div>

        <!-- EXPANDED: static logo + name on the left -->
        <div v-else class="flex items-center gap-2 overflow-hidden">
          <img :src="logoUrl" alt="Logo" class="w-8 h-8 object-contain flex-shrink-0" />
          <span class="font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap">Caterlytics</span>
        </div>

        <!-- EXPANDED: dedicated toggle button on the right, like Gemini's collapse icon -->
        <div v-if="sidebarExpanded" class="relative flex-shrink-0">
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center rounded-none text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            @mouseenter="isLogoHovered = true"
            @mouseleave="isLogoHovered = false"
            @click="toggleSidebar"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke-width="1.5" />
              <line x1="9.5" y1="4.5" x2="9.5" y2="19.5" stroke-width="1.5" />
            </svg>
          </button>

          <div v-if="isLogoHovered" class="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg z-[60] pointer-events-none">
            Close sidebar
          </div>
        </div>
      </div>

      <nav class="flex-1 px-3 mt-6 space-y-1 overflow-y-auto">

        <a v-for="item in navItems" :key="item.name"
          href="#"
          @click.prevent="goTo(item)"
          :class="item.name === 'Inventory' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
          class="relative flex items-center gap-3 px-3 py-2.5 rounded-none text-sm transition"
        >
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.iconPath" />
          </svg>
          <span v-if="sidebarExpanded" class="whitespace-nowrap">{{ item.name }}</span>
          <span
            v-if="item.name === 'Support Chat' && chatUnread"
            :class="sidebarExpanded ? 'ml-auto min-w-[20px] h-5 px-1.5' : 'absolute top-1 right-1 min-w-[16px] h-4 px-1'"
            class="rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow"
          >{{ chatUnread > 99 ? '99+' : chatUnread }}</span>
          <span
            v-if="item.name === 'Feedback & Ratings' && reviewPending"
            :class="sidebarExpanded ? 'ml-auto min-w-[20px] h-5 px-1.5' : 'absolute top-1 right-1 min-w-[16px] h-4 px-1'"
            class="rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow"
          >{{ reviewPending > 99 ? '99+' : reviewPending }}</span>
        </a>
      </nav>

      <div class="border-t border-gray-200 dark:border-gray-700 p-3 relative">
        <!-- Click-outside backdrop -->
        <div v-if="showAccountMenu" @click="showAccountMenu = false" class="fixed inset-0 z-40"></div>

        <!-- Account menu (Log Out) -->
        <div v-if="showAccountMenu" class="absolute bottom-full left-2 mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-none shadow-lg overflow-hidden z-50">
          <button v-if="userRole === 'Admin' || userRole === 'Owner/Manager'" @click="showAccountMenu = false; router.push('/settings')" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
          <button @click="handleLogout" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
        </div>

        <!-- Profile: click toggles the account menu -->
        <div @click="showAccountMenu = !showAccountMenu" class="flex items-center gap-3 px-2 py-2 rounded-none hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
          <div class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
            <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="Profile picture" class="w-full h-full object-cover" />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div v-if="sidebarExpanded" class="overflow-hidden">
            <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ userRole }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="flex-1 p-4 sm:p-8 pt-20 lg:pt-8 overflow-x-hidden w-full min-w-0">
      <div class="max-w-none 2xl:max-w-[1920px] mx-auto">

        <!-- Toolbar -->
        <div class="flex flex-row items-center justify-between gap-2 sm:gap-3 mb-4">
          <div class="relative flex-1 max-w-sm">
            <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by item or category..."
              class="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div class="flex items-center gap-3 flex-shrink-0">
            <div class="hidden lg:block">
              <NotificationBell />
            </div>
            <button @click="exportCsv" :disabled="!filteredItems.length" class="hidden sm:flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 whitespace-nowrap" title="Download the list below as a CSV file">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              Export CSV
            </button>
            <button @click="openCreateModal" class="flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2.5 sm:px-4 rounded-none font-semibold text-sm hover:bg-emerald-700 transition whitespace-nowrap min-w-[172px]">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Item
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="!isLoading && items.length" class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Items</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 tabular-nums">{{ items.length }}</p>
          </div>
          <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Stock value</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1 tabular-nums">₱{{ formatMoney(totalStockValue) }}</p>
          </div>
          <button type="button" @click="levelFilter = lowStockItems.length ? 'low' : 'near'" class="text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 hover:border-amber-400">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Needs restock</p>
            <p :class="lowStockItems.length ? 'text-red-600 dark:text-red-400' : nearLowItems.length ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'" class="text-2xl font-bold mt-1 tabular-nums">
              {{ lowStockItems.length + nearLowItems.length }}
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400">{{ lowStockItems.length }} low · {{ nearLowItems.length }} running low</span>
            </p>
          </button>
          <button type="button" @click="levelFilter = 'expiring'" class="text-left bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 hover:border-amber-400">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Expiring (within {{ EXPIRING_SOON_DAYS }} days)</p>
            <p :class="expiringItems.length ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-gray-100'" class="text-2xl font-bold mt-1 tabular-nums">{{ expiringItems.length }}</p>
          </button>
        </div>

        <!-- Low Stock Alert -->
        <div v-if="lowStockItems.length > 0" role="alert" class="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 p-3">
          <div class="flex gap-2 flex-1 min-w-0 text-red-700 dark:text-red-300 text-sm font-medium">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 003.82 21h16.36a2 2 0 001.71-3l-8.18-14.14a2 2 0 00-3.42 0z" />
            </svg>
            <span>{{ lowStockItems.length }} item(s) at or below threshold: {{ lowStockItems.map(i => i.item_name).join(', ') }}</span>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button type="button" @click="levelFilter = 'low'" class="px-3 py-1.5 text-xs font-semibold border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40">Show them</button>
            <button type="button" @click="reorderAll" class="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white hover:bg-red-700">Reorder</button>
          </div>
        </div>

        <!-- Expiry alert -->
        <div v-if="expiryAlertItems.length > 0" role="alert" class="mb-4 flex flex-col sm:flex-row sm:items-center gap-3 border border-amber-200 dark:border-amber-900/60 border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 p-3">
          <div class="flex gap-2 flex-1 min-w-0 text-amber-800 dark:text-amber-300 text-sm font-medium">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ expiryAlertItems.map(i => `${i.item_name} (${expiryInfo(i).label.toLowerCase()})`).join(', ') }}. Use it first, or log it as waste if it has spoiled.</span>
          </div>
          <div class="flex gap-2 flex-shrink-0">
            <button type="button" @click="levelFilter = 'expiring'" class="px-3 py-1.5 text-xs font-semibold border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40">Show them</button>
            <button type="button" @click="router.push('/admin/waste')" class="px-3 py-1.5 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700">Waste Tracking</button>
          </div>
        </div>

        <!-- Error Banner -->
        <div v-if="pageError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ pageError }}
        </div>

        <!-- Needs for upcoming events -->
        <div class="mb-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <button type="button" @click="showForecast = !showForecast" class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left" :aria-expanded="showForecast">
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">Needs for upcoming events</p>
              <p :class="forecastShort.length ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-gray-500 dark:text-gray-400'" class="text-xs mt-0.5">{{ forecastSummary }}</p>
            </div>
            <svg :class="showForecast ? 'rotate-180' : ''" class="w-4 h-4 text-gray-400 shrink-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="showForecast" class="border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-5">
            <p v-if="forecastLoading && !forecast" class="text-sm text-gray-400 dark:text-gray-500">Checking pending events...</p>
            <p v-else-if="forecastError" class="text-sm text-red-600 dark:text-red-400">{{ forecastError }}</p>
            <p v-else-if="forecast && !forecast.events.length" class="text-sm text-gray-500 dark:text-gray-400">
              No upcoming Pending events. Confirmed events have already had their ingredients deducted from stock above.
            </p>

            <template v-else-if="forecast">
              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Ingredients needed</p>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                      <tr>
                        <th class="text-left py-2 pr-4 font-semibold">Item</th>
                        <th class="text-right py-2 px-4 font-semibold">Needed</th>
                        <th class="text-right py-2 px-4 font-semibold">In stock</th>
                        <th class="text-left py-2 pl-4 font-semibold">Result</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                      <tr v-for="f in forecastRows" :key="f.item_id" class="text-gray-700 dark:text-gray-300">
                        <td class="py-2 pr-4 font-medium text-gray-800 dark:text-gray-100">{{ f.name }}</td>
                        <td class="py-2 px-4 text-right tabular-nums">{{ formatQty(f.needed, f.unit) }}</td>
                        <td class="py-2 px-4 text-right tabular-nums">{{ formatQty(f.in_stock, f.unit) }}</td>
                        <td class="py-2 pl-4 text-xs font-semibold">
                          <span v-if="f.short_by > 0" class="text-red-600 dark:text-red-400">Short by {{ formatQty(f.short_by, f.unit) }}</span>
                          <span v-else class="text-emerald-600 dark:text-emerald-400">Enough</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button v-if="forecast.items.length > forecastRows.length || showAllForecast" type="button" @click="showAllForecast = !showAllForecast" class="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  {{ showAllForecast ? 'Show only items that are short' : `Show all ${forecast.items.length} ingredients` }}
                </button>
              </div>

              <div>
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">By event (soonest first)</p>
                <ul class="space-y-1.5">
                  <li v-for="e in forecast.events" :key="e.booking_id" class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-gray-700 dark:text-gray-300">
                    <span class="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{{ formatEventDate(e.event_date) }}</span>
                    <span class="capitalize">{{ e.client_name }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{ e.guest_count }} guests · {{ e.package_name || 'No package' }}</span>
                    <span v-if="!e.hasRecipe" class="text-xs font-semibold text-gray-500 dark:text-gray-400">No ingredients set up for this package</span>
                    <span v-else-if="e.shortLines.length" class="text-xs font-semibold text-red-600 dark:text-red-400">Short: {{ e.shortLines.map(l => l.name).join(', ') }}</span>
                    <span v-else class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Enough stock</span>
                  </li>
                </ul>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <p class="text-[11px] text-gray-400 dark:text-gray-500">
                  Only Pending events are counted: Confirmed events already deducted their ingredients.
                  <span v-if="forecast.totalPending > forecast.shown">Showing the next {{ forecast.shown }} of {{ forecast.totalPending }}.</span>
                  <span v-if="forecast.failed" class="text-amber-600 dark:text-amber-400"> {{ forecast.failed }} event(s) couldn't be checked.</span>
                </p>
                <button v-if="forecastShort.length" type="button" @click="reorderAll" class="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shrink-0">Reorder what's needed</button>
              </div>
            </template>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
          <div class="flex gap-1 overflow-x-auto -mx-1 px-1" role="tablist" aria-label="Filter by stock level">
            <button
              v-for="c in levelChips" :key="c.value"
              type="button" role="tab"
              :aria-selected="levelFilter === c.value"
              @click="levelFilter = c.value"
              :class="levelFilter === c.value
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-500'"
              class="flex items-center gap-1.5 px-3 py-2 border text-sm font-semibold whitespace-nowrap transition"
            >
              {{ c.label }}
              <span :class="levelFilter === c.value ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'" class="min-w-[20px] px-1.5 text-[11px] leading-5 text-center">{{ c.count }}</span>
            </button>
          </div>

          <div class="flex gap-2">
            <select v-model="categoryFilter" aria-label="Filter by category" class="py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">All categories</option>
              <option v-for="c in categoryOptions" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="sortKey" aria-label="Sort by" class="md:hidden py-2.5 px-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
              <option v-for="o in sortOptions" :key="o.value" :value="o.value">Sort: {{ o.label }}</option>
            </select>
          </div>
        </div>

        <!-- Inventory — mobile card list (phone-friendly, replaces the table below md) -->
        <div class="md:hidden space-y-3">
          <div v-if="isLoading" class="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Loading inventory...</div>
          <div v-else-if="filteredItems.length === 0" class="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
            {{ items.length === 0 ? 'No items yet. Tap "New Item" to add one.' : 'No items match your filters.' }}
          </div>
          <div
            v-for="i in filteredItems" :key="i.item_id"
            class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-none p-4"
          >
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-gray-100 truncate">{{ i.item_name }}</p>
                <p v-if="i.category" class="text-xs text-gray-500 dark:text-gray-400">{{ i.category }}</p>
              </div>
              <span :class="LEVELS[stockLevel(i)].text" class="shrink-0 text-xs font-semibold leading-5">{{ LEVELS[stockLevel(i)].label }}</span>
            </div>

            <div class="flex items-center justify-between mb-1.5">
              <span class="text-lg font-bold text-gray-800 dark:text-gray-100 tabular-nums">{{ formatQty(i.quantity, i.unit || 'kg') }}</span>
              <p class="text-xs text-gray-500 dark:text-gray-400">Alert at {{ formatQty(i.low_stock_threshold, i.unit || 'kg') }}</p>
            </div>
            <div class="h-1.5 bg-gray-100 dark:bg-gray-700 mb-3" role="presentation">
              <div :class="LEVELS[stockLevel(i)].bar" class="h-full" :style="{ width: Math.round(stockRatio(i) * 100) + '%' }"></div>
            </div>

            <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <p>Unit cost: ₱{{ formatCost(i.unit_cost) }}</p>
              <p>Value: ₱{{ formatMoney(stockValue(i)) }}</p>
              <p v-if="expiryInfo(i)" :class="EXPIRY_TEXT[expiryInfo(i).state]" class="font-semibold">{{ expiryInfo(i).label }}</p>
              <p v-if="lastMoved[i.item_id]">Updated {{ timeAgo(lastMoved[i.item_id]) }}</p>
              <p v-if="needByItem.get(i.item_id)?.short_by > 0" class="col-span-2 font-semibold text-red-600 dark:text-red-400">Short by {{ formatQty(needByItem.get(i.item_id).short_by, i.unit || 'kg') }} for pending events</p>
            </div>

            <div class="flex gap-2 mb-3">
              <button
                @click="openAdjustModal(i)"
                class="flex-1 py-2.5 rounded-none text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
              >
                Stock In / Out
              </button>
              <button
                v-if="needsReorder(i)"
                @click="reorderItem(i)"
                class="flex-1 py-2.5 rounded-none text-sm font-semibold text-white bg-emerald-600 active:bg-emerald-700"
              >
                Reorder
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="openEditModal(i)"
                class="flex-1 py-2.5 rounded-none text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 active:bg-emerald-100 dark:active:bg-emerald-900/40"
              >
                Edit
              </button>
              <button
                @click="confirmDelete(i)"
                class="w-11 h-11 flex items-center justify-center rounded-none text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 active:bg-red-50 dark:active:bg-red-900/30 active:text-red-600"
                title="Delete"
                aria-label="Delete item"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Inventory Table — desktop / tablet -->
        <div class="hidden md:block bg-white dark:bg-gray-800 rounded-none shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
                <tr>
                  <th v-for="c in columns" :key="c.key" :class="[c.align === 'right' ? 'text-right' : 'text-left', c.cls]" class="px-4 py-3 font-semibold whitespace-nowrap" :aria-sort="sortKey === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'">
                    <button v-if="c.sortable" type="button" @click="setSort(c.key)" :class="sortKey === c.key ? 'text-emerald-600 dark:text-emerald-400' : ''" class="inline-flex items-center gap-1 uppercase font-semibold tracking-wide hover:text-emerald-600 dark:hover:text-emerald-400">
                      {{ c.label }}
                      <span class="w-3 text-[10px]" aria-hidden="true">{{ sortKey === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
                    </button>
                    <span v-else>{{ c.label }}</span>
                  </th>
                  <th class="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                <tr v-if="isLoading">
                  <td colspan="8" class="text-center py-10 text-gray-400 dark:text-gray-500">Loading inventory...</td>
                </tr>
                <tr v-else-if="filteredItems.length === 0">
                  <td colspan="8" class="text-center py-10 text-gray-400 dark:text-gray-500">
                    {{ items.length === 0 ? 'No items yet. Click "New Item" to add one.' : 'No items match your filters.' }}
                  </td>
                </tr>
                <tr v-for="i in filteredItems" :key="i.item_id" class="hover:bg-gray-50/60 dark:hover:bg-gray-700/60">
                  <td class="px-4 py-3.5 min-w-[12rem]">
                    <button type="button" @click="openAdjustModal(i)" class="font-medium text-left text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline" title="Stock in/out and history">{{ i.item_name }}</button>
                    <div v-if="i.category || supplierName(i.supplier_id)" class="text-xs text-gray-500 dark:text-gray-400">
                      {{ [i.category, supplierName(i.supplier_id)].filter(Boolean).join(' · ') }}
                    </div>
                  </td>
                  <td class="px-4 py-3.5 text-right min-w-[8rem]">
                    <div class="font-semibold text-gray-800 dark:text-gray-100 tabular-nums">{{ formatQty(i.quantity, i.unit || 'kg') }}</div>
                    <div class="h-1.5 bg-gray-100 dark:bg-gray-700 mt-1 ml-auto w-24" role="presentation">
                      <div :class="LEVELS[stockLevel(i)].bar" class="h-full" :style="{ width: Math.round(stockRatio(i) * 100) + '%' }"></div>
                    </div>
                    <div v-if="lastMoved[i.item_id]" class="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">updated {{ timeAgo(lastMoved[i.item_id]) }}</div>
                  </td>
                  <td class="px-4 py-3.5 text-right text-gray-600 dark:text-gray-300 tabular-nums hidden xl:table-cell">{{ formatQty(i.low_stock_threshold, i.unit || 'kg') }}</td>
                  <td class="px-4 py-3.5 text-right text-gray-600 dark:text-gray-300 tabular-nums">₱{{ formatCost(i.unit_cost) }}</td>
                  <td class="px-4 py-3.5 text-right text-gray-800 dark:text-gray-100 tabular-nums">₱{{ formatMoney(stockValue(i)) }}</td>
                  <td class="px-4 py-3.5 whitespace-nowrap">
                    <span v-if="expiryInfo(i)" :class="EXPIRY_TEXT[expiryInfo(i).state]" class="text-xs font-semibold">{{ expiryInfo(i).label }}</span>
                    <span v-else class="text-xs text-gray-400 dark:text-gray-500">—</span>
                    <div v-if="expiryInfo(i)" class="text-[11px] text-gray-400 dark:text-gray-500">{{ formatEventDate(i.expiry_date) }}</div>
                  </td>
                  <td class="px-4 py-3.5 align-middle">
                    <span :class="LEVELS[stockLevel(i)].text" class="inline-block align-middle text-xs font-semibold leading-5">{{ LEVELS[stockLevel(i)].label }}</span>
                    <div v-if="needByItem.get(i.item_id)?.short_by > 0" class="text-[11px] font-semibold text-red-600 dark:text-red-400">Short for pending events</div>
                  </td>
                  <td class="px-4 py-3.5">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="openAdjustModal(i)" class="px-3 h-8 flex items-center justify-center rounded-none border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" title="Stock In / Out">Adjust</button>
                      <button v-if="needsReorder(i)" @click="reorderItem(i)" class="px-3 h-8 flex items-center justify-center rounded-none bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700" :title="`Order about ${reorderQtyFor(i)} ${i.unit || 'kg'} from a supplier`">Reorder</button>
                      <button @click="openEditModal(i)" class="w-8 h-8 flex items-center justify-center rounded-none text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Edit item" aria-label="Edit item">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click="confirmDelete(i)" class="w-8 h-8 flex items-center justify-center rounded-none text-red-400 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete item" aria-label="Delete item">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- ============ CREATE / EDIT MODAL ============ -->
    <div v-if="showFormModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">{{ editingItem ? 'Edit Item' : 'New Item' }}</h3>

        <div v-if="modalError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ modalError }}
        </div>

        <form @submit.prevent="handleSaveItem" class="space-y-4">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Item Name</label>
            <input type="text" v-model="form.item_name" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Unit</label>
              <select v-model="form.unit" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" required>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="pcs">Pieces (pcs)</option>
                <option value="pack">Pack</option>
              </select>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">How this item is counted in the storeroom.</p>
              <p v-if="unitChanged" class="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Changing the unit does not convert existing numbers. Only allowed if no package or dish uses this item.</p>
            </div>
            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Quantity ({{ form.unit }})</label>
              <input type="number" min="0" step="1" v-model.number="form.quantity" :disabled="!!editingItem" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" required />
              <p v-if="editingItem" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">To change stock, close this and use Adjust / Stock In-Out.</p>
            </div>
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Low Stock Threshold ({{ form.unit }})</label>
            <input type="number" min="0" step="1" v-model.number="form.low_stock_threshold" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">The system will alert you when stock reaches this level or lower.</p>
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Unit Cost (₱ per {{ form.unit }})</label>
            <input type="number" min="0" step="0.01" v-model.number="form.unit_cost" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Used to compute food costing/margin per package.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Category</label>
              <select v-model="form.category" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
                <option value="">No category</option>
                <option v-for="c in formCategoryOptions" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Usual supplier</label>
              <select v-model="form.supplier_id" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
                <option value="">None</option>
                <option v-for="sp in formSupplierOptions" :key="sp.supplier_id" :value="sp.supplier_id">{{ sp.supplier_name }}{{ sp.is_active ? '' : ' (inactive)' }}</option>
              </select>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Pre-selected when you tap Reorder.</p>
            </div>
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Expiry date (optional)</label>
            <input type="date" v-model="form.expiry_date" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">The earliest expiry of what is in the storeroom. Update it when a new batch arrives.</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeFormModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" :disabled="isSaving" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
              {{ isSaving ? 'Saving...' : (editingItem ? 'Save Changes' : 'Create Item') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============ DELETE CONFIRM MODAL ============ -->
    <div v-if="itemToDelete" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Item?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently remove <span class="font-semibold text-gray-700 dark:text-gray-200">{{ itemToDelete.item_name }}</span> from inventory.
        </p>
        <p v-if="usageMessage" class="text-sm text-amber-600 dark:text-amber-400 mb-4">{{ usageMessage }}</p>
        <p v-if="deleteError" class="text-sm text-red-600 dark:text-red-400 mb-4">{{ deleteError }}</p>
        <div class="flex gap-3">
          <button @click="closeDelete" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button @click="handleDelete" :disabled="isDeleting || blockedByUsage" class="flex-1 bg-red-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-red-700 disabled:opacity-50">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ STOCK IN / OUT MODAL ============ -->
    <div v-if="showAdjustModal && adjustItem" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Adjust Stock</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ adjustItem.item_name }}</span>
          — current: {{ formatQty(adjustItem.quantity, adjustItem.unit || 'kg') }}
        </p>

        <div v-if="adjustError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{{ adjustError }}</div>
        <div v-if="inventoryStatus.historyMissing || movementsUnavailable" class="text-amber-700 dark:text-amber-300 text-xs font-medium mb-4">
          Stock history isn't enabled on the database yet, so reasons and notes are not saved. Ask your developer to run inventory_fixes.sql.
        </div>
        <div v-if="inventoryStatus.setCountLegacy" class="text-amber-700 dark:text-amber-300 text-xs font-medium mb-4">
          "Set Count" is running in compatibility mode and can be off if a booking is confirmed at the same moment. Ask your developer to run inventory_set_stock.sql.
        </div>

        <div class="grid grid-cols-3 gap-2 mb-4">
          <button v-for="m in adjustModes" :key="m.value" type="button" @click="adjustMode = m.value"
            :class="adjustMode === m.value ? 'bg-emerald-600 text-white border-emerald-600' : 'text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600'"
            class="py-2 text-xs font-semibold border rounded-none">{{ m.label }}</button>
        </div>

        <form @submit.prevent="submitAdjust" class="space-y-4">
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {{ adjustMode === 'in' ? 'Amount to add' : adjustMode === 'out' ? 'Amount to remove' : 'Counted quantity' }} ({{ adjustItem.unit || 'kg' }})
            </label>
            <input type="number" min="0" step="1" v-model.number="adjustAmount" required
              class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            <p v-if="adjustPreviewInvalid" class="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
              Not enough stock. Only {{ formatQty(adjustItem.quantity, adjustItem.unit || 'kg') }} available.
            </p>
            <p v-else-if="adjustPreview !== null" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
              New quantity: {{ formatQty(adjustPreview, adjustItem.unit || 'kg') }}
            </p>
          </div>
          <div v-if="adjustMode !== 'set'">
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Reason</label>
            <select v-model="adjustReason"
              class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
              <option v-for="r in reasonOptions" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Note (optional)</label>
            <input type="text" maxlength="200" v-model="adjustNote"
              class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeAdjustModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" :disabled="isAdjusting || adjustPreviewInvalid" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
              {{ isAdjusting ? 'Saving...' : 'Apply' }}
            </button>
          </div>
        </form>

        <div v-if="movements && movements.length" class="mt-6 border-t border-gray-100 dark:border-gray-700 pt-4">
          <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Recent movements</p>
          <ul class="space-y-1.5">
            <li v-for="m in movements" :key="m.movement_id" class="flex items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-300">
              <span class="truncate">{{ formatMoveDate(m.created_at) }} · {{ m.reason || 'Adjustment' }}<span v-if="m.note"> — {{ m.note }}</span></span>
              <span :class="Number(m.delta) < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'" class="font-semibold shrink-0">
                {{ Number(m.delta) > 0 ? '+' : '' }}{{ formatQty(m.delta, adjustItem.unit || 'kg') }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { logoutUser } from '../services/authService'
import { resetNotifications } from '../composables/useNotifications'
import logoUrl from '../Assets/logofinal.png'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabaseClient'
import NotificationBell from '../Components/NotificationBell.vue'
import { useSidebarState } from '../composables/useSidebarState'
import { useChatUnread } from '../composables/useChatUnread'
import { useReviewAlerts } from '../composables/useReviewAlerts'
import { useRouter } from 'vue-router'
import {
  getAllInventory,
  createInventoryItem,
  updateInventoryItem,
  adjustInventoryStock,
  setInventoryStock,
  deleteInventoryItem,
  getItemUsage,
  getInventoryMovements,
  getInventoryItem,
  inventoryStatus,
  getLastMovementDates,
  getUpcomingNeeds
} from '../services/inventoryService'
import { getSuppliers } from '../services/supplierservice'
import { localToday } from '../utils/date'
import {
  isLowStock as isLow, formatQty, formatCost, formatMoney, stockLevel, stockRatio, stockValue,
  expiryInfo, suggestedReorderQty, timeAgo, ITEM_CATEGORIES, EXPIRING_SOON_DAYS
} from '../utils/inventory'

const router = useRouter()

const { isSidebarOpen, isMobileSidebarOpen, sidebarExpanded } = useSidebarState()
const { chatUnread } = useChatUnread()
const { reviewPending } = useReviewAlerts()
const isLogoHovered = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
  isLogoHovered.value = false
}
const showAccountMenu = ref(false)
const userName = ref('User')
const userRole = ref('Staff')
const userInitial = ref('U')
const userAvatarUrl = ref('')

const items = ref([])
const isLoading = ref(false)
const pageError = ref('')
const searchQuery = ref('')

const showFormModal = ref(false)
const editingItem = ref(null)
const isSaving = ref(false)
const modalError = ref('')

const itemToDelete = ref(null)
const isDeleting = ref(false)

const emptyForm = () => ({ item_name: '', quantity: 0, low_stock_threshold: 5, unit_cost: 0, unit: 'kg', category: '', supplier_id: '', expiry_date: '' })

const form = ref(emptyForm())

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }
  const user = JSON.parse(storedUser)
  // Staff has no Inventory access (same as the route guard in main.js).
  if (!['Admin', 'Owner/Manager'].includes(user.role)) {
    router.push('/')
    return
  }
  const displayName = user.full_name || user.username || 'User'
  userName.value = displayName
  userRole.value = user.role
  userInitial.value = displayName.charAt(0).toUpperCase()
  userAvatarUrl.value = user.avatar_url || ''

  fetchItems()
  loadSuppliers()
  refreshExtras()
  startLiveUpdates()
})

onUnmounted(stopLiveUpdates)

// ---------- Live updates ----------
// Stock changes from somewhere else (a booking Confirmed in another tab or on
// another device, or a teammate's Stock In/Out) show up here without a manual
// refresh. Realtime is the fast path; refetching when the tab regains focus
// covers the case where the websocket dropped or Realtime isn't enabled.
let inventoryChannel = null
let liveRefreshTimer = null

// Confirming a booking updates many items at once -> a burst of events.
// Debounce so we refetch once, not once per row.
function scheduleLiveRefresh() {
  clearTimeout(liveRefreshTimer)
  liveRefreshTimer = setTimeout(async () => {
    await fetchItems({ silent: true })
    refreshExtras()
    // Keep the item being edited in sync with the database so nothing below
    // (unit-change detection, quantity shown) is computed from a stale copy.
    if (showFormModal.value && editingItem.value) {
      const freshEdit = items.value.find((i) => i.item_id === editingItem.value.item_id)
      if (freshEdit) editingItem.value = freshEdit
      else modalError.value = 'This item was deleted by someone else. Close this window and refresh.'
    }
    if (showAdjustModal.value && adjustItem.value) {
      const fresh = items.value.find((i) => i.item_id === adjustItem.value.item_id)
      if (fresh) adjustItem.value = fresh
      movements.value = await getInventoryMovements(adjustItem.value.item_id, 10)
      movementsUnavailable.value = movements.value === null
    }
  }, 400)
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') scheduleLiveRefresh()
}

function startLiveUpdates() {
  inventoryChannel = supabase
    .channel('inventory-page-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tbl_inventory' }, scheduleLiveRefresh)
    .subscribe()
  document.addEventListener('visibilitychange', onVisibilityChange)
}

function stopLiveUpdates() {
  clearTimeout(liveRefreshTimer)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (inventoryChannel) {
    supabase.removeChannel(inventoryChannel)
    inventoryChannel = null
  }
}

async function fetchItems({ silent = false } = {}) {
  if (!silent) isLoading.value = true
  pageError.value = ''
  try {
    items.value = await getAllInventory()
  } catch (error) {
    pageError.value = 'Failed to load inventory. Please refresh the page.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

// ---------- Filters, sorting, summary ----------
const levelFilter = ref('all') // 'all' | 'low' | 'near' | 'expiring'
const categoryFilter = ref('')
const sortKey = ref('status')
const sortDir = ref('asc')

const LEVELS = {
  low: { label: 'Low Stock', text: 'text-red-700 dark:text-red-300', bar: 'bg-red-500' },
  near: { label: 'Running low', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' },
  ok: { label: 'OK', text: 'text-emerald-700 dark:text-emerald-300', bar: 'bg-emerald-500' }
}
const EXPIRY_TEXT = {
  expired: 'text-red-600 dark:text-red-400',
  soon: 'text-amber-600 dark:text-amber-400',
  ok: 'text-gray-500 dark:text-gray-400'
}

const columns = [
  { key: 'item', label: 'Item', align: 'left', sortable: true },
  { key: 'quantity', label: 'Quantity', align: 'right', sortable: true },
  { key: 'threshold', label: 'Alert at', align: 'right', sortable: false, cls: 'hidden xl:table-cell' },
  { key: 'cost', label: 'Unit cost', align: 'right', sortable: true },
  { key: 'value', label: 'Stock value', align: 'right', sortable: true },
  { key: 'expiry', label: 'Expiry', align: 'left', sortable: true },
  { key: 'status', label: 'Status', align: 'left', sortable: true }
]
const sortOptions = [
  { value: 'status', label: 'Status (low first)' },
  { value: 'item', label: 'Name' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'value', label: 'Stock value' },
  { value: 'expiry', label: 'Expiry' }
]

function setSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}

const LEVEL_RANK = { low: 0, near: 1, ok: 2 }
function compareItems(a, b) {
  const byName = () => String(a.item_name).localeCompare(String(b.item_name))
  switch (sortKey.value) {
    case 'item': return byName()
    case 'quantity': return (Number(a.quantity) - Number(b.quantity)) || byName()
    case 'cost': return (Number(a.unit_cost) - Number(b.unit_cost)) || byName()
    case 'value': return (stockValue(a) - stockValue(b)) || byName()
    case 'status': {
      const r = LEVEL_RANK[stockLevel(a)] - LEVEL_RANK[stockLevel(b)]
      return r || (stockRatio(a) - stockRatio(b)) || byName()
    }
    default: return byName()
  }
}

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const list = items.value.filter((i) => {
    if (q && !(i.item_name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q))) return false
    if (categoryFilter.value && i.category !== categoryFilter.value) return false
    if (levelFilter.value === 'low' && stockLevel(i) !== 'low') return false
    if (levelFilter.value === 'near' && stockLevel(i) !== 'near') return false
    if (levelFilter.value === 'expiring') {
      const e = expiryInfo(i)
      if (!e || e.state === 'ok') return false
    }
    return true
  })

  if (sortKey.value === 'expiry') {
    // Items with no expiry date always go last, whichever direction is chosen.
    const dated = list.filter((i) => i.expiry_date).sort((a, b) => String(a.expiry_date).localeCompare(String(b.expiry_date)))
    if (sortDir.value === 'desc') dated.reverse()
    return [...dated, ...list.filter((i) => !i.expiry_date)]
  }
  list.sort(compareItems)
  if (sortDir.value === 'desc') list.reverse()
  return list
})

const lowStockItems = computed(() => items.value.filter((i) => stockLevel(i) === 'low'))
const nearLowItems = computed(() => items.value.filter((i) => stockLevel(i) === 'near'))
const expiringItems = computed(() => items.value.filter((i) => {
  const e = expiryInfo(i)
  return e && e.state !== 'ok'
}))
// Banner: only what needs action right now (expired, or going off within 3 days).
const expiryAlertItems = computed(() => expiringItems.value.filter((i) => expiryInfo(i).days <= 3))
const totalStockValue = computed(() => items.value.reduce((sum, i) => sum + stockValue(i), 0))

const levelChips = computed(() => [
  { value: 'all', label: 'All', count: items.value.length },
  { value: 'low', label: 'Low', count: lowStockItems.value.length },
  { value: 'near', label: 'Running low', count: nearLowItems.value.length },
  { value: 'expiring', label: 'Expiring', count: expiringItems.value.length }
])

const categoryOptions = computed(() =>
  [...new Set(items.value.map((i) => i.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
)

// ---------- Suppliers + "updated X ago" ----------
const suppliers = ref([])
const lastMoved = ref({})

async function loadSuppliers() {
  try {
    suppliers.value = await getSuppliers()
  } catch (error) {
    suppliers.value = [] // supplier tables not set up: Reorder still works, just without a linked supplier
    console.error(error)
  }
}
const supplierNames = computed(() => Object.fromEntries(suppliers.value.map((s) => [s.supplier_id, s.supplier_name])))
const supplierName = (id) => (id ? supplierNames.value[id] || '' : '')

// Form dropdowns: keep an item's current category / supplier selectable even if
// it is no longer in the standard list or the supplier was deactivated.
const formCategoryOptions = computed(() => {
  const list = [...ITEM_CATEGORIES]
  if (form.value.category && !list.includes(form.value.category)) list.push(form.value.category)
  return list
})
const formSupplierOptions = computed(() =>
  suppliers.value.filter((s) => s.is_active || s.supplier_id === form.value.supplier_id)
)

async function loadLastMoved() {
  lastMoved.value = await getLastMovementDates()
}

// ---------- Needs for upcoming events ----------
const forecast = ref(null)
const forecastLoading = ref(false)
const forecastError = ref('')
const showForecast = ref(false)
const showAllForecast = ref(false)
let forecastSeq = 0
let forecastAutoOpened = false

async function loadForecast() {
  const seq = ++forecastSeq
  forecastLoading.value = true
  forecastError.value = ''
  try {
    const result = await getUpcomingNeeds({ limit: 20 })
    if (seq !== forecastSeq) return
    forecast.value = result
    // Open it by itself once if something is short; after that the user decides.
    if (!forecastAutoOpened && result.items.some((i) => i.short_by > 0)) {
      showForecast.value = true
      forecastAutoOpened = true
    }
  } catch (error) {
    if (seq !== forecastSeq) return
    forecastError.value = "Couldn't check upcoming events right now."
    console.error(error)
  } finally {
    if (seq === forecastSeq) forecastLoading.value = false
  }
}

function refreshExtras() {
  loadLastMoved()
  loadForecast()
}

const forecastShort = computed(() => (forecast.value?.items || []).filter((i) => i.short_by > 0))
const forecastRows = computed(() => {
  const all = forecast.value?.items || []
  return showAllForecast.value ? all : all.filter((i) => i.short_by > 0)
})
const needByItem = computed(() => new Map((forecast.value?.items || []).map((i) => [i.item_id, i])))

const forecastSummary = computed(() => {
  if (forecastError.value) return forecastError.value
  if (!forecast.value) return forecastLoading.value ? 'Checking pending events...' : ''
  const n = forecast.value.events.length
  if (!n) return 'No upcoming Pending events'
  const events = `${n} pending event${n === 1 ? '' : 's'}`
  return forecastShort.value.length
    ? `${events} · ${forecastShort.value.length} ingredient${forecastShort.value.length === 1 ? '' : 's'} short`
    : `${events} · enough stock for all of them`
})

function formatEventDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(String(dateStr).slice(0, 10) + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ---------- Reorder (opens a pre-filled purchase order on the Suppliers page) ----------
const needsReorder = (i) => stockLevel(i) !== 'ok' || (needByItem.value.get(i.item_id)?.short_by || 0) > 0
const reorderQtyFor = (i) => suggestedReorderQty(i, needByItem.value.get(i.item_id)?.short_by || 0)

function goReorder(list) {
  if (!list.length) return
  const query = list.map((i) => `${i.item_id}:${reorderQtyFor(i)}`).join(',')
  router.push({ path: '/admin/suppliers', query: { reorder: query } })
}
const reorderItem = (i) => goReorder([i])
const reorderAll = () => goReorder(items.value.filter(needsReorder))

// ---------- Export ----------
function csvCell(value) {
  if (typeof value === 'number') return String(value)
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}` // stop Excel from running it as a formula
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function exportCsv() {
  const header = ['Item', 'Category', 'Supplier', 'Quantity', 'Unit', 'Alert at', 'Unit cost', 'Stock value', 'Expiry date', 'Status']
  const rows = filteredItems.value.map((i) => [
    i.item_name, i.category || '', supplierName(i.supplier_id), Number(i.quantity), i.unit || 'kg',
    Number(i.low_stock_threshold), Number(i.unit_cost || 0), stockValue(i), i.expiry_date ? String(i.expiry_date).slice(0, 10) : '',
    LEVELS[stockLevel(i)].label
  ])
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM so Excel reads it as UTF-8
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inventory-${localToday()}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function openCreateModal() {
  editingItem.value = null
  form.value = emptyForm()
  modalError.value = ''
  showFormModal.value = true
}

function openEditModal(item) {
  editingItem.value = item
  form.value = {
    item_name: item.item_name, quantity: item.quantity, low_stock_threshold: item.low_stock_threshold, unit_cost: item.unit_cost, unit: item.unit || 'kg',
    category: item.category || '', supplier_id: item.supplier_id || '', expiry_date: item.expiry_date ? String(item.expiry_date).slice(0, 10) : ''
  }
  modalError.value = ''
  showFormModal.value = true
}

function closeFormModal() {
  showFormModal.value = false
}

const unitChanged = computed(() => !!editingItem.value && form.value.unit !== (editingItem.value.unit || 'kg'))

async function handleSaveItem() {
  if (isSaving.value) return
  modalError.value = ''

  const name = String(form.value.item_name || '').trim().toLowerCase()
  const duplicate = items.value.some(
    (i) => i.item_id !== editingItem.value?.item_id && i.item_name?.trim().toLowerCase() === name
  )
  if (duplicate) {
    modalError.value = 'An item with that name already exists.'
    return
  }

  isSaving.value = true
  try {
    if (editingItem.value) {
      // Compare against what the database has RIGHT NOW. The copy in
      // editingItem can be stale (someone else edited the item while this
      // window was open), and updateInventoryItem always sends the unit, so a
      // stale copy could change the unit without the usage check running.
      const current = await getInventoryItem(editingItem.value.item_id)
      const unitReallyChanged = form.value.unit !== (current.unit || 'kg')
      if (unitReallyChanged) {
        const usage = await getItemUsage(editingItem.value.item_id)
        if (usage.total > 0) {
          throw new Error('Cannot change the unit: this item is used in package/dish ingredients and their quantities would become wrong.')
        }
      }
      await updateInventoryItem(editingItem.value.item_id, form.value)
    } else {
      await createInventoryItem(form.value)
    }
    showFormModal.value = false
    await fetchItems({ silent: true })
    refreshExtras()
  } catch (error) {
    modalError.value = error?.message || 'Something went wrong. Please try again.'
  } finally {
    isSaving.value = false
  }
}

// ---------- Stock In / Out ----------
const adjustModes = [
  { value: 'in', label: 'Stock In' },
  { value: 'out', label: 'Stock Out' },
  { value: 'set', label: 'Set Count' }
]
const REASONS = {
  in: ['Purchase / delivery', 'Returned', 'Other'],
  out: ['Spoilage / waste', 'Used outside events', 'Damaged / lost', 'Other']
}
const showAdjustModal = ref(false)
const adjustItem = ref(null)
const adjustMode = ref('in')
const adjustAmount = ref(null)
const adjustReason = ref(REASONS.in[0])
const adjustNote = ref('')
const adjustError = ref('')
const isAdjusting = ref(false)
const movements = ref(null)

const reasonOptions = computed(() => REASONS[adjustMode.value] || [])
watch(adjustMode, (m) => {
  if (REASONS[m]) adjustReason.value = REASONS[m][0]
  adjustError.value = ''
})

const adjustPreview = computed(() => {
  if (!adjustItem.value || adjustAmount.value === null || adjustAmount.value === '') return null
  const amt = Number(adjustAmount.value)
  if (!Number.isFinite(amt)) return null
  const cur = Number(adjustItem.value.quantity)
  if (adjustMode.value === 'in') return cur + amt
  if (adjustMode.value === 'out') return cur - amt
  return amt
})

// Stock Out more than we have would go negative -- show it in red while typing
// and stop the Apply button (the database also refuses it).
const adjustPreviewInvalid = computed(
  () => adjustPreview.value !== null && adjustPreview.value < 0
)
const movementsUnavailable = ref(false)

async function openAdjustModal(item) {
  adjustItem.value = item
  adjustMode.value = 'in'
  adjustAmount.value = null
  adjustReason.value = REASONS.in[0]
  adjustNote.value = ''
  adjustError.value = ''
  movements.value = null
  movementsUnavailable.value = false
  showAdjustModal.value = true
  movements.value = await getInventoryMovements(item.item_id, 10)
  movementsUnavailable.value = movements.value === null
}

function closeAdjustModal() {
  showAdjustModal.value = false
  adjustItem.value = null
}

async function submitAdjust() {
  if (isAdjusting.value || !adjustItem.value) return
  adjustError.value = ''
  const amt = Number(adjustAmount.value)
  if (!Number.isInteger(amt) || amt < 0) {
    adjustError.value = 'Enter a whole number (no decimals).'
    return
  }
  if (adjustMode.value !== 'set' && amt <= 0) {
    adjustError.value = 'Amount must be greater than 0.'
    return
  }
  if (adjustMode.value === 'out' && amt > Number(adjustItem.value.quantity)) {
    adjustError.value = 'Not enough stock to remove that amount.'
    return
  }

  isAdjusting.value = true
  try {
    const note = adjustNote.value.trim() || null
    if (adjustMode.value === 'set') {
      await setInventoryStock(adjustItem.value.item_id, amt, note)
    } else {
      await adjustInventoryStock(
        adjustItem.value.item_id,
        adjustMode.value === 'in' ? amt : -amt,
        adjustReason.value,
        note
      )
    }
    closeAdjustModal()
    await fetchItems({ silent: true })
    refreshExtras()
  } catch (error) {
    adjustError.value = error?.message || 'Failed to adjust stock.'
    console.error(error)
  } finally {
    isAdjusting.value = false
  }
}

function formatMoveDate(iso) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ---------- Delete ----------
const deleteError = ref('')
const deleteUsage = ref(null)

const blockedByUsage = computed(() => (deleteUsage.value?.total || 0) > 0)
const usageMessage = computed(() =>
  blockedByUsage.value
    ? `Can't delete: used in ${deleteUsage.value.packages} package ingredient(s) and ${deleteUsage.value.dishes} dish ingredient(s). Remove it from those first.`
    : ''
)

async function confirmDelete(item) {
  deleteError.value = ''
  deleteUsage.value = null
  itemToDelete.value = item
  try {
    deleteUsage.value = await getItemUsage(item.item_id)
  } catch (error) {
    // the service re-checks on delete, so this is only a UX hint
    console.error(error)
  }
}

function closeDelete() {
  itemToDelete.value = null
  deleteError.value = ''
  deleteUsage.value = null
}

async function handleDelete() {
  if (!itemToDelete.value || isDeleting.value) return
  isDeleting.value = true
  deleteError.value = ''
  try {
    const id = itemToDelete.value.item_id
    await deleteInventoryItem(id)
    items.value = items.value.filter((i) => i.item_id !== id)
    closeDelete()
  } catch (error) {
    deleteError.value = error?.message || 'Failed to delete item.'
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}

function goTo(item) {
  isMobileSidebarOpen.value = false
  router.push(item.path)
}

const handleLogout = async () => {
  // End the real Supabase session too -- clearing sessionStorage alone left it
  // alive, so Back / typing the URL let the user straight back in.
  try {
    await logoutUser()
  } catch (error) {
    console.error('Sign out failed:', error)
  }
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  resetNotifications()
  router.push('/')
}

const allNavItems = [
  { name: 'Dashboard', path: '/admin/dashboard', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Event Bookings', path: '/admin/bookings', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { name: 'Event Planning', path: '/admin/planning', iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Catering Packages', path: '/admin/packages', iconPath: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { name: 'Pricing & Discounts', path: '/admin/pricing', iconPath: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z' },
  { name: 'Inventory', path: '/admin/inventory', iconPath: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4' },
  { name: 'Suppliers', path: '/admin/suppliers', iconPath: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21' },
  { name: 'Waste Tracking', path: '/admin/waste', iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
  { name: 'Delivery & Fleet', path: '/admin/fleet', iconPath: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12' },
  { name: 'Payment Records', path: '/admin/payments', iconPath: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018.75 4.5H5.25A2.25 2.25 0 003 6.75v10.5A2.25 2.25 0 005.25 19.5z' },
  { name: 'Branches', path: '/admin/branches', iconPath: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01' },
  { name: 'Staff Management', path: '/admin/staff', iconPath: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4z' },
  { name: 'Reports', path: '/admin/reports', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Legal Documents', path: '/admin/legal-documents', iconPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { name: 'Audit Logs', path: '/admin/audit-logs', iconPath: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { name: 'Feedback & Ratings', path: '/admin/feedback', iconPath: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { name: 'Support Chat', path: '/admin/support', iconPath: 'M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }
]

// Staff (per the manuscript's Use Case Diagram) only has access to
// Login/Authentication and Manage Payments -- so their sidebar only
// shows Dashboard (general landing view) and Payments.
const staffAllowedSections = ['Dashboard', 'Payment Records', 'Support Chat']

const navItems = computed(() =>
  userRole.value === 'Staff'
    ? allNavItems.filter(item => staffAllowedSections.includes(item.name))
    : allNavItems
)
</script>

<style scoped>
</style>