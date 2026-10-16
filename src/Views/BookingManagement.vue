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
          :class="item.name === 'Event Bookings' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
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
    <main class="flex-1 p-4 sm:p-8 pt-20 lg:pt-8 pb-24 sm:pb-8 overflow-x-hidden w-full min-w-0">
      <div class="max-w-none 2xl:max-w-[1920px] mx-auto">

        <div class="flex flex-col gap-3 mb-4">
          <div class="flex flex-row items-center justify-between gap-2 sm:gap-3">
            <div class="relative flex-1 min-w-0 sm:max-w-sm">
              <svg class="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search name or mobile..."
                class="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                type="button"
                @click="openCalendar"
                class="flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 dark:text-emerald-300 px-3 py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Calendar
              </button>
              <button @click="openCreateModal" class="hidden sm:flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2.5 sm:px-4 rounded-none font-semibold text-sm hover:bg-emerald-700 transition whitespace-nowrap min-w-[172px]">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Booking
              </button>
              <div class="hidden lg:block">
                <NotificationBell />
              </div>
            </div>
          </div>

          <!-- Filters: status tabs (with counts) + when -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
            <div class="flex gap-1 overflow-x-auto -mx-4 px-4 sm:-mx-1 sm:px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter by status">
              <button
                v-for="tab in statusTabs" :key="tab.value"
                type="button" role="tab"
                :aria-selected="statusFilter === tab.value"
                @click="statusFilter = tab.value"
                :class="statusFilter === tab.value
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-500'"
                class="flex items-center gap-1.5 px-3 py-2 min-h-[40px] sm:min-h-0 border text-sm font-semibold whitespace-nowrap transition shrink-0"
              >
                {{ tab.label }}
                <span :class="statusFilter === tab.value ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'" class="min-w-[20px] px-1.5 text-[11px] leading-5 text-center">{{ tab.count }}</span>
              </button>
            </div>

            <div class="flex gap-1 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter by event date">
              <button
                v-for="w in whenOptions" :key="w.value"
                type="button" role="tab"
                :aria-selected="whenFilter === w.value"
                @click="whenFilter = w.value"
                :class="whenFilter === w.value
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-emerald-500'"
                class="px-3 py-2 min-h-[40px] sm:min-h-0 border text-sm font-semibold whitespace-nowrap transition shrink-0"
              >{{ w.label }}</button>
            </div>
          </div>
        </div>

        <!-- Error Banner -->
        <div v-if="pageError" role="alert" class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900/60 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 p-4 shadow-sm">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-red-800 dark:text-red-200">{{ pageErrorParsed.title }}</p>
            <p v-if="pageErrorParsed.subtitle" class="text-sm text-red-700/80 dark:text-red-300/80 mt-0.5">{{ pageErrorParsed.subtitle }}</p>
            <div v-if="pageErrorParsed.gaps.length" class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="g in pageErrorParsed.gaps" :key="g.label"
                class="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-300"
              >
                {{ g.label }}
                <span class="rounded-full bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 text-[11px] font-semibold">{{ g.picked }} / {{ g.need }}</span>
              </span>
            </div>
          </div>
          <button type="button" @click="pageError = ''" aria-label="Dismiss" class="text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Stock Notice (shown after a status change moves inventory) -->
        <div v-if="stockNotice" role="status" class="mb-4 flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 p-4 shadow-sm">
          <svg class="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">{{ stockNotice }}</p>
          <button type="button" @click="stockNotice = ''" aria-label="Dismiss" class="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Bookings — mobile card list (phone-friendly, replaces the table below md) -->
        <div class="xl:hidden grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
          <div v-if="isLoading" class="col-span-full text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Loading bookings...</div>
          <div v-else-if="filteredBookings.length === 0" class="col-span-full text-center py-12 px-4">
            <svg class="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">{{ !hasActiveFilters ? 'No bookings yet.' : 'No bookings match your filters.' }}</p>
            <button v-if="!hasActiveFilters" @click="openCreateModal" class="mt-4 px-5 min-h-[44px] bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">New Booking</button>
          </div>

          <!-- Summary line -->
          <p v-if="!isLoading && filteredBookings.length" class="col-span-full text-xs text-gray-500 dark:text-gray-400 px-1">
            {{ totalBookings }} booking{{ totalBookings === 1 ? '' : 's' }}
            <template v-if="todayCount"> · <span class="font-semibold text-red-600 dark:text-red-400">{{ todayCount }} today</span></template>
            <template v-if="countByStatus('Pending')"> · <span class="font-semibold text-amber-600 dark:text-amber-400">{{ countByStatus('Pending') }} pending</span></template>
          </p>

          <div
            v-for="b in filteredBookings" :key="b.booking_id"
            :class="[statusStripeClass(b.booking_status), b.booking_status === 'Cancelled' ? 'opacity-70' : '']"
            class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 border-l-4 rounded-xl p-3 sm:p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="font-semibold text-gray-900 dark:text-gray-100 truncate capitalize">{{ b.client_name }}</p>
                <a v-if="b.client_contact_number" :href="'tel:' + b.client_contact_number" class="inline-flex items-center gap-1 py-1 -my-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  {{ b.client_contact_number }}
                </a>
              </div>
              <span :class="statusSelectClass(b.booking_status)" class="shrink-0 border px-2.5 py-1 rounded-full text-xs font-semibold leading-none">{{ b.booking_status }}</span>
            </div>

            <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(b.event_date) }} · {{ formatTime(b.event_time) }}</span>
              <span v-if="relativeDay(b)" :class="relativeDay(b).pill" class="px-2 py-0.5 rounded-full font-semibold">{{ relativeDay(b).text }}</span>
            </div>

            <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
              <span class="flex items-center gap-1.5 min-w-0"><svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span class="truncate capitalize">{{ b.event_location }}</span></span>
              <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4a4 4 0 10-4-4m4 4a4 4 0 01-4-4" /></svg>{{ b.guest_count }} guests · {{ b.package_name || 'No package' }}</span>
            </div>

            <div v-if="menuPicksFor(b.booking_id).length" class="mt-2">
              <button type="button" @click="toggleMenuRow(b.booking_id)" class="py-1.5 -my-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {{ expandedMenuRows.has(b.booking_id) ? 'Hide menu' : `View menu (${menuPicksFor(b.booking_id).length})` }}
              </button>
              <div v-if="expandedMenuRows.has(b.booking_id)" class="mt-1.5 space-y-2">
                <div v-for="grp in groupMenuPicks(menuPicksFor(b.booking_id))" :key="grp.category">
                  <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{{ grp.category }}</p>
                  <p v-for="p in grp.items" :key="p.item_id" class="text-xs text-gray-600 dark:text-gray-300">
                    {{ p.item_name }}
                    <span v-if="p.portion !== 'Regular'" class="ml-1 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">{{ p.portion }}</span>
                  </p>
                </div>
              </div>
            </div>

            <div v-if="addonsFor(b.booking_id).length" class="mt-2 text-xs text-gray-600 dark:text-gray-300">
              <p class="font-semibold text-emerald-600 dark:text-emerald-400">Add-ons (+₱{{ sumAddons(addonsFor(b.booking_id)).toLocaleString('en-PH') }})</p>
              <p v-for="a in addonsFor(b.booking_id)" :key="a.addon_id">{{ a.addon_name }} ×{{ a.quantity }}</p>
            </div>

            <div class="mt-2 flex items-center gap-1.5 flex-wrap">
              <span v-if="assignedStaffNames(b.booking_id).length === 0 && b.booking_status === 'Confirmed'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-[11px] font-semibold text-amber-700 dark:text-amber-300">⚠ No staff assigned yet</span>
              <span v-else-if="assignedStaffNames(b.booking_id).length === 0" class="text-xs text-gray-400 dark:text-gray-500">No staff assigned</span>
              <span v-for="name in assignedStaffNames(b.booking_id)" :key="name" class="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[11px] font-semibold text-gray-900 dark:text-gray-100">
                {{ name }}
              </span>
            </div>

            <div class="mt-3">
              <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">Set status</p>
              <div class="grid grid-cols-4 gap-1" role="group" aria-label="Set booking status">
                <button
                  v-for="st in ['Pending', 'Confirmed', 'Completed', 'Cancelled']" :key="st"
                  type="button"
                  :aria-pressed="b.booking_status === st"
                  @click="requestStatusChange(b, { target: { value: st } })"
                  :class="b.booking_status === st ? statusSelectClass(st) : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-700'"
                  class="min-h-[40px] border text-[11px] font-semibold transition"
                >{{ st }}</button>
              </div>
            </div>

            <div class="mt-2 grid grid-cols-2 gap-2">
              <button
                @click="openAssignModal(b)"
                class="min-h-[44px] flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-200 active:bg-purple-50 dark:active:bg-purple-900/30"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4z" /></svg>
                Assign staff
              </button>
              <button
                @click="confirmDelete(b)"
                class="min-h-[44px] flex items-center justify-center gap-2 border border-red-200 dark:border-red-900 text-sm font-semibold text-red-600 dark:text-red-400 active:bg-red-50 dark:active:bg-red-900/30"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
              </button>
            </div>
          </div>

          <div v-if="!isLoading && filteredBookings.length" class="col-span-full flex flex-col items-center gap-2 pt-1">
            <p class="text-xs text-gray-500 dark:text-gray-400">Showing {{ bookings.length }} of {{ totalBookings }}</p>
            <template v-if="hasMoreBookings">
              <button @click="loadMoreBookings" :disabled="isLoadingMore" class="px-5 py-2.5 min-h-[44px] rounded-none border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 active:bg-gray-50 dark:active:bg-gray-700 disabled:opacity-50">
                {{ isLoadingMore ? 'Loading...' : 'Load more' }}
              </button>
              <div :ref="setSentinel" class="h-px w-full"></div>
            </template>
          </div>
        </div>

        <!-- Bookings Table — desktop / tablet -->
        <div class="hidden xl:block bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 text-xs border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th class="text-left pl-5 pr-4 py-3 font-medium w-[15%]">Client</th>
                  <th class="text-left px-4 py-3 font-medium w-[12%]">Event</th>
                  <th class="text-left px-4 py-3 font-medium w-[14%]">Location</th>
                  <th class="text-left px-4 py-3 font-medium">Package</th>
                  <th class="text-left px-4 py-3 font-medium w-[13%]">Staff</th>
                  <th class="text-right pl-4 pr-5 py-3 font-medium w-px whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700/70">
                <tr v-if="isLoading">
                  <td colspan="6" class="text-center py-12 text-gray-400 dark:text-gray-500">Loading bookings...</td>
                </tr>
                <tr v-else-if="filteredBookings.length === 0">
                  <td colspan="6" class="text-center py-12 text-gray-400 dark:text-gray-500">
                    {{ !hasActiveFilters ? 'No bookings yet. Click "New Booking" to create one.' : 'No bookings match your filters.' }}
                  </td>
                </tr>
                <tr
                  v-for="b in filteredBookings" :key="b.booking_id"
                  :class="b.booking_status === 'Cancelled' ? 'bg-gray-50/70 dark:bg-gray-900/30' : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/40'"
                  class="align-top transition-colors"
                >
                  <!-- Client (left stripe = status at a glance) -->
                  <td :class="['border-l-4', statusStripeClass(b.booking_status), b.booking_status === 'Cancelled' ? 'opacity-60' : '']" class="pl-5 pr-4 py-4">
                    <div class="font-semibold text-gray-900 dark:text-gray-100 capitalize leading-tight">{{ b.client_name }}</div>
                    <a v-if="b.client_contact_number" :href="'tel:' + b.client_contact_number" class="mt-1 inline-block text-xs text-gray-500 dark:text-gray-400 tabular-nums hover:text-emerald-600 dark:hover:text-emerald-400">{{ b.client_contact_number }}</a>
                    <span v-else class="mt-1 inline-block text-xs text-gray-400 dark:text-gray-500">No number</span>
                  </td>

                  <!-- Event date -->
                  <td :class="b.booking_status === 'Cancelled' ? 'opacity-60' : ''" class="px-4 py-4 whitespace-nowrap">
                    <div class="font-medium text-gray-900 dark:text-gray-100 leading-tight">{{ formatDate(b.event_date) }}</div>
                    <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 tabular-nums">{{ formatTime(b.event_time) }}</div>
                    <span v-if="relativeDay(b)" :class="relativeDay(b).pill" class="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold">{{ relativeDay(b).text }}</span>
                  </td>

                  <!-- Location: wraps to 2 lines instead of cutting off -->
                  <td :class="b.booking_status === 'Cancelled' ? 'opacity-60' : ''" class="px-4 py-4 text-gray-700 dark:text-gray-300 capitalize" :title="b.event_location">
                    <div class="line-clamp-2 max-w-[14rem] leading-snug">{{ b.event_location || '—' }}</div>
                  </td>

                  <!-- Package + add-ons + menu -->
                  <td :class="b.booking_status === 'Cancelled' ? 'opacity-60' : ''" class="px-4 py-4">
                    <div class="flex items-baseline gap-2">
                      <span class="font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">{{ b.package_name || '—' }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{{ b.guest_count }} guests</span>
                    </div>

                    <div v-if="addonsFor(b.booking_id).length || menuPicksFor(b.booking_id).length" class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <button
                        v-if="addonsFor(b.booking_id).length"
                        type="button" @click="toggleAddonRow(b.booking_id)"
                        class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <svg :class="expandedAddonRows.has(b.booking_id) ? 'rotate-90' : ''" class="w-3 h-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        {{ addonsFor(b.booking_id).length }} add-on{{ addonsFor(b.booking_id).length === 1 ? '' : 's' }}
                        <span class="font-medium text-gray-500 dark:text-gray-400">(+₱{{ sumAddons(addonsFor(b.booking_id)).toLocaleString('en-PH') }})</span>
                      </button>
                      <button
                        v-if="menuPicksFor(b.booking_id).length"
                        type="button" @click="toggleMenuRow(b.booking_id)"
                        class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        <svg :class="expandedMenuRows.has(b.booking_id) ? 'rotate-90' : ''" class="w-3 h-3 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        {{ expandedMenuRows.has(b.booking_id) ? 'Hide menu' : `Menu (${menuPicksFor(b.booking_id).length} dishes)` }}
                      </button>
                    </div>

                    <div v-if="expandedAddonRows.has(b.booking_id)" class="mt-2 flex flex-wrap gap-1.5 max-w-xl">
                      <span
                        v-for="a in addonsFor(b.booking_id)" :key="a.addon_id"
                        class="rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 px-2 py-1 text-xs text-gray-700 dark:text-gray-200"
                      >{{ a.addon_name }} <span class="font-semibold text-emerald-700 dark:text-emerald-400">×{{ a.quantity }}</span></span>
                    </div>

                    <div v-if="expandedMenuRows.has(b.booking_id)" class="mt-2 space-y-2 max-w-xl rounded-md bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700 p-3">
                      <div v-for="grp in groupMenuPicks(menuPicksFor(b.booking_id))" :key="grp.category">
                        <p class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-0.5">{{ grp.category }}</p>
                        <p v-for="p in grp.items" :key="p.item_id" class="text-xs text-gray-700 dark:text-gray-200">
                          {{ p.item_name }}
                          <span v-if="p.portion !== 'Regular'" class="ml-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">{{ p.portion }}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  <!-- Staff -->
                  <td :class="b.booking_status === 'Cancelled' ? 'opacity-60' : ''" class="px-4 py-4">
                    <span v-if="assignedStaffNames(b.booking_id).length === 0" class="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>
                    <div v-else class="flex flex-col items-start gap-1.5">
                      <span v-for="name in assignedStaffNames(b.booking_id)" :key="name" class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        <span class="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 text-[10px] font-bold text-gray-600 dark:text-gray-200 flex items-center justify-center">{{ (name || '?').trim().charAt(0).toUpperCase() }}</span>
                        {{ name }}
                      </span>
                    </div>
                  </td>

                  <!-- Status + actions -->
                  <td class="pl-4 pr-5 py-3.5">
                    <div class="flex items-center justify-end gap-1">
                      <select
                        :value="b.booking_status"
                        @change="requestStatusChange(b, $event)"
                        :class="statusSelectClass(b.booking_status)"
                        class="text-xs font-semibold border rounded-full pl-3 pr-7 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Booking status"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button @click="openAssignModal(b)" class="ml-1 p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30" title="Assign staff" aria-label="Assign staff">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4z" />
                        </svg>
                      </button>
                      <button @click="confirmDelete(b)" class="p-2 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30" title="Delete booking" aria-label="Delete booking">
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
          <div v-if="hasMoreBookings && !isLoading" class="flex justify-center py-4 border-t border-gray-100 dark:border-gray-700">
            <button @click="loadMoreBookings" :disabled="isLoadingMore" class="px-5 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
              {{ isLoadingMore ? 'Loading...' : `Load more (${bookings.length} of ${totalBookings})` }}
            </button>
          </div>
        </div>

      </div>
    </main>

    <!-- ============ NEW BOOKING MODAL ============ -->
    <button @click="openCreateModal" aria-label="New booking"
      class="sm:hidden fixed bottom-5 right-5 z-30 w-14 h-14 rounded-full bg-emerald-600 text-white shadow-lg active:bg-emerald-700 flex items-center justify-center print:hidden">
      <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14" /></svg>
    </button>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-none shadow-xl w-full max-w-lg p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div class="sm:hidden mx-auto -mt-3 mb-3 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">New Booking</h3>

        <div v-if="modalError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ modalError }}
        </div>

        <div v-if="conflictWarning" class="text-amber-700 dark:text-amber-300 text-sm font-medium mb-4 flex gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 003.82 21h16.36a2 2 0 001.71-3l-8.18-14.14a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ conflictWarning }}</span>
        </div>

        <form @submit.prevent="handleCreateBooking" class="space-y-5">
          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Client Name</label>
            <input type="text" v-model="form.client_name" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Client Contact Number</label>
            <input type="tel" inputmode="tel" v-model="form.client_contact_number" placeholder="09171234567" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Event Date</label>
              <input
                type="date"
                v-model="form.event_date"
                @change="handleDateCheck"
                :min="todayStr"
                class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100"
                required
              />
            </div>
            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Event Time</label>
              <input type="time" v-model="form.event_time" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
            </div>
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Event Location</label>
            <input type="text" v-model="form.event_location" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Guest Count</label>
              <input type="number" min="1" max="5000" step="1" v-model.number="form.guest_count" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
            </div>
            <div class="relative">
              <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Package</label>
              <select v-model="form.package_id" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required>
                <option value="" disabled>Select a package</option>
                <option v-for="p in packages" :key="p.package_id" :value="p.package_id">{{ p.package_name }}</option>
              </select>
            </div>
          </div>
          <p v-if="packages.length === 0" class="text-xs text-amber-600 dark:text-amber-400 -mt-2">No packages yet. Create one under Catering Packages first.</p>

          <!-- Menu picks (per-category limits), same rule the client form uses.
               Without these a booking can never be Confirmed (the menu must be complete). -->
          <div v-if="form.package_id && menuCategories.length" class="space-y-3">
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400">Menu selection</p>
            <div v-for="cat in menuCategories" :key="cat.category" class="border border-gray-200 dark:border-gray-700 p-3">
              <p class="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                {{ cat.category }}
                <span class="font-normal text-gray-400 dark:text-gray-500">— pick {{ cat.need }} ({{ (selectedMenu[cat.category] || []).length }}/{{ cat.need }})</span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <label v-for="item in cat.items" :key="item.item_id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                  <input
                    type="checkbox"
                    :checked="(selectedMenu[cat.category] || []).includes(item.item_id)"
                    :disabled="!(selectedMenu[cat.category] || []).includes(item.item_id) && (selectedMenu[cat.category] || []).length >= cat.need"
                    @change="toggleMenuItem(cat, item.item_id)"
                  />
                  {{ item.item_name }}
                </label>
              </div>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Assign Staff (optional)</p>
            <div v-if="assignableStaff.length === 0" class="text-xs text-gray-400 dark:text-gray-500">
              No staff accounts yet. Add staff under Staff Management first.
            </div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-none p-3">
              <label v-for="s in assignableStaff" :key="s.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
                <input
                  type="checkbox"
                  :value="s.id"
                  v-model="selectedStaffIds"
                  @change="checkStaffAvailability"
                  class="rounded-none"
                />
                {{ s.full_name }}<span v-if="s.position" class="text-xs text-gray-400 dark:text-gray-500"> · {{ s.position }}</span>
              </label>
            </div>
            <p v-if="staffConflictWarning" class="text-xs text-amber-600 dark:text-amber-400 mt-2">{{ staffConflictWarning }}</p>
          </div>

          <div class="flex gap-3 sm:pt-2 sticky bottom-0 bg-white dark:bg-gray-800 -mx-6 px-6 -mb-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-gray-700 sm:static sm:mx-0 sm:px-0 sm:mb-0 sm:pb-0 sm:border-0">
            <button type="button" @click="closeCreateModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" :disabled="isCreating" class="flex-1 bg-emerald-600 text-white py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
              {{ isCreating ? 'Saving...' : 'Create Booking' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============ RETURN-STOCK CONFIRM MODAL ============ -->
    <div v-if="revertRequest" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Return stock to inventory?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Changing <span class="font-semibold text-gray-700 dark:text-gray-200">{{ revertRequest.booking.client_name }}</span>'s booking from
          {{ revertRequest.booking.booking_status }} to <span class="font-semibold text-gray-700 dark:text-gray-200">{{ revertRequest.newStatus }}</span>
          will put
          <template v-if="revertRequest.count">the {{ revertRequest.count }} deducted item(s)</template>
          <template v-else>the deducted ingredients</template>
          back into inventory.
        </p>
        <div class="flex gap-3">
          <button @click="revertRequest = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Keep as is
          </button>
          <button @click="confirmRevert" class="flex-1 bg-emerald-600 text-white py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-emerald-700">
            Return stock
          </button>
        </div>
      </div>
    </div>

    <!-- ============ BOOKINGS CALENDAR MODAL ============ -->
    <div v-if="showCalendar" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4" @click.self="closeCalendar">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-5xl p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between gap-2 mb-3">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Booked Events</h3>
          <button type="button" @click="closeCalendar" aria-label="Close" class="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-1">
            <button type="button" @click="calendarPrev" aria-label="Previous month" class="w-11 h-11 sm:w-9 sm:h-9 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-500">&lsaquo;</button>
            <p class="min-w-[9rem] text-center text-sm font-bold text-gray-800 dark:text-gray-100">{{ calendarMonthLabel }}</p>
            <button type="button" @click="calendarNext" aria-label="Next month" class="w-11 h-11 sm:w-9 sm:h-9 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-emerald-500">&rsaquo;</button>
            <button type="button" @click="calendarToday" class="ml-2 px-3 h-11 sm:h-9 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:border-emerald-500">Today</button>
          </div>
          <div class="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-amber-500"></span>Pending</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-emerald-600"></span>Confirmed</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 bg-blue-600"></span>Completed</span>
            <label class="flex items-center gap-1 cursor-pointer"><input type="checkbox" v-model="calendarShowCancelled" class="rounded-none" />Show cancelled</label>
          </div>
        </div>

        <div v-if="calendarError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-3">{{ calendarError }}</div>

        <div class="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700">
          <div v-for="d in ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']" :key="d" class="border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 py-1.5">{{ d }}</div>
          <button
            v-for="(cell, idx) in calendarCells" :key="idx"
            type="button"
            :disabled="!cell"
            @click="cell && (calendarSelected = cell.date)"
            :class="[
              !cell ? 'bg-gray-50/50 dark:bg-gray-900/40' : 'hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20',
              cell && cell.date === calendarSelected ? 'ring-2 ring-inset ring-emerald-500' : ''
            ]"
            class="border-r border-b border-gray-200 dark:border-gray-700 min-h-[56px] sm:min-h-[88px] p-1 text-left align-top flex flex-col gap-0.5"
          >
            <template v-if="cell">
              <span :class="cell.date === todayStr ? 'bg-emerald-600 text-white' : 'text-gray-700 dark:text-gray-200'" class="w-5 h-5 text-[11px] font-semibold flex items-center justify-center rounded-full">{{ cell.day }}</span>
              <!-- phones: dots + count -->
              <div v-if="cell.items.length" class="sm:hidden flex flex-wrap gap-0.5 mt-0.5">
                <span v-for="b in cell.items.slice(0, 4)" :key="b.booking_id" :class="calendarDot(b.booking_status)" class="w-2 h-2 rounded-full"></span>
                <span v-if="cell.items.length > 4" class="text-[9px] text-gray-500">+{{ cell.items.length - 4 }}</span>
              </div>
              <!-- larger screens: event chips -->
              <div class="hidden sm:flex flex-col gap-0.5 w-full">
                <span
                  v-for="b in cell.items.slice(0, 2)" :key="b.booking_id"
                  :class="[calendarChip(b.booking_status), b.booking_status === 'Cancelled' ? 'line-through' : '']"
                  class="block truncate px-1 py-0.5 text-[11px] font-semibold text-white capitalize"
                  :title="b.client_name"
                >{{ formatTime(b.event_time) }} {{ b.client_name }}</span>
                <span v-if="cell.items.length > 2" class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">+{{ cell.items.length - 2 }} more</span>
              </div>
            </template>
          </button>
        </div>

        <p v-if="isLoadingCalendar" class="text-xs text-gray-400 dark:text-gray-500 mt-2">Loading…</p>

        <!-- Selected day details -->
        <div class="mt-4">
          <p class="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">{{ calendarSelected ? formatDate(calendarSelected) : 'Pick a day' }}</p>
          <p v-if="calendarSelected && calendarSelectedItems.length === 0" class="text-sm text-gray-400 dark:text-gray-500">No events booked on this day.</p>
          <div class="space-y-2">
            <div v-for="b in calendarSelectedItems" :key="b.booking_id" class="border border-gray-200 dark:border-gray-700 p-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div class="min-w-0 text-sm">
                <p class="font-semibold text-gray-900 dark:text-gray-100 capitalize">{{ b.client_name }} <span class="font-normal text-gray-500 dark:text-gray-400">· {{ formatTime(b.event_time) }}</span></p>
                <p class="text-gray-600 dark:text-gray-300 capitalize">{{ b.event_location }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ b.guest_count }} guests · {{ b.package_name || 'No package' }}<template v-if="b.client_contact_number"> · {{ b.client_contact_number }}</template></p>
                <p v-if="assignedStaffNames(b.booking_id).length" class="text-xs text-gray-500 dark:text-gray-400">Staff: {{ assignedStaffNames(b.booking_id).join(', ') }}</p>
              </div>
              <span :class="statusBadgeClass(b.booking_status)" class="shrink-0 text-xs font-semibold">{{ b.booking_status }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ DELETE CONFIRM MODAL ============ -->
    <div v-if="bookingToDelete" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Booking?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently remove the booking for <span class="font-semibold text-gray-700 dark:text-gray-200">{{ bookingToDelete.client_name }}</span> on {{ formatDate(bookingToDelete.event_date) }}.
        </p>
        <div class="flex gap-3">
          <button @click="bookingToDelete = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button @click="handleDelete" :disabled="isDeleting" class="flex-1 bg-red-600 text-white py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-red-700 disabled:opacity-50">
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ ASSIGN STAFF MODAL ============ -->
    <div v-if="assignModalBooking" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div class="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-none shadow-xl w-full max-w-md p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        <div class="sm:hidden mx-auto -mt-3 mb-3 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Assign Staff</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ assignModalBooking.client_name }} — {{ formatDate(assignModalBooking.event_date) }}
        </p>

        <div v-if="assignModalError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ assignModalError }}
        </div>
        <div v-if="assignModalConflict" class="text-amber-700 dark:text-amber-300 text-sm font-medium mb-4 flex gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 003.82 21h16.36a2 2 0 001.71-3l-8.18-14.14a2 2 0 00-3.42 0z" />
          </svg>
          <span>{{ assignModalConflict }}</span>
        </div>

        <div v-if="assignableStaff.length === 0" class="text-sm text-gray-400 dark:text-gray-500 mb-4">
          No staff accounts yet. Add staff under Staff Management first.
        </div>
        <div v-else class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-none p-3 mb-4">
          <label v-for="s in assignableStaff" :key="s.id" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer">
            <input
              type="checkbox"
              :value="s.id"
              v-model="assignModalStaffIds"
              @change="checkAssignModalConflicts"
              class="rounded-none"
            />
            {{ s.full_name }}
            <span v-if="s.position" class="text-xs text-gray-400 dark:text-gray-500"> · {{ s.position }}</span>
            <span v-if="s.availability !== 'Available'" class="text-xs text-gray-400 dark:text-gray-500">({{ s.availability }})</span>
          </label>
        </div>

        <div class="flex gap-3 sm:pt-2 sticky bottom-0 bg-white dark:bg-gray-800 -mx-6 px-6 -mb-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-gray-100 dark:border-gray-700 sm:static sm:mx-0 sm:px-0 sm:mb-0 sm:pb-0 sm:border-0">
          <button type="button" @click="closeAssignModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="button" @click="handleSaveAssignment" :disabled="isSavingAssignment" class="flex-1 bg-emerald-600 text-white py-2.5 min-h-[44px] sm:min-h-0 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
            {{ isSavingAssignment ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { localToday, toLocalDateStr } from '../utils/date'
import { logoutUser } from '../services/authService'
import { resetNotifications } from '../composables/useNotifications'
import logoUrl from '../Assets/logofinal.png'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import NotificationBell from '../Components/NotificationBell.vue'
import { useSidebarState } from '../composables/useSidebarState'
import { useChatUnread } from '../composables/useChatUnread'
import { useReviewAlerts } from '../composables/useReviewAlerts'
import { useRouter } from 'vue-router'
import {
  getBookingsPage,
  getBookingsInRange,
  getBookingStatusCounts,
  createBooking,
  updateBookingStatus,
  getBookingStockCount,
  deleteBooking,
  checkDateConflict,
  setBookingSelections,
  getSelectionsForBookings
} from '../services/bookingService'
import { getAllPackages, getPackageMenu, getAllMenuItems, MENU_CATEGORIES } from '../services/packageService'
import { getAddonsForBookings, sumAddons } from '../services/addonService'
import { sendBookingConfirmationSms, sendBookingCancellationSms } from '../services/smsService'
import {
  getAssignableStaff,
  getAssignedStaff,
  getAssignedStaffForBookings,
  getStaffScheduleConflicts,
  getUnavailableStaffOnDate,
  setBookingStaff
} from '../services/staffassignmentservice'

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

const bookings = ref([])
const isLoading = ref(false)
const pageError = ref('')

// Turns the raw DB message ("Cannot confirm booking: menu selection is incomplete -
// Main Course (picked 0 of 2); ...") into a title + category chips. Any other
// error text just falls back to a plain title.
const pageErrorParsed = computed(() => {
  const raw = (pageError.value || '').trim()
  const m = raw.match(/^Cannot confirm booking:\s*menu selection is incomplete\s*-\s*(.+)$/i)
  if (!m) return { title: raw, subtitle: '', gaps: [] }
  const gaps = [...m[1].matchAll(/([^;()]+?)\s*\(picked\s*(\d+)\s*of\s*(\d+)\)/gi)]
    .map((x) => ({ label: x[1].trim(), picked: x[2], need: x[3] }))
  return {
    title: 'Cannot confirm this booking',
    subtitle: 'The client has not finished picking their menu. Still needed per category:',
    gaps
  }
})
const stockNotice = ref('')
const revertRequest = ref(null) // { booking, newStatus, count } while the "return stock?" modal is open
let stockNoticeTimer = null

function showStockNotice(message) {
  stockNotice.value = message
  clearTimeout(stockNoticeTimer)
  stockNoticeTimer = setTimeout(() => { stockNotice.value = '' }, 8000)
}

const PAGE_SIZE = 50
const totalBookings = ref(0)
const isLoadingMore = ref(false)
const statusCounts = ref({})
const hasMoreBookings = computed(() => bookings.value.length < totalBookings.value)

const searchQuery = ref('')
const statusFilter = ref('')
const whenFilter = ref('upcoming') // 'upcoming' | 'past' | 'all'

const whenOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All dates' }
]

const showCreateModal = ref(false)
const isCreating = ref(false)
const modalError = ref('')
const conflictWarning = ref('')

const bookingToDelete = ref(null)
const isDeleting = ref(false)

const emptyForm = () => ({
  client_name: '',
  client_contact_number: '',
  event_date: '',
  event_time: '',
  event_location: '',
  guest_count: null,
  package_id: '',
  package_name: ''
})
const form = ref(emptyForm())

// --- Package + menu picks for admin-created bookings ---
// This used to be a free-text "package name" box, so the booking had NO
// package_id: no menu, no ingredient stock deduction, no food costing.
const packages = ref([])
const allMenuItems = ref([])
const packageMenu = ref({ limits: [], itemsByCategory: {} })
const selectedMenu = ref({}) // category -> [item_id, ...]

// Same rule as the client form and the confirm RPC: per category the booking
// needs min(pick limit, dishes offered) dishes.
const menuCategories = computed(() => {
  const out = []
  for (const l of packageMenu.value.limits) {
    const ids = packageMenu.value.itemsByCategory[l.category] || []
    const items = allMenuItems.value.filter((i) => ids.includes(i.item_id) && i.is_active !== false)
    const need = Math.min(Number(l.max_selections) || 0, items.length)
    if (need > 0) out.push({ category: l.category, need, items })
  }
  return out
})

const isMenuComplete = computed(() =>
  menuCategories.value.every((c) => (selectedMenu.value[c.category] || []).length === c.need)
)

function toggleMenuItem(cat, itemId) {
  const current = selectedMenu.value[cat.category] || []
  if (current.includes(itemId)) {
    selectedMenu.value = { ...selectedMenu.value, [cat.category]: current.filter((id) => id !== itemId) }
  } else if (current.length < cat.need) {
    selectedMenu.value = { ...selectedMenu.value, [cat.category]: [...current, itemId] }
  }
}

watch(() => form.value.package_id, async (packageId) => {
  selectedMenu.value = {}
  packageMenu.value = { limits: [], itemsByCategory: {} }
  const pkg = packages.value.find((p) => p.package_id === packageId)
  form.value.package_name = pkg?.package_name || ''
  if (!packageId) return
  try {
    packageMenu.value = await getPackageMenu(packageId)
  } catch (error) {
    console.error('Failed to load package menu:', error)
  }
})

// --- Staff assignment ---
const assignableStaff = ref([]) // all Staff-role profiles, for checklists
const assignedStaffByBooking = ref({}) // booking_id -> [{ id, full_name }]
const selectedStaffIds = ref([]) // used by the New Booking form
const staffConflictWarning = ref('')

const assignModalBooking = ref(null) // booking currently being (re)assigned
const assignModalStaffIds = ref([])
const isSavingAssignment = ref(false)
const assignModalError = ref('')
const assignModalConflict = ref('')

const todayStr = localToday()

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }
  const user = JSON.parse(storedUser)
  if (!['Admin', 'Staff', 'Owner/Manager'].includes(user.role)) {
    router.push('/')
    return
  }
  // Per the manuscript's Use Case Diagram, Staff only has access to
  // Login/Authentication and Manage Payments -- Bookings is Admin-only.
  if (user.role === 'Staff') {
    router.push('/admin/dashboard')
    return
  }
  // full_name can be empty for accounts created without one -- fall back so
  // `.charAt` never runs on null and blanks the whole page.
  const displayName = user.full_name || user.username || 'User'
  userName.value = displayName
  userRole.value = user.role
  userInitial.value = displayName.charAt(0).toUpperCase()
  userAvatarUrl.value = user.avatar_url || ''

  fetchBookings()
  getAssignableStaff().then((staff) => { assignableStaff.value = staff }).catch(console.error)
  getAllPackages().then((rows) => { packages.value = rows }).catch(console.error)
  getAllMenuItems().then((rows) => { allMenuItems.value = rows }).catch(console.error)
})

