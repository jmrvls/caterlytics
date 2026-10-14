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
          :class="item.name === 'Staff Management' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
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

        <!-- Page header: Add New User sits at the very top -->
        <div class="flex items-center justify-between gap-3 mb-4">
          <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">Staff Management</h1>
          <div class="flex items-center gap-3 flex-shrink-0">
            <button v-if="userRole === 'Admin' || userRole === 'Owner/Manager'" @click="openAddUserModal" class="flex items-center justify-center gap-2 bg-emerald-600 text-white px-3 py-2.5 sm:px-4 rounded-none font-semibold text-sm hover:bg-emerald-700 transition whitespace-nowrap">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New User
            </button>
            <div class="hidden lg:block">
              <NotificationBell />
            </div>
          </div>
        </div>

        <!-- Success notice -->
        <div v-if="notice" class="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2 mb-3">{{ notice }}</div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div v-for="c in summaryCards" :key="c.label" class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm px-4 py-3">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{{ c.label }}</p>
            <p class="text-2xl font-bold mt-1" :class="c.cls">{{ isLoadingUsers ? '–' : c.value }}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ c.sub }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-3 mb-4">
          <!-- Row 1: Search + all filters side by side -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="relative flex-1 min-w-[200px] max-w-sm">
              <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                v-model="staffSearchQuery"
                placeholder="Search by name, username, email, position, or contact..."
                class="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100"
              />
            </div>
            <select v-model="staffRoleFilter" class="w-36 sm:w-40 shrink-0 py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Owner/Manager">Owner/Manager</option>
            </select>
            <select v-model="staffPositionFilter" class="w-36 sm:w-40 shrink-0 py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">All Positions</option>
              <option v-for="p in POSITIONS" :key="p" :value="p">{{ p }}</option>
            </select>
            <select v-model="staffAvailabilityFilter" class="w-36 sm:w-40 shrink-0 py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">All Availability</option>
              <option value="Available">Available</option>
              <option value="On Leave">On Leave</option>
              <option value="Unavailable">Unavailable</option>
            </select>
            <select v-model="staffStatusFilter" class="w-36 sm:w-40 shrink-0 py-2.5 px-3 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="active">Active accounts</option>
              <option value="inactive">Inactive accounts</option>
              <option value="all">All accounts</option>
            </select>

          </div>

          <!-- Row 2: mobile-only sort -->
          <div class="flex flex-row flex-wrap gap-2 sm:hidden">
            <!-- Sorting for the mobile card list (desktop sorts by clicking the column headers) -->
            <div class="flex gap-2 w-full sm:hidden">
              <select v-model="sortKey" class="flex-1 py-2 px-3 text-sm bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none text-gray-900 dark:text-gray-100">
                <option value="name">Sort: Name</option>
                <option value="role">Sort: Role</option>
                <option value="status">Sort: Status</option>
                <option value="events">Sort: Assigned events</option>
              </select>
              <button type="button" @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'" class="px-4 py-2 text-sm font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900">
                {{ sortDir === 'asc' ? 'A → Z' : 'Z → A' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="usersError" class="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 mb-3">{{ usersError }}</div>

        <!-- Bulk action bar -->
        <div v-if="selected.length > 0" class="flex flex-wrap items-center gap-2 mb-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <span class="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mr-auto">{{ selected.length }} selected</span>
          <select @change="handleBulkAvailability($event)" :disabled="isBulkRunning" class="py-2 px-3 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-none">
            <option value="">Set availability…</option>
            <option value="Available">Mark Available</option>
            <option value="On Leave">Mark On Leave</option>
            <option value="Unavailable">Mark Unavailable</option>
          </select>
          <button v-if="selectedActiveCount > 0" @click="openBulk('deactivate')" :disabled="isBulkRunning" class="h-9 px-3 text-xs font-semibold bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50">Deactivate ({{ selectedActiveCount }})</button>
          <button v-if="selectedInactiveCount > 0" @click="openBulk('reactivate')" :disabled="isBulkRunning" class="h-9 px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">Reactivate ({{ selectedInactiveCount }})</button>
          <button @click="selected = []" class="h-9 px-3 text-xs font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900">Clear</button>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden">

          <div v-if="isLoadingUsers" class="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">Loading team...</div>

          <!-- Empty state -->
          <div v-else-if="filteredUserList.length === 0" class="text-center py-12 px-4">
            <svg class="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-2.13a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <template v-if="userList.length === 0">
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">No team members yet</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your cooks, servers, drivers and coordinators so you can assign them to events.</p>
              <button v-if="userRole === 'Admin' || userRole === 'Owner/Manager'" @click="openAddUserModal" class="mt-4 bg-emerald-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-emerald-700">Add New User</button>
            </template>
            <template v-else>
              <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">No one matches these filters</p>
              <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Try a different search, or switch the account filter (Active / Inactive / All).</p>
              <button @click="clearFilters" class="mt-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2.5 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700">Clear filters</button>
            </template>
          </div>

          <template v-else>
            <!-- Mobile card list -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
              <div v-for="u in pagedUsers" :key="u.id" class="px-3 py-3" :class="{ 'opacity-60': !u.is_active }">
                <div class="flex items-center gap-2.5 mb-2.5">
                  <input v-if="isSelectable(u)" type="checkbox" :checked="selected.includes(u.id)" @change="toggleSelect(u.id)" class="w-5 h-5 accent-emerald-600 shrink-0" :aria-label="'Select ' + u.full_name" />
                  <div class="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                    <img v-if="u.avatar_url" :src="u.avatar_url" alt="" class="w-full h-full object-cover" />
                    <span v-else>{{ (u.full_name || u.username || '?').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-sm text-gray-800 dark:text-gray-100 truncate">{{ u.full_name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ u.username }} · {{ u.contact_number ? formatPhone(u.contact_number) : 'No contact number' }}</p>
                    <p v-if="inviteMap[u.id]?.email" class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ inviteMap[u.id].email }}</p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-1.5 mb-2.5">
                  <span :class="roleBadge(u.role)" class="inline-block px-2 py-0.5 border rounded-md text-[11px] font-medium">{{ u.role }}</span>
                  <span class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200"><span class="w-2 h-2 rounded-full" :class="statusDot(effectiveStatus(u).tone)"></span>{{ effectiveStatus(u).label }}</span>
                  <span v-if="u.position" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{{ u.position }}</span>
                  <span v-if="u.role === 'Staff' && u.can_take_payments" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">Takes payments</span>
                  <span v-if="isPending(u)" class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">Invite pending</span>
                </div>

                <button v-if="u.role === 'Staff'" @click="openEventsModal(u)" class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline mb-2.5">
                  {{ upcomingCount(u.id) }} assigned event{{ upcomingCount(u.id) === 1 ? '' : 's' }}<span v-if="weekCount(u.id)"> · {{ weekCount(u.id) }} this week</span>
                </button>

                <div v-if="canAdminister" class="grid grid-cols-2 gap-2">
                  <button v-if="canManage(u)" @click="openEditUserModal(u)" :disabled="rowBusy(u)" class="inline-flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-semibold bg-emerald-600 text-white active:bg-emerald-700 disabled:opacity-50"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2 2 0 112.828 2.828L11.828 15.83a4 4 0 01-1.414.943L6 18l1.227-4.414A4 4 0 018 12.172z"/></svg> Edit</button>
                  <button v-if="u.role === 'Staff'" @click="openScheduleModal(u)" :disabled="rowBusy(u)" class="inline-flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-semibold border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 disabled:opacity-50"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Schedule</button>
                  <button v-if="isPending(u)" @click="handleResendInvite(u)" :disabled="rowBusy(u)" class="inline-flex items-center justify-center gap-1.5 min-h-[44px] text-sm font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-900/30 disabled:opacity-50"><template v-if="resendingId === u.id"><svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg> Sending...</template><template v-else>Resend invite</template></button>
                  <button v-if="canToggleActive(u)" @click="openToggleModal(u)" :disabled="rowBusy(u)" :class="u.is_active ? 'text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700' : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30'" class="inline-flex items-center justify-center min-h-[44px] text-sm font-semibold disabled:opacity-50">{{ u.is_active ? 'Deactivate' : 'Reactivate' }}</button>
                </div>
              </div>
            </div>

            <!-- Desktop / tablet table -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wide">
                  <tr>
                    <th v-if="canAdminister" class="px-4 py-3 w-10"><input type="checkbox" :checked="allPageSelected" :disabled="pageSelectable.length === 0" @change="toggleSelectAllPage" class="w-4 h-4 accent-emerald-600" aria-label="Select all on this page" /></th>
                    <th class="text-left px-4 py-3 font-semibold"></th>
                    <th class="text-left px-4 py-3 font-semibold"><button type="button" @click="setSort('name')" class="uppercase tracking-wide font-semibold hover:text-gray-800 dark:hover:text-gray-100">Full Name{{ sortIndicator('name') }}</button></th>
                    <th class="text-left px-4 py-3 font-semibold">Contact Number</th>
                    <th class="text-left px-4 py-3 font-semibold"><button type="button" @click="setSort('role')" class="uppercase tracking-wide font-semibold hover:text-gray-800 dark:hover:text-gray-100">Role{{ sortIndicator('role') }}</button></th>
                    <th class="text-left px-4 py-3 font-semibold">Position</th>
                    <th class="text-left px-4 py-3 font-semibold"><button type="button" @click="setSort('status')" class="uppercase tracking-wide font-semibold hover:text-gray-800 dark:hover:text-gray-100">Status{{ sortIndicator('status') }}</button></th>
                    <th class="text-left px-4 py-3 font-semibold"><button type="button" @click="setSort('events')" class="uppercase tracking-wide font-semibold hover:text-gray-800 dark:hover:text-gray-100">Assigned Events{{ sortIndicator('events') }}</button></th>
                    <th class="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                  <tr v-for="u in pagedUsers" :key="u.id" :class="{ 'opacity-60': !u.is_active }" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td v-if="canAdminister" class="px-4 py-3.5 w-10"><input v-if="isSelectable(u)" type="checkbox" :checked="selected.includes(u.id)" @change="toggleSelect(u.id)" class="w-4 h-4 accent-emerald-600" :aria-label="'Select ' + u.full_name" /></td>
                    <td class="px-4 py-3.5">
                      <div class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                        <img v-if="u.avatar_url" :src="u.avatar_url" alt="" class="w-full h-full object-cover" />
                        <span v-else>{{ (u.full_name || u.username || '?').charAt(0).toUpperCase() }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3.5">
                      <p class="font-medium text-gray-800 dark:text-gray-100">{{ u.full_name }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">@{{ u.username }}</p>
                      <p v-if="inviteMap[u.id]?.email" class="text-xs text-gray-400 dark:text-gray-500">{{ inviteMap[u.id].email }}</p>
                      <span v-if="isPending(u)" class="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">Invite pending</span>
                    </td>
                    <td class="px-4 py-3.5 text-gray-500 dark:text-gray-400">{{ formatPhone(u.contact_number) }}</td>
                    <td class="px-4 py-3.5 align-middle">
                      <span :class="roleBadge(u.role)" class="inline-block px-2 py-0.5 border rounded-md text-xs font-medium">{{ u.role }}</span>
                    </td>
                    <td class="px-4 py-3.5 text-gray-500 dark:text-gray-400">{{ positionLabel(u) }}</td>
                    <td class="px-4 py-3.5 align-middle">
                      <span class="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-200"><span class="w-2 h-2 rounded-full" :class="statusDot(effectiveStatus(u).tone)"></span>{{ effectiveStatus(u).label }}</span>
                    </td>
                    <td class="px-4 py-3.5">
                      <template v-if="u.role === 'Staff'">
                        <button v-if="upcomingCount(u.id) > 0" @click="openEventsModal(u)" class="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline text-left">
                          {{ upcomingCount(u.id) }} assigned
                          <span v-if="weekCount(u.id)" class="block font-normal text-gray-500 dark:text-gray-400">{{ weekCount(u.id) }} this week</span>
                        </button>
                        <span v-else class="text-xs text-gray-400 dark:text-gray-500">No assigned events</span>
                      </template>
                      <span v-else class="text-xs text-gray-400 dark:text-gray-500">Not applicable</span>
                    </td>
                    <td class="px-4 py-3.5 text-right">
                      <div v-if="canAdminister" class="flex items-center justify-end gap-2">
                        <button v-if="canManage(u)" @click="openEditUserModal(u)" :disabled="rowBusy(u)" title="Edit this person" :aria-label="'Edit ' + u.full_name" class="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536M9 13l6.768-6.768a2 2 0 112.828 2.828L11.828 15.83a4 4 0 01-1.414.943L6 18l1.227-4.414A4 4 0 018 12.172z"/></svg> Edit</button>
                        <button v-if="u.role === 'Staff'" @click="openScheduleModal(u)" :disabled="rowBusy(u)" title="Leave dates and assigned events" :aria-label="'Schedule for ' + u.full_name" class="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 disabled:opacity-50"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> Schedule</button>
                        <button v-if="hasRowMenu(u)" @click.stop="openRowMenu(u, $event)" :disabled="rowBusy(u)" title="More actions" :aria-label="'More actions for ' + u.full_name" class="inline-flex items-center justify-center h-8 w-8 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-60">
                          <template v-if="rowBusy(u)"><svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></template><template v-else><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg></template>
                        </button>
                        <span v-if="!hasAnyAction(u)" class="text-xs text-gray-400 dark:text-gray-500">No actions</span>
                      </div>
                      <span v-else class="text-xs text-gray-400 dark:text-gray-500">No actions</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="filteredUserList.length > PAGE_SIZE" class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <span>Showing {{ pageStart + 1 }}–{{ pageEnd }} of {{ filteredUserList.length }}</span>
              <div class="flex items-center gap-2">
                <button @click="page--" :disabled="page <= 1" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 font-semibold disabled:opacity-40">Prev</button>
                <span>Page {{ page }} of {{ totalPages }}</span>
                <button @click="page++" :disabled="page >= totalPages" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 font-semibold disabled:opacity-40">Next</button>
              </div>
            </div>
          </template>
        </div>

      </div>
    </main>

    <!-- ============ ADD USER MODAL ============ -->
    <div v-if="showAddUserModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Add New User</h3>

        <div v-if="modalError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ modalError }}
        </div>

        <form @submit.prevent="handleCreateUser" class="space-y-5">
          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</label>
            <input type="text" v-model="newUser.full_name" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Username</label>
            <input type="text" v-model="newUser.username" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Email</label>
            <input type="email" v-model="newUser.email" placeholder="their.email@gmail.com" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">An invitation email will be sent to this address so they can set their own password.</p>
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Contact Number</label>
            <input type="text" v-model="newUser.contact_number" placeholder="e.g. 0917 123 4567" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Role</label>
            <select v-model="newUser.role" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required>
              <option disabled value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option v-if="userRole === 'Owner/Manager'" value="Owner/Manager">Owner/Manager</option>
            </select>
          </div>

          <div v-if="newUser.role === 'Staff'" class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Position</label>
            <select v-model="newUser.position" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">No position set</option>
              <option value="Cook">Cook</option>
              <option value="Server">Server</option>
              <option value="Driver">Driver</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Availability</label>
            <select v-model="newUser.availability" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required>
              <option value="Available">Available</option>
              <option value="On Leave">On Leave</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeAddUserModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" :disabled="isCreating" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
              {{ isCreating ? 'Creating...' : 'Create User' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ============ EDIT USER MODAL ============ -->
    <div v-if="showEditUserModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-md p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Staff Member</h3>

        <div v-if="editModalError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ editModalError }}
        </div>

        <form @submit.prevent="handleUpdateUser" class="space-y-5">
          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Full Name</label>
            <input type="text" v-model="editUser.full_name" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Username</label>
            <input type="text" :value="editUser.username" disabled class="w-full p-3 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-none text-gray-500 dark:text-gray-400" />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Contact Number</label>
            <input type="text" v-model="editUser.contact_number" placeholder="e.g. 0917 123 4567" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" />
          </div>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Role</label>
            <select v-model="editUser.role" :disabled="!canEditRole" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option v-if="editUser.role === 'Owner/Manager'" value="Owner/Manager">Owner/Manager</option>
            </select>
            <p v-if="!canEditRole" class="text-xs text-gray-400 dark:text-gray-500 mt-1">The owner's role is fixed and can't be changed.</p>
          </div>

          <div v-if="editUser.role === 'Staff'" class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Position</label>
            <select v-model="editUser.position" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100">
              <option value="">No position set</option>
              <option value="Cook">Cook</option>
              <option value="Server">Server</option>
              <option value="Driver">Driver</option>
              <option value="Coordinator">Coordinator</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <label v-if="editUser.role === 'Staff'" class="flex items-start gap-3 p-3 border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/40">
            <input type="checkbox" v-model="editUser.can_take_payments" class="mt-0.5 h-4 w-4 accent-emerald-600" />
            <span>
              <span class="block text-sm font-semibold text-gray-900 dark:text-gray-100">Can take payments</span>
              <span class="block text-xs text-gray-500 dark:text-gray-400">Lets this staff record client payments and open Payment Records. Turn off for staff who shouldn't handle money.</span>
            </span>
          </label>

          <div class="relative">
            <label class="absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">Availability</label>
            <select v-model="editUser.availability" class="w-full p-3 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 dark:text-gray-100" required>
              <option value="Available">Available</option>
              <option value="On Leave">On Leave</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeEditUserModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </button>
            <button type="submit" :disabled="isSavingEdit" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
              {{ isSavingEdit ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>

        <div v-if="canDeleteEditTarget" class="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Leaving the business? Use <span class="font-semibold">Deactivate</span> on the list to keep their history. Deleting is permanent.</p>
          <button type="button" @click="deleteFromEdit" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">Delete this account permanently</button>
        </div>
      </div>
    </div>

    <!-- ============ DELETE USER CONFIRM MODAL ============ -->
    <div v-if="userToDelete" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Delete Account?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
          This will permanently delete the account for
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ userToDelete.full_name }}</span>
          ({{ userToDelete.role }}). This cannot be undone, and their assignment history is lost. Consider deactivating instead.
        </p>
        <div v-if="deleteUserError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
          {{ deleteUserError }}
        </div>
        <div class="flex gap-3">
          <button @click="userToDelete = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button @click="handleDeleteUser" :disabled="isDeletingUser" class="flex-1 bg-red-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-red-700 disabled:opacity-50">
            {{ isDeletingUser ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ============ STAFF SCHEDULE MODAL (calendar: leave + assigned events) ============ -->
    <div v-if="scheduleModalUser" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{{ scheduleModalUser.full_name }}'s Schedule</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Click a future date to mark it as leave. Booking-time assignment checks use these dates.</p>

        <div v-if="scheduleError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">{{ scheduleError }}</div>

        <!-- Month calendar -->
        <div class="border border-gray-200 dark:border-gray-700 mb-3">
          <div class="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <button type="button" @click="shiftMonth(-1)" class="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Previous month">‹</button>
            <span class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ calLabel }}</span>
            <button type="button" @click="shiftMonth(1)" class="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Next month">›</button>
          </div>
          <div class="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-gray-400 dark:text-gray-500 py-1.5">
            <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
          </div>
          <div class="grid grid-cols-7 gap-px p-1">
            <template v-for="(c, i) in calCells" :key="i">
              <div v-if="!c" class="h-11"></div>
              <button
                v-else
                type="button"
                :disabled="c.past"
                :title="cellTitle(c)"
                @click="pickCalendarDay(c)"
                :class="cellClass(c)"
                class="h-11 text-xs relative flex flex-col items-center justify-center"
              >
                <span>{{ c.day }}</span>
                <span v-if="c.events.length" class="absolute bottom-1 flex items-center gap-0.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span v-if="c.events.length > 1" class="text-[9px] leading-none font-bold text-emerald-700 dark:text-emerald-300">{{ c.events.length }}</span>
                </span>
              </button>
            </template>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2 border-t border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-amber-200 dark:bg-amber-800/60"></span>Leave</span>
            <span class="flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Assigned event</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 bg-red-200 dark:bg-red-800/60"></span>Event on a leave day</span>
          </div>
        </div>

        <form @submit.prevent="handleAddLeaveDate" class="flex gap-2 mb-4">
          <input type="date" v-model="newLeaveDate" :min="todayStr" required class="flex-1 min-w-0 p-2.5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
          <input type="text" v-model="newLeaveReason" maxlength="120" placeholder="Reason (optional)" class="flex-1 min-w-0 p-2.5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
          <button type="submit" :disabled="isSavingLeave" class="px-4 py-2.5 bg-emerald-600 text-white rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">Add</button>
        </form>

        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Marked unavailable</p>
        <div v-if="isLoadingSchedule" class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
        <div v-else-if="scheduleDates.length === 0" class="text-center py-5 text-gray-400 dark:text-gray-500 text-sm">No unavailable dates marked yet.</div>
        <div v-else class="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-300 dark:border-gray-600 rounded-none max-h-44 overflow-y-auto">
          <div v-for="d in scheduleDates" :key="d.id" class="flex items-center justify-between px-4 py-2.5">
            <div>
              <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ formatDate(d.unavailable_date) }}</p>
              <p v-if="d.reason" class="text-xs text-gray-500 dark:text-gray-400">{{ d.reason }}</p>
              <p v-if="(eventsByDate[d.unavailable_date] || []).length" class="text-xs font-semibold text-red-600 dark:text-red-400">Heads up: has an assigned event on this date</p>
            </div>
            <button @click="handleRemoveLeaveDate(d.id)" class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline">Remove</button>
          </div>
        </div>

        <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mt-4 mb-1.5">Assigned events</p>
        <div v-if="scheduleEvents.length === 0" class="text-sm text-gray-400 dark:text-gray-500">No upcoming events assigned.</div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-300 dark:border-gray-600 max-h-40 overflow-y-auto">
          <li v-for="e in scheduleEvents" :key="e.booking_id" class="px-4 py-2">
            <p class="text-sm font-medium text-gray-800 dark:text-gray-100">{{ formatDate(e.event_date) }} <span v-if="e.event_time" class="text-gray-500 dark:text-gray-400 font-normal">· {{ e.event_time }}</span></p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ e.client_name }}<span v-if="e.package_name"> · {{ e.package_name }}</span></p>
          </li>
        </ul>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="closeScheduleModal" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
        </div>
      </div>
    </div>

    <!-- ============ UPCOMING EVENTS MODAL (workload) ============ -->
    <div v-if="eventsModalUser" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{{ eventsModalUser.full_name }}'s Assigned Events</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">Pending and confirmed events this person is assigned to.</p>
        <div v-if="eventsModalList.length === 0" class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">No upcoming events assigned.</div>
        <ul v-else class="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
          <li v-for="e in eventsModalList" :key="e.booking_id" class="px-4 py-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ formatDate(e.event_date) }}<span v-if="e.event_time" class="font-normal text-gray-500 dark:text-gray-400"> · {{ e.event_time }}</span></p>
                <p class="text-sm text-gray-600 dark:text-gray-300 truncate">{{ e.client_name }}<span v-if="e.package_name"> · {{ e.package_name }}</span></p>
                <p v-if="e.event_location" class="text-xs text-gray-400 dark:text-gray-500 truncate">{{ e.event_location }}<span v-if="e.guest_count"> · {{ e.guest_count }} guests</span></p>
              </div>
              <span :class="e.booking_status === 'Confirmed' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'" class="px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0">{{ e.booking_status }}</span>
            </div>
          </li>
        </ul>
        <div class="flex gap-3 pt-4">
          <button type="button" @click="eventsModalUser = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Close</button>
        </div>
      </div>
    </div>

    <!-- ============ DEACTIVATE / REACTIVATE CONFIRM MODAL ============ -->
    <div v-if="userToToggle" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{ userToToggle.is_active ? 'Deactivate account?' : 'Reactivate account?' }}</h3>
        <p v-if="userToToggle.is_active" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ userToToggle.full_name }}</span> will no longer be able to sign in or be assigned to events. Their history is kept, and you can reactivate them anytime.
        </p>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span class="font-semibold text-gray-700 dark:text-gray-200">{{ userToToggle.full_name }}</span> will be able to sign in again and be assigned to events.
        </p>
        <div v-if="userToToggle.is_active && upcomingCount(userToToggle.id) > 0" class="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 mb-3">
          <p>They still have {{ upcomingCount(userToToggle.id) }} upcoming event{{ upcomingCount(userToToggle.id) === 1 ? '' : 's' }}. Reassign them first so no event is left without a crew.</p>
          <div class="flex flex-wrap gap-3 mt-2">
            <button type="button" @click="goReassign" class="text-xs font-semibold underline">Open Event Bookings</button>
            <button type="button" @click="viewEventsFromToggle" class="text-xs font-semibold underline">View their events</button>
          </div>
        </div>
        <div v-if="toggleError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-3">{{ toggleError }}</div>
        <div class="flex gap-3">
          <button @click="userToToggle = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
          <button @click="handleToggleActive" :disabled="isToggling" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
            <span class="inline-flex items-center justify-center gap-2"><template v-if="isToggling"><svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></template>{{ isToggling ? 'Saving...' : (userToToggle.is_active ? 'Deactivate' : 'Reactivate') }}</span>
          </button>
        </div>
      </div>
    </div>


    <!-- ============ ROW "MORE" MENU ============ -->
    <template v-if="rowMenu">
      <div class="fixed inset-0 z-40" @click="closeRowMenu"></div>
      <div class="fixed z-50 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1" :style="rowMenuStyle">
        <button v-if="rowMenu.user.role === 'Staff' && upcomingCount(rowMenu.user.id) > 0" @click="menuAction('events')" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> View assigned events</button>
        <button v-if="isPending(rowMenu.user)" @click="menuAction('resend')" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/30"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg> Resend invite</button>
        <button v-if="canToggleActive(rowMenu.user)" @click="menuAction('toggle')" :class="rowMenu.user.is_active ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700' : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.36 6.64a9 9 0 11-12.73 0M12 3v9"/></svg> {{ rowMenu.user.is_active ? 'Deactivate' : 'Reactivate' }}</button>
      </div>
    </template>

    <!-- ============ BULK DEACTIVATE / REACTIVATE CONFIRM ============ -->
    <div v-if="bulkAction" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-none shadow-xl w-full max-w-sm p-6">
        <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{{ bulkAction === 'deactivate' ? 'Deactivate' : 'Reactivate' }} {{ bulkTargets.length }} account{{ bulkTargets.length === 1 ? '' : 's' }}?</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {{ bulkTargets.map((u) => u.full_name).slice(0, 4).join(', ') }}<span v-if="bulkTargets.length > 4"> and {{ bulkTargets.length - 4 }} more</span>
        </p>
        <p v-if="bulkAction === 'deactivate' && bulkEventTotal > 0" class="text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 mb-3">
          Together they still have {{ bulkEventTotal }} upcoming assignment{{ bulkEventTotal === 1 ? '' : 's' }}. Reassign them in Event Bookings.
        </p>
        <div v-if="bulkError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-3">{{ bulkError }}</div>
        <div class="flex gap-3">
          <button @click="bulkAction = null" :disabled="isBulkRunning" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-none font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Cancel</button>
          <button @click="handleBulkConfirm" :disabled="isBulkRunning" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-none font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
            <span class="inline-flex items-center justify-center gap-2"><template v-if="isBulkRunning"><svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg></template>{{ isBulkRunning ? 'Working...' : 'Confirm' }}</span>
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
import { useRouter } from 'vue-router'
import NotificationBell from '../Components/NotificationBell.vue'
import { useSidebarState } from '../composables/useSidebarState'
import { useChatUnread } from '../composables/useChatUnread'
import { useReviewAlerts } from '../composables/useReviewAlerts'
import { isValidPhMobile, normalizePhMobile } from '../utils/validators'
import {
  getUsers, createStaffUser, updateStaffUser, deleteStaffUser,
  getStaffWorkload, getUpcomingLeaveMap, getInviteStatus, resendInvite, setStaffActive, bulkSetAvailability
} from '../services/staffService'
import {
  getUnavailableDates,
  addUnavailableDate,
  removeUnavailableDate
} from '../services/staffassignmentservice'

