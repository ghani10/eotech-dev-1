<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'

/**
 * Super Admin Dashboard
 * Displays system-wide metrics and management options
 */

const { user, logout, getUserDisplayName } = useAuth()

const stats = ref({
  totalEvents: 0,
  totalUsers: 0,
  totalTicketsSold: 0,
  totalRevenue: 0,
})

const isLoading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/api/v1/admin/dashboard/stats')
    if (response.ok) {
      const data = await response.json()
      stats.value = data.data
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  } finally {
    isLoading.value = false
  }
})

const handleLogout = async () => {
  await logout()
  window.location.href = '/login'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
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
        <!-- Total Events -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Event</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalEvents }}</p>
            </div>
            <div class="bg-blue-100 rounded-lg p-3">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Pengguna</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalUsers }}</p>
            </div>
            <div class="bg-green-100 rounded-lg p-3">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Tickets Sold -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Tiket Terjual</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalTicketsSold }}</p>
            </div>
            <div class="bg-purple-100 rounded-lg p-3">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h6a2 2 0 012 2m0 0a2 2 0 012 2v6a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Revenue -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Pendapatan</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                Rp {{ stats.totalRevenue.toLocaleString('id-ID') }}
              </p>
            </div>
            <div class="bg-orange-100 rounded-lg p-3">
              <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Management Sections -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Aksi Cepat</h2>
          <div class="space-y-3">
            <router-link
              to="/admin/users"
              class="block w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition text-left"
            >
              <p class="font-medium text-blue-900">Kelola Pengguna</p>
              <p class="text-sm text-blue-700 mt-1">Atur peran dan izin pengguna</p>
            </router-link>

            <router-link
              to="/admin/system"
              class="block w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition text-left"
            >
              <p class="font-medium text-purple-900">Pengaturan Sistem</p>
              <p class="text-sm text-purple-700 mt-1">Konfigurasi sistem dan monitoring</p>
            </router-link>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Aktivitas Terbaru</h2>
          <div class="space-y-3">
            <div class="flex items-start gap-3 pb-3 border-b">
              <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-900">Event baru dibuat</p>
                <p class="text-xs text-gray-500 mt-1">5 menit yang lalu</p>
              </div>
            </div>
            <div class="flex items-start gap-3 pb-3 border-b">
              <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-900">Pengguna baru terdaftar</p>
                <p class="text-xs text-gray-500 mt-1">2 jam yang lalu</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
              <div>
                <p class="text-sm font-medium text-gray-900">Tiket terjual</p>
                <p class="text-xs text-gray-500 mt-1">4 jam yang lalu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
