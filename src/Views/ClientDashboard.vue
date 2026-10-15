<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">

    <!-- TOP NAV -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="w-full px-4 sm:px-6 lg:px-10 py-3 sm:py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img :src="logoUrl" alt="Logo" class="w-8 h-8 object-contain" />
          <span class="font-bold text-gray-800 dark:text-gray-100">Caterlytics</span>
        </div>
        <div class="flex items-center gap-3 relative" @keydown.esc="showAccountMenu = false">
          <button type="button" @click="showAccountMenu = !showAccountMenu" aria-haspopup="menu" :aria-expanded="showAccountMenu" aria-label="Account menu" class="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <div class="text-right hidden sm:block">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-none">{{ userName }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Client</p>
            </div>
            <div class="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              <img v-if="userAvatarUrl" :src="userAvatarUrl" alt="Profile picture" class="w-full h-full object-cover" />
              <span v-else>{{ userInitial }}</span>
            </div>
          </button>

          <!-- Click-outside backdrop -->
          <div v-if="showAccountMenu" @click="showAccountMenu = false" class="fixed inset-0 z-40"></div>

          <!-- Account menu, opens downward from the top nav -->
          <div v-if="showAccountMenu" role="menu" class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
            <button @click="showAccountMenu = false; router.push('/settings')" class="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
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
        </div>
      </div>
    </header>

    <main class="w-full px-4 sm:px-6 lg:px-10 py-4 sm:py-8">

      <!-- TABS (hidden while a caterer is open in Book Catering) -->
      <div v-if="!(activeTab === 'Book Catering' && selectedBusinessId)" class="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <div class="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 w-full sm:w-fit overflow-x-auto no-scrollbar">
            <button
              v-for="tab in tabs" :key="tab"
              @click="activeTab = tab"
              :class="activeTab === tab ? 'bg-emerald-600 dark:bg-emerald-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
              class="relative flex-1 sm:flex-none whitespace-nowrap px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold transition"
            >
              {{ tab }}
              <span
                v-if="tab === 'Messages' && chatUnread"
                class="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow"
              >{{ chatUnread > 99 ? '99+' : chatUnread }}</span>
            </button>
        </div>
        <div v-if="activeTab === 'Book Catering' && !selectedBusinessId && !bookingConfirmation && businesses.length" class="flex flex-wrap items-center gap-2 sm:gap-3 sm:ml-auto">
          <label for="biz-sort" class="text-xs font-semibold text-gray-500 dark:text-gray-400">Sort by</label>
          <select id="biz-sort" v-model="businessSort" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
            <option value="name">Name (A–Z)</option>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price">Lowest price</option>
          </select>
          <button
            type="button"
            @click="businessFavoritesOnly = !businessFavoritesOnly"
            :class="businessFavoritesOnly ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-600 dark:text-red-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'"
            class="px-3 py-2 border rounded-xl text-sm font-semibold transition"
          >
            ♥ Favorites{{ favoriteBusinessIds.size ? ` (${favoriteBusinessIds.size})` : '' }}
          </button>
          <div class="flex items-center gap-2">
            <label for="biz-date" class="text-xs font-semibold text-gray-500 dark:text-gray-400">Available on</label>
            <input id="biz-date" type="date" v-model="bizDate" :min="minEventDate" :max="maxEventDate" class="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            <button v-if="bizDate" type="button" @click="bizDate = ''" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Clear</button>
          </div>
        </div>
      </div>

      <!-- Global success / error banners -->
      <div v-if="successMessage" class="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium p-3 rounded-xl mb-4">
        {{ successMessage }}
      </div>
      <div v-if="pageError" class="text-red-600 dark:text-red-400 text-sm font-medium mb-4">
        {{ pageError }}
      </div>

      <!-- ============ BOOKING SENT: CONFIRMATION SCREEN ============ -->
      <div v-if="activeTab === 'Book Catering' && bookingConfirmation" class="max-w-xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div class="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-800 dark:text-gray-100 mt-4 text-center">Booking request sent!</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">{{ bookingConfirmation.business_name }} will review your request.</p>

          <div class="mt-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 space-y-2 text-sm">
            <div v-for="row in bookingConfirmation.rows" :key="row.label" class="flex items-start justify-between gap-4">
              <span class="text-gray-500 dark:text-gray-400 flex-shrink-0">{{ row.label }}</span>
              <span class="font-semibold text-gray-800 dark:text-gray-100 text-right break-words min-w-0">{{ row.value }}</span>
            </div>
            <div class="flex items-center justify-between gap-4">
              <span class="text-gray-500 dark:text-gray-400">Status</span>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">Pending</span>
            </div>
          </div>

          <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-6 mb-3">What happens next</p>
          <ol class="space-y-3">
            <li v-for="(step, i) in confirmationNextSteps" :key="step.title" class="flex items-start gap-3">
              <span class="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{{ i + 1 }}</span>
              <div>
                <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ step.title }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ step.text }}</p>
              </div>
            </li>
          </ol>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" @click="bookingConfirmation = null; activeTab = 'My Bookings'" class="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition">View My Bookings</button>
            <button type="button" @click="messageBusiness(bookingConfirmation.business_id)" class="flex-1 min-h-[44px] border border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl font-semibold text-sm transition">Message caterer</button>
          </div>
          <button type="button" @click="bookingConfirmation = null" class="block mx-auto mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline">Book another event</button>
        </div>
      </div>

      <!-- ============ STEP 1: PICK A CATERING BUSINESS ============ -->
      <div v-else-if="activeTab === 'Book Catering' && !selectedBusinessId">

        <p v-if="bizDate" class="text-xs text-gray-500 dark:text-gray-400 mb-3" role="status">
          <template v-if="isCheckingBizDate">Checking who is free on {{ formatDate(bizDate) }}...</template>
          <template v-else>Showing caterers free on {{ formatDate(bizDate) }}<span v-if="bookedOnDateCount"> · {{ bookedOnDateCount }} already booked that day</span>.</template>
        </p>

        <div v-if="businesses.length" class="relative mb-4">
          <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="businessSearch"
            aria-label="Search caterers"
            placeholder="Search by name or address..."
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div v-if="!businesses.length" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-14 text-gray-400 dark:text-gray-500 text-sm">
          No catering businesses are available yet.
        </div>

        <div v-else-if="!filteredBusinessesForBooking.length" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-14 text-gray-500 dark:text-gray-400 text-sm">
          <template v-if="isCheckingBizDate">Checking availability...</template>
          <template v-else-if="bizDate">No caterers are free on {{ formatDate(bizDate) }} with these filters. Try another date.</template>
          <template v-else>No businesses match your filters.</template>
          <div v-if="hasBizFilters" class="mt-3">
            <button type="button" @click="clearBizFilters" class="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Clear filters</button>
          </div>
        </div>

        <div v-else :class="isCheckingBizDate ? 'opacity-60' : ''" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity">
          <div
            v-for="b in filteredBusinessesForBooking"
            :key="b.business_id"
            role="button"
            tabindex="0"
            @click="selectBusiness(b.business_id)"
            @keydown.enter.self="selectBusiness(b.business_id)"
            class="group relative cursor-pointer text-left bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex flex-col"
          >
            <!-- Cover photo (first package photo), or a gradient with the initial -->
            <div class="relative aspect-[16/7] bg-gradient-to-br from-emerald-500 to-emerald-800 overflow-hidden">
              <img v-if="b.cover_url" :src="b.cover_url" :alt="`${b.business_name} cover photo`" class="w-full h-full object-cover object-[center_25%]" loading="lazy" />
              <span v-else class="absolute inset-0 flex items-center justify-center text-6xl font-extrabold text-white/25 select-none" aria-hidden="true">{{ b.business_name.charAt(0).toUpperCase() }}</span>
              <div class="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/35 to-transparent"></div>
              <div class="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                <span v-if="isTopRated(b)" class="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-wide shadow">★ Top rated</span>
                <span v-if="isMostBooked(b)" class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wide shadow">Most booked</span>
              </div>
              <div class="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-gray-900/70 p-0.5 shadow">
                <HeartButton small :active="favoriteBusinessIds.has(b.business_id)" @toggle="toggleFavoriteBusiness(b.business_id)" />
              </div>
            </div>

            <div class="px-4 pb-4 flex flex-col flex-1">
              <img
                v-if="b.logo_url"
                :src="b.logo_url"
                :alt="b.business_name"
                class="w-14 h-14 -mt-8 rounded-full object-cover border-4 border-white dark:border-gray-800 bg-white flex-shrink-0 relative"
              />
              <div v-else class="w-14 h-14 -mt-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 border-4 border-white dark:border-gray-800 flex items-center justify-center font-bold text-xl flex-shrink-0 relative">
                {{ b.business_name.charAt(0).toUpperCase() }}
              </div>
              <p class="font-bold text-base text-gray-900 dark:text-gray-50 truncate mt-2">{{ b.business_name }}</p>
              <p v-if="b.address" class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mt-1 min-w-0"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg><span class="truncate">{{ b.address }}</span></p>
              <p v-if="b.contact_number" class="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 mt-0.5"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><span>{{ b.contact_number }}</span></p>

              <div class="flex items-center gap-1.5 mt-2.5 min-h-[1.5rem]">
                <template v-if="b.review_count">
                  <StarRating :model-value="b.avg_rating || 0" />
                  <span class="text-sm text-gray-600 dark:text-gray-300">{{ b.avg_rating?.toFixed(1) }} ({{ b.review_count }})</span>
                </template>
                <span v-else class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wide">New</span>
              </div>

              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span class="text-sm text-gray-600 dark:text-gray-300">{{ b.package_count }} package{{ b.package_count === 1 ? '' : 's' }}</span>
                <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">From ₱{{ formatPrice(b.min_price) }}/head</span>
              </div>

              <!-- Actions pinned to the bottom so every card lines up -->
              <div class="mt-auto pt-4 flex items-center gap-2">
                <span class="flex-1 text-center bg-emerald-600 group-hover:bg-emerald-700 text-white min-h-[40px] flex items-center justify-center rounded-xl text-sm font-semibold transition">Book with this caterer</span>
                <button type="button" @click.stop="messageBusiness(b.business_id)" title="Message" aria-label="Message this caterer" class="w-10 h-10 flex items-center justify-center rounded-xl border border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg></button>
                <button type="button" @click.stop="openBusinessProfile(b.business_id)" title="View profile" aria-label="View profile and reviews" class="w-10 h-10 flex items-center justify-center rounded-xl border border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Popular packages -->
        <div v-if="businesses.length && popularPackages.length" class="mt-8">
          <h4 class="font-bold text-gray-800 dark:text-gray-100">Popular packages</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5 mb-3">Most booked by other clients.</p>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button
              v-for="p in popularPackages" :key="p.package_id" type="button" @click="bookPopularPackage(p)"
              class="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500 rounded-2xl overflow-hidden transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <div class="h-24 sm:h-28 bg-gradient-to-br from-emerald-500 to-emerald-800">
                <img v-if="p.image_url" :src="p.image_url" :alt="p.package_name" class="w-full h-full object-cover" loading="lazy" />
              </div>
              <div class="p-3">
                <p class="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{{ p.package_name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ p.tbl_business?.business_name }}</p>
                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">₱{{ formatPrice(p.price_per_head) }}<span class="text-xs font-medium text-gray-400"> /head</span></p>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Booked {{ pkgStats(p).booking_count }}×</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ============ STEP 2: CHOOSE A PACKAGE (Shopee-style browse grid) ============ -->
      <div v-else-if="activeTab === 'Book Catering' && !form.package_id">
        <!-- Facebook-style caterer page: cover, big avatar, name, actions, tab strip -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden mb-5">
          <!-- Cover photo -->
          <div class="relative h-44 sm:h-64 lg:h-80 bg-gradient-to-br from-emerald-500 to-emerald-800">
            <img v-if="selectedBusiness?.cover_url" :src="selectedBusiness.cover_url" :alt="`${selectedBusiness.business_name} cover photo`" @click="showCoverViewer = true" class="w-full h-full object-cover object-[center_25%] cursor-pointer" />
            <span v-else class="absolute inset-0 flex items-center justify-center text-8xl font-extrabold text-white/25 select-none" aria-hidden="true">{{ (selectedBusiness?.business_name || '?').charAt(0).toUpperCase() }}</span>
            <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 to-transparent"></div>
            <button type="button" @click="clearBusiness" class="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900 text-sm font-semibold text-gray-700 dark:text-gray-100 shadow transition">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>

          <div class="px-4 sm:px-8">
            <div class="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-5 pt-3 pb-4 text-center sm:text-left">
              <img
                v-if="selectedBusiness?.logo_url"
                :src="selectedBusiness.logo_url"
                :alt="selectedBusiness.business_name"
                class="w-28 h-28 sm:w-36 sm:h-36 -mt-16 sm:-mt-20 rounded-full object-cover border-4 border-white dark:border-gray-800 bg-white shadow flex-shrink-0 relative"
              />
              <div v-else class="w-28 h-28 sm:w-36 sm:h-36 -mt-16 sm:-mt-20 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 border-4 border-white dark:border-gray-800 shadow flex items-center justify-center text-5xl font-bold flex-shrink-0 relative">
                {{ (selectedBusiness?.business_name || '?').charAt(0).toUpperCase() }}
              </div>

              <div class="flex-1 min-w-0 sm:pb-2">
                <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-50 leading-tight">{{ selectedBusiness?.business_name }}</h2>
                <div class="flex items-center justify-center sm:justify-start flex-wrap gap-x-3 gap-y-1 mt-1.5 text-sm text-gray-600 dark:text-gray-300">
                  <span v-if="selectedBusiness?.review_count" class="flex items-center gap-1.5">
                    <StarRating :model-value="selectedBusiness.avg_rating || 0" />
                    <span>{{ selectedBusiness.avg_rating?.toFixed(1) }} ({{ selectedBusiness.review_count }})</span>
                  </span>
                  <span v-else class="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wide">New</span>
                  <span>{{ businessPackages.length }} package{{ businessPackages.length === 1 ? '' : 's' }}</span>
                  <span v-if="selectedBusiness?.min_price">From ₱{{ formatPrice(selectedBusiness.min_price) }}/head</span>
                </div>
                <p v-if="selectedBusiness?.address || selectedBusiness?.contact_number" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {{ [selectedBusiness.address, selectedBusiness.contact_number].filter(Boolean).join(' · ') }}
                </p>
              </div>

              <div class="flex items-center gap-2 sm:pb-2 flex-shrink-0">
                <button type="button" @click="messageBusiness(selectedBusinessId)" class="flex items-center gap-2 px-4 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4-.8L3 20l1.3-3.9A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </button>
                <div class="min-h-[40px] px-2 flex items-center rounded-xl border border-gray-200 dark:border-gray-700">
                  <HeartButton small :active="favoriteBusinessIds.has(selectedBusinessId)" @toggle="toggleFavoriteBusiness(selectedBusinessId)" />
                </div>
              </div>
            </div>

            <!-- Tab strip: Packages / About / Reviews, all shown on this page -->
            <div class="border-t border-gray-200 dark:border-gray-700 flex items-center gap-1 overflow-x-auto no-scrollbar -mx-1" role="tablist">
              <button
                v-for="bt in ['Packages', 'About', 'Reviews']" :key="bt"
                type="button" role="tab" :aria-selected="bizPageTab === bt"
                @click="bizPageTab = bt"
                :class="bizPageTab === bt ? 'text-emerald-600 dark:text-emerald-400 border-emerald-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent rounded-lg my-1'"
                class="px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-[3px] transition"
              >
                {{ bt }}<span v-if="bt === 'Reviews' && selectedBusiness?.review_count"> ({{ selectedBusiness.review_count }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- PACKAGES TAB -->
        <template v-if="bizPageTab === 'Packages'">
        <!-- 18 / 19 / 23: search, filter, sort, price display -->
        <div v-if="businessPackages.length" class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 sm:p-4 mb-5 space-y-3">
          <div class="relative">
            <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" v-model="pkgSearch" placeholder="Search packages (e.g. wedding, lechon)..." class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Event type</label>
              <select v-model="pkgType" :disabled="!availablePackageTypes.length" class="w-full mt-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 disabled:opacity-50">
                <option value="All">All types</option>
                <option v-for="t in availablePackageTypes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">No. of guests</label>
              <input type="number" min="1" v-model.number="form.guest_count" placeholder="Any" class="w-full mt-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Min ₱ / head</label>
              <input type="number" min="0" v-model.number="pkgMinPrice" placeholder="0" class="w-full mt-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Max ₱ / head</label>
              <input type="number" min="0" v-model.number="pkgMaxPrice" placeholder="Any" class="w-full mt-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div class="col-span-2 lg:col-span-1">
              <label class="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Sort by</label>
              <select v-model="pkgSort" class="w-full mt-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100">
                <option value="popular">Most popular</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs font-semibold">
              <button type="button" @click="priceMode = 'head'" :class="priceMode === 'head' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'" class="px-3 py-1.5">Per head</button>
              <button type="button" @click="priceMode = 'total'" :class="priceMode === 'total' ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'" class="px-3 py-1.5">Total price</button>
            </div>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <button type="button" @click="pkgFavoritesOnly = !pkgFavoritesOnly" :class="pkgFavoritesOnly ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'" class="text-xs font-semibold">♥ Favorites only</button>
              <button v-if="hasActivePackageFilters" type="button" @click="resetPackageFilters" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Clear filters</button>
              <span class="text-xs text-gray-400 dark:text-gray-500">{{ visiblePackages.length }} of {{ businessPackages.length }}</span>
            </div>
          </div>
        </div>

        <p v-if="!businessPackages.length" class="text-sm text-gray-400 dark:text-gray-500 text-center py-14">This business has no packages yet.</p>

        <p v-else-if="!visiblePackages.length" class="text-sm text-gray-400 dark:text-gray-500 text-center py-14">
          No packages match your filters.
          <button type="button" @click="resetPackageFilters" class="ml-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Clear filters</button>
        </p>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="p in visiblePackages"
            :key="p.package_id"
            role="button"
            tabindex="0"
            @click="viewPackageDetails(p)"
            @keydown.enter.self="viewPackageDetails(p)"
            class="cursor-pointer text-left rounded-lg overflow-hidden transition bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <div class="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <img v-if="p.image_url" :src="p.image_url" :alt="p.package_name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-xs">No image</div>
              <div class="absolute top-2 right-2">
                <HeartButton small :active="favoritePackageIds.has(p.package_id)" @toggle="toggleFavoritePackage(p.package_id)" />
              </div>
              <span v-if="p.package_type" class="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/55 text-white px-2 py-0.5 rounded-full">{{ p.package_type }}</span>
            </div>
            <div class="p-2.5">
              <p class="text-xs sm:text-sm text-gray-700 dark:text-gray-200 leading-snug line-clamp-2 min-h-[2.5em]">{{ p.package_name }}</p>
              <div class="flex items-center gap-1 mt-1">
                <StarRating :model-value="pkgStats(p).avg_rating || 0" />
                <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ pkgStats(p).review_count ? `(${pkgStats(p).review_count})` : 'New' }}</span>
              </div>
              <div class="flex items-baseline gap-1 mt-1.5">
                <span class="text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-bold">₱{{ formatPrice(priceLines(p).main) }}</span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ priceLines(p).mainLabel }}</span>
              </div>
              <p v-if="priceLines(p).sub" class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{{ priceLines(p).sub }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-[10px] text-gray-400 dark:text-gray-500">{{ guestRangeLabel(p) }}<template v-if="pkgStats(p).booking_count"> · {{ pkgStats(p).booking_count }} booked</template></span>
                <span class="text-[10px] text-gray-400 dark:text-gray-500">Details ›</span>
              </div>
            </div>
          </div>
        </div>
        </template>

        <!-- ABOUT TAB -->
        <div v-else-if="bizPageTab === 'About'" class="space-y-5">
          <div v-if="isLoadingBizPage" class="text-sm text-gray-400 dark:text-gray-500 text-center py-16">Loading…</div>
          <template v-else>
            <section class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">About</p>
              <p v-if="bizAbout?.about" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ bizAbout.about }}</p>
              <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">This business hasn't added a description yet.</p>
            </section>

            <section class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Contact</p>
                <p v-if="bizAbout?.address" class="text-sm text-gray-700 dark:text-gray-300">📍 {{ bizAbout.address }}</p>
                <p v-if="bizAbout?.contact_number" class="text-sm text-gray-700 dark:text-gray-300 mt-1">📞 {{ bizAbout.contact_number }}</p>
                <p v-if="bizAbout?.contact_email" class="text-sm text-gray-700 dark:text-gray-300 mt-1 break-all">✉️ {{ bizAbout.contact_email }}</p>
                <p v-if="!bizAbout?.address && !bizAbout?.contact_number && !bizAbout?.contact_email" class="text-sm text-gray-400 dark:text-gray-500 italic">No contact details yet.</p>
              </div>
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Business Hours</p>
                <p v-if="bizAbout?.opening_hours" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ bizAbout.opening_hours }}</p>
                <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Not specified.</p>
              </div>
            </section>

            <section class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Policies</p>
              <p v-if="bizAbout?.policies" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ bizAbout.policies }}</p>
              <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">No policies posted. Please ask the business directly before booking.</p>
            </section>
          </template>
        </div>

        <!-- REVIEWS TAB -->
        <div v-else class="space-y-4">
          <div v-if="isLoadingBizPage" class="text-sm text-gray-400 dark:text-gray-500 text-center py-16">Loading…</div>
          <template v-else>
            <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-4">
              <p class="text-4xl font-extrabold text-gray-900 dark:text-gray-50">{{ selectedBusiness?.review_count ? selectedBusiness.avg_rating?.toFixed(1) : '–' }}</p>
              <div>
                <StarRating :model-value="selectedBusiness?.avg_rating || 0" />
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  <template v-if="selectedBusiness?.review_count">{{ selectedBusiness.review_count }} review{{ selectedBusiness.review_count === 1 ? '' : 's' }} from past clients</template>
                  <template v-else>No reviews yet</template>
                </p>
              </div>
            </div>

            <p v-if="!bizReviews.length" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-12 text-sm text-gray-400 dark:text-gray-500 italic">
              No reviews yet. Only clients with a completed booking can leave one.
            </p>
            <ul v-else class="space-y-3">
              <li v-for="r in bizReviews" :key="r.review_id" class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ r.reviewer }}</p>
                  <span class="text-xs text-gray-400 dark:text-gray-500">{{ formatReviewDate(r.created_at) }}</span>
                </div>
                <div class="flex items-center gap-2 mt-1">
                  <StarRating :model-value="r.rating" />
                  <span v-if="r.package_name" class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ r.package_name }}</span>
                </div>
                <p v-if="r.comment" class="text-sm text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">{{ r.comment }}</p>
                <div v-if="r.owner_reply" class="mt-3 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 rounded-r-lg p-3">
                  <p class="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1">Reply from the caterer</p>
                  <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line break-words">{{ r.owner_reply }}</p>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>

      <!-- ============ STEP 3: PACKAGE PAGE + BOOKING FORM (Shopee product-page style) ============ -->
      <div v-else-if="activeTab === 'Book Catering'">
        <button type="button" @click="backToPackages" class="flex items-center gap-1.5 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-4">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to packages
        </button>

        <p class="text-xs text-gray-400 dark:text-gray-500 mb-4 truncate">
          {{ selectedBusiness?.business_name }} <span class="mx-1">›</span> <span class="text-gray-600 dark:text-gray-300 font-medium">{{ selectedPackage?.package_name }}</span>
        </p>

        <form @submit.prevent="submitBooking">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">

            <!-- LEFT: photo gallery, stays put while the buy-box scrolls -->
            <div class="lg:sticky lg:top-24 lg:self-start">
              <PackageGallery :images="galleryImages" :alt="selectedPackage?.package_name || 'Package photo'" />

              <!-- Catering store card (fills the space under the thumbnail) -->
              <div v-if="selectedBusiness" class="mt-5 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Catering Store</p>
                  <button type="button" @click="clearBusiness" class="text-[11px] text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2">Change store</button>
                </div>
                <div class="flex items-center gap-3">
                  <img
                    v-if="selectedBusiness.logo_url"
                    :src="selectedBusiness.logo_url"
                    :alt="selectedBusiness.business_name"
                    class="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                  />
                  <div v-else class="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {{ (selectedBusiness.business_name || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-gray-900 dark:text-gray-100 truncate">{{ selectedBusiness.business_name }}</p>
                    <div class="flex items-center gap-1.5 mt-0.5">
                      <StarRating :model-value="selectedBusiness.avg_rating || 0" />
                      <span class="text-xs text-gray-600 dark:text-gray-300">{{ selectedBusiness.review_count ? `${selectedBusiness.avg_rating?.toFixed(1)} (${selectedBusiness.review_count})` : 'No reviews yet' }}</span>
                    </div>
                    <p v-if="selectedBusiness.address" class="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-300 mt-1">
                      <svg class="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{{ selectedBusiness.address }}</span>
                    </p>
                  </div>
                </div>

                <div class="mt-4">
                  <button type="button" @click="messageBusiness(selectedBusiness.business_id)" class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 min-h-[44px] rounded-xl transition">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h8M8 14h5m-9 6l2.3-3.4A8 8 0 1112 20H4z" /></svg>
                    Message
                  </button>
                </div>
                <button type="button" @click="openBusinessProfile(selectedBusiness.business_id)" class="w-full mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-emerald-400 transition">
                  View profile &amp; reviews
                </button>
                <p class="text-[11px] text-gray-500 dark:text-gray-400 text-center mt-2">{{ selectedBusiness.package_count }} package{{ selectedBusiness.package_count === 1 ? '' : 's' }} available</p>
              </div>
            </div>

            <!-- RIGHT: buy box -- package price, then all booking details -->
            <div class="space-y-5">
              <div>
                <p class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 leading-snug">{{ selectedPackage?.package_name }}</p>
                <div class="flex flex-wrap items-center gap-2 mt-1.5">
                  <span v-if="selectedPackage?.package_type" class="text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{{ selectedPackage.package_type }}</span>
                  <span v-if="selectedPackage && guestRangeLabel(selectedPackage)" class="text-[11px] text-gray-500 dark:text-gray-400">Good for {{ guestRangeLabel(selectedPackage) }}</span>
                  <StarRating :model-value="pkgStats(selectedPackage).avg_rating || 0" />
                  <span class="text-xs text-gray-500 dark:text-gray-400">{{ pkgStats(selectedPackage).review_count ? `${pkgStats(selectedPackage).avg_rating?.toFixed(1)} (${pkgStats(selectedPackage).review_count} reviews)` : 'No reviews yet' }}</span>
                  <HeartButton small :active="favoritePackageIds.has(selectedPackage?.package_id)" @toggle="toggleFavoritePackage(selectedPackage.package_id)" />
                </div>
                <div v-if="selectedPackage" class="mt-3 flex flex-wrap items-end gap-x-6 gap-y-2">
                  <div>
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">₱{{ formatPrice(selectedPackage.price_per_head) }}</span>
                      <span class="text-xs font-medium text-gray-400 dark:text-gray-500">/ head</span>
                    </div>
                  </div>
                  <div v-if="guestsNum > 0">
                    <div class="flex items-baseline gap-1.5">
                      <span class="text-lg font-bold text-gray-800 dark:text-gray-100">₱{{ formatPrice((selectedPackage.price_per_head || 0) * guestsNum) }}</span>
                      <span class="text-xs font-medium text-gray-400 dark:text-gray-500">total for {{ guestsNum }} guest{{ guestsNum === 1 ? '' : 's' }}</span>
                    </div>
                  </div>
                  <p v-else class="text-xs text-gray-500 dark:text-gray-400">Enter your number of guests to see the total.</p>
                </div>
                <div class="mt-3 max-w-[220px]">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Number of Guests</label>
                  <input type="number" v-model.number="form.guest_count" required min="1" :max="platform.max_guests" step="1" placeholder="e.g. 50" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
                </div>
                <p v-if="selectedPackage && !fitsGuests(selectedPackage)" class="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">
                  Heads up: this package is meant for {{ guestRangeLabel(selectedPackage) }}, but you entered {{ guestsNum }}.
                </p>
              </div>

              <!-- ============ EXTRA ADD-ONS (ala carte, optional) ============ -->
              <div v-if="isLoadingAddons" class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
                Loading add-ons...
              </div>
              <div v-else-if="businessAddons.length" class="space-y-2">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Extra Add-Ons (optional)</p>
                <AddonPicker :addons="businessAddons" :quantities="addonQuantities" @update="setAddonQuantity" />
                <p v-if="addonsSubtotal > 0" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-right">+ ₱{{ formatPrice(addonsSubtotal) }} in add-ons</p>
              </div>

              <!-- ============ CHOOSE YOUR MENU (main module) ============ -->
              <div v-if="isLoadingPackageMenu" class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
                Loading menu choices...
              </div>
              <div v-else-if="packageMenuCategories.length" class="space-y-4">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Choose Your Menu</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2">Pick your dishes, then tap Small, Regular or Large for each one. The price stays per head.</p>
                <div v-for="cat in packageMenuCategories" :key="cat.category" class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-3 sm:p-4">
                  <div class="flex items-center justify-between gap-2 mb-2">
                    <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ cat.category }}</p>
                    <span
                      class="text-xs font-bold"
                      :class="(selectedMenuItems[cat.category]?.length || 0) >= cat.max ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
                    >
                      {{ selectedMenuItems[cat.category]?.length || 0 }} / {{ cat.max }} selected
                    </span>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                    <div v-for="item in cat.items" :key="item.item_id" class="flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                    <label
                      class="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-200 cursor-pointer p-2"
                    >
                      <input
                        type="checkbox"
                        :checked="(selectedMenuItems[cat.category] || []).includes(item.item_id)"
                        :disabled="!(selectedMenuItems[cat.category] || []).includes(item.item_id) && (selectedMenuItems[cat.category]?.length || 0) >= cat.max"
                        @change="toggleMenuItem(cat.category, item.item_id, cat.max)"
                        class="rounded-none accent-emerald-600 mt-1"
                      />
                      <img v-if="item.image_url" :src="item.image_url" :alt="item.item_name" class="w-14 h-14 rounded-md object-cover flex-shrink-0" />
                      <span class="min-w-0">
                        <span class="block font-medium">{{ item.item_name }}</span>
                        <span v-if="item.tags?.length" class="flex flex-wrap gap-1 mt-0.5">
                          <span v-for="t in item.tags" :key="t" :class="tagMeta(t)?.cls || 'bg-gray-100 text-gray-600'" class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full">{{ tagMeta(t)?.label || t }}</span>
                        </span>
                        <span v-if="item.description" class="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ item.description }}</span>
                      </span>
                    </label>
                    <div v-if="(selectedMenuItems[cat.category] || []).includes(item.item_id)" class="flex flex-wrap items-center gap-1.5 px-2 pb-2 pl-8">
                      <span class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Serving:</span>
                      <button
                        v-for="p in PORTIONS"
                        :key="p.value"
                        type="button"
                        @click="selectedPortions[item.item_id] = p.value"
                        :class="(selectedPortions[item.item_id] || 'Regular') === p.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'"
                        class="text-xs sm:text-[11px] font-semibold px-3 sm:px-2 py-1 sm:py-0.5 border rounded-full"
                      >{{ p.label }}</button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="showMenuWarning && !isMenuComplete" id="menu-warning" class="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-800 dark:text-amber-200">
                <p class="font-semibold">Your menu is not complete yet.</p>
                <p class="mt-0.5">
                  <span v-for="(m, i) in missingMenuPicks" :key="m.category">{{ m.category }}: pick {{ m.need }} more{{ i < missingMenuPicks.length - 1 ? ' · ' : '' }}</span>
                </p>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Date</label>
                    <button type="button" @click="showCalendar = !showCalendar" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                      {{ showCalendar ? 'Hide calendar' : 'Check availability' }}
                    </button>
                  </div>
                  <input
                    type="date"
                    v-model="form.event_date"
                    @change="handleDateCheck"
                    required
                    :min="minEventDate" :max="maxEventDate"
                    class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Time</label>
                  <input type="time" v-model="form.event_time" required class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div v-if="showCalendar" class="w-full max-w-[320px] mx-auto bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div class="flex items-center justify-between mb-3">
                  <button type="button" @click="goToPrevMonth" class="w-9 h-9 sm:w-7 sm:h-7 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm font-bold">‹</button>
                  <p class="text-sm font-bold text-gray-700 dark:text-gray-200">{{ calendarMonthLabel }}</p>
                  <button type="button" @click="goToNextMonth" class="w-9 h-9 sm:w-7 sm:h-7 rounded-md border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-sm font-bold">›</button>
                </div>
                <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-gray-400 dark:text-gray-500 mb-1.5">
                  <span v-for="wd in ['S','M','T','W','T','F','S']" :key="wd">{{ wd }}</span>
                </div>
                <div v-if="isLoadingCalendar" class="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Loading…</div>
                <div v-else class="grid grid-cols-7 gap-1">
                  <button
                    v-for="(day, idx) in calendarDays"
                    :key="idx"
                    type="button"
                    :disabled="!day.inMonth || day.isPast || day.isTaken"
                    @click="pickCalendarDate(day)"
                    class="h-10 sm:h-9 w-full max-w-[2.75rem] rounded-lg text-xs font-semibold flex items-center justify-center transition mx-auto"
                    :class="!day.inMonth ? 'invisible' :
                      day.isSelected ? 'bg-emerald-600 text-white' :
                      day.isTaken ? 'bg-red-100 dark:bg-red-900/30 text-red-400 line-through cursor-not-allowed' :
                      day.isPast ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' :
                      'text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'"
                  >{{ day.day }}</button>
                </div>
                <div class="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-400 dark:text-gray-500">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-red-200 dark:bg-red-900/50 inline-block"></span> Booked</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-600 inline-block"></span> Selected</span>
                </div>
              </div>

              <div v-if="conflictWarning" class="text-amber-700 dark:text-amber-300 text-sm font-medium flex gap-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86l-8.18 14.14A2 2 0 003.82 21h16.36a2 2 0 001.71-3l-8.18-14.14a2 2 0 00-3.42 0z" />
                </svg>
                <span>{{ conflictWarning }}</span>
              </div>

              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Location</label>
                <input type="text" v-model="form.event_location" required placeholder="e.g. Barangay Hall, Roxas City" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
              </div>

              <!-- ============ PROMO CODE + LOYALTY POINTS ============ -->
              <div v-if="selectedPackage" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Promo code</label>
                  <div class="flex gap-2 mt-1">
                    <input v-model="promoInput" @keydown.enter.prevent="applyPromo" maxlength="20" placeholder="Enter code" class="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
                    <button type="button" @click="applyPromo" :disabled="!promoInput.trim() || !form.event_date" class="px-4 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-40 transition">Apply</button>
                  </div>
                  <p v-if="quote && quote.promo_code" class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{{ quote.promo_code }} applied.
                    <button type="button" @click="removePromo" class="underline ml-1">Remove</button></p>
                  <p v-else-if="quote && quote.promo_error" class="text-xs text-red-600 dark:text-red-400 mt-1">{{ quote.promo_error }}</p>
                  <p v-else-if="!form.event_date && promoInput" class="text-xs text-gray-400 dark:text-gray-500 mt-1">Pick an event date, then apply.</p>
                </div>
                <div v-if="quote && quote.loyalty_enabled">
                  <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Loyalty points
                    <span :class="tierBadgeClass(quote.tier)" class="ml-1 px-1.5 py-0.5 rounded text-[10px] normal-case tracking-normal">{{ quote.tier }}</span></label>
                  <div class="flex gap-2 mt-1">
                    <input type="number" v-model.number="pointsInput" min="0" :max="quote.max_redeemable_points" :disabled="!quote.max_redeemable_points" placeholder="0" class="flex-1 min-w-0 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100 disabled:opacity-50" />
                    <button type="button" @click="pointsInput = quote.max_redeemable_points" :disabled="!quote.max_redeemable_points" class="px-4 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-40 transition">Use max</button>
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">You have {{ quote.points_balance.toLocaleString() }} points (₱{{ formatPrice(quote.peso_per_point) }} each).
                    <span v-if="quote.loyalty_note" class="text-amber-600 dark:text-amber-400">{{ quote.loyalty_note }}</span></p>
                </div>
              </div>

              <div class="flex flex-col sm:flex-row sm:items-end gap-3">
                <div v-if="selectedPackage" class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 text-left flex-1">
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    ₱{{ formatPrice(selectedPackage.price_per_head) }} × {{ form.guest_count || 0 }} guests = ₱{{ formatPrice((selectedPackage.price_per_head || 0) * (form.guest_count || 0)) }}<template v-if="addonsSubtotal > 0"> + ₱{{ formatPrice(addonsSubtotal) }} add-ons</template>
                  </p>
                  <template v-if="quote">
                    <p v-if="Number(quote.season_adjustment) !== 0" class="text-xs mt-1" :class="Number(quote.season_adjustment) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'">
                      {{ quote.season_rule_name }}: {{ Number(quote.season_adjustment) > 0 ? '+' : '−' }}₱{{ formatPrice(Math.abs(quote.season_adjustment)) }}
                    </p>
                    <p v-if="Number(quote.promo_discount) > 0" class="text-xs mt-1 text-emerald-600 dark:text-emerald-400">Promo {{ quote.promo_code }}: −₱{{ formatPrice(quote.promo_discount) }}</p>
                    <p v-if="Number(quote.loyalty_discount) > 0" class="text-xs mt-1 text-emerald-600 dark:text-emerald-400">{{ quote.points_used }} points: −₱{{ formatPrice(quote.loyalty_discount) }}</p>
                  </template>
                  <p v-else-if="!form.event_date" class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Pick an event date to see seasonal pricing.</p>
                  <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Est. Total: ₱{{ formatPrice(quote ? quote.total : (selectedPackage.price_per_head || 0) * (form.guest_count || 0) + addonsSubtotal) }}
                  </p>
                  <template v-if="feeBreakdown.serviceFee > 0 || feeBreakdown.tax > 0">
                    <p v-if="feeBreakdown.serviceFee > 0" class="text-xs mt-1 text-gray-500 dark:text-gray-400">Service fee: +{{ platformMoney(feeBreakdown.serviceFee) }}</p>
                    <p v-if="feeBreakdown.tax > 0" class="text-xs mt-0.5 text-gray-500 dark:text-gray-400">{{ platform.tax_label }} ({{ platform.tax_rate_percent }}%): +{{ platformMoney(feeBreakdown.tax) }}</p>
                    <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Total with fees: {{ platformMoney(feeBreakdown.total) }}</p>
                  </template>
                  <p v-if="quote && quote.loyalty_enabled && quote.points_to_earn > 0" class="text-[11px] text-gray-500 dark:text-gray-400 mt-1">You'll earn about {{ quote.points_to_earn }} points when this booking is completed.</p>
                </div>
              </div>

            </div>
          </div>

          <!-- ============ WHAT'S INCLUDED (full-width, below the buy box) ============ -->
          <div v-if="packageDescriptionLines.length" class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">What's Included</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              <template v-for="(line, idx) in packageDescriptionLines" :key="idx">
                <p v-if="line.type === 'header'" class="text-sm font-bold text-gray-800 dark:text-gray-100 mt-3 first:mt-0 sm:col-span-2">
                  {{ line.text }}
                </p>
                <p v-else class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{{ line.text }}</span>
                </p>
              </template>
            </div>
          </div>

          <!-- ============ INCLUDED / NOT INCLUDED ============ -->
          <div v-if="packageInclusions.length" class="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div v-if="includedItems.length">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Included in the price</p>
              <p v-for="i in includedItems" :key="i.inclusion_id" class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                <span>{{ i.label }}</span>
              </p>
            </div>
            <div v-if="excludedItems.length">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Not included</p>
              <p v-for="i in excludedItems" :key="i.inclusion_id" class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 mb-1">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                <span>{{ i.label }}</span>
              </p>
            </div>
          </div>
          <!-- Always-visible total + submit (mobile and desktop) -->
          <div class="h-24" aria-hidden="true"></div>
          <div class="fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
            <div class="flex items-center gap-3 max-w-xl lg:max-w-4xl mx-auto">
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Est. Total</p>
                <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight truncate">{{ guestsNum > 0 ? bookingTotalLabel : 'Enter guests' }}</p>
                <p v-if="guestsNum > 0" class="text-[11px] text-gray-500 dark:text-gray-400">{{ guestsNum }} guest{{ guestsNum === 1 ? '' : 's' }}<template v-if="addonsSubtotal > 0"> · incl. ₱{{ formatPrice(addonsSubtotal) }} add-ons</template></p>
              </div>
              <button type="submit" :disabled="isSubmitting || !!conflictWarning" class="flex-shrink-0 bg-emerald-600 text-white px-5 min-h-[44px] rounded-xl font-bold text-sm hover:bg-emerald-700 transition disabled:opacity-50">
                {{ isSubmitting ? 'Submitting...' : 'Book Now' }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- ============ MESSAGES TAB (real-time chat with the caterer's staff) ============ -->
      <div v-else-if="activeTab === 'Messages'">
        <ChatInbox mode="client" :start-business-id="chatStartBusinessId" />
      </div>

      <!-- ============ MY BOOKINGS TAB ============ -->
      <div v-else-if="activeTab === 'My Bookings'">
        <div class="flex items-start justify-between gap-3 mb-5">
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">My Bookings</h2>
            <p v-if="!isLoading && myBookings.length" class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              {{ myBookings.length }} booking{{ myBookings.length === 1 ? '' : 's' }}
            </p>
          </div>
          <button type="button" @click="activeTab = 'Book Catering'" class="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 5v14M5 12h14" /></svg>
            Book new event
          </button>
        </div>
        <div v-if="myRewards.length" class="flex flex-wrap gap-3 mb-4">
          <div v-for="r in myRewards" :key="r.business_id" class="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
            <div>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ r.business_name }} rewards</p>
              <p class="text-lg font-bold text-gray-800 dark:text-gray-100">{{ r.points_balance.toLocaleString() }} <span class="text-xs font-medium text-gray-400">points</span></p>
            </div>
            <span :class="tierBadgeClass(r.tier)" class="px-2 py-0.5 rounded-full text-xs font-semibold">{{ r.tier }}</span>
          </div>
        </div>
        <div
          v-for="change in statusChangeAlerts"
          :key="change.booking.booking_id"
          class="flex items-start justify-between gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-3"
        >
          <p class="text-sm text-blue-800 dark:text-blue-300">
            <span class="font-semibold">{{ change.booking.package_name || 'Your booking' }}</span>
            for {{ formatDate(change.booking.event_date) }} is now
            <span class="font-bold">{{ change.to }}</span>.
          </p>
          <button @click="dismissStatusAlert(change.booking.booking_id)" class="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 flex-shrink-0" aria-label="Dismiss">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Next upcoming event -->
        <div v-if="!isLoading && upcomingBooking" class="mb-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-emerald-100">Your next event</p>
            <p class="text-lg font-bold mt-0.5 truncate">{{ upcomingBooking.package_name || 'Custom Booking' }}</p>
            <p class="text-sm text-emerald-50 mt-0.5">{{ formatDay(upcomingBooking.event_date) }} · {{ formatTime(upcomingBooking.event_time) }} · {{ upcomingBooking.guest_count }} guests</p>
            <p class="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-[13px] font-medium">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {{ nextActionText(upcomingBooking) }}
            </p>
          </div>
          <div class="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2 flex-shrink-0">
            <p class="text-2xl sm:text-3xl font-extrabold leading-none">{{ daysUntilLabel(upcomingBooking.event_date) }}</p>
            <button type="button" @click="goToBooking(upcomingBooking)" class="min-h-[40px] px-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700">
              View details
            </button>
          </div>
        </div>

        <!-- View tabs + collapsible filters -->
        <div v-if="!isLoading && myBookings.length > 0" class="mb-4">
          <div class="flex items-center justify-between gap-3">
            <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-x-auto" role="tablist" aria-label="Booking groups">
              <button
                v-for="v in bookingViews"
                :key="v"
                type="button"
                role="tab"
                :aria-selected="bookingView === v"
                @click="bookingView = v"
                :class="bookingView === v
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'"
                class="px-3.5 min-h-[36px] rounded-lg text-sm font-semibold whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                {{ v }}
                <span class="ml-1 text-[13px] font-medium text-gray-500 dark:text-gray-400">{{ bookingViewCounts[v] }}</span>
              </button>
            </div>
            <button
              type="button"
              @click="showBookingFilters = !showBookingFilters"
              :aria-expanded="showBookingFilters"
              class="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M6 12h12M10 20h4" /></svg>
              Filters
              <span v-if="hasActiveBookingFilters" class="w-2 h-2 rounded-full bg-emerald-500" aria-label="Filters applied"></span>
            </button>
          </div>

          <div v-if="showBookingFilters" class="mt-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
            <div class="relative">
              <svg class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                v-model="bookingSearchQuery"
                placeholder="Search package or venue"
                aria-label="Search package or venue"
                class="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <label class="flex items-center gap-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300">From
                <input type="date" v-model="bookingDateFrom" class="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <label class="flex items-center gap-2 text-[13px] font-semibold text-gray-600 dark:text-gray-300">To
                <input type="date" v-model="bookingDateTo" class="p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-normal text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </label>
              <button v-if="hasActiveBookingFilters" type="button" @click="clearBookingFilters" class="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Clear filters</button>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="grid gap-4" aria-busy="true" aria-label="Loading your bookings">
          <div v-for="n in 3" :key="n" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-5 animate-pulse">
            <div class="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div class="h-3 w-3/4 bg-gray-100 dark:bg-gray-700/70 rounded mt-3"></div>
            <div class="h-3 w-1/4 bg-gray-100 dark:bg-gray-700/70 rounded mt-2"></div>
            <div class="flex items-center gap-2 mt-5">
              <div class="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div><div class="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div><div class="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div><div class="h-0.5 flex-1 bg-gray-200 dark:bg-gray-700"></div>
              <div class="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
        <div v-else-if="myBookings.length === 0" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-14">
          <p class="text-gray-600 dark:text-gray-400 text-sm">You haven't made any bookings yet.</p>
          <button @click="activeTab = 'Book Catering'" class="mt-3 min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
            Book your first event
          </button>
        </div>
        <div v-else-if="filteredMyBookings.length === 0" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center py-14">
          <p class="text-gray-600 dark:text-gray-400 text-sm">
            {{ hasActiveBookingFilters ? 'No bookings match your filters.' : `No ${bookingView.toLowerCase()} bookings.` }}
          </p>
          <button v-if="hasActiveBookingFilters" @click="clearBookingFilters" class="mt-3 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:underline">
            Clear filters
          </button>
          <button v-else-if="bookingView === 'Upcoming'" @click="activeTab = 'Book Catering'" class="mt-3 min-h-[40px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
            Book new event
          </button>
        </div>

        <div v-else class="grid gap-4">
          <article
            v-for="b in filteredMyBookings"
            :key="b.booking_id"
            :id="`booking-${b.booking_id}`"
            :class="[
              b.booking_status === 'Cancelled'
                ? 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700',
              highlightedBookingId === b.booking_id ? 'ring-2 ring-emerald-500' : ''
            ]"
            class="rounded-2xl border p-4 sm:p-5 scroll-mt-24 transition"
          >
            <!-- Title + status -->
            <div class="flex items-start justify-between gap-3">
              <h3 class="font-bold text-base text-gray-900 dark:text-gray-100 min-w-0 break-words">{{ b.package_name || 'Custom Booking' }}</h3>
              <span :class="statusBadgeClass(b.booking_status)" class="px-3 py-1 rounded-full text-[13px] font-semibold flex-shrink-0">
                {{ b.booking_status }}
              </span>
            </div>

            <!-- When / where / how many -->
            <ul class="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-gray-700 dark:text-gray-300">
              <li class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" /></svg>
                <span class="sr-only">Date:</span>{{ formatDay(b.event_date) }}
              </li>
              <li class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="sr-only">Time:</span>{{ formatTime(b.event_time) }}
              </li>
              <li class="flex items-center gap-1.5 min-w-0">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span class="break-words">Venue: <span class="capitalize">{{ b.event_location || '—' }}</span></span>
              </li>
              <li class="flex items-center gap-1.5">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {{ b.guest_count }} guests
              </li>
            </ul>

            <!-- Progress (active bookings only) -->
            <div v-if="b.booking_status !== 'Cancelled'" class="mt-4">
              <div class="flex items-start max-w-md" role="list" aria-label="Booking progress">
                <template v-for="(st, i) in trackerSteps(b)" :key="st.label">
                  <div class="flex flex-col items-center w-16 sm:w-20 flex-shrink-0" role="listitem">
                    <span :class="stepDotClass(st.state)" class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">
                      <svg v-if="st.state === 'done'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
                      <span v-else>{{ i + 1 }}</span>
                    </span>
                    <span :class="stepLabelClass(st.state)" class="mt-1 text-xs sm:text-[13px] font-semibold text-center leading-tight">{{ st.label }}</span>
                  </div>
                  <div v-if="i < 3" :class="st.state === 'done' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-600'" class="h-0.5 flex-1 mt-3.5"></div>
                </template>
              </div>
              <p class="mt-2.5 text-sm font-medium text-gray-800 dark:text-gray-100">{{ trackerCaption(b) }}</p>
            </div>

            <!-- Cancelled note -->
            <div v-else class="mt-3 text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>This booking was cancelled.</p>
              <p v-if="b.tbl_payments && Number(b.tbl_payments.amount_paid) > 0" class="text-amber-700 dark:text-amber-300">
                You paid ₱{{ formatPrice(b.tbl_payments.amount_paid) }} before cancelling. Refunds are handled directly with the caterer.
              </p>
            </div>

            <!-- Money -->
            <div v-if="b.booking_status !== 'Cancelled' && b.tbl_payments" class="mt-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-3">
              <div class="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400">Total</p>
                  <p class="font-bold text-gray-900 dark:text-gray-100">₱{{ formatPrice(b.tbl_payments.total_amount) }}</p>
                </div>
                <div>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400">Paid</p>
                  <p class="font-bold text-gray-900 dark:text-gray-100">₱{{ formatPrice(b.tbl_payments.amount_paid) }}</p>
                </div>
                <div>
                  <p class="text-[13px] text-gray-600 dark:text-gray-400">Balance</p>
                  <p :class="Number(b.tbl_payments.balance) > 0 ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'" class="font-bold">₱{{ formatPrice(b.tbl_payments.balance) }}</p>
                </div>
              </div>
              <div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span :class="paymentBadgeClass(b.tbl_payments.payment_status)" class="px-2.5 py-0.5 rounded-full text-[13px] font-semibold">{{ b.tbl_payments.payment_status }}</span>
                <button type="button" @click="downloadReceipt(b)" class="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Download receipt</button>
              </div>
            </div>
            <p v-else-if="b.booking_status !== 'Cancelled' && b.quoted_total != null" class="mt-4 text-sm text-gray-700 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-gray-100">Quoted ₱{{ formatPrice(b.quoted_total) }}</span>
              <span class="text-gray-600 dark:text-gray-400"> · the caterer will send the final amount after confirming.</span>
            </p>

            <p v-if="b.booking_status !== 'Cancelled' && b.quoted_total != null && (Number(b.seasonal_adjustment) !== 0 || Number(b.promo_discount) > 0 || Number(b.loyalty_discount) > 0)" class="mt-2 text-[13px] text-gray-600 dark:text-gray-400">
              <span v-if="b.tbl_payments" class="font-semibold text-gray-700 dark:text-gray-200">Quoted ₱{{ formatPrice(b.quoted_total) }}</span>
              <span v-if="Number(b.seasonal_adjustment) !== 0"> · {{ b.seasonal_rule_name || 'Seasonal' }} {{ Number(b.seasonal_adjustment) > 0 ? '+' : '−' }}₱{{ formatPrice(Math.abs(b.seasonal_adjustment)) }}</span>
              <span v-if="Number(b.promo_discount) > 0" class="text-emerald-700 dark:text-emerald-400"> · {{ b.promo_code }} −₱{{ formatPrice(b.promo_discount) }}</span>
              <span v-if="Number(b.loyalty_discount) > 0" class="text-emerald-700 dark:text-emerald-400"> · {{ b.loyalty_points_used }} points −₱{{ formatPrice(b.loyalty_discount) }}</span>
            </p>

            <!-- Add-ons as chips -->
            <div v-if="b.addons?.length" class="mt-3">
              <p class="text-[13px] font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Add-ons</p>
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="a in b.addons"
                  :key="a.addon_id || a.addon_name"
                  :class="b.booking_status === 'Cancelled' ? 'line-through text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800' : 'text-gray-800 dark:text-gray-100 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/40'"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-transparent text-[13px]"
                >
                  {{ a.addon_name }} <span class="text-gray-600 dark:text-gray-400">×{{ a.quantity }}</span>
                  <span class="font-semibold">₱{{ formatPrice(a.subtotal) }}</span>
                </li>
              </ul>
            </div>

            <!-- Menu accordion -->
            <div v-if="b.menuPicks?.length" class="mt-3 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                type="button"
                @click="toggleBookingMenu(b.booking_id)"
                :aria-expanded="expandedBookingMenus.has(b.booking_id)"
                class="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
              >
                <span>Menu <span class="font-normal text-gray-600 dark:text-gray-400">({{ b.menuPicks.length }} dishes)</span></span>
                <svg :class="expandedBookingMenus.has(b.booking_id) ? 'rotate-180' : ''" class="w-4 h-4 text-gray-500 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div v-if="expandedBookingMenus.has(b.booking_id)" class="px-3 pb-3 pt-1 space-y-2.5 border-t border-gray-100 dark:border-gray-700">
                <div v-for="grp in groupMenuPicks(b.menuPicks)" :key="grp.category">
                  <p class="text-[13px] font-semibold text-gray-500 dark:text-gray-400">{{ grp.category }}</p>
                  <p v-for="p in grp.items" :key="p.item_id" class="text-sm text-gray-800 dark:text-gray-200">
                    {{ p.item_name }}
                    <span v-if="p.portion !== 'Regular'" class="ml-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">{{ p.portion }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment instructions (offline payment: GCash / bank / cash, recorded by the caterer) -->
            <div v-if="needsPayment(b) && expandedPayHelp.has(b.booking_id)" id="pay-help" class="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 p-4 text-sm text-gray-700 dark:text-gray-200 space-y-2">
              <p v-if="b.tbl_payments && Number(b.tbl_payments.balance) > 0" class="font-semibold text-gray-900 dark:text-gray-100">Amount to pay: ₱{{ formatPrice(b.tbl_payments.balance) }}</p>
              <p v-if="paymentInfo[bookingBusinessId(b)]" class="whitespace-pre-line font-medium text-gray-900 dark:text-gray-100">{{ paymentInfo[bookingBusinessId(b)] }}</p>
              <p v-else>
                This caterer hasn't posted payment details yet.
                <button type="button" @click="messageBusiness(bookingBusinessId(b))" class="font-semibold text-sky-700 dark:text-sky-400 hover:underline">Message them</button>
                to ask how to pay.
              </p>
              <p class="text-gray-600 dark:text-gray-300">
                Pay the caterer directly, then message them your proof of payment. They'll record it, and your balance and receipt will update here.
              </p>
            </div>

            <!-- Actions -->
            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-2 sm:justify-end">
              <button
                v-if="needsPayment(b)"
                type="button"
                @click="togglePayHelp(b.booking_id)"
                :aria-expanded="expandedPayHelp.has(b.booking_id)"
                aria-controls="pay-help"
                :class="b.booking_status === 'Confirmed'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                class="w-full sm:w-auto min-h-[44px] px-4 rounded-xl text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                {{ expandedPayHelp.has(b.booking_id) ? 'Hide payment instructions' : 'Payment instructions' }}
              </button>

              <button
                v-if="b.booking_status === 'Completed' && !reviewedBookingIds.has(String(b.booking_id))"
                @click="reviewTarget = b"
                class="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition"
              >
                ★ Rate this event
              </button>
              <span v-else-if="reviewedBookingIds.has(String(b.booking_id))" class="text-sm text-gray-600 dark:text-gray-400 px-2">Reviewed ✓</span>

              <!-- Cancelled: Book again (+ Message only if money needs sorting out) -->
              <template v-if="b.booking_status === 'Cancelled'">
                <button
                  v-if="bookingBusinessId(b) && b.tbl_payments && Number(b.tbl_payments.amount_paid) > 0"
                  @click="messageBusiness(bookingBusinessId(b))"
                  class="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl border border-sky-600 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sm font-semibold transition"
                >
                  Ask about refund
                </button>
                <button
                  type="button"
                  @click="bookAgain(b)"
                  class="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm font-semibold transition"
                >
                  Book again
                </button>
              </template>

              <button
                v-else-if="bookingBusinessId(b)"
                @click="messageBusiness(bookingBusinessId(b))"
                class="flex-1 sm:flex-none min-h-[44px] px-4 rounded-xl border border-sky-600 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-sm font-semibold transition"
              >
                Message caterer
              </button>

              <div v-if="['Pending', 'Confirmed'].includes(b.booking_status)" class="relative flex-1 sm:flex-none">
                <button
                  type="button"
                  @click="openActionMenuId = openActionMenuId === b.booking_id ? null : b.booking_id"
                  aria-haspopup="menu"
                  :aria-expanded="openActionMenuId === b.booking_id"
                  class="w-full min-h-[44px] px-4 inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  Manage
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div v-if="openActionMenuId === b.booking_id" @click="openActionMenuId = null" class="fixed inset-0 z-30"></div>
                <div v-if="openActionMenuId === b.booking_id" role="menu" class="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-40">
                  <button role="menuitem" @click="openActionMenuId = null; plannerTarget = b" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Plan event</button>
                  <button v-if="b.booking_status === 'Pending'" role="menuitem" @click="openActionMenuId = null; openEditModal(b)" class="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">Edit / reschedule</button>
                  <button role="menuitem" @click="openActionMenuId = null; confirmCancel(b)" class="w-full text-left px-4 py-3 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border-t border-gray-100 dark:border-gray-700">Cancel booking</button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      <!-- ============ CANCEL CONFIRM MODAL ============ -->
      <div v-if="bookingToCancel" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-5 sm:p-6 rounded-b-none sm:rounded-b-2xl">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Cancel this booking?</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
            This is for <span class="font-semibold text-gray-700 dark:text-gray-200">{{ formatDate(bookingToCancel.event_date) }}</span> at {{ bookingToCancel.event_location }}. This can't be undone once cancelled.
          </p>
          <p v-if="!cancelRule.allowed" class="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-3">{{ cancelRule.message }}</p>
          <p v-if="platform.cancellation_policy" class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg p-3 mb-3">
            <span class="font-semibold">Cancellation policy:</span> {{ platform.cancellation_policy }}
          </p>
          <p
            v-if="bookingToCancel.tbl_payments && Number(bookingToCancel.tbl_payments.amount_paid) > 0"
            class="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-5"
          >
            You've already paid ₱{{ formatPrice(bookingToCancel.tbl_payments.amount_paid) }} toward this booking. Refunds for cancelled bookings are handled directly with the business — please coordinate with them after cancelling.
          </p>
          <div class="flex gap-3">
            <button @click="bookingToCancel = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
              Keep Booking
            </button>
            <button @click="handleCancelBooking" :disabled="isCancelling || !cancelRule.allowed" class="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-red-700 disabled:opacity-50">
              {{ isCancelling ? 'Cancelling...' : 'Yes, Cancel' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ============ EDIT BOOKING MODAL ============ -->
      <div v-if="bookingToEdit" class="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-5 sm:p-6 max-h-[92dvh] overflow-y-auto rounded-b-none sm:rounded-b-2xl overscroll-contain">
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">Edit Booking</h3>
          <p class="text-xs text-gray-400 dark:text-gray-500 mb-5">Only Pending bookings can be edited.</p>

          <form @submit.prevent="handleSaveEdit" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Date</label>
                <input
                  type="date"
                  v-model="editForm.event_date"
                  @change="handleEditDateCheck"
                  required
                  :min="minEventDate" :max="maxEventDate"
                  class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Time</label>
                <input type="time" v-model="editForm.event_time" required class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
              </div>
            </div>

            <div v-if="editConflictWarning" class="text-amber-700 dark:text-amber-300 text-sm font-medium">
              {{ editConflictWarning }}
            </div>

            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Event Location</label>
              <input type="text" v-model="editForm.event_location" required class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
            </div>

            <div>
              <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Catering Business</label>
              <select v-model="editBusinessId" @change="editForm.package_id = ''; loadEditPackageMenu(''); loadEditBusinessAddons(editBusinessId)" required class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
                <option value="" disabled>Select a catering business</option>
                <option v-for="b in businesses" :key="b.business_id" :value="b.business_id">{{ b.business_name }}</option>
              </select>
              <p v-if="!businesses.length" class="text-xs text-gray-500 dark:text-gray-400 mt-1">No catering businesses are available yet.</p>
              <p v-else-if="editBusiness?.address || editBusiness?.contact_number" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ [editBusiness.address, editBusiness.contact_number].filter(Boolean).join(' · ') }}
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Number of Guests</label>
                <input type="number" v-model.number="editForm.guest_count" required min="1" :max="platform.max_guests" step="1" class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Catering Package</label>
                <select v-model="editForm.package_id" @change="handleEditPackageChange" :disabled="!editBusinessId" required class="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100">
                  <option value="" disabled>{{ editBusinessId ? 'Select a package' : 'Select a business first' }}</option>
                  <option v-for="p in editBusinessPackages" :key="p.package_id" :value="p.package_id">
                    {{ p.package_name }} — ₱{{ formatPrice(p.price_per_head) }}/head<template v-if="guestRangeLabel(p)"> ({{ guestRangeLabel(p) }})</template>
                  </option>
                </select>
              </div>
            </div>

            <div v-if="selectedEditPackage" class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
              <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ selectedEditPackage.package_name }}</p>
              <p v-if="selectedEditPackage.tbl_business?.business_name" class="text-xs text-gray-500 dark:text-gray-400">by {{ selectedEditPackage.tbl_business.business_name }}</p>
              <p v-if="selectedEditPackage.description" class="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-3">Includes</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 whitespace-pre-line">{{ selectedEditPackage.description }}</p>
              <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-3">
                Est. Total: ₱{{ formatPrice((selectedEditPackage.price_per_head || 0) * (editForm.guest_count || 0) + editAddonsSubtotal) }}
              </p>
              <p class="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Before seasonal pricing and discounts. They're re-applied when you save.</p>
            </div>

            <!-- ============ EXTRA ADD-ONS (edit, ala carte, optional) ============ -->
            <div v-if="isLoadingEditAddons" class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
              Loading add-ons...
            </div>
            <div v-else-if="editBusinessAddons.length" class="space-y-2">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Extra Add-Ons (optional)</p>
              <AddonPicker :addons="editBusinessAddons" :quantities="editAddonQuantities" @update="setEditAddonQuantity" />
            </div>

            <!-- ============ CHOOSE YOUR MENU (edit) ============ -->
            <div v-if="isLoadingEditPackageMenu" class="text-sm text-gray-400 dark:text-gray-500 text-center py-3">
              Loading menu choices...
            </div>
            <div v-else-if="editPackageMenuCategories.length" class="space-y-4">
              <p class="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Choose Your Menu</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 -mt-2">Pick your dishes, then tap Small, Regular or Large for each one. The price stays per head.</p>
              <div v-for="cat in editPackageMenuCategories" :key="cat.category" class="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                <div class="flex items-center justify-between mb-2">
                  <p class="text-sm font-semibold text-gray-800 dark:text-gray-100">{{ cat.category }}</p>
                  <span
                    class="text-xs font-bold"
                    :class="(editSelectedMenuItems[cat.category]?.length || 0) >= cat.max ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'"
                  >
                    {{ editSelectedMenuItems[cat.category]?.length || 0 }} / {{ cat.max }} selected
                  </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                  <div v-for="item in cat.items" :key="item.item_id" class="flex flex-col">
                  <label
                    class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      :checked="(editSelectedMenuItems[cat.category] || []).includes(item.item_id)"
                      :disabled="!(editSelectedMenuItems[cat.category] || []).includes(item.item_id) && (editSelectedMenuItems[cat.category]?.length || 0) >= cat.max"
                      @change="toggleEditMenuItem(cat.category, item.item_id, cat.max)"
                      class="rounded-none accent-emerald-600"
                    />
                    {{ item.item_name }}
                  </label>
                  <div v-if="(editSelectedMenuItems[cat.category] || []).includes(item.item_id)" class="flex flex-wrap items-center gap-1.5 pl-6 pb-1">
                    <span class="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Serving:</span>
                    <button
                      v-for="p in PORTIONS"
                      :key="p.value"
                      type="button"
                      @click="editSelectedPortions[item.item_id] = p.value"
                      :class="(editSelectedPortions[item.item_id] || 'Regular') === p.value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'"
                      class="text-xs sm:text-[11px] font-semibold px-3 sm:px-2 py-1 sm:py-0.5 border rounded-full"
                    >{{ p.label }}</button>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="showEditMenuWarning && !isEditMenuComplete" id="edit-menu-warning" class="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 p-3 text-sm text-amber-800 dark:text-amber-200">
              <p class="font-semibold">Your menu is not complete yet.</p>
              <p class="mt-0.5">
                <span v-for="(m, i) in editMissingMenuPicks" :key="m.category">{{ m.category }}: pick {{ m.need }} more{{ i < editMissingMenuPicks.length - 1 ? ' · ' : '' }}</span>
              </p>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="bookingToEdit = null" class="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button type="submit" :disabled="isSaving || !!editConflictWarning" class="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ============ COVER PHOTO VIEWER ============ -->
      <div v-if="showCoverViewer && selectedBusiness?.cover_url" @click="showCoverViewer = false" class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 sm:p-8" role="dialog" aria-modal="true" aria-label="Cover photo">
        <button type="button" @click="showCoverViewer = false" aria-label="Close photo" class="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img :src="selectedBusiness.cover_url" :alt="`${selectedBusiness.business_name} cover photo`" @click.stop class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
      </div>

      <!-- ============ BUSINESS PROFILE + REVIEW MODALS ============ -->
      <BusinessProfileModal
        v-if="showProfile"
        :profile="profileData"
        :stats="bizStats(profileBusinessId)"
        :reviews="profileReviews"
        :is-loading="isLoadingProfile"
        :is-favorite="favoriteBusinessIds.has(profileBusinessId)"
        :show-book-button="activeTab === 'Book Catering' && profileBusinessId !== selectedBusinessId"
        @close="showProfile = false"
        @toggle-favorite="toggleFavoriteBusiness(profileBusinessId)"
        @book="bookFromProfile"
        @message="messageBusiness"
      />
      <ReviewModal v-if="reviewTarget" :booking="reviewTarget" @close="reviewTarget = null" @submitted="onReviewSubmitted" />
      <EventPlanner v-if="plannerTarget" :booking="plannerTarget" @close="plannerTarget = null" />

    </main>
  </div>