// Profiles store mobiles as 09171234567 (that's what phone-otp saves), so turn
// +639171234567 into the same shape and strip spaces/dashes.
function toLocalMobile(value) {
  const n = normalizePhMobile(value)
  return n.startsWith('+63') ? '0' + n.slice(3) : n
}

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
const userRole = ref('Admin')
const userInitial = ref('U')
const userAvatarUrl = ref('')
const currentUserId = ref('')

const userList = ref([])
const staffSearchQuery = ref('')
const staffRoleFilter = ref('')
const staffAvailabilityFilter = ref('')
const staffPositionFilter = ref('')
const staffStatusFilter = ref('active')
const POSITIONS = ['Cook', 'Server', 'Driver', 'Coordinator', 'Other']

// Extra data layered on top of the profile list.
const workloadMap = ref({})   // { staff_id: [upcoming bookings] }
const leaveMap = ref({})      // { staff_id: [{ unavailable_date, reason }] } (today onward)
const inviteMap = ref({})     // { user_id: { email, pending } } -- needs the manage-staff edge function
const notice = ref('')
let noticeTimer = null
function showNotice(msg) {
  notice.value = msg
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 4500)
}

const canAdminister = computed(() => userRole.value === 'Admin' || userRole.value === 'Owner/Manager')

// ---------- Derived per-person info ----------
function upcomingCount(id) { return (workloadMap.value[id] || []).length }
function weekCount(id) {
  const limit = toLocalDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
  return (workloadMap.value[id] || []).filter((e) => e.event_date <= limit).length
}
function leaveToday(id) {
  return (leaveMap.value[id] || []).some((d) => d.unavailable_date === localToday())
}
// Last day of the unbroken run of leave dates that starts today.
function leaveUntil(id) {
  const dates = new Set((leaveMap.value[id] || []).map((d) => d.unavailable_date))
  let day = new Date()
  let last = localToday()
  for (;;) {
    day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)
    const next = toLocalDateStr(day)
    if (!dates.has(next)) break
    last = next
  }
  return last
}
function shortDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })
}
// 09321321323 -> 0932 132 1323 (display only; the database keeps the plain number)
function formatPhone(n) {
  const v = String(n || '')
  return /^09\d{9}$/.test(v) ? `${v.slice(0, 4)} ${v.slice(4, 7)} ${v.slice(7)}` : (v || '—')
}
function positionLabel(u) {
  if (u.position) return u.position
  if (u.role === 'Owner/Manager') return 'Owner'
  return 'Not applicable'
}
function hasAnyAction(u) {
  return canManage(u) || u.role === 'Staff' || hasRowMenu(u)
}
function isPending(u) { return !!inviteMap.value[u.id]?.pending }

