<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../../composables/useAuth'

/**
 * Event Organizer Admin Dashboard
 * Displays event management and sales metrics
 */

const router = useRouter()
const { user, logout, getUserDisplayName } = useAuth()

const events = ref<any[]>([])
const stats = ref({
  myEvents: 0,
  totalParticipants: 0,
  totalSales: 0,
  ticketsRemaining: 0,
})

const isLoading = ref(true)

onMounted(async () => {
  try {
    const [eventsRes, statsRes] = await Promise.all([
      fetch('/api/v1/events?limit=5'),
      fetch('/api/v1/events/stats'),
    ])

    if (eventsRes.ok) {
      const eventsData = await eventsRes.json()
      events.value = eventsData.data.data || []
    }

    if (statsRes.ok) {
      const statsData = await statsRes.json()
      stats.value = statsData.data
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
})

const handleLogout = async () => {
  await logout()
  window.location.href = '/login'
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Kelola Event</h1>
            <p class="mt-1 text-sm text-gray-600">Selamat datang, {{ getUserDisplayName() }}</p>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div v-if="!isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Event Saya</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.myEvents }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Total Peserta</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalParticipants }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Total Penjualan</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">Rp {{ stats.totalSales.toLocaleString('id-ID') }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Tiket Tersisa</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.ticketsRemaining }}</p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mb-8">
        <button
          @click="navigateTo('/admin/events/create')"
          class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          + Buat Event Baru
        </button>
      </div>

      <!-- Events List -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
          <h2 class="text-xl font-bold text-gray-900">Event Terbaru</h2>
        </div>
        <div v-if="!isLoading && events.length > 0" class="divide-y">
          <div v-for="event in events" :key="event.event_id" class="p-6 hover:bg-gray-50 transition">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ event.title }}</h3>
                <p class="text-gray-600 text-sm mt-1">{{ event.location }}</p>
                <p class="text-gray-600 text-sm mt-2">{{ event.description }}</p>
                <div class="flex items-center gap-4 mt-3">
                  <span :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    event.status === 'publish' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ event.status === 'publish' ? 'Dipublikasikan' : 'Draft' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="navigateTo(`/admin/events/${event.event_id}/edit`)"
                  class="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                >
                  Edit
                </button>
                <button
                  @click="navigateTo(`/admin/events/${event.event_id}/tickets`)"
                  class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition"
                >
                  Tiket
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!isLoading" class="p-6 text-center">
          <p class="text-gray-500">Belum ada event. Buat event baru untuk memulai!</p>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          to="/admin/reports"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <h3 class="font-semibold text-gray-900 mb-2">Laporan Penjualan</h3>
          <p class="text-sm text-gray-600">Lihat detail penjualan dan transaksi</p>
        </router-link>
        <router-link
          to="/admin/events"
          class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
        >
          <h3 class="font-semibold text-gray-900 mb-2">Semua Event</h3>
          <p class="text-sm text-gray-600">Kelola semua event Anda</p>
        </router-link>
      </div>
    </main>
  </div>
</template>