// Guards against out-of-order responses: if the admin types/filters quickly,
// only the most recent request is allowed to write to the table.
let fetchSeq = 0

async function fetchBookings({ refreshCounts = true } = {}) {
  const seq = ++fetchSeq
  isLoading.value = true
  pageError.value = ''
  try {
    const [page, counts] = await Promise.all([
      getBookingsPage({
        offset: 0,
        limit: PAGE_SIZE,
        status: statusFilter.value,
        search: searchQuery.value,
        when: whenFilter.value
      }),
      refreshCounts ? getBookingStatusCounts() : Promise.resolve(null)
    ])
    if (seq !== fetchSeq) return // a newer request superseded this one
    bookings.value = page.rows
    totalBookings.value = page.total
    if (counts) statusCounts.value = counts
    loadAssignedStaffFor(page.rows)
    loadMenuPicksFor(page.rows)
  } catch (error) {
    if (seq !== fetchSeq) return
    pageError.value = 'Failed to load bookings. Please refresh the page.'
    console.error(error)
  } finally {
    if (seq === fetchSeq) isLoading.value = false
  }
}

async function loadMoreBookings() {
  if (isLoadingMore.value || !hasMoreBookings.value) return
  const seq = fetchSeq
  isLoadingMore.value = true
  try {
    const page = await getBookingsPage({
      offset: bookings.value.length,
      limit: PAGE_SIZE,
      status: statusFilter.value,
      search: searchQuery.value,
      when: whenFilter.value
    })
    if (seq !== fetchSeq) return // filters changed while loading; drop this page
    bookings.value = [...bookings.value, ...page.rows]
    totalBookings.value = page.total
    loadAssignedStaffFor(page.rows)
    loadMenuPicksFor(page.rows)
  } catch (error) {
    pageError.value = 'Failed to load more bookings.'
    console.error(error)
  } finally {
    isLoadingMore.value = false
  }
}

