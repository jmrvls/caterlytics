<template>
  <div>
    <div class="group relative w-full aspect-[5/4] bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
      <img v-if="current" :src="current" :alt="alt" class="w-full h-full object-contain cursor-zoom-in" @click="zoom = true" />
      <span v-if="current" class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition text-xs font-semibold bg-black/70 text-white px-3 py-1.5 rounded-full whitespace-nowrap">🔍 Click to enlarge</span>
      <button v-if="current" type="button" @click="zoom = true" class="absolute top-2 right-2 text-xs font-semibold bg-black/65 hover:bg-black/85 text-white px-3 py-1.5 rounded-full" aria-label="Zoom photo">⤢ Zoom</button>
      <div v-else class="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">No image</div>

      <template v-if="images.length > 1">
        <button type="button" @click="step(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center" aria-label="Previous photo">‹</button>
        <button type="button" @click="step(1)" class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center" aria-label="Next photo">›</button>
        <span class="absolute bottom-2 right-2 text-[10px] font-semibold bg-black/50 text-white px-2 py-0.5 rounded-full">{{ index + 1 }} / {{ images.length }}</span>
      </template>
    </div>

    <div v-if="images.length > 1" class="flex gap-2 mt-3 overflow-x-auto pb-1">
      <button
        v-for="(src, i) in images"
        :key="src + i"
        type="button"
        @click="index = i"
        class="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border-2 transition"
        :class="i === index ? 'border-emerald-500' : 'border-transparent opacity-70 hover:opacity-100'"
      >
        <img :src="src" :alt="`${alt} photo ${i + 1}`" class="w-full h-full object-cover" />
      </button>
    </div>

    <!-- Fullscreen viewer: posters and menus with small text become readable -->
    <Teleport to="body">
      <div v-if="zoom" class="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" @click.self="zoom = false" @keydown.esc="zoom = false" tabindex="-1" ref="viewer">
        <button type="button" @click="zoom = false" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white text-xl" aria-label="Close">✕</button>
        <button v-if="images.length > 1" type="button" @click="step(-1)" class="absolute left-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white text-xl" aria-label="Previous photo">‹</button>
        <img :src="current" :alt="alt" class="max-w-full max-h-full object-contain" />
        <button v-if="images.length > 1" type="button" @click="step(1)" class="absolute right-3 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white text-xl" aria-label="Next photo">›</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

// images: array of URL strings. The first image is usually the package cover.
const props = defineProps({
  images: { type: Array, default: () => [] },
  alt: { type: String, default: 'Package photo' }
})

const index = ref(0)
const zoom = ref(false)
const onKey = (e) => { if (!zoom.value) return; if (e.key === 'Escape') zoom.value = false; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1) }
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
const current = computed(() => props.images[index.value] || '')
watch(() => props.images, () => { index.value = 0 })

function step(dir) {
  const n = props.images.length
  if (!n) return
  index.value = (index.value + dir + n) % n
}
</script>