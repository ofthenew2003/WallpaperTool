<template>
  <div class="flex gap-4 mb-6">
    <button
      v-for="option in options"
      :key="option.value"
      @click="selectMode(option.value)"
      class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200"
      :class="[
        mode === option.value
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
          : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90'
      ]"
    >
      <span class="mr-2">{{ option.icon }}</span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import type { GenerationMode } from '@/types'

const store = useGenerationStore()
const mode = computed(() => store.mode)

const options = [
  { value: 'wallpaper' as const, label: '壁纸', icon: '🖼️' },
  { value: 'avatar' as const, label: '头像', icon: '👤' },
]

const selectMode = (value: GenerationMode) => {
  store.setMode(value)
}
</script>