</template>

<script setup>
import logoUrl from '../Assets/logofinal.png'
import { toTitleCase } from '../utils/textFormat'
import { supabase } from '../supabaseClient'
import { logoutUser } from '../services/authService'
import { getMyProfile } from '../services/profileService'
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { getPlatformSettings, bookingDateRange, checkCancellation, computeFees, SETTINGS_DEFAULTS } from '../services/platformSettingsService'
import { useRouter } from 'vue-router'
import { PORTIONS, getSelectionsForBookings, createBooking, getMyBookings, checkDateConflict, getTakenDates, cancelMyBooking, updateMyBooking, setBookingSelections, getBookingSelections } from '../services/bookingService'
import { getAllPackages, getPackageMenu, MENU_CATEGORIES } from '../services/packageService'
import {
  DIETARY_TAGS, getCatalogStats, getPackagePhotos, getPackageInclusions, getBusinessProfile, getBusinessPaymentInstructions,
  getBusinessReviews, getMyReviewedBookingIds, getMyFavorites, setFavoriteBusiness, setFavoritePackage
} from '../services/catalogService'
import StarRating from '../Components/StarRating.vue'
import HeartButton from '../Components/HeartButton.vue'
import PackageGallery from '../Components/PackageGallery.vue'
import AddonPicker from '../Components/AddonPicker.vue'
import BusinessProfileModal from '../Components/BusinessProfileModal.vue'
import ReviewModal from '../Components/ReviewModal.vue'
import EventPlanner from '../Components/EventPlanner.vue'
import ChatInbox from '../Components/ChatInbox.vue'
import { useChatUnread, resetChatUnread } from '../composables/useChatUnread'
import { getBusinessAddons, getBookingAddons, setBookingAddons, sumAddons } from '../services/addonService'
import { quoteBookingPrice, applyBookingPricing, getMyLoyalty, tierBadgeClass } from '../services/pricingService'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const router = useRouter()