// What to show in the Status column: the manual availability flag, overridden
// by "Inactive" and by a leave date that falls today.
function effectiveStatus(u) {
  if (!u.is_active) return { label: 'Inactive', tone: 'gray' }
  if (u.availability === 'Available' && leaveToday(u.id)) {
    const until = leaveUntil(u.id)
    return { label: until === localToday() ? 'On leave today' : `On leave until ${shortDate(until)}`, tone: 'amber' }
  }
  if (u.availability === 'On Leave') return { label: 'On Leave', tone: 'amber' }
  if (u.availability === 'Unavailable') return { label: 'Unavailable', tone: 'red' }
  return { label: u.availability || 'Available', tone: 'emerald' }
}

const ROLE_BADGES = {
  Admin: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200',
  Staff: 'border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200',
  'Owner/Manager': 'border-emerald-400 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300'
}
// Status = small coloured dot + plain text (calmer than filled pills).
const STATUS_DOTS = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  gray: 'bg-gray-400'
}
const statusDot = (tone) => STATUS_DOTS[tone] || STATUS_DOTS.gray
const roleBadge = (role) => ROLE_BADGES[role] || ROLE_BADGES.Staff

// ---------- Summary cards (Staff-role people who are active) ----------
const summaryCards = computed(() => {
  const active = userList.value.filter((u) => u.is_active)
  const staff = active.filter((u) => u.role === 'Staff')
  const availableToday = staff.filter((u) => effectiveStatus(u).tone === 'emerald').length
  const weekStaff = staff.filter((u) => weekCount(u.id) > 0)
  const weekEvents = new Set()
  for (const u of weekStaff) {
    const limit = toLocalDateStr(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    for (const e of workloadMap.value[u.id] || []) if (e.event_date <= limit) weekEvents.add(e.booking_id)
  }
  return [
    { label: 'Team members', value: active.length, sub: `${staff.length} staff · ${active.length - staff.length} admin/owner`, cls: 'text-gray-900 dark:text-gray-100' },
    { label: 'Available today', value: availableToday, sub: 'Staff ready to be assigned', cls: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Off today', value: staff.length - availableToday, sub: 'On leave or unavailable', cls: 'text-amber-600 dark:text-amber-400' },
    { label: 'Assigned this week', value: weekStaff.length, sub: `${weekEvents.size} event${weekEvents.size === 1 ? '' : 's'} in the next 7 days`, cls: 'text-blue-600 dark:text-blue-400' }
  ]
})

// ---------- Search, filter, sort, paginate ----------
const sortKey = ref('name')
const sortDir = ref('asc')
const page = ref(1)
const PAGE_SIZE = 10

function setSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDir.value = 'asc' }
}
function sortIndicator(key) {
  if (sortKey.value !== key) return ''
  return sortDir.value === 'asc' ? ' ▲' : ' ▼'
}
function clearFilters() {
  staffSearchQuery.value = ''
  staffRoleFilter.value = ''
  staffPositionFilter.value = ''
  staffAvailabilityFilter.value = ''
  staffStatusFilter.value = 'active'
}

