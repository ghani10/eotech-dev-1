<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

/**
 * Participant Dashboard
 * Shows tickets, orders, and events for participants
 */

const router = useRouter()
const { user, logout, getUserDisplayName } = useAuth()

const tickets = ref<any[]>([])
const orders = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [ticketsRes, ordersRes] = await Promise.all([
      fetch('/api/v1/participant/tickets'),
      fetch('/api/v1/participant/orders'),
    ])

    if (ticketsRes.ok) {
      const ticketsData = await ticketsRes.json()
      tickets.value = ticketsData.data || []
    }

    if (ordersRes.ok) {
      const ordersData = await ordersRes.json()
      orders.value = ordersData.data || []
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

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    valid: 'bg-green-100 text-green-800',
    used: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard Peserta</h1>
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

    <!-- Navigation -->
    <div class="bg-white border-b sticky top-16 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex gap-4">
          <router-link
            to="/participant/dashboard"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="px-4 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent transition"
          >
            Dashboard
          </router-link>
          <router-link
            to="/participant/events"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="px-4 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent transition"
          >
            Jelajahi Event
          </router-link>
          <router-link
            to="/participant/tickets"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="px-4 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent transition"
          >
            Tiket Saya
          </router-link>
          <router-link
            to="/participant/orders"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="px-4 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent transition"
          >
            Pesanan
          </router-link>
          <router-link
            to="/participant/profile"
            active-class="border-b-2 border-indigo-600 text-indigo-600"
            class="px-4 py-3 text-gray-600 hover:text-gray-900 border-b-2 border-transparent transition"
          >
            Profil
          </router-link>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Tiket Aktif</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ tickets.filter(t => t.status === 'valid').length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Pesanan Saya</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">{{ orders.length }}</p>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <p class="text-gray-600 text-sm font-medium">Total Pengeluaran</p>
          <p class="text-3xl font-bold text-gray-900 mt-2">
            Rp {{ orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString('id-ID') }}
          </p>
        </div>
      </div>

      <!-- Tickets Section -->
      <div class="mb-8">
        <div class="bg-white rounded-lg shadow">
          <div class="px-6 py-4 border-b">
            <h2 class="text-xl font-bold text-gray-900">Tiket Saya</h2>
          </div>
          <div v-if="!isLoading && tickets.length > 0" class="divide-y">
            <div v-for="ticket in tickets.slice(0, 3)" :key="ticket.ticket_id" class="p-6 hover:bg-gray-50">
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h3 class="font-semibold text-gray-900">{{ ticket.event_title }}</h3>
                  <p class="text-sm text-gray-600 mt-1">
                    Nomor Tiket: <span class="font-mono">{{ ticket.ticket_id }}</span>
                  </p>
                  <p class="text-sm text-gray-600 mt-1">Tipe: {{ ticket.ticket_type }}</p>
                </div>
                <span :class="['px-4 py-2 rounded-full text-sm font-medium', getStatusBadgeClass(ticket.status)]">
                  {{ ticket.status }}
                </span>
              </div>
            </div>
          </div>
          <div v-else-if="!isLoading" class="p-6 text-center">
            <p class="text-gray-500">Belum ada tiket. Jelajahi event untuk membeli tiket!</p>
            <router-link
              to="/participant/events"
              class="mt-3 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              Jelajahi Event
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b">
          <h2 class="text-xl font-bold text-gray-900">Pesanan Terbaru</h2>
        </div>
        <div v-if="!isLoading && orders.length > 0" class="divide-y">
          <div v-for="order in orders.slice(0, 3)" :key="order.order_id" class="p-6 hover:bg-gray-50">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900">{{ order.event_title }}</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Order ID: <span class="font-mono">{{ order.order_id }}</span>
                </p>
                <p class="text-sm text-gray-600 mt-1">
                  {{ order.ticket_count }} tiket × Rp {{ order.price.toLocaleString('id-ID') }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">Rp {{ order.total.toLocaleString('id-ID') }}</p>
                <p :class="[
                  'text-sm mt-1 font-medium',
                  order.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                ]">
                  {{ order.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran' }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!isLoading" class="p-6 text-center text-gray-500">
          Tidak ada pesanan
        </div>
      </div>
    </main>
  </div>
</template>