const userName = ref('')
const userInitial = ref('U')
const userAvatarUrl = ref('')
const showAccountMenu = ref(false)

const tabs = ['Book Catering', 'My Bookings', 'Messages']
const { chatUnread } = useChatUnread()
const activeTab = ref('Book Catering')

const packages = ref([])
const selectedBusinessId = ref('')
const editBusinessId = ref('')
const myBookings = ref([])
const bookingToCancel = ref(null)
const isCancelling = ref(false)

const bookingToEdit = ref(null)
const isSaving = ref(false)
const editConflictWarning = ref('')
const editForm = ref({
  event_date: '',
  event_time: '',
  event_location: '',
  guest_count: null,
  package_id: ''
})

// Package menu for the EDIT modal -- mirrors the "Choose Your Menu" state
// below, but kept separate so editing a booking doesn't clobber the new
// booking form's in-progress selections.
const editPackageMenu = ref({ limits: [], itemsByCategory: {} })
const editSelectedMenuItems = ref({}) // { [category]: [item_id, ...] }
const editSelectedPortions = ref({}) // { [item_id]: 'Small' | 'Regular' | 'Large' }
const isLoadingEditPackageMenu = ref(false)
const editAllMenuItemsFlat = ref([])

const isLoading = ref(false)
const isSubmitting = ref(false)
const successMessage = ref('')
const pageError = ref('')
const conflictWarning = ref('')

