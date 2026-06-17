<template>
  <div class="flex flex-wrap gap-2 mb-4">
    <button
      v-for="tag in STYLE_TAGS"
      :key="tag.value"
      @click="selectStyle(tag.value)"
      class="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
      :class="[
        selectedStyle === tag.value
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
          : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90'
      ]"
    >
      {{ tag.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { STYLE_TAGS } from '@/utils/constants'

const store = useGenerationStore()
const selectedStyle = computed(() => store.selectedStyle)

const selectStyle = (value: string) => {
  store.setStyle(store.selectedStyle === value ? null : value)
}
</script>