// Status dropdown: refetch right away. Search box: wait for a pause in typing.
// The status counts don't depend on the filters, so they aren't re-queried.
let searchTimer = null
watch([statusFilter, whenFilter], () => fetchBookings({ refreshCounts: false }))
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => fetchBookings({ refreshCounts: false }), 300)
})
onBeforeUnmount(() => {
  clearTimeout(searchTimer)
  clearTimeout(stockNoticeTimer)
})

// Saved dishes + serving sizes per booking, for the "View menu" toggle.
const menuPicksByBooking = ref({}) // booking_id -> [{ item_id, item_name, category, portion }]
const expandedMenuRows = ref(new Set())
function menuPicksFor(bookingId) {
  return menuPicksByBooking.value[bookingId] || []
}
// Group a booking's picked dishes by menu category (Main Course, Side Dish,
// Soup, Dessert, Drinks first, then any other category so nothing is hidden).
function groupMenuPicks(picks) {
  const groups = {}
  for (const p of picks) (groups[p.category || 'Other'] ||= []).push(p)
  const known = MENU_CATEGORIES.filter((c) => groups[c])
  const rest = Object.keys(groups).filter((c) => !MENU_CATEGORIES.includes(c))
  return [...known, ...rest].map((c) => ({ category: c, items: groups[c] }))
}
function toggleMenuRow(id) {
  const next = new Set(expandedMenuRows.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedMenuRows.value = next
}
// Add-ons list is collapsed by default in the desktop table (can be long).
const expandedAddonRows = ref(new Set())
function toggleAddonRow(id) {
  const next = new Set(expandedAddonRows.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedAddonRows.value = next
}
// Add-ons (extras) each client attached, so staff/kitchen can see them.
const addonsByBooking = ref({})
function addonsFor(bookingId) {
  return addonsByBooking.value[bookingId] || []
}
async function loadAddonsFor(rows) {
  try {
    const map = await getAddonsForBookings(rows.map((b) => b.booking_id))
    const filled = Object.fromEntries(rows.map((b) => [b.booking_id, map[b.booking_id] || []]))
    addonsByBooking.value = { ...addonsByBooking.value, ...filled }
  } catch (error) {
    console.error('Failed to load add-ons:', error)
  }
}
async function loadMenuPicksFor(rows) {
  loadAddonsFor(rows)
  try {
    const map = await getSelectionsForBookings(rows.map((b) => b.booking_id))
    // Bookings with no picks get an explicit empty list so stale data clears.
    const filled = Object.fromEntries(rows.map((b) => [b.booking_id, map[b.booking_id] || []]))
    menuPicksByBooking.value = { ...menuPicksByBooking.value, ...filled }
  } catch (error) {
    console.error('Failed to load menu picks:', error)
  }
}

async function loadAssignedStaffFor(rows) {
  try {
    const ids = rows.map((b) => b.booking_id)
    const map = await getAssignedStaffForBookings(ids)
    assignedStaffByBooking.value = { ...assignedStaffByBooking.value, ...map }
  } catch (error) {
    console.error('Failed to load staff assignments:', error)
  }
}

// Filtering/search happen in the query (see getBookingsPage), so the loaded
// rows are already exactly what should be shown.
const filteredBookings = computed(() => bookings.value)
const todayCount = computed(() => bookings.value.filter((b) => b.event_date === localToday() && !['Completed', 'Cancelled'].includes(b.booking_status)).length)

// Mobile list: load the next page automatically when the user scrolls to the end.
let sentinelObserver = null
function setSentinel(el) {
  if (sentinelObserver) { sentinelObserver.disconnect(); sentinelObserver = null }
  if (el && typeof IntersectionObserver !== 'undefined') {
    sentinelObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreBookings.value && !isLoadingMore.value && !isLoading.value) loadMoreBookings()
    }, { rootMargin: '200px' })
    sentinelObserver.observe(el)
  }
}
onBeforeUnmount(() => { if (sentinelObserver) sentinelObserver.disconnect() })
const hasActiveFilters = computed(() => Boolean(statusFilter.value || searchQuery.value.trim() || whenFilter.value !== 'all'))