// Booking status-change alerts: since a client isn't paying online or being
// emailed, this is how they find out a Pending booking got Confirmed/Rejected
// since their last visit. No backend table needed -- just remembers what was
// last seen, per user, in localStorage.
const statusChangeAlerts = ref([])
let currentUserId = ''

// Local date (NOT toISOString, which is UTC and gives "yesterday" in the
// Philippines between 12:00 AM and 8:00 AM).
const todayStr = toDateStr(new Date())

// ---------- Platform-wide rules set by the Super Admin (Global Config) ----------
// Falls back to harmless defaults if global_config.sql has not been run.
const platform = ref({ ...SETTINGS_DEFAULTS })
const minEventDate = computed(() => bookingDateRange(platform.value).min)
const maxEventDate = computed(() => bookingDateRange(platform.value).max)
onMounted(async () => {
  const res = await getPlatformSettings()
  platform.value = res.settings
})
const cancelRule = computed(() =>
  bookingToCancel.value ? checkCancellation(platform.value, bookingToCancel.value.event_date) : { allowed: true, message: '' }
)
// Service fee + tax shown on top of the quoted total. The quote itself still
// comes from the server; these lines are the platform default fee/tax estimate.
const estSubtotal = computed(() =>
  selectedPackage.value
    ? (quote.value ? Number(quote.value.total) : (selectedPackage.value.price_per_head || 0) * (form.value.guest_count || 0) + addonsSubtotal.value)
    : 0
)
const feeBreakdown = computed(() => computeFees(platform.value, estSubtotal.value))
const platformMoney = (n) => `${platform.value.currency_symbol}${formatPrice(n)}`

