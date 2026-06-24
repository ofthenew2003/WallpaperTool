<template>
  <button
    :disabled="disabled"
    class="w-full py-4 px-6 rounded-2xl font-semibold text-white text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      disabled
        ? 'bg-gray-400'
        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl active:scale-[0.99]',
    ]"
    @click="$emit('generate')"
  >
    <LoadingSpinner v-if="loading" />
    <span v-else>🎬</span>
    <span>{{ buttonText }}</span>
  </button>

  <!-- 进度条 -->
  <div v-if="loading" class="mt-3">
    <div class="flex justify-between text-xs text-gray-500 mb-1">
      <span>{{ stageMessage }}</span>
      <span>{{ progress }}%</span>
    </div>
    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
        :style="{ width: progress + '%' }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const props = defineProps<{
  loading: boolean
  disabled: boolean
  progress: number
  stageMessage: string
}>()

defineEmits<{ generate: [] }>()

const buttonText = computed(() => {
  if (!props.loading) return '生成视频'
  if (props.progress < 20) return 'AI 正在构思…'
  if (props.progress < 50) return 'AI 正在生成场景…'
  if (props.progress < 90) return 'AI 正在合成视频…'
  return '即将完成…'
})
</script>