const statusTabs = computed(() => {
  const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled']
  const all = statuses.reduce((sum, st) => sum + countByStatus(st), 0)
  return [
    { value: '', label: 'All', count: all },
    ...statuses.map((st) => ({ value: st, label: st, count: countByStatus(st) }))
  ]
})

// "Today", "Tomorrow", "in 6 days" for active bookings, so the admin can see
// what is coming up without doing date math. Hidden once a booking is done.
const PILL_RED = 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
const PILL_AMBER = 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
const PILL_GRAY = 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
function relativeDay(b) {
  if (!b.event_date || ['Completed', 'Cancelled'].includes(b.booking_status)) return null
  const today = new Date(localToday() + 'T00:00:00')
  const event = new Date(b.event_date + 'T00:00:00')
  const days = Math.round((event - today) / 86400000)
  if (days < 0) return { text: `${-days} day${days === -1 ? '' : 's'} overdue`, class: 'text-red-600 dark:text-red-400', pill: PILL_RED }
  if (days === 0) return { text: 'Today', class: 'text-red-600 dark:text-red-400', pill: PILL_RED }
  if (days === 1) return { text: 'Tomorrow', class: 'text-amber-600 dark:text-amber-400', pill: PILL_AMBER }
  if (days <= 7) return { text: `in ${days} days`, class: 'text-amber-600 dark:text-amber-400', pill: PILL_AMBER }
  return { text: `in ${days} days`, class: 'text-gray-400 dark:text-gray-500', pill: PILL_GRAY }
}