const filteredUserList = computed(() => {
  const q = staffSearchQuery.value.trim().toLowerCase()
  const list = userList.value.filter((u) => {
    const matchesQuery = !q ||
      u.full_name?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.contact_number?.toLowerCase().includes(q.replace(/\s+/g, '')) ||
      u.position?.toLowerCase().includes(q) ||
      inviteMap.value[u.id]?.email?.toLowerCase().includes(q)
    const matchesRole = !staffRoleFilter.value || u.role === staffRoleFilter.value
    const matchesPosition = !staffPositionFilter.value || u.position === staffPositionFilter.value
    const matchesAvailability = !staffAvailabilityFilter.value || u.availability === staffAvailabilityFilter.value
    const matchesStatus = staffStatusFilter.value === 'all' ||
      (staffStatusFilter.value === 'active' ? u.is_active : !u.is_active)
    return matchesQuery && matchesRole && matchesPosition && matchesAvailability && matchesStatus
  })

  const dir = sortDir.value === 'asc' ? 1 : -1
  const keyOf = {
    name: (u) => (u.full_name || u.username || '').toLowerCase(),
    role: (u) => u.role || '',
    status: (u) => effectiveStatus(u).label,
    events: (u) => upcomingCount(u.id)
  }[sortKey.value]
  return [...list].sort((a, b) => {
    const x = keyOf(a), y = keyOf(b)
    const cmp = typeof x === 'number' ? x - y : String(x).localeCompare(String(y))
    return (cmp || (a.full_name || '').localeCompare(b.full_name || '')) * dir
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUserList.value.length / PAGE_SIZE)))
const pageStart = computed(() => (page.value - 1) * PAGE_SIZE)
const pageEnd = computed(() => Math.min(pageStart.value + PAGE_SIZE, filteredUserList.value.length))
const pagedUsers = computed(() => filteredUserList.value.slice(pageStart.value, pageStart.value + PAGE_SIZE))

watch([staffSearchQuery, staffRoleFilter, staffPositionFilter, staffAvailabilityFilter, staffStatusFilter, sortKey, sortDir], () => { page.value = 1 })
watch(totalPages, (n) => { if (page.value > n) page.value = n })
const isLoadingUsers = ref(false)
const usersError = ref('')

const showAddUserModal = ref(false)
const isCreating = ref(false)
const modalError = ref('')
const newUser = ref({ full_name: '', username: '', email: '', role: '', contact_number: '', availability: 'Available', position: '' })

const showEditUserModal = ref(false)
const isSavingEdit = ref(false)
const editModalError = ref('')
const editUser = ref({ id: '', full_name: '', username: '', role: '', contact_number: '', availability: 'Available', position: '', can_take_payments: true })

const userToDelete = ref(null)
const isDeletingUser = ref(false)
// Mirrors the database rules: only the owner may edit the owner profile, and
// only an Admin may change roles (the owner role itself never changes).
function canManage(u) {
  return u.role !== 'Owner/Manager' || u.id === currentUserId.value
}
const canEditRole = computed(() => {
  const target = userList.value.find((u) => u.id === editUser.value.id)
  // Admin AND Owner/Manager may change roles (matches the database trigger),
  // but never the owner's own role.
  return ['Admin', 'Owner/Manager'].includes(userRole.value) && target?.role !== 'Owner/Manager'
})
const deleteUserError = ref('')

// ---------- Staff schedule (per-date unavailability) ----------
const scheduleModalUser = ref(null)
const scheduleDates = ref([])
const isLoadingSchedule = ref(false)
const scheduleError = ref('')
const newLeaveDate = ref('')
const newLeaveReason = ref('')
const isSavingLeave = ref(false)
const todayStr = localToday()

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }
  const user = JSON.parse(storedUser)

  // Per the manuscript's Use Case Diagram, only Admin and Owner/Manager
  // manage staff -- Staff themselves don't get this page.
  if (!['Admin', 'Owner/Manager'].includes(user.role)) {
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
  currentUserId.value = user.user_id

  fetchUsers()
  loadExtras()
})