// ---------- Availability calendar (Book Catering step) ----------
// Shows a whole month of a business's Pending/Confirmed dates up front, so
// the client sees what's already taken before typing/picking a date instead
// of only finding out after (handleDateCheck still runs as the final,
// race-condition-safe check right before submit).
const calendarViewDate = ref(startOfMonth(new Date())) // first day of the month currently shown
const takenDates = ref(new Set()) // Set of 'YYYY-MM-DD' strings, for the viewed month
const isLoadingCalendar = ref(false)
const showCalendar = ref(false)

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function toDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const calendarMonthLabel = computed(() =>
  calendarViewDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

// Sun-first 6x7 grid: leading/trailing days from adjacent months are shown
// (dimmed, unclickable) purely so the grid lines up, matching how native
// date pickers look.
const calendarDays = computed(() => {
  const first = calendarViewDate.value
  const startWeekday = first.getDay() // 0 = Sun
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  const days = []

  for (let i = 0; i < startWeekday; i++) {
    days.push({ inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(first.getFullYear(), first.getMonth(), d)
    const dateStr = toDateStr(date)
    days.push({
      inMonth: true,
      day: d,
      dateStr,
      isPast: dateStr < todayStr,
      isTaken: takenDates.value.has(dateStr),
      isSelected: form.value.event_date === dateStr,
    })
  }
  while (days.length % 7 !== 0) {
    days.push({ inMonth: false })
  }
  return days
})

let calendarLoadToken = 0
async function loadCalendarMonth() {
  if (!selectedBusinessId.value) return
  const token = ++calendarLoadToken // only the latest request may write results
  const first = calendarViewDate.value
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0)
  isLoadingCalendar.value = true
  try {
    const dates = await getTakenDates(selectedBusinessId.value, toDateStr(first), toDateStr(last))
    if (token !== calendarLoadToken) return
    takenDates.value = new Set(dates)
  } catch (error) {
    if (token !== calendarLoadToken) return
    console.error('Failed to load calendar availability:', error)
    takenDates.value = new Set()
  } finally {
    if (token === calendarLoadToken) isLoadingCalendar.value = false
  }
}

function goToPrevMonth() {
  const d = calendarViewDate.value
  calendarViewDate.value = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  loadCalendarMonth()
}

function goToNextMonth() {
  const d = calendarViewDate.value
  calendarViewDate.value = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  loadCalendarMonth()
}

// Clicking an open day on the calendar fills the date input and runs the
// same authoritative check as typing a date directly would.
function pickCalendarDate(day) {
  if (!day.inMonth || day.isPast || day.isTaken) return
  form.value.event_date = day.dateStr
  handleDateCheck()
  showCalendar.value = false
}

const form = ref({
  event_date: '',
  event_time: '',
  event_location: '',
  guest_count: null,
  package_id: '',
  client_email: ''
})

// Package menu (main module): which items the client may choose from,
// per category, and how many per category, for the package they picked.
const packageMenu = ref({ limits: [], itemsByCategory: {} })
const selectedMenuItems = ref({}) // { [category]: [item_id, ...] }
const selectedPortions = ref({}) // { [item_id]: 'Small' | 'Regular' | 'Large' }
const isLoadingPackageMenu = ref(false)

// Only categories that actually have a limit configured for this package
// are shown -- packages with no menu set up yet behave exactly as before.
const packageMenuCategories = computed(() =>
  MENU_CATEGORIES
    .map((cat) => ({
      category: cat,
      max: packageMenu.value.limits.find((l) => l.category === cat)?.max_selections || 0,
      items: (packageMenu.value.itemsByCategory[cat] || [])
        .map((id) => allMenuItemsFlat.value.find((i) => i.item_id === id))
        .filter(Boolean)
    }))
    .filter((c) => c.max > 0 && c.items.length > 0)
)

// itemsByCategory only stores ids, so keep a lookup of id -> {item_id, item_name}
// built from whatever the menu endpoint returned inline.
const allMenuItemsFlat = ref([])

// Categories where the client still has to pick more dishes. The required
// count is the package limit, or fewer if the category simply doesn't offer
// that many dishes. The database also refuses to confirm an incomplete menu.
const missingMenuPicks = computed(() =>
  packageMenuCategories.value
    .map((cat) => ({
      category: cat.category,
      need: Math.min(cat.max, cat.items.length) - (selectedMenuItems.value[cat.category]?.length || 0)
    }))
    .filter((m) => m.need > 0)
)
const isMenuComplete = computed(() => missingMenuPicks.value.length === 0)

// The warning only appears once the client presses Submit with an incomplete menu.
const showMenuWarning = ref(false)
watch(isMenuComplete, (complete) => { if (complete) showMenuWarning.value = false })

// ---------- Extra Add-Ons (ala carte, sold alongside the package) ----------
const businessAddons = ref([])       // this business's active add-ons (new booking form)
const addonQuantities = ref({})      // { [addon_id]: quantity }, 0/absent = not selected
const isLoadingAddons = ref(false)
const addonsSubtotal = computed(() =>
  businessAddons.value.reduce((sum, a) => sum + (Number(addonQuantities.value[a.addon_id]) || 0) * Number(a.price), 0)
)

// ---- Dynamic pricing: live quote (seasonal + promo + loyalty) ----
// The server does the maths (quote_booking_price); this just asks it whenever an input changes.
const promoInput = ref('')
const appliedPromo = ref('')
const pointsInput = ref(0)
const quote = ref(null)
const myRewards = ref([])
let quoteTimer = null
let quoteSeq = 0

async function refreshQuote() {
  const f = form.value
  const pkg = selectedPackage.value
  if (!pkg || !selectedBusinessId.value || !f.event_date || !(Number(f.guest_count) >= 1)) { quote.value = null; return }
  const seq = ++quoteSeq
  try {
    const q = await quoteBookingPrice({
      businessId: selectedBusinessId.value,
      packageId: pkg.package_id,
      eventDate: f.event_date,
      guests: Number(f.guest_count),
      addonsTotal: addonsSubtotal.value,
      promoCode: appliedPromo.value,
      points: Number(pointsInput.value) || 0,
    })
    if (seq !== quoteSeq) return          // a newer request is in flight
    quote.value = q
    // The server may have clamped the points; keep the box honest.
    if ((Number(pointsInput.value) || 0) > q.points_used) pointsInput.value = q.points_used
  } catch (error) {
    // Pricing SQL not installed yet, or offline: fall back to the plain estimate.
    if (seq === quoteSeq) quote.value = null
    console.error('Price quote failed:', error)
  }
}
function scheduleQuote() {
  clearTimeout(quoteTimer)
  quoteTimer = setTimeout(refreshQuote, 300)
}
watch(
  [selectedBusinessId, () => form.value.package_id, () => form.value.event_date, () => form.value.guest_count, addonsSubtotal, appliedPromo, pointsInput],
  scheduleQuote
)
function applyPromo() {
  appliedPromo.value = promoInput.value.trim().toUpperCase()
}
function removePromo() {
  appliedPromo.value = ''
  promoInput.value = ''
}
function resetPricingInputs() {
  promoInput.value = ''
  appliedPromo.value = ''
  pointsInput.value = 0
  quote.value = null
}
// apply_booking_pricing returns the server's breakdown; map it onto a booking row for display.
function pricingToBooking(q) {
  return q ? {
    base_amount: q.base_amount,
    seasonal_rule_name: q.season_rule_name,
    seasonal_adjustment: q.season_adjustment,
    promo_code: q.promo_code,
    promo_discount: q.promo_discount,
    loyalty_points_used: q.points_used,
    loyalty_discount: q.loyalty_discount,
    quoted_total: q.total,
  } : {}
}
async function loadMyRewards() {
  try { myRewards.value = await getMyLoyalty() } catch { myRewards.value = [] }
}

function setAddonQuantity(addonId, qty) {
  const n = Math.max(0, Math.floor(Number(qty) || 0))
  addonQuantities.value = { ...addonQuantities.value, [addonId]: n }
}

async function loadBusinessAddons(businessId) {
  addonQuantities.value = {}
  businessAddons.value = []
  if (!businessId) return
  isLoadingAddons.value = true
  try {
    businessAddons.value = await getBusinessAddons(businessId)
  } catch (error) {
    console.error('Failed to load add-ons:', error)
  } finally {
    isLoadingAddons.value = false
  }
}

// Same shape, but for the Edit Booking modal.
const editBusinessAddons = ref([])
const editAddonQuantities = ref({})
const isLoadingEditAddons = ref(false)
const editAddonsSubtotal = computed(() =>
  editBusinessAddons.value.reduce((sum, a) => sum + (Number(editAddonQuantities.value[a.addon_id]) || 0) * Number(a.price), 0)
)

function setEditAddonQuantity(addonId, qty) {
  const n = Math.max(0, Math.floor(Number(qty) || 0))
  editAddonQuantities.value = { ...editAddonQuantities.value, [addonId]: n }
}

async function loadEditBusinessAddons(businessId, { preserveSelections = false } = {}) {
  if (!preserveSelections) editAddonQuantities.value = {}
  editBusinessAddons.value = []
  if (!businessId) return
  isLoadingEditAddons.value = true
  try {
    editBusinessAddons.value = await getBusinessAddons(businessId)
  } catch (error) {
    console.error('Failed to load add-ons:', error)
  } finally {
    isLoadingEditAddons.value = false
  }
}

let packageMenuToken = 0
async function loadPackageMenu(packageId) {
  const token = ++packageMenuToken // invalidates any earlier in-flight load
  selectedMenuItems.value = {}
  selectedPortions.value = {}
  showMenuWarning.value = false
  packageMenu.value = { limits: [], itemsByCategory: {} }
  allMenuItemsFlat.value = []
  if (!packageId) {
    isLoadingPackageMenu.value = false
    return
  }

  isLoadingPackageMenu.value = true
  try {
    const menu = await getPackageMenu(packageId)
    // getPackageMenu only returns item_ids; fetch names from tbl_menu_items.
    const ids = Object.values(menu.itemsByCategory).flat()
    let names = []
    if (ids.length) {
      let { data, error: itemsError } = await supabase
        .from('tbl_menu_items')
        .select('item_id, item_name, description, image_url, tags')
        .in('item_id', ids)
      if (itemsError) {
        // Migration not run yet -> fall back to the basic columns.
        ;({ data } = await supabase.from('tbl_menu_items').select('item_id, item_name').in('item_id', ids))
      }
      names = data || []
    }
    // A newer load (or "Back to packages") started meanwhile -- drop this result.
    if (token !== packageMenuToken) return
    packageMenu.value = menu
    allMenuItemsFlat.value = names
  } catch (error) {
    console.error('Failed to load package menu:', error)
  } finally {
    if (token === packageMenuToken) isLoadingPackageMenu.value = false
  }
}

function toggleMenuItem(category, itemId, max) {
  const current = selectedMenuItems.value[category] || []
  const idx = current.indexOf(itemId)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    if (current.length >= max) return
    current.push(itemId)
  }
  selectedMenuItems.value = { ...selectedMenuItems.value, [category]: current }
}

// Same shape as packageMenuCategories/loadPackageMenu/toggleMenuItem above,
// but for the Edit Booking modal so changing the package there also lets
// the client re-pick their menu instead of leaving stale selections behind.
const editPackageMenuCategories = computed(() =>
  MENU_CATEGORIES
    .map((cat) => ({
      category: cat,
      max: editPackageMenu.value.limits.find((l) => l.category === cat)?.max_selections || 0,
      items: (editPackageMenu.value.itemsByCategory[cat] || [])
        .map((id) => editAllMenuItemsFlat.value.find((i) => i.item_id === id))
        .filter(Boolean)
    }))
    .filter((c) => c.max > 0 && c.items.length > 0)
)

const editMissingMenuPicks = computed(() =>
  editPackageMenuCategories.value
    .map((cat) => ({
      category: cat.category,
      need: Math.min(cat.max, cat.items.length) - (editSelectedMenuItems.value[cat.category]?.length || 0)
    }))
    .filter((m) => m.need > 0)
)
const isEditMenuComplete = computed(() => editMissingMenuPicks.value.length === 0)

const showEditMenuWarning = ref(false)
watch(isEditMenuComplete, (complete) => { if (complete) showEditMenuWarning.value = false })
watch(bookingToEdit, () => { showEditMenuWarning.value = false })

let editPackageMenuToken = 0
async function loadEditPackageMenu(packageId, { preserveSelections = false } = {}) {
  const token = ++editPackageMenuToken
  if (!preserveSelections) editSelectedMenuItems.value = {}
  editPackageMenu.value = { limits: [], itemsByCategory: {} }
  editAllMenuItemsFlat.value = []
  if (!packageId) {
    isLoadingEditPackageMenu.value = false
    return
  }

  isLoadingEditPackageMenu.value = true
  try {
    const menu = await getPackageMenu(packageId)
    const ids = Object.values(menu.itemsByCategory).flat()
    let names = []
    if (ids.length) {
      const { data } = await supabase.from('tbl_menu_items').select('item_id, item_name').in('item_id', ids)
      names = data || []
    }
    if (token !== editPackageMenuToken) return
    editPackageMenu.value = menu
    editAllMenuItemsFlat.value = names
  } catch (error) {
    console.error('Failed to load package menu:', error)
  } finally {
    if (token === editPackageMenuToken) isLoadingEditPackageMenu.value = false
  }
}

function toggleEditMenuItem(category, itemId, max) {
  const current = editSelectedMenuItems.value[category] || []
  const idx = current.indexOf(itemId)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    if (current.length >= max) return
    current.push(itemId)
  }
  editSelectedMenuItems.value = { ...editSelectedMenuItems.value, [category]: current }
}