function countByStatus(status) {
  return statusCounts.value[status] || 0
}

// Desktop table: left stripe + filled select pill per status.
function statusStripeClass(status) {
  switch (status) {
    case 'Confirmed': return 'border-l-emerald-500'
    case 'Pending': return 'border-l-amber-400'
    case 'Completed': return 'border-l-blue-500'
    case 'Cancelled': return 'border-l-red-400'
    default: return 'border-l-gray-300'
  }
}
function statusSelectClass(status) {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300'
    case 'Pending': return 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300'
    case 'Completed': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
    case 'Cancelled': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300'
    default: return 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
  }
}

function statusBadgeClass(status) {
  switch (status) {
    case 'Confirmed': return 'text-emerald-700 dark:text-emerald-300'
    case 'Pending': return 'text-amber-700 dark:text-amber-300'
    case 'Completed': return 'text-blue-700 dark:text-blue-300'
    case 'Cancelled': return 'text-red-700 dark:text-red-300'
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

// ---------- Bookings calendar (button in the header) ----------
const showCalendar = ref(false)
const calendarMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const calendarBookings = ref([])
const calendarSelected = ref('')
const calendarShowCancelled = ref(false)
const calendarError = ref('')
const isLoadingCalendar = ref(false)
let calendarSeq = 0

const calendarMonthLabel = computed(() =>
  calendarMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const calendarVisible = computed(() =>
  calendarBookings.value.filter((b) => calendarShowCancelled.value || b.booking_status !== 'Cancelled')
)

const calendarCells = computed(() => {
  const first = calendarMonth.value
  const y = first.getFullYear()
  const m = first.getMonth()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const byDate = {}
  for (const b of calendarVisible.value) (byDate[b.event_date] ||= []).push(b)
  const cells = Array(first.getDay()).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = toLocalDateStr(new Date(y, m, d))
    cells.push({ day: d, date, items: byDate[date] || [] })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

const calendarSelectedItems = computed(() =>
  calendarVisible.value.filter((b) => b.event_date === calendarSelected.value)
)

function calendarChip(status) {
  return { Pending: 'bg-amber-500', Confirmed: 'bg-emerald-600', Completed: 'bg-blue-600', Cancelled: 'bg-red-500' }[status] || 'bg-gray-500'
}
function calendarDot(status) { return calendarChip(status) }

async function loadCalendarMonth() {
  const seq = ++calendarSeq // only the latest request may write results
  const y = calendarMonth.value.getFullYear()
  const m = calendarMonth.value.getMonth()
  isLoadingCalendar.value = true
  calendarError.value = ''
  try {
    const rows = await getBookingsInRange(
      toLocalDateStr(new Date(y, m, 1)),
      toLocalDateStr(new Date(y, m + 1, 0))
    )
    if (seq !== calendarSeq) return
    calendarBookings.value = rows
    loadAssignedStaffFor(rows)
  } catch (error) {
    if (seq !== calendarSeq) return
    console.error('Failed to load calendar bookings:', error)
    calendarError.value = "Couldn't load the bookings for this month. Please try again."
  } finally {
    if (seq === calendarSeq) isLoadingCalendar.value = false
  }
}

function openCalendar() {
  showCalendar.value = true
  calendarSelected.value = todayStr
  calendarMonth.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  loadCalendarMonth()
}
function closeCalendar() { showCalendar.value = false }
function calendarPrev() {
  const d = calendarMonth.value
  calendarMonth.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  calendarSelected.value = ''
  loadCalendarMonth()
}
function calendarNext() {
  const d = calendarMonth.value
  calendarMonth.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  calendarSelected.value = ''
  loadCalendarMonth()
}
function calendarToday() { openCalendar() }

function assignedStaffNames(bookingId) {
  return (assignedStaffByBooking.value[bookingId] || []).map((s) => s.full_name)
}

function formatTime(timeStr) {
  if (!timeStr) return '—'
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${m} ${suffix}`
}

function openCreateModal() {
  form.value = emptyForm()
  selectedStaffIds.value = []
  modalError.value = ''
  conflictWarning.value = ''
  staffConflictWarning.value = ''
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
}

async function handleDateCheck() {
  conflictWarning.value = ''
  if (!form.value.event_date) return
  try {
    const result = await checkDateConflict(form.value.event_date)
    if (result.conflict) {
      const existing = result.existingBookings[0]
      conflictWarning.value = result.capacity > 1
        ? `This date is fully booked (${result.taken} of ${result.capacity} events taken). Please choose a different date.`
        : `This date already has a booking (${existing.client_name} at ${formatTime(existing.event_time)}). Please choose a different date.`
    } else if (result.capacity > 1 && result.taken > 0) {
      conflictWarning.value = `Heads up: ${result.taken} of ${result.capacity} events are already booked on this date. Make sure a separate crew, vehicle and stock are available.`
    }
  } catch (error) {
    console.error('Conflict check failed:', error)
  }
  await checkStaffAvailability()
}

// Warn (don't block) if any selected staff member is already assigned to
// another Pending/Confirmed booking on this date, OR has marked this date
// as unavailable (leave/time-off) on their schedule.
async function checkStaffAvailability() {
  staffConflictWarning.value = ''
  if (!form.value.event_date || selectedStaffIds.value.length === 0) return
  try {
    const [bookingConflicts, leaveConflicts] = await Promise.all([
      getStaffScheduleConflicts(form.value.event_date, selectedStaffIds.value),
      getUnavailableStaffOnDate(form.value.event_date, selectedStaffIds.value)
    ])
    const messages = []
    if (bookingConflicts.length > 0) {
      const names = [...new Set(bookingConflicts.map((c) => c.staff_name))].join(', ')
      messages.push(`${names} already assigned to another event on this date.`)
    }
    if (leaveConflicts.length > 0) {
      const names = [...new Set(leaveConflicts.map((c) => c.staff_name))].join(', ')
      messages.push(`${names} marked unavailable (leave/time-off) on this date.`)
    }
    staffConflictWarning.value = messages.join(' ')
  } catch (error) {
    console.error('Staff conflict check failed:', error)
  }
}

async function handleCreateBooking() {
  modalError.value = ''
  if (!form.value.package_id) {
    modalError.value = 'Please select a package.'
    return
  }
  if (!isMenuComplete.value) {
    modalError.value = 'Please finish the menu selection for every category.'
    return
  }
  isCreating.value = true
  try {
    const booking = await createBooking(form.value)
    const flatSelections = Object.values(selectedMenu.value).flat().map((item_id) => ({ item_id }))
    if (flatSelections.length) {
      try {
        await setBookingSelections(booking.booking_id, flatSelections)
        loadMenuPicksFor([booking])
      } catch (selError) {
        // The booking exists; don't lose it, but tell the admin clearly.
        pageError.value = selError?.message || 'Booking created, but the menu picks could not be saved.'
      }
    }
    if (selectedStaffIds.value.length > 0) {
      try {
        await setBookingStaff(booking.booking_id, selectedStaffIds.value)
      } catch (assignError) {
        // Booking itself succeeded; surface the assignment failure but
        // don't lose the booking that was just created.
        pageError.value = assignError?.message || 'Booking created, but staff assignment failed. Assign staff from the table.'
      }
    }
    showCreateModal.value = false
    fetchBookings()
  } catch (error) {
    modalError.value = error?.message || error?.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    isCreating.value = false
  }
}

// --- Assign Staff modal (for existing bookings) ---
async function openAssignModal(booking) {
  assignModalBooking.value = booking
  assignModalError.value = ''
  assignModalConflict.value = ''
  assignModalStaffIds.value = (assignedStaffByBooking.value[booking.booking_id] || []).map((s) => s.id)
  // Refresh from source of truth in case the cached list is stale.
  try {
    const current = await getAssignedStaff(booking.booking_id)
    assignModalStaffIds.value = current.map((s) => s.id)
  } catch (error) {
    console.error(error)
  }
}

function closeAssignModal() {
  assignModalBooking.value = null
}

async function checkAssignModalConflicts() {
  assignModalConflict.value = ''
  if (!assignModalBooking.value || assignModalStaffIds.value.length === 0) return
  try {
    const [bookingConflicts, leaveConflicts] = await Promise.all([
      getStaffScheduleConflicts(
        assignModalBooking.value.event_date,
        assignModalStaffIds.value,
        assignModalBooking.value.booking_id
      ),
      getUnavailableStaffOnDate(assignModalBooking.value.event_date, assignModalStaffIds.value)
    ])
    const messages = []
    if (bookingConflicts.length > 0) {
      const names = [...new Set(bookingConflicts.map((c) => c.staff_name))].join(', ')
      messages.push(`${names} already assigned to another event on this date.`)
    }
    if (leaveConflicts.length > 0) {
      const names = [...new Set(leaveConflicts.map((c) => c.staff_name))].join(', ')
      messages.push(`${names} marked unavailable (leave/time-off) on this date.`)
    }
    assignModalConflict.value = messages.join(' ')
  } catch (error) {
    console.error(error)
  }
}

async function handleSaveAssignment() {
  if (!assignModalBooking.value) return
  assignModalError.value = ''
  isSavingAssignment.value = true
  try {
    await setBookingStaff(assignModalBooking.value.booking_id, assignModalStaffIds.value)
    const updated = await getAssignedStaff(assignModalBooking.value.booking_id)
    assignedStaffByBooking.value = { ...assignedStaffByBooking.value, [assignModalBooking.value.booking_id]: updated }
    assignModalBooking.value = null
  } catch (error) {
    assignModalError.value = error?.message || 'Failed to save staff assignment.'
  } finally {
    isSavingAssignment.value = false
  }
}

// Entry point for both status dropdowns. Stock is deducted when a booking is
// Confirmed and returned when it goes back to Pending or to Cancelled, so
// those two moves ask first instead of surprising the admin.
async function requestStatusChange(booking, event) {
  const newStatus = event.target.value
  const previousStatus = booking.booking_status
  if (newStatus === previousStatus) return

  // An event that hasn't happened yet can't be Completed.
  if (newStatus === 'Completed' && booking.event_date > localToday()) {
    event.target.value = previousStatus // snap the dropdown back
    pageError.value = `${booking.client_name || 'This booking'}'s event is on ${formatDate(booking.event_date)}. You can mark it Completed on or after that date.`
    return
  }

  const returnsStock =
    ['Confirmed', 'Completed'].includes(previousStatus) && ['Pending', 'Cancelled'].includes(newStatus)
  if (!returnsStock) {
    handleStatusChange(booking, newStatus)
    return
  }

  event.target.value = previousStatus // snap the dropdown back until the admin agrees
  const count = await getBookingStockCount(booking.booking_id)
  revertRequest.value = { booking, newStatus, count }
}

function confirmRevert() {
  const { booking, newStatus } = revertRequest.value
  revertRequest.value = null
  handleStatusChange(booking, newStatus)
}

async function handleStatusChange(booking, newStatus) {
  const previousStatus = booking.booking_status
  pageError.value = '' // drop any stale error from a previous attempt
  stockNotice.value = ''
  const countBefore = ['Pending', 'Cancelled'].includes(newStatus)
    ? await getBookingStockCount(booking.booking_id)
    : null
  booking.booking_status = newStatus // optimistic update
  try {
    await updateBookingStatus(booking.booking_id, newStatus)
    if (newStatus === 'Confirmed') {
      const deducted = await getBookingStockCount(booking.booking_id)
      showStockNotice(
        deducted
          ? `${deducted} item(s) deducted from inventory.`
          : 'Booking confirmed. Ingredients were deducted from inventory.'
      )
    } else if (countBefore) {
      showStockNotice(`${countBefore} item(s) returned to inventory.`)
    }
    statusCounts.value = {
      ...statusCounts.value,
      [previousStatus]: Math.max(0, (statusCounts.value[previousStatus] || 0) - 1),
      [newStatus]: (statusCounts.value[newStatus] || 0) + 1
    }
    // Text the client. Never blocks or undoes the status change; the admin is
    // told when the text did not go out.
    if (newStatus === 'Confirmed' || newStatus === 'Cancelled') {
      const result = newStatus === 'Confirmed'
        ? await sendBookingConfirmationSms(booking.booking_id)
        : await sendBookingCancellationSms(booking.booking_id, previousStatus)
      if (result?.sent) {
        showStockNotice(`${stockNotice.value ? stockNotice.value + ' ' : ''}SMS sent to ${booking.client_name || 'the client'}.`)
      } else if (result && result.reason !== 'already_sent') {
        pageError.value = `Status updated, but the SMS was NOT sent: ${result.message || 'unknown error'}`
      }
    }
  } catch (error) {
    booking.booking_status = previousStatus
    pageError.value = error?.message || 'Failed to update booking status.'
    console.error(error)
  }
}

function confirmDelete(booking) {
  bookingToDelete.value = booking
}

async function handleDelete() {
  if (!bookingToDelete.value) return
  isDeleting.value = true
  try {
    await deleteBooking(bookingToDelete.value.booking_id)
    const deletedStatus = bookingToDelete.value.booking_status
    const deletedId = bookingToDelete.value.booking_id
    bookings.value = bookings.value.filter((b) => b.booking_id !== deletedId)
    const { [deletedId]: _removed, ...restAssignments } = assignedStaffByBooking.value
    assignedStaffByBooking.value = restAssignments
    totalBookings.value = Math.max(0, totalBookings.value - 1)
    statusCounts.value = {
      ...statusCounts.value,
      [deletedStatus]: Math.max(0, (statusCounts.value[deletedStatus] || 0) - 1)
    }
    bookingToDelete.value = null
  } catch (error) {
    pageError.value = 'Failed to delete booking.'
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


const staffAllowedSections = ['Dashboard', 'Payment Records', 'Support Chat']

const navItems = computed(() =>
  userRole.value === 'Staff'
    ? allNavItems.filter(item => staffAllowedSections.includes(item.name))
    : allNavItems
)
</script>

<style scoped>
</style>