async function fetchUsers() {
  isLoadingUsers.value = true
  usersError.value = ''
  try {
    const result = await getUsers()
    userList.value = result.users
  } catch (error) {
    console.error('Failed to fetch users:', error)
    usersError.value = error?.message || 'Failed to load staff.'
  } finally {
    isLoadingUsers.value = false
  }
}

async function loadExtras() {
  // Each piece is optional: if one fails the page still works without it.
  const [workload, leave] = await Promise.allSettled([getStaffWorkload(), getUpcomingLeaveMap()])
  if (workload.status === 'fulfilled') workloadMap.value = workload.value
  else console.error(workload.reason)
  if (leave.status === 'fulfilled') leaveMap.value = leave.value
  else console.error(leave.reason)
  loadInviteStatus()
}

async function loadInviteStatus() {
  try {
    inviteMap.value = await getInviteStatus()
  } catch (error) {
    // manage-staff edge function not deployed yet -> just hide emails / pending badges.
    console.warn('Invite status unavailable:', error?.message)
  }
}

async function refreshLeaveMap() {
  try { leaveMap.value = await getUpcomingLeaveMap() } catch (error) { console.error(error) }
}

function openAddUserModal() {
  newUser.value = { full_name: '', username: '', email: '', role: '', contact_number: '', availability: 'Available', position: '' }
  modalError.value = ''
  showAddUserModal.value = true
}

