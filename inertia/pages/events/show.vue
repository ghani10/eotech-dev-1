<script setup lang="ts">
// event is passed directly from server via Inertia — no fetch needed
defineProps<{
  event: {
    title: string
    banner: string
    location: string
    description: string
    organizer_contact: string
  }
}>()
</script>

<template>
  <section class="container mx-auto py-12">
    <img :src="event.banner" class="w-full h-[400px] object-cover rounded-xl mb-6" />
    <h1 class="text-4xl font-bold mb-4">{{ event.title }}</h1>
    <p class="text-gray-500 mb-4">📍 {{ event.location }}</p>
    <p class="text-gray-700">{{ event.description }}</p>
    <a
      :href="`https://wa.me/${event.organizer_contact.replace(/[^0-9]/g, '')}`"
      target="_blank"
      class="inline-block mt-6 px-6 py-3 bg-black text-white rounded-xl"
    >
      Hubungi Organizer
    </a>
  </section>
</template>