// editForm.package_id has no @change of its own in the template (only
// editBusinessId does), so this is called directly from the select.
function handleEditPackageChange() {
  loadEditPackageMenu(editForm.value.package_id)
}

// Clicking a package card in the browse grid opens its full product-page
// view (image left, booking details right) by selecting it and loading its
// menu, the same way choosing a business used to jump straight to the form.
function viewPackageDetails(p) {
  form.value.package_id = p.package_id
  loadPackageMenu(p.package_id)
  loadPackageExtras(p.package_id)
}

// "Back to packages" only clears the package (and its menu picks) so the
// client can browse other packages for the same business without losing
// their chosen date/time/location/guest count.
function backToPackages() {
  packageMenuToken++ // drop any menu load still in flight
  isLoadingPackageMenu.value = false
  form.value.package_id = ''
  showMenuWarning.value = false
  selectedMenuItems.value = {}
  selectedPortions.value = {}
  packageMenu.value = { limits: [], itemsByCategory: {} }
  loadPackageExtras('')
}

const selectedPackage = computed(() => packages.value.find((p) => p.package_id === form.value.package_id))

// =====================================================================
// CATALOG FEATURES (18-26): search/filter, sort, gallery, dish tags,
// inclusions, per-head vs total price, business profile, reviews, favorites
// =====================================================================
const catalogStats = ref({ packages: {}, businesses: {} })
const favoriteBusinessIds = ref(new Set())
const favoritePackageIds = ref(new Set())
const reviewedBookingIds = ref(new Set())

// 18 / 19: package filters + sort
const pkgSearch = ref('')
const pkgType = ref('All')
const pkgMinPrice = ref(null)
const pkgMaxPrice = ref(null)
const pkgSort = ref('popular') // popular | price_asc | price_desc | rating
const pkgFavoritesOnly = ref(false)
// 23: 'head' = presyo kada ulo, 'total' = kabuuang presyo (price x guest count)
const priceMode = ref('head')

// Business grid (Step 1) sort + favorites filter
const businessSort = ref('name') // name | price | rating | popular
const businessFavoritesOnly = ref(false)

// Per-package extras (20 gallery, 22 inclusions)
const packagePhotos = ref([])
const packageInclusions = ref([])
let packageExtrasToken = 0

// 24 / 25: business profile modal + review modal
const showProfile = ref(false)
// In-page caterer tabs (Packages / About / Reviews)
const bizPageTab = ref('Packages')
const bizAbout = ref(null)
const bizReviews = ref([])
const isLoadingBizPage = ref(false)
async function loadBizPage(id) {
  bizAbout.value = null
  bizReviews.value = []
  isLoadingBizPage.value = true
  const [profile, reviews] = await Promise.allSettled([getBusinessProfile(id), getBusinessReviews(id)])
  if (selectedBusinessId.value !== id) return
  bizAbout.value = profile.status === 'fulfilled' && profile.value ? profile.value : (businesses.value.find((b) => b.business_id === id) || null)
  if (reviews.status === 'fulfilled') bizReviews.value = reviews.value
  isLoadingBizPage.value = false
}
watch(selectedBusinessId, (id) => {
  bizPageTab.value = 'Packages'
  if (id) loadBizPage(id)
})
function formatReviewDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}
// Full-size cover photo viewer (click the cover on a caterer's page)
const showCoverViewer = ref(false)
function onCoverViewerKey(e) { if (e.key === 'Escape') showCoverViewer.value = false }
watch(showCoverViewer, (open) => {
  if (open) window.addEventListener('keydown', onCoverViewerKey)
  else window.removeEventListener('keydown', onCoverViewerKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onCoverViewerKey))
const profileBusinessId = ref('')
// Chat: set when the client taps "Message" on a business profile.
const chatStartBusinessId = ref(null)
watch(activeTab, (t) => { if (t !== 'Messages') chatStartBusinessId.value = null })
// id is passed from the cards / booking form / My Bookings; the profile modal
// emits no id, so fall back to the business whose profile is open.
function messageBusiness(id) {
  chatStartBusinessId.value = (typeof id === 'string' && id) || profileBusinessId.value || null
  showProfile.value = false
  activeTab.value = 'Messages'
}
function bookingBusinessId(booking) {
  return booking.business_id || packages.value.find((p) => p.package_id === booking.package_id)?.business_id || ''
}
const profileData = ref(null)
const profileReviews = ref([])
const isLoadingProfile = ref(false)
const reviewTarget = ref(null)
// Booking currently open in the Event Planning tools (guest list / seating / dietary).
const plannerTarget = ref(null)

const guestsNum = computed(() => Number(form.value.guest_count) || 0)

function pkgStats(p) {
  return catalogStats.value.packages[p?.package_id] || { booking_count: 0, review_count: 0, avg_rating: null }
}
function bizStats(id) {
  return catalogStats.value.businesses[id] || { booking_count: 0, review_count: 0, avg_rating: null }
}
function tagMeta(key) {
  return DIETARY_TAGS.find((t) => t.key === key)
}

// 23: main price shown on a card / page, plus the "other" price underneath.
function priceLines(p) {
  const head = Number(p?.price_per_head) || 0
  const g = guestsNum.value
  const total = head * g
  if (priceMode.value === 'total' && g > 0) {
    return { main: total, mainLabel: `for ${g} guest${g === 1 ? '' : 's'}`, sub: `₱${formatPrice(head)} per head` }
  }
  return {
    main: head,
    mainLabel: 'per head',
    sub: g > 0 ? `₱${formatPrice(total)} for ${g} guest${g === 1 ? '' : 's'}` : (priceMode.value === 'total' ? 'Enter guest count to see total' : '')
  }
}

// 18: guest-count fit (null min/max = no limit)
function fitsGuests(p) {
  const g = guestsNum.value
  if (!g) return true
  if (p.min_guests != null && g < p.min_guests) return false
  if (p.max_guests != null && g > p.max_guests) return false
  return true
}
function guestRangeLabel(p) {
  if (p.min_guests != null && p.max_guests != null) return `${p.min_guests}–${p.max_guests} guests`
  if (p.min_guests != null) return `${p.min_guests}+ guests`
  if (p.max_guests != null) return `up to ${p.max_guests} guests`
  return ''
}

const availablePackageTypes = computed(() => {
  const set = new Set()
  for (const p of businessPackages.value) if (p.package_type) set.add(p.package_type)
  return [...set].sort()
})

const visiblePackages = computed(() => {
  const q = pkgSearch.value.trim().toLowerCase()
  const min = pkgMinPrice.value === null || pkgMinPrice.value === '' ? null : Number(pkgMinPrice.value)
  const max = pkgMaxPrice.value === null || pkgMaxPrice.value === '' ? null : Number(pkgMaxPrice.value)

  const list = businessPackages.value.filter((p) => {
    const price = Number(p.price_per_head) || 0
    if (q && !`${p.package_name || ''} ${p.description || ''} ${p.package_type || ''}`.toLowerCase().includes(q)) return false
    if (pkgType.value !== 'All' && p.package_type !== pkgType.value) return false
    if (min !== null && price < min) return false
    if (max !== null && price > max) return false
    if (!fitsGuests(p)) return false
    if (pkgFavoritesOnly.value && !favoritePackageIds.value.has(p.package_id)) return false
    return true
  })

  const byPrice = (a, b) => (Number(a.price_per_head) || 0) - (Number(b.price_per_head) || 0)
  const popular = (a, b) => pkgStats(b).booking_count - pkgStats(a).booking_count
  const rating = (a, b) => (pkgStats(b).avg_rating || 0) - (pkgStats(a).avg_rating || 0)
  const sorters = {
    popular: (a, b) => popular(a, b) || rating(a, b) || byPrice(a, b),
    price_asc: byPrice,
    price_desc: (a, b) => byPrice(b, a),
    rating: (a, b) => rating(a, b) || popular(a, b)
  }
  return [...list].sort(sorters[pkgSort.value] || sorters.popular)
})

const hasActivePackageFilters = computed(() =>
  !!pkgSearch.value.trim() || pkgType.value !== 'All' || !!pkgMinPrice.value || !!pkgMaxPrice.value ||
  pkgFavoritesOnly.value || guestsNum.value > 0
)
function resetPackageFilters() {
  pkgSearch.value = ''
  pkgType.value = 'All'
  pkgMinPrice.value = null
  pkgMaxPrice.value = null
  pkgFavoritesOnly.value = false
  form.value.guest_count = null
}

// 20: gallery = cover image first, then extra photos (no duplicates)
const galleryImages = computed(() => {
  const urls = [selectedPackage.value?.image_url, ...packagePhotos.value.map((ph) => ph.image_url)].filter(Boolean)
  return [...new Set(urls)]
})
// 22: included / not included
const includedItems = computed(() => packageInclusions.value.filter((i) => i.is_included))
const excludedItems = computed(() => packageInclusions.value.filter((i) => !i.is_included))

async function loadPackageExtras(packageId) {
  const token = ++packageExtrasToken
  packagePhotos.value = []
  packageInclusions.value = []
  if (!packageId) return
  const [photos, inclusions] = await Promise.allSettled([getPackagePhotos(packageId), getPackageInclusions(packageId)])
  if (token !== packageExtrasToken) return
  if (photos.status === 'fulfilled') packagePhotos.value = photos.value
  if (inclusions.status === 'fulfilled') packageInclusions.value = inclusions.value
}

// Every piece is optional: if the catalog_features.sql migration hasn't been
// run yet, these just fail quietly and the page behaves like before.
async function loadCatalogExtras() {
  const [stats, favs, reviewed] = await Promise.allSettled([getCatalogStats(), getMyFavorites(), getMyReviewedBookingIds()])
  if (stats.status === 'fulfilled') catalogStats.value = stats.value
  if (favs.status === 'fulfilled') {
    favoriteBusinessIds.value = favs.value.businesses
    favoritePackageIds.value = favs.value.packages
  }
  if (reviewed.status === 'fulfilled') reviewedBookingIds.value = reviewed.value
}

// 26: favorites (optimistic, revert on failure)
async function toggleFavoriteBusiness(id) {
  const on = !favoriteBusinessIds.value.has(id)
  on ? favoriteBusinessIds.value.add(id) : favoriteBusinessIds.value.delete(id)
  try {
    await setFavoriteBusiness(id, on)
  } catch (e) {
    on ? favoriteBusinessIds.value.delete(id) : favoriteBusinessIds.value.add(id)
    pageError.value = e.message
  }
}
async function toggleFavoritePackage(id) {
  const on = !favoritePackageIds.value.has(id)
  on ? favoritePackageIds.value.add(id) : favoritePackageIds.value.delete(id)
  try {
    await setFavoritePackage(id, on)
  } catch (e) {
    on ? favoritePackageIds.value.delete(id) : favoritePackageIds.value.add(id)
    pageError.value = e.message
  }
}

// 24 / 25: business profile + reviews
async function openBusinessProfile(id) {
  profileBusinessId.value = id
  profileData.value = null
  profileReviews.value = []
  showProfile.value = true
  isLoadingProfile.value = true
  const [profile, reviews] = await Promise.allSettled([getBusinessProfile(id), getBusinessReviews(id)])
  if (profileBusinessId.value !== id) return
  const fallback = businesses.value.find((b) => b.business_id === id) || null
  profileData.value = profile.status === 'fulfilled' && profile.value ? profile.value : fallback
  if (reviews.status === 'fulfilled') profileReviews.value = reviews.value
  isLoadingProfile.value = false
}
function bookFromProfile() {
  const id = profileBusinessId.value
  showProfile.value = false
  if (id && id !== selectedBusinessId.value) selectBusiness(id)
}
function onReviewSubmitted(bookingId) {
  reviewedBookingIds.value.add(String(bookingId))
  reviewTarget.value = null
  successMessage.value = 'Thanks for your review!'
  setTimeout(() => { successMessage.value = '' }, 4000)
  getCatalogStats().then((st) => { catalogStats.value = st }).catch(() => {})
}

// Splits a package's free-text description into display lines for the
// full-width "What's Included" section. A line ending in ':' with no
// leading '-' (e.g. "3 Main Courses:") is treated as a category header;
// everything else is a checklist item, with any leading "- " stripped.
const packageDescriptionLines = computed(() => {
  const text = selectedPackage.value?.description || ''
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (/:$/.test(line) && !line.startsWith('-')) {
        return { type: 'header', text: line }
      }
      return { type: 'item', text: line.replace(/^-\s*/, '') }
    })
})
const selectedEditPackage = computed(() => packages.value.find((p) => p.package_id === editForm.value.package_id))

// Catering businesses the client can book from, derived from the packages
// they can see (only businesses with at least one package show up).
const businesses = computed(() => {
  const map = new Map()
  for (const p of packages.value) {
    if (!p.business_id) continue
    const price = Number(p.price_per_head) || 0
    const existing = map.get(p.business_id)
    if (existing) {
      existing.package_count += 1
      existing.min_price = Math.min(existing.min_price, price)
      if (!existing.cover_url && p.image_url) existing.cover_url = p.image_url
      if (p.package_type && !existing.types.includes(p.package_type)) existing.types.push(p.package_type)
    } else {
      map.set(p.business_id, {
        business_id: p.business_id,
        business_name: p.tbl_business?.business_name || 'Unnamed business',
        address: p.tbl_business?.address || '',
        contact_number: p.tbl_business?.contact_number || '',
        logo_url: p.tbl_business?.logo_url || '',
        cover_url: p.tbl_business?.cover_url || p.image_url || '',
        has_store_cover: !!p.tbl_business?.cover_url,
        types: p.package_type ? [p.package_type] : [],
        package_count: 1,
        min_price: price
      })
    }
  }
  return [...map.values()]
    .map((b) => ({ ...b, ...bizStats(b.business_id) }))
    .sort((a, b) => a.business_name.localeCompare(b.business_name))
})
// Search/filter for Step 1's business grid -- matches on name or address.
const businessSearch = ref('')
// ---------- Step 1 extras: event-type chips, "available on my date", badges ----------
const bizTypeFilter = ref('All')
const bizDate = ref('')
const bizBookedOnDate = ref(new Set()) // business_ids already booked on bizDate
const isCheckingBizDate = ref(false)
let bizDateToken = 0