function closeAddUserModal() {
  showAddUserModal.value = false
}

async function handleCreateUser() {
  modalError.value = ''
  // `required` lets whitespace-only text through, and a username saved with a
  // trailing space can never be found again at login, so clean everything first.
  const username = String(newUser.value.username || '').trim()
  const email = String(newUser.value.email || '').trim().toLowerCase()
  const fullName = String(newUser.value.full_name || '').trim()
  if (!fullName) {
    modalError.value = 'Full name is required.'
    return
  }
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) {
    modalError.value = 'Username must be 3-30 characters: letters, numbers, dot, dash or underscore only.'
    return
  }
  if (newUser.value.contact_number && !isValidPhMobile(newUser.value.contact_number)) {
    modalError.value = 'Enter a valid mobile number, e.g. 09171234567.'
    return
  }
  isCreating.value = true

  try {
    await createStaffUser(
      username,
      email,
      fullName,
      newUser.value.role,
      // Store 09171234567, not "0917 123 4567", so login-by-number and SMS match.
      toLocalMobile(newUser.value.contact_number) || null,
      newUser.value.availability,
      newUser.value.role === 'Staff' ? (newUser.value.position || null) : null
    )
    showAddUserModal.value = false
    fetchUsers()
    loadInviteStatus()
    showNotice('Account created. An invitation email was sent.')
  } catch (error) {
    modalError.value = error.message || 'Something went wrong. Please try again.'
  } finally {
    isCreating.value = false
  }
}

function openEditUserModal(user) {
  editUser.value = {
    id: user.id,
    full_name: user.full_name,
    username: user.username,
    role: user.role,
    contact_number: user.contact_number || '',
    availability: user.availability || 'Available',
    position: user.position || '',
    can_take_payments: user.can_take_payments !== false
  }
  editModalError.value = ''
  showEditUserModal.value = true
}

