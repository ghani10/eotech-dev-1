<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { Link } from '@inertiajs/vue3'

const events = ref([])
const loading = ref(true)

const apiPrefix = import.meta.env.VITE_APP_API_URL

const fetchEvents = async () => {
  try {
    const res = await axios.get(`${apiPrefix}/events`)
    events.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchEvents)
</script>

<template>
  <section class="container mx-auto py-12">
    <h1 class="text-3xl font-bold mb-6">Events</h1>

    <div v-if="loading">Loading...</div>

    <div v-else class="grid md:grid-cols-3 gap-6">
      <div
        v-for="event in events"
        :key="event.event_id"
        class="border p-4 rounded-xl"
      >
        <img :src="event.banner" class="h-40 w-full object-cover rounded mb-3" />

        <h2 class="font-semibold">{{ event.title }}</h2>
        <p class="text-sm text-gray-500">{{ event.location }}</p>

        <Link
          :href="`/events/${event.slug}`"
          class="inline-block mt-3 text-blue-500"
        >
          Lihat Detail →
        </Link>
      </div>
    </div>
  </section>
</template>