const allEventTypes = computed(() => {
  const set = new Set()
  for (const p of packages.value) if (p.package_type) set.add(p.package_type)
  return [...set].sort()
})
const bookedOnDateCount = computed(() =>
  businesses.value.filter((b) => bizBookedOnDate.value.has(b.business_id)).length
)

// Asks the database (is_date_taken) about every caterer for the chosen day.
// A failed check never hides a caterer -- they just stay in the list.
async function checkBizDate() {
  const token = ++bizDateToken
  const date = bizDate.value
  if (!date) {
    bizBookedOnDate.value = new Set()
    isCheckingBizDate.value = false
    return
  }
  isCheckingBizDate.value = true
  const results = await Promise.allSettled(
    businesses.value.map(async (b) => ({ id: b.business_id, taken: (await checkDateConflict(date, b.business_id)).conflict }))
  )
  if (token !== bizDateToken) return // a newer date was picked meanwhile
  bizBookedOnDate.value = new Set(results.filter((r) => r.status === 'fulfilled' && r.value.taken).map((r) => r.value.id))
  isCheckingBizDate.value = false
}
watch(bizDate, checkBizDate)
watch(() => businesses.value.length, () => { if (bizDate.value) checkBizDate() })

const maxBizBookings = computed(() => Math.max(0, ...businesses.value.map((b) => b.booking_count || 0)))
const isTopRated = (b) => (b.review_count || 0) >= 1 && (b.avg_rating || 0) >= 4.5
const isMostBooked = (b) => businesses.value.length > 1 && maxBizBookings.value > 0 && (b.booking_count || 0) === maxBizBookings.value

const hasBizFilters = computed(() =>
  !!businessSearch.value.trim() || bizTypeFilter.value !== 'All' || !!bizDate.value || businessFavoritesOnly.value
)
function clearBizFilters() {
  businessSearch.value = ''
  bizTypeFilter.value = 'All'
  bizDate.value = ''
  businessFavoritesOnly.value = false
}

