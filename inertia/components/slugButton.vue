<script setup lang="ts">
import { Link } from '@inertiajs/vue3'

const props = defineProps<{
  slug: string
}>()
</script>

<template>
  <Link
    :href="`/events/${props.slug}`"
    class="text-[10px] font-bold text-eotech border-2 border-eotech/20 px-4 py-2 rounded-xl hover:bg-eotech hover:text-white transition-all shadow-sm"
  >
    Lihat Detail
  </Link>
</template>