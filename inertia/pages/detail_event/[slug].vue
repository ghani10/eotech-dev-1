<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// state
const event = ref(null)
const loading = ref(true)
const error = ref(null)

// config
const apiPrefix = 'api/v1'

// ambil slug dari URL (Ziggy)
const slug = route().params.slug

const fetchEvent = async () => {
  if (!slug) {
    error.value = 'Event not found'
    loading.value = false
    return
  }

  try {
    const res = await axios.get(`/events/${slug}`)
    event.value = res.data
  } catch (err) {
    error.value = 'Failed to fetch event'
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvent)
</script>

<template>
  <section class="min-h-screen bg-gray-50">

    <!-- LOADING -->
    <div v-if="loading" class="container mx-auto py-12 animate-pulse">
      <div class="h-64 bg-gray-300 rounded-xl mb-6"></div>
      <div class="h-8 bg-gray-300 w-1/2 mb-4"></div>
      <div class="h-4 bg-gray-300 w-1/3 mb-2"></div>
      <div class="h-4 bg-gray-300 w-1/4"></div>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="container mx-auto py-12 text-center">
      <h1 class="text-2xl font-bold text-red-500">{{ error }}</h1>
    </div>

    <!-- CONTENT -->
    <div v-else-if="event" class="container mx-auto py-12">

      <!-- Banner -->
      <img
        :src="event.banner"
        class="w-full h-[400px] object-cover rounded-2xl mb-8 shadow"
      />

      <!-- Title -->
      <h1 class="text-4xl font-bold mb-4">
        {{ event.title }}
      </h1>

      <!-- Meta Info -->
      <div class="text-gray-500 mb-6 space-y-1">
        <p>📍 {{ event.location }}</p>
        <p>📅 {{ formatDate(event.registration_start_at) }} - {{ formatDate(event.registration_end_at) }}</p>
      </div>

      <!-- Description -->
      <div class="prose max-w-none text-gray-700">
        <p>{{ event.description }}</p>
      </div>

      <!-- CTA SECTION -->
      <div class="mt-10 p-6 bg-black text-white rounded-2xl text-center shadow-lg">
        <h3 class="text-xl font-semibold">Daftar Sekarang</h3>
        <p class="text-sm opacity-80 mt-1">
          Jangan sampai kehabisan slot!
        </p>

        <a
          :href="`https://wa.me/${formatPhone(event.organizer_contact)}`"
          target="_blank"
          class="inline-block mt-4 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          Hubungi Organizer
        </a>
      </div>

    </div>

  </section>
</template>

<script>
// helper function (boleh dipindah ke utils)
function formatDate(date) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function formatPhone(phone) {
  return phone.replace(/[^0-9]/g, '')
}
</script>