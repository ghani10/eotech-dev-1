<template>
  <section class="px-6 md:px-20 py-12 text-left bg-gray-50/50">
    <p class="text-[10px] font-bold text-eotech uppercase tracking-[0.2em] mb-2">Event</p>
    <h2 class="text-3xl font-bold mb-10 text-gray-900 tracking-tight">Event Terbaru</h2>

    <div v-if="loading && events.length === 0" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D4433]"></div>
    </div>

    <div v-else-if="events.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="event in events"
        :key="event.event_id"
        class="group bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg transition-all text-left"
      >
        <div class="relative rounded-[24px] overflow-hidden aspect-[1/1] mb-5 bg-gray-100">
          <!-- ✅ Lazy loading image dengan IntersectionObserver -->
          <img
            :data-src="event.banner || '../images/placeholder.jpeg'"
            src="../images/placeholder.jpeg"
            alt=""
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 lazy-img"
          />
          <span
            class="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-eotech"
          >TERBARU</span>
        </div>
        <h3 class="font-bold text-lg mb-1.5 text-gray-950 tracking-tight leading-snug">{{ event.title }}</h3>
        <p class="text-gray-400 text-xs mb-5 flex items-center gap-1.5">
          <span class="w-3 h-3 bg-gray-300 rounded-full"></span> {{ event.location }}
        </p>
        <div class="flex justify-between items-center pt-5 border-t border-gray-100">
          <span class="font-extrabold text-lg tracking-tight text-eotech">IDR 0++</span>
          <SlugButton :slug="event.slug"/>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Tidak ada event tersedia saat ini.</p>
    </div>

    <!-- Pagination -->
    <!-- ✅ ref="paginationRef" untuk scroll anchor -->
    <div
      v-if="pagination && pagination.lastPage > 1"
      ref="paginationRef"
      class="flex flex-col items-center gap-2.5 mt-12"
    >
      <p class="text-xs text-gray-400">
        Menampilkan {{ pageStart }}–{{ pageEnd }} dari {{ pagination.total }} event
      </p>

      <div class="flex items-center gap-1.5 flex-wrap justify-center">

        <!-- Prev -->
        <button
          :disabled="pagination.currentPage <= 1 || loading"
          @click="goToPage(pagination.currentPage - 1)"
          class="flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-500
                 hover:border-eotech hover:text-eotech hover:bg-eotech/5
                 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
        >
          <span>‹</span><span>Prev</span>
        </button>

        <!-- Page numbers + dots -->
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            :disabled="loading"
            @click="goToPage(page as number)"
            :class="[
              'h-9 min-w-[36px] px-2.5 text-sm rounded-xl border-[1.5px] transition-all',
              page === pagination.currentPage
                ? 'bg-eotech text-white border-eotech font-medium'
                : 'bg-white text-gray-600 border-gray-200 hover:border-eotech hover:text-eotech hover:bg-eotech/5',
              loading ? 'opacity-50 cursor-not-allowed' : ''
            ]"
          >
            <!-- ✅ Spinner kecil di tombol aktif saat loading -->
            <span v-if="page === pagination.currentPage && loading">
              <svg class="animate-spin h-3.5 w-3.5 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            </span>
            <span v-else>{{ page }}</span>
          </button>
          <span v-else class="h-9 min-w-[28px] flex items-center justify-center text-gray-400 text-sm">···</span>
        </template>

        <!-- Next -->
        <button
          :disabled="pagination.currentPage >= pagination.lastPage || loading"
          @click="goToPage(pagination.currentPage + 1)"
          class="flex items-center gap-1 h-9 px-3 text-sm font-medium rounded-xl border-[1.5px] border-gray-200 bg-white text-gray-500
                 hover:border-eotech hover:text-eotech hover:bg-eotech/5
                 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
        >
          <span>Next</span><span>›</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import SlugButton from './slugButton.vue'

interface Event {
  event_id: string
  title: string
  description: string
  location: string
  banner?: string
  slug: string
  status: string
  registration_start_at: string
  registration_end_at: string
  created_at: string
  updated_at: string
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
  firstPageUrl: string
  lastPageUrl: string
  nextPageUrl?: string | null
  previousPageUrl?: string | null
}

interface ApiResponse {
  message_id: string
  message: string
  data: {
    meta: PaginationMeta
    data_events: Event[]
  }
}

const events = ref<Event[]>([])
const pagination = ref<PaginationMeta | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// ✅ Ref untuk elemen pagination (dipakai sebagai scroll anchor)
const paginationRef = ref<HTMLElement | null>(null)

// ✅ Observer untuk lazy loading gambar
let imageObserver: IntersectionObserver | null = null

const setupImageObserver = () => {
  // Cleanup observer lama jika ada
  if (imageObserver) {
    imageObserver.disconnect()
  }

  imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          const src = img.dataset.src
          if (src) {
            img.src = src
            img.removeAttribute('data-src')
            // Tambah class fade-in saat gambar load
            img.onload = () => img.classList.add('loaded')
          }
          imageObserver?.unobserve(img)
        }
      })
    },
    {
      rootMargin: '100px', // mulai load 100px sebelum masuk viewport
      threshold: 0.01
    }
  )

  // Observe semua gambar lazy setelah DOM update
  nextTick(() => {
    document.querySelectorAll('img.lazy-img[data-src]').forEach((img) => {
      imageObserver?.observe(img)
    })
  })
}

const fetchEvents = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    const response = await fetch(`/events?page=${page}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result: ApiResponse = await response.json()
    events.value = result.data.data_events
    pagination.value = result.data.meta

    // ✅ Setup lazy loading setelah data baru masuk
    await nextTick()
    setupImageObserver()

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch events'
    console.error('Error fetching events:', err)
  } finally {
    loading.value = false
  }
}

const goToPage = (page: number) => {
  if (!pagination.value) return
  if (page < 1 || page > pagination.value.lastPage) return

  // ✅ Scroll ke bagian atas pagination, bukan ke top halaman
  nextTick(() => {
    paginationRef.value?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest' // tidak scroll jika sudah terlihat
    })
  })

  fetchEvents(page)
}

const visiblePages = computed((): (number | string)[] => {
  if (!pagination.value) return []
  const { currentPage: cur, lastPage: last } = pagination.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  if (cur <= 4)        return [1, 2, 3, 4, 5, '...', last]
  if (cur >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last]
  return [1, '...', cur - 1, cur, cur + 1, '...', last]
})

const pageStart = computed(() =>
  pagination.value ? (pagination.value.currentPage - 1) * pagination.value.perPage + 1 : 0
)

const pageEnd = computed(() =>
  pagination.value
    ? Math.min(pagination.value.currentPage * pagination.value.perPage, pagination.value.total)
    : 0
)

onMounted(() => {
  fetchEvents()
})

// ✅ Cleanup observer saat komponen di-unmount
onUnmounted(() => {
  imageObserver?.disconnect()
})
</script>

<style scoped>
/* Fade-in saat gambar lazy berhasil load */
.lazy-img {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.lazy-img.loaded {
  opacity: 1;
}
</style>