function closeEditUserModal() {
  showEditUserModal.value = false
}

async function handleUpdateUser() {
  editModalError.value = ''

  // An Admin/Owner who changes their OWN role (e.g. Admin -> Staff) would lose
  // access to this page immediately and could lock the business out.
  if (editUser.value.id === currentUserId.value) {
    const original = userList.value.find((u) => u.id === currentUserId.value)
    if (original && original.role !== editUser.value.role) {
      editModalError.value = "You can't change your own role. Ask another Admin/Owner to do it."
      return
    }
  }
  if (!String(editUser.value.full_name || '').trim()) {
    editModalError.value = 'Full name is required.'
    return
  }
  if (editUser.value.contact_number && !isValidPhMobile(editUser.value.contact_number)) {
    editModalError.value = 'Enter a valid mobile number, e.g. 09171234567.'
    return
  }
  isSavingEdit.value = true

  try {
    await updateStaffUser(editUser.value.id, {
      full_name: String(editUser.value.full_name).trim(),
      role: editUser.value.role,
      contact_number: toLocalMobile(editUser.value.contact_number) || null,
      availability: editUser.value.availability,
      position: editUser.value.role === 'Staff' ? (editUser.value.position || null) : null,
      // Admin/Owner can always take payments; only Staff is switchable.
      can_take_payments: editUser.value.role === 'Staff' ? !!editUser.value.can_take_payments : true
    })
    showEditUserModal.value = false
    fetchUsers()
  } catch (error) {
    editModalError.value = error.message || 'Something went wrong. Please try again.'
  } finally {
    isSavingEdit.value = false
  }
}

function confirmDeleteUser(user) {
  userToDelete.value = user
  deleteUserError.value = ''
}

async function handleDeleteUser() {
  if (!userToDelete.value) return
  deleteUserError.value = ''
  isDeletingUser.value = true
  try {
    await deleteStaffUser(userToDelete.value.id)
    userList.value = userList.value.filter((u) => u.id !== userToDelete.value.id)
    userToDelete.value = null
    showNotice('Account deleted.')
  } catch (error) {
    deleteUserError.value = error.message || 'Failed to delete account. Please try again.'
  } finally {
    isDeletingUser.value = false
  }
}

const canDeleteEditTarget = computed(() => {
  const t = userList.value.find((u) => u.id === editUser.value.id)
  return !!t && t.id !== currentUserId.value && t.role !== 'Owner/Manager'
})
function deleteFromEdit() {
  const t = userList.value.find((u) => u.id === editUser.value.id)
  if (!t) return
  showEditUserModal.value = false
  confirmDeleteUser(t)
}

// ---------- Deactivate / reactivate ----------
const userToToggle = ref(null)
const isToggling = ref(false)
const toggleError = ref('')

// Same rules the edge function enforces: never yourself, never the owner,
// and only the owner may deactivate an Admin.
function canToggleActive(u) {
  if (u.id === currentUserId.value || u.role === 'Owner/Manager') return false
  if (u.role === 'Admin' && userRole.value !== 'Owner/Manager') return false
  return true
}
function openToggleModal(u) {
  userToToggle.value = u
  toggleError.value = ''
}
async function handleToggleActive() {
  const u = userToToggle.value
  if (!u) return
  isToggling.value = true
  toggleError.value = ''
  try {
    const nextActive = !u.is_active
    await setStaffActive(u.id, nextActive)
    u.is_active = nextActive
    userToToggle.value = null
    showNotice(nextActive ? `${u.full_name} was reactivated.` : `${u.full_name} was deactivated.`)
  } catch (error) {
    toggleError.value = error?.message || 'Failed to update the account.'
  } finally {
    isToggling.value = false
  }
}

// ---------- Resend invitation ----------
const resendingId = ref('')
async function handleResendInvite(u) {
  resendingId.value = u.id
  usersError.value = ''
  try {
    const res = await resendInvite(u.id)
    showNotice(res?.message || 'Invitation sent.')
  } catch (error) {
    usersError.value = error?.message || 'Failed to resend invitation.'
  } finally {
    resendingId.value = ''
  }
}

// ---------- Upcoming events (workload) modal ----------
const eventsModalUser = ref(null)
const eventsModalList = computed(() => (eventsModalUser.value ? workloadMap.value[eventsModalUser.value.id] || [] : []))
function openEventsModal(u) { eventsModalUser.value = u }

async function openScheduleModal(user) {
  scheduleModalUser.value = user
  scheduleError.value = ''
  newLeaveDate.value = ''
  newLeaveReason.value = ''
  const now = new Date()
  calMonth.value = new Date(now.getFullYear(), now.getMonth(), 1)
  await loadSchedule()
}

function closeScheduleModal() {
  scheduleModalUser.value = null
  scheduleDates.value = []
}

async function loadSchedule() {
  if (!scheduleModalUser.value) return
  isLoadingSchedule.value = true
  try {
    scheduleDates.value = await getUnavailableDates(scheduleModalUser.value.id)
  } catch (error) {
    scheduleError.value = error?.message || 'Failed to load schedule.'
  } finally {
    isLoadingSchedule.value = false
  }
}

async function handleAddLeaveDate() {
  if (!scheduleModalUser.value || !newLeaveDate.value) return
  scheduleError.value = ''
  isSavingLeave.value = true
  try {
    await addUnavailableDate(scheduleModalUser.value.id, newLeaveDate.value, newLeaveReason.value || null)
    newLeaveDate.value = ''
    newLeaveReason.value = ''
    await loadSchedule()
    refreshLeaveMap()
  } catch (error) {
    scheduleError.value = error?.message || 'Failed to add date.'
  } finally {
    isSavingLeave.value = false
  }
}

async function handleRemoveLeaveDate(id) {
  scheduleError.value = ''
  try {
    await removeUnavailableDate(id)
    scheduleDates.value = scheduleDates.value.filter((d) => d.id !== id)
    refreshLeaveMap()
  } catch (error) {
    scheduleError.value = error?.message || 'Failed to remove date.'
  }
}

// ---------- Row "more" menu (fixed-position so the table's scroll area can't clip it) ----------
const rowMenu = ref(null)
const rowMenuStyle = computed(() => {
  const m = rowMenu.value
  if (!m) return {}
  return m.openUp
    ? { bottom: `${m.edge}px`, right: `${m.right}px` }
    : { top: `${m.edge}px`, right: `${m.right}px` }
})
function hasRowMenu(u) {
  return isPending(u) || canToggleActive(u) || (u.role === 'Staff' && upcomingCount(u.id) > 0)
}
function openRowMenu(u, ev) {
  if (rowMenu.value?.user.id === u.id) { closeRowMenu(); return }
  const r = ev.currentTarget.getBoundingClientRect()
  const openUp = window.innerHeight - r.bottom < 190
  rowMenu.value = {
    user: u,
    openUp,
    edge: openUp ? window.innerHeight - r.top + 4 : r.bottom + 4,
    right: window.innerWidth - r.right
  }
}
function closeRowMenu() { rowMenu.value = null }
function menuAction(kind) {
  const u = rowMenu.value?.user
  closeRowMenu()
  if (!u) return
  if (kind === 'events') openEventsModal(u)
  else if (kind === 'resend') handleResendInvite(u)
  else if (kind === 'toggle') openToggleModal(u)
}
window.addEventListener('scroll', closeRowMenu, true)
window.addEventListener('resize', closeRowMenu)
onBeforeUnmount(() => {
  window.removeEventListener('scroll', closeRowMenu, true)
  window.removeEventListener('resize', closeRowMenu)
})