// Top packages by number of bookings, respecting the event-type / date filters.
const popularPackages = computed(() => {
  const stats = catalogStats.value.packages
  return packages.value
    .filter((p) =>
      p.business_id &&
      (stats[p.package_id]?.booking_count || 0) > 0 &&
      (bizTypeFilter.value === 'All' || p.package_type === bizTypeFilter.value) &&
      !(bizDate.value && bizBookedOnDate.value.has(p.business_id))
    )
    .sort((a, b) => stats[b.package_id].booking_count - stats[a.package_id].booking_count)
    .slice(0, 4)
})
function bookPopularPackage(p) {
  selectBusiness(p.business_id)
  viewPackageDetails(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const filteredBusinessesForBooking = computed(() => {
  const q = businessSearch.value.trim().toLowerCase()
  let list = businesses.value.filter((b) =>
    (!q || b.business_name.toLowerCase().includes(q) || (b.address || '').toLowerCase().includes(q)) &&
    (!businessFavoritesOnly.value || favoriteBusinessIds.value.has(b.business_id)) &&
    (bizTypeFilter.value === 'All' || b.types.includes(bizTypeFilter.value)) &&
    !(bizDate.value && bizBookedOnDate.value.has(b.business_id))
  )
  const sorters = {
    name: (a, b) => a.business_name.localeCompare(b.business_name),
    price: (a, b) => a.min_price - b.min_price,
    rating: (a, b) => (b.avg_rating || 0) - (a.avg_rating || 0) || b.review_count - a.review_count,
    popular: (a, b) => b.booking_count - a.booking_count
  }
  return [...list].sort(sorters[businessSort.value] || sorters.name)
})

// Search/filter for the My Bookings tab -- status, text search (package
// name or event location), and an optional event-date range.
const bookingViews = ['Upcoming', 'Past', 'Cancelled']
const bookingView = ref('Upcoming')
const showBookingFilters = ref(false)
const highlightedBookingId = ref(null)
const bookingSearchQuery = ref('')
const bookingDateFrom = ref('')
const bookingDateTo = ref('')
function bookingInView(b, view) {
  if (view === 'Upcoming') return ['Pending', 'Confirmed'].includes(b.booking_status)
  if (view === 'Past') return b.booking_status === 'Completed'
  return b.booking_status === 'Cancelled'
}
const bookingViewCounts = computed(() => ({
  Upcoming: myBookings.value.filter((b) => bookingInView(b, 'Upcoming')).length,
  Past: myBookings.value.filter((b) => bookingInView(b, 'Past')).length,
  Cancelled: myBookings.value.filter((b) => bookingInView(b, 'Cancelled')).length
}))
const hasActiveBookingFilters = computed(() =>
  !!bookingSearchQuery.value || !!bookingDateFrom.value || !!bookingDateTo.value
)
function clearBookingFilters() {
  bookingSearchQuery.value = ''
  bookingDateFrom.value = ''
  bookingDateTo.value = ''
}
const filteredMyBookings = computed(() => {
  const q = bookingSearchQuery.value.trim().toLowerCase()
  const list = myBookings.value.filter((b) => {
    if (!bookingInView(b, bookingView.value)) return false
    if (bookingDateFrom.value && b.event_date < bookingDateFrom.value) return false
    if (bookingDateTo.value && b.event_date > bookingDateTo.value) return false
    if (q) {
      const haystack = `${b.package_name || ''} ${b.event_location || ''}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
  // Upcoming: soonest first. Past / Cancelled: most recent first.
  const dir = bookingView.value === 'Upcoming' ? 1 : -1
  return list.sort((a, b) =>
    dir * (`${a.event_date} ${a.event_time || ''}`).localeCompare(`${b.event_date} ${b.event_time || ''}`)
  )
})

const selectedBusiness = computed(() => businesses.value.find((b) => b.business_id === selectedBusinessId.value))
const editBusiness = computed(() => businesses.value.find((b) => b.business_id === editBusinessId.value))
const businessPackages = computed(() => packages.value.filter((p) => p.business_id === selectedBusinessId.value))
const editBusinessPackages = computed(() => packages.value.filter((p) => p.business_id === editBusinessId.value))

function selectBusiness(id) {
  packageMenuToken++
  isLoadingPackageMenu.value = false
  selectedBusinessId.value = id
  pkgSearch.value = ''
  pkgType.value = 'All'
  pkgMinPrice.value = null
  pkgMaxPrice.value = null
  pkgFavoritesOnly.value = false
  form.value.package_id = ''
  conflictWarning.value = ''
  selectedMenuItems.value = {}
  selectedPortions.value = {}
  packageMenu.value = { limits: [], itemsByCategory: {} }
  loadBusinessAddons(id)
  calendarViewDate.value = startOfMonth(new Date())
  showCalendar.value = false
  loadCalendarMonth()
  // Date picked in the "Available on" filter carries into the booking form.
  if (bizDate.value) form.value.event_date = bizDate.value
  // A date may already be filled in from before; re-check it for this business.
  if (form.value.event_date) handleDateCheck()
}

function clearBusiness() {
  packageMenuToken++
  calendarLoadToken++
  isLoadingPackageMenu.value = false
  isLoadingCalendar.value = false
  selectedBusinessId.value = ''
  form.value.package_id = ''
  conflictWarning.value = ''
  selectedMenuItems.value = {}
  selectedPortions.value = {}
  packageMenu.value = { limits: [], itemsByCategory: {} }
  addonQuantities.value = {}
  businessAddons.value = []
  takenDates.value = new Set()
  showCalendar.value = false
}

onMounted(() => {
  const storedUser = sessionStorage.getItem('user')
  if (!storedUser) {
    router.push('/')
    return
  }
  const user = JSON.parse(storedUser)
  if (user.role !== 'Client') {
    router.push('/admin/dashboard')
    return
  }
  const displayName = user.full_name || user.username || user.email || 'User'
  userName.value = displayName
  userInitial.value = displayName.charAt(0).toUpperCase()
  userAvatarUrl.value = user.avatar_url || ''
  // Clients register with a phone number, so their login email is only an
  // internal placeholder (username@gmail.com). Never save that as the booking's
  // contact email -- it is not theirs and the caterer would see a fake address.
  const internalEmail = user.username ? `${String(user.username).toLowerCase()}@gmail.com` : ''
  form.value.client_email = user.email && user.email.toLowerCase() !== internalEmail ? user.email : ''
  currentUserId = user.user_id || user.id || user.email || ''
  loadMyContactNumber()

  loadPackages()
  loadMyBookings()
  loadCatalogExtras()
  loadMyRewards()
})

// Compares freshly-fetched bookings against what was last seen (localStorage,
// per user) and surfaces anything whose status changed since then -- e.g. a
// Pending booking that just got Confirmed or Rejected.
function checkStatusChanges(freshBookings) {
  if (!currentUserId) return
  const storageKey = `caterlytics_seen_statuses_${currentUserId}`
  let previous = {}
  try {
    previous = JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    previous = {}
  }

  const hadPreviousData = Object.keys(previous).length > 0
  const changes = []
  const nextSnapshot = {}

  for (const b of freshBookings) {
    nextSnapshot[b.booking_id] = b.booking_status
    const oldStatus = previous[b.booking_id]
    if (hadPreviousData && oldStatus && oldStatus !== b.booking_status) {
      changes.push({ booking: b, from: oldStatus, to: b.booking_status })
    }
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(nextSnapshot))
  } catch {
    // localStorage unavailable -- alerts just won't persist across visits.
  }

  // Merge with alerts the client hasn't dismissed yet, so a later reload (e.g.
  // after submitting a booking) doesn't silently wipe them.
  const newIds = new Set(changes.map((c) => c.booking.booking_id))
  statusChangeAlerts.value = [
    ...statusChangeAlerts.value.filter((c) => !newIds.has(c.booking.booking_id)),
    ...changes,
  ]
}

function dismissStatusAlert(bookingId) {
  statusChangeAlerts.value = statusChangeAlerts.value.filter((c) => c.booking.booking_id !== bookingId)
}

// The number the client registered with, so the caterer can reach them from
// the booking (it used to be left empty on every booking).
let myContactNumber = ''
async function loadMyContactNumber() {
  try {
    const profile = await getMyProfile(currentUserId)
    const n = String(profile?.contact_number || '').replace(/[\s-]/g, '')
    // Same format createBooking() accepts; anything else is skipped so it can't block a booking.
    myContactNumber = /^(09\d{9}|\+639\d{9})$/.test(n) ? n : ''
  } catch (error) {
    console.error('Failed to load contact number:', error)
  }
}

async function loadPackages() {
  try {
    packages.value = await getAllPackages()
  } catch (error) {
    console.error(error)
    pageError.value = 'Failed to load catering packages. Please refresh the page.'
  }
}

// Expand/collapse the saved menu on a My Bookings card.
const expandedBookingMenus = ref(new Set())
function toggleBookingMenu(id) {
  const next = new Set(expandedBookingMenus.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedBookingMenus.value = next
}
function groupMenuPicks(picks) {
  const groups = {}
  for (const p of picks) (groups[p.category] ||= []).push(p)
  return MENU_CATEGORIES.filter((c) => groups[c]).map((c) => ({ category: c, items: groups[c] }))
    .concat(Object.keys(groups).filter((c) => !MENU_CATEGORIES.includes(c)).map((c) => ({ category: c, items: groups[c] })))
}

async function loadMyBookings() {
  isLoading.value = true
  try {
    myBookings.value = await getMyBookings()
    if (!myBookings.value.some((b) => bookingInView(b, 'Upcoming'))) {
      bookingView.value = myBookings.value.some((b) => bookingInView(b, 'Past')) ? 'Past' : myBookings.value.some((b) => bookingInView(b, 'Cancelled')) ? 'Cancelled' : 'Upcoming'
    }
    checkStatusChanges(myBookings.value)
    // Attach each booking's saved dishes + serving sizes for display.
    try {
      const picks = await getSelectionsForBookings(myBookings.value.map((b) => b.booking_id))
      myBookings.value.forEach((b) => { b.menuPicks = picks[b.booking_id] || [] })
    } catch (error) {
      console.error('Failed to load menu picks', error)
    }
    // Attach each booking's saved add-ons for display (My Bookings + receipt).
    await Promise.all(myBookings.value.map(async (b) => {
      try {
        b.addons = await getBookingAddons(b.booking_id)
      } catch (error) {
        console.error('Failed to load add-ons for booking', b.booking_id, error)
        b.addons = []
      }
    }))
    loadPaymentInfo() // best-effort, not awaited
  } catch (error) {
    pageError.value = 'Failed to load your bookings.'
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

function confirmCancel(booking) {
  bookingToCancel.value = booking
}

async function handleCancelBooking() {
  if (!bookingToCancel.value) return
  isCancelling.value = true
  try {
    await cancelMyBooking(bookingToCancel.value.booking_id)
    const cancelled = bookingToCancel.value
    const target = myBookings.value.find((b) => b.booking_id === cancelled.booking_id)
    if (target) target.booking_status = 'Cancelled'
    bookingToCancel.value = null
  } catch (error) {
    pageError.value = error.message || 'Failed to cancel booking.'
    console.error(error)
  } finally {
    isCancelling.value = false
  }
}

async function openEditModal(booking) {
  bookingToEdit.value = booking
  editConflictWarning.value = ''
  editForm.value = {
    event_date: booking.event_date,
    event_time: booking.event_time,
    event_location: booking.event_location,
    guest_count: booking.guest_count,
    package_id: booking.package_id || ''
  }
  editBusinessId.value = packages.value.find((p) => p.package_id === booking.package_id)?.business_id || ''

  // Load this package's menu setup, then prefill with whatever the client
  // already picked for this booking (so opening Edit doesn't wipe their picks).
  editSelectedMenuItems.value = {}
  editSelectedPortions.value = {}
  if (editForm.value.package_id) {
    await loadEditPackageMenu(editForm.value.package_id, { preserveSelections: true })
    try {
      const existing = await getBookingSelections(booking.booking_id)
      const byCategory = {}
      const portions = {}
      for (const row of existing) {
        if (!byCategory[row.category]) byCategory[row.category] = []
        byCategory[row.category].push(row.item_id)
        portions[row.item_id] = row.portion || 'Regular'
      }
      editSelectedMenuItems.value = byCategory
      editSelectedPortions.value = portions
    } catch (error) {
      console.error('Failed to load existing menu selections:', error)
    }
  } else {
    editPackageMenu.value = { limits: [], itemsByCategory: {} }
    editAllMenuItemsFlat.value = []
  }

  // Same idea for add-ons: load this business's catalog, then prefill
  // whichever ones (and quantities) are already saved on this booking.
  editAddonQuantities.value = {}
  if (editBusinessId.value) {
    await loadEditBusinessAddons(editBusinessId.value, { preserveSelections: true })
    try {
      const existingAddons = booking.addons || (await getBookingAddons(booking.booking_id))
      const quantities = {}
      for (const row of existingAddons) quantities[row.addon_id] = row.quantity
      editAddonQuantities.value = quantities
    } catch (error) {
      console.error('Failed to load existing add-on selections:', error)
    }
  } else {
    editBusinessAddons.value = []
  }
}

async function handleEditDateCheck() {
  editConflictWarning.value = ''
  if (!editForm.value.event_date || !bookingToEdit.value) return
  if (editForm.value.event_date === bookingToEdit.value.event_date) return
  try {
    const result = await checkDateConflict(editForm.value.event_date, editBusinessId.value || null, bookingToEdit.value.booking_id)
    if (result.conflict) {
      editConflictWarning.value = 'This date already has a booking. Please choose another date before saving.'
    }
  } catch (error) {
    console.error('Conflict check failed:', error)
  }
}

async function handleSaveEdit() {
  if (!bookingToEdit.value) return
  if (!isEditMenuComplete.value) {
    showEditMenuWarning.value = true
    await nextTick()
    document.getElementById('edit-menu-warning')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  isSaving.value = true
  pageError.value = ''
  try {
    const updated = await updateMyBooking(bookingToEdit.value.booking_id, {
      event_date: editForm.value.event_date,
      event_time: editForm.value.event_time,
      event_location: editForm.value.event_location,
      guest_count: editForm.value.guest_count,
      package_name: selectedEditPackage.value?.package_name || null,
      package_id: selectedEditPackage.value?.package_id || null,
      business_id: editBusinessId.value || null
    })

    // Always sync menu picks against whatever package is now saved on the
    // booking -- even an empty selection -- so switching packages (or to a
    // package with no menu configured) can never leave stale selections
    // from the old package sitting against this booking_id.
    const flatEditSelections = Object.values(editSelectedMenuItems.value)
      .flat()
      .map((item_id) => ({ item_id, portion: editSelectedPortions.value[item_id] || 'Regular' }))
    try {
      await setBookingSelections(updated.booking_id, flatEditSelections)
    } catch (selError) {
      console.error('Failed to save menu selections:', selError)
      pageError.value = 'Booking was updated, but we couldn\'t save your menu picks. Please edit again to try.'
    }

    // Add-ons: sync against the chosen quantities. Two safeguards so an edit
    // can never silently delete add-ons the client didn't touch:
    //  1. add-ons the business has since DEACTIVATED aren't in the (active-only)
    //     catalog shown here, so carry them over when the business is unchanged;
    //  2. if the final list equals what the booking already has, skip the save.
    const originalAddons = bookingToEdit.value.addons || []
    const originalBusinessId = packages.value.find((p) => p.package_id === bookingToEdit.value.package_id)?.business_id || ''
    const flatEditAddons = editBusinessAddons.value
      .map((a) => ({ addon_id: a.addon_id, quantity: editAddonQuantities.value[a.addon_id] || 0 }))
      .filter((a) => a.quantity > 0)
    if (editBusinessId.value && editBusinessId.value === originalBusinessId) {
      const inCatalog = new Set(editBusinessAddons.value.map((a) => a.addon_id))
      for (const row of originalAddons) {
        if (!inCatalog.has(row.addon_id) && row.quantity > 0) {
          flatEditAddons.push({ addon_id: row.addon_id, quantity: row.quantity })
        }
      }
    }
    const toKey = (list) => list.map((a) => `${a.addon_id}:${a.quantity}`).sort().join('|')
    const addonsUnchanged = toKey(flatEditAddons) === toKey(originalAddons.map((a) => ({ addon_id: a.addon_id, quantity: a.quantity })))
    if (!addonsUnchanged) {
      try {
        updated.addons = await setBookingAddons(updated.booking_id, flatEditAddons)
      } catch (addonError) {
        console.error('Failed to save add-ons:', addonError)
        pageError.value = 'Booking was updated, but we couldn\'t save your add-ons. Please edit again to try.'
      }
    } else {
      updated.addons = originalAddons
    }

    // Guests / date / package / add-ons may have changed, so re-price. Keeps the
    // booking's promo + points where they still fit (non-strict drops what doesn't).
    try {
      const q = await applyBookingPricing(updated.booking_id, {
        promoCode: bookingToEdit.value.promo_code || '',
        points: Number(bookingToEdit.value.loyalty_points_used) || 0,
        strict: false,
      })
      Object.assign(updated, pricingToBooking(q))
      if (bookingToEdit.value.promo_code && !q.promo_code) {
        pageError.value = `Promo ${bookingToEdit.value.promo_code} no longer applies to this booking and was removed.`
      }
      loadMyRewards()
    } catch (priceError) {
      console.error('Failed to re-price booking:', priceError)
    }

    const target = myBookings.value.find((b) => b.booking_id === updated.booking_id)
    if (target) {
      Object.assign(target, updated)
      // Menu picks were just re-saved above; refresh what the card shows.
      try {
        const picks = await getSelectionsForBookings([updated.booking_id])
        target.menuPicks = picks[updated.booking_id] || []
      } catch (error) {
        console.error('Failed to refresh menu picks', error)
      }
    }
    successMessage.value = 'Booking updated!'
    bookingToEdit.value = null
  } catch (error) {
    pageError.value = error.message || 'Failed to update booking.'
    console.error(error)
  } finally {
    isSaving.value = false
  }
}

async function handleDateCheck() {
  conflictWarning.value = ''
  if (!form.value.event_date) return
  try {
    const result = await checkDateConflict(form.value.event_date, selectedBusinessId.value || null)
    if (result.conflict) {
      conflictWarning.value = 'This date already has a booking. Please choose another date before submitting.'
    }
  } catch (error) {
    console.error('Conflict check failed:', error)
  }
}

async function submitBooking() {
  successMessage.value = ''
  pageError.value = ''

  // The package picker is now a card selector, not a native <select
  // required>, so the browser's built-in validation no longer catches an
  // empty pick -- enforce it here instead.
  if (!form.value.package_id) {
    pageError.value = 'Please select a catering package.'
    return
  }
  if (!isMenuComplete.value) {
    showMenuWarning.value = true
    await nextTick()
    document.getElementById('menu-warning')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  isSubmitting.value = true

  try {
    const newBooking = await createBooking({
      client_name: userName.value,
      client_email: form.value.client_email,
      client_contact_number: myContactNumber,
      event_date: form.value.event_date,
      event_time: form.value.event_time,
      event_location: form.value.event_location,
      guest_count: form.value.guest_count,
      package_name: selectedPackage.value?.package_name || null,
      package_id: form.value.package_id || null,
      business_id: selectedBusinessId.value || null
    })

    // Save the client's per-category menu picks against the new booking
    // (only relevant when this package actually has a menu configured).
    const flatSelections = Object.values(selectedMenuItems.value)
      .flat()
      .map((item_id) => ({ item_id, portion: selectedPortions.value[item_id] || 'Regular' }))
    if (flatSelections.length) {
      try {
        await setBookingSelections(newBooking.booking_id, flatSelections)
      } catch (selError) {
        console.error('Failed to save menu selections:', selError)
        pageError.value = 'Booking was submitted, but we couldn\'t save your menu picks. Please edit the booking to try again.'
      }
    }

    // Save the client's selected add-ons (quantity > 0 only) against the new booking.
    const flatAddons = businessAddons.value
      .map((a) => ({ addon_id: a.addon_id, quantity: addonQuantities.value[a.addon_id] || 0 }))
      .filter((a) => a.quantity > 0)
    if (flatAddons.length) {
      try {
        await setBookingAddons(newBooking.booking_id, flatAddons)
      } catch (addonError) {
        console.error('Failed to save add-ons:', addonError)
        pageError.value = 'Booking was submitted, but we couldn\'t save your add-ons. Please edit the booking to try again.'
      }
    }

    // Lock in the price: seasonal rule, promo code and loyalty points are
    // re-checked and applied by the server (never trusted from the browser).
    // A plain booking with no promo/points still gets its seasonal quote saved,
    // but a hiccup there must not look like a failed booking.
    const wantsDiscount = !!appliedPromo.value || (Number(pointsInput.value) || 0) > 0
    try {
      await applyBookingPricing(newBooking.booking_id, {
        promoCode: appliedPromo.value,
        points: Number(pointsInput.value) || 0,
      })
    } catch (priceError) {
      console.error('Failed to apply pricing:', priceError)
      if (wantsDiscount) {
        pageError.value = `Booking was submitted, but your discount wasn't applied: ${priceError.message}`
      }
    }

    // Snapshot for the confirmation screen BEFORE the form/pricing state is reset.
    bookingConfirmation.value = {
      business_id: selectedBusinessId.value,
      business_name: selectedBusiness.value?.business_name || 'The caterer',
      rows: [
        { label: 'Package', value: selectedPackage.value?.package_name || 'Custom Booking' },
        { label: 'Date & time', value: `${formatDate(form.value.event_date)} at ${form.value.event_time}` },
        { label: 'Location', value: form.value.event_location },
        { label: 'Guests', value: String(form.value.guest_count) },
        { label: 'Estimated total', value: bookingTotalLabel.value }
      ]
    }
    successMessage.value = ''
    resetPricingInputs()
    loadMyRewards()
    form.value = { ...form.value, event_date: '', event_time: '', event_location: '', guest_count: null, package_id: '' }
    selectedBusinessId.value = ''
    selectedMenuItems.value = {}
    selectedPortions.value = {}
    packageMenu.value = { limits: [], itemsByCategory: {} }
    addonQuantities.value = {}
    businessAddons.value = []
    takenDates.value = new Set()
    conflictWarning.value = ''
    await loadMyBookings()
    // Stay on Book Catering: the confirmation screen is shown here, with a
    // button to jump to My Bookings.
  } catch (error) {
    pageError.value = error.message || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
// ---------- Booking confirmation screen (shown right after submitting) ----------
const bookingConfirmation = ref(null)
watch(activeTab, (tab) => { if (tab !== 'Book Catering') bookingConfirmation.value = null })
const confirmationNextSteps = [
  { title: 'The caterer reviews your request', text: 'Your booking stays Pending until it is confirmed.' },
  { title: 'Watch the status', text: 'Follow it in My Bookings, or message the caterer anytime.' },
  { title: 'Pay as instructed', text: 'Once confirmed, tap "Payment instructions" on your booking card.' }
]

// Same total the buy box shows (with service fee/tax when the platform has them).
const bookingTotalLabel = computed(() => {
  if (!selectedPackage.value) return ''
  const f = feeBreakdown.value
  return (f.serviceFee > 0 || f.tax > 0) ? platformMoney(f.total) : `₱${formatPrice(estSubtotal.value)}`
})

// ---------- My Bookings: next event, progress tracker, actions menu, how to pay ----------
const openActionMenuId = ref(null)
const expandedPayHelp = ref(new Set())
const paymentInfo = ref({}) // { [business_id]: 'GCash / bank details text' }

function togglePayHelp(id) {
  const next = new Set(expandedPayHelp.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedPayHelp.value = next
}
async function loadPaymentInfo() {
  const ids = [...new Set(myBookings.value.map(bookingBusinessId).filter(Boolean))]
  if (!ids.length) return
  paymentInfo.value = await getBusinessPaymentInstructions(ids)
}
function needsPayment(b) {
  return ['Pending', 'Confirmed'].includes(b.booking_status) && b.tbl_payments?.payment_status !== 'Paid'
}

function daysUntil(dateStr) {
  const [y, m, d] = String(dateStr || '').slice(0, 10).split('-').map(Number)
  if (!y) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d) - today) / 86400000)
}
function daysUntilLabel(dateStr) {
  const n = daysUntil(dateStr)
  if (n === 0) return 'Today'
  if (n === 1) return 'Tomorrow'
  return `In ${n} days`
}
const upcomingBooking = computed(() =>
  myBookings.value
    .filter((b) => ['Pending', 'Confirmed'].includes(b.booking_status) && (daysUntil(b.event_date) ?? -1) >= 0)
    .sort((a, b) => daysUntil(a.event_date) - daysUntil(b.event_date))[0] || null
)

function formatDay(dateStr) {
  if (!dateStr) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(dateStr)
  return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}
// '17:42:00' -> '5:42 PM'
function formatTime(t) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t || ''))
  if (!m) return t || '—'
  const h = Number(m[1])
  return `${h % 12 || 12}:${m[2]} ${h >= 12 ? 'PM' : 'AM'}`
}
function balanceOf(b) {
  return Number(b.tbl_payments?.balance) || 0
}
// One plain-language line saying what's happening / what the client should do next.
function nextActionText(b) {
  if (b.booking_status === 'Pending') return 'Waiting for the caterer to confirm'
  if (b.booking_status === 'Confirmed') {
    if (b.tbl_payments?.payment_status === 'Paid') return 'Paid in full. You\'re all set'
    return balanceOf(b) > 0
      ? `Confirmed. Balance of ₱${formatPrice(balanceOf(b))}, see payment instructions`
      : 'Confirmed. See payment instructions'
  }
  if (b.booking_status === 'Completed') return 'Event completed'
  return ''
}
function trackerCaption(b) {
  if (b.booking_status === 'Pending') return 'Waiting for the caterer to confirm your booking.'
  if (b.booking_status === 'Confirmed') {
    if (b.tbl_payments?.payment_status === 'Paid') return 'Paid in full. Your event is all set.'
    return balanceOf(b) > 0
      ? `Confirmed. Please settle the ₱${formatPrice(balanceOf(b))} balance with the caterer.`
      : 'Confirmed. Check the payment instructions to settle your payment.'
  }
  if (b.booking_status === 'Completed') return 'Event completed. Thanks for booking with us!'
  return ''
}
function goToBooking(b) {
  bookingView.value = bookingInView(b, 'Upcoming') ? 'Upcoming' : bookingInView(b, 'Past') ? 'Past' : 'Cancelled'
  clearBookingFilters()
  highlightedBookingId.value = b.booking_id
  nextTick(() => {
    document.getElementById(`booking-${b.booking_id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => { highlightedBookingId.value = null }, 2000)
  })
}
function bookAgain(b) {
  const id = bookingBusinessId(b)
  activeTab.value = 'Book Catering'
  if (id) selectBusiness(id)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const TRACKER_LABELS = ['Submitted', 'Confirmed', 'Paid', 'Completed']
function trackerSteps(b) {
  const status = b.booking_status
  const paid = b.tbl_payments?.payment_status === 'Paid'
  const done = [true, status === 'Confirmed' || status === 'Completed', paid, status === 'Completed']
  const current = done.findIndex((d) => !d)
  return TRACKER_LABELS.map((label, i) => ({ label, state: done[i] ? 'done' : i === current ? 'current' : 'todo' }))
}
function stepDotClass(state) {
  if (state === 'done') return 'bg-emerald-600 text-white'
  if (state === 'current') return 'bg-white dark:bg-gray-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-4 ring-emerald-100 dark:ring-emerald-900/40'
  return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
}
function stepLabelClass(state) {
  return state === 'todo' ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'
}

function statusBadgeClass(status) {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'Pending': return 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'Completed': return 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    case 'Cancelled': return 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

function paymentBadgeClass(status) {
  switch (status) {
    case 'Paid': return 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'Partial': return 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'Unpaid': return 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  }
}

// Official receipt PDF, generated on-the-fly from the client's own booking +
// payment record (same approach as the Admin/Staff receipt in
// PaymentManagement.vue — no dedicated "receipts" table exists in the
// schema, see ERD Figure 5). Receipt No. is derived from the stable
// payment_id so re-downloading always yields the same number.
function downloadReceipt(booking) {
  const payment = booking.tbl_payments
  if (!payment) return

  const doc = new jsPDF()
  const receiptNo = `OR-${String(payment.payment_id).padStart(6, '0')}`
  const issuedOn = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

  doc.setFontSize(18)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('Caterlytics', 14, 18)

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100)
  doc.text('Catering-Service Management & Inventory System', 14, 24)

  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(17, 24, 39)
  doc.text('OFFICIAL RECEIPT', 196, 18, { align: 'right' })
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(100)
  doc.text(receiptNo, 196, 24, { align: 'right' })
  doc.text(`Issued: ${issuedOn}`, 196, 29, { align: 'right' })

  doc.setDrawColor(220)
  doc.line(14, 34, 196, 34)

  autoTable(doc, {
    startY: 40,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.5 },
    body: [
      ['Client Name', toTitleCase(userName.value) || '—'],
      ['Event Date', formatDate(booking.event_date)],
      ['Event Location', toTitleCase(booking.event_location) || '—'],
      ['Guest Count', booking.guest_count != null ? String(booking.guest_count) : '—'],
      ['Package', booking.package_name || '—'],
    ],
    columnStyles: { 0: { fontStyle: 'bold', textColor: [107, 114, 128], cellWidth: 45 } },
  })

  // Add-ons are itemized here for transparency (booked at the snapshot price
  // saved on the booking). The business enters payment.total_amount itself
  // when creating the payment record and is expected to already include
  // these — this table just shows the client what made up that figure.
  const addonRows = (booking.addons || []).map((a) => [
    `Add-on: ${a.addon_name} × ${a.quantity}`,
    `PHP ${Number(a.subtotal).toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 6,
    head: [['Description', 'Amount']],
    body: [
      ...addonRows,
      ['Total Package Cost', `PHP ${Number(payment.total_amount).toLocaleString()}`],
      ['Amount Paid to Date', `PHP ${Number(payment.amount_paid).toLocaleString()}`],
      ['Remaining Balance', `PHP ${Number(payment.balance).toLocaleString()}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [5, 150, 105] },
    foot: [['Payment Status', payment.payment_status]],
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
  })

  const finalY = doc.lastAutoTable.finalY + 20
  doc.setFontSize(9)
  doc.setTextColor(150)
  doc.text('This receipt was generated by the Caterlytics system and reflects the payment record on file.', 14, finalY)

  doc.save(`caterlytics-receipt-${receiptNo}.pdf`)
}

function formatPrice(value) {
  const num = Number(value) || 0
  return num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  // Plain 'YYYY-MM-DD' strings parse as UTC and can shift a day; build a local date instead.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(dateStr)
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function handleLogout() {
  // Actually end the Supabase session -- clearing sessionStorage alone left the
  // real session alive, so Back / re-typing the URL let the user straight back in.
  try {
    await logoutUser()
  } catch (error) {
    console.error('Sign out failed:', error)
  }
  resetChatUnread()
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('user')
  router.push('/')
}
</script>