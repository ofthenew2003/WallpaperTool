<template>
  <div>
    <label class="block text-gray-600 text-sm font-medium mb-3">视频风格</label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="s in styles"
        :key="s.value"
        type="button"
        class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border"
        :class="[
          modelValue === s.value
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-transparent shadow-md'
            : 'bg-white/70 border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600',
        ]"
        @click="emit('update:modelValue', s.value)"
      >
        {{ s.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VIDEO_STYLES } from '@/utils/constants'
import type { VideoStyle } from '@/types'

defineProps<{ modelValue: VideoStyle }>()
const emit = defineEmits<{ 'update:modelValue': [value: VideoStyle] }>()
const styles = [...VIDEO_STYLES]
</script>