// Row is "busy" while its own resend / deactivate request is running.
function rowBusy(u) {
  return resendingId.value === u.id || (isToggling.value && userToToggle.value?.id === u.id)
}

// Shortcuts from the deactivate warning.
function goReassign() {
  userToToggle.value = null
  router.push('/admin/bookings')
}
function viewEventsFromToggle() {
  const u = userToToggle.value
  userToToggle.value = null
  if (u) openEventsModal(u)
}

// ---------- Bulk selection ----------
const selected = ref([])
const isSelectable = (u) => canAdminister.value && canToggleActive(u)
const pageSelectable = computed(() => pagedUsers.value.filter(isSelectable))
const allPageSelected = computed(() => pageSelectable.value.length > 0 && pageSelectable.value.every((u) => selected.value.includes(u.id)))
const selectedUsers = computed(() => userList.value.filter((u) => selected.value.includes(u.id)))
const selectedActiveCount = computed(() => selectedUsers.value.filter((u) => u.is_active).length)
const selectedInactiveCount = computed(() => selectedUsers.value.filter((u) => !u.is_active).length)

function toggleSelect(id) {
  selected.value = selected.value.includes(id) ? selected.value.filter((x) => x !== id) : [...selected.value, id]
}
function toggleSelectAllPage() {
  const ids = pageSelectable.value.map((u) => u.id)
  selected.value = allPageSelected.value
    ? selected.value.filter((id) => !ids.includes(id))
    : [...new Set([...selected.value, ...ids])]
}
// A changed filter or page can hide selected rows -- never act on people you can't see.
watch([staffSearchQuery, staffRoleFilter, staffPositionFilter, staffAvailabilityFilter, staffStatusFilter], () => { selected.value = [] })

const bulkAction = ref(null)
const bulkError = ref('')
const isBulkRunning = ref(false)
const bulkTargets = computed(() => selectedUsers.value.filter((u) => (bulkAction.value === 'deactivate' ? u.is_active : !u.is_active)))
const bulkEventTotal = computed(() => bulkTargets.value.reduce((n, u) => n + upcomingCount(u.id), 0))

function openBulk(action) {
  bulkAction.value = action
  bulkError.value = ''
}
async function handleBulkConfirm() {
  const nextActive = bulkAction.value === 'reactivate'
  const targets = [...bulkTargets.value]
  isBulkRunning.value = true
  bulkError.value = ''
  let ok = 0
  const failed = []
  // One at a time: each call also bans/unbans the sign-in, and a failure on one shouldn't stop the rest.
  for (const u of targets) {
    try {
      await setStaffActive(u.id, nextActive)
      u.is_active = nextActive
      ok++
    } catch (error) {
      failed.push(`${u.full_name}: ${error?.message || 'failed'}`)
    }
  }
  isBulkRunning.value = false
  selected.value = selected.value.filter((id) => failed.length && targets.some((u) => u.id === id && !(u.is_active === nextActive)))
  if (failed.length) {
    bulkError.value = `${ok} updated, ${failed.length} failed. ${failed.slice(0, 2).join(' | ')}`
    return
  }
  bulkAction.value = null
  showNotice(`${ok} account${ok === 1 ? '' : 's'} ${nextActive ? 'reactivated' : 'deactivated'}.`)
}

async function handleBulkAvailability(ev) {
  const value = ev.target.value
  ev.target.value = ''
  if (!value) return
  const targets = selectedUsers.value.filter((u) => u.is_active)
  if (targets.length === 0) {
    usersError.value = 'Reactivate inactive accounts before changing their availability.'
    return
  }
  isBulkRunning.value = true
  usersError.value = ''
  try {
    await bulkSetAvailability(targets.map((u) => u.id), value)
    for (const u of targets) u.availability = value
    selected.value = []
    showNotice(`${targets.length} account${targets.length === 1 ? '' : 's'} set to ${value}.`)
  } catch (error) {
    usersError.value = error?.message || 'Failed to update availability.'
  } finally {
    isBulkRunning.value = false
  }
}

// ---------- Schedule calendar ----------
const calMonth = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const calLabel = computed(() => calMonth.value.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' }))
function shiftMonth(delta) {
  calMonth.value = new Date(calMonth.value.getFullYear(), calMonth.value.getMonth() + delta, 1)
}
const scheduleEvents = computed(() => (scheduleModalUser.value ? workloadMap.value[scheduleModalUser.value.id] || [] : []))
const leaveByDate = computed(() => {
  const m = {}
  for (const d of scheduleDates.value) m[d.unavailable_date] = d
  return m
})
const eventsByDate = computed(() => {
  const m = {}
  for (const e of scheduleEvents.value) (m[e.event_date] ||= []).push(e)
  return m
})
const calCells = computed(() => {
  const y = calMonth.value.getFullYear()
  const mo = calMonth.value.getMonth()
  const lead = new Date(y, mo, 1).getDay()
  const days = new Date(y, mo + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < lead; i++) cells.push(null)
  for (let d = 1; d <= days; d++) {
    const date = toLocalDateStr(new Date(y, mo, d))
    cells.push({ day: d, date, past: date < todayStr, today: date === todayStr, leave: leaveByDate.value[date], events: eventsByDate.value[date] || [] })
  }
  return cells
})
function pickCalendarDay(c) {
  if (!c || c.past) return
  newLeaveDate.value = c.date
}
function cellTitle(c) {
  const bits = []
  if (c.leave) bits.push(`Leave${c.leave.reason ? ': ' + c.leave.reason : ''}`)
  for (const e of c.events) bits.push(`Event: ${e.client_name}`)
  return bits.join(' | ')
}
function cellClass(c) {
  const cls = []
  if (c.past) cls.push('text-gray-300 dark:text-gray-600 cursor-not-allowed')
  else cls.push('text-gray-700 dark:text-gray-200')
  if (c.leave && c.events.length) cls.push('bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300')
  else if (c.leave) cls.push('bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200')
  else if (!c.past) cls.push('hover:bg-gray-100 dark:hover:bg-gray-700')
  if (c.today) cls.push('border border-emerald-500 font-bold')
  if (newLeaveDate.value === c.date) cls.push('ring-2 ring-emerald-500')
  return cls.join(' ')
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

const navItems = [
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
</script>

<style scoped>
</style>