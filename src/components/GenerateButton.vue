<template>
  <button
    @click="handleGenerate"
    :disabled="isLoading || !prompt"
    class="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200 mb-6"
    :class="[
      !isLoading && prompt
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    ]"
  >
    <span v-if="isLoading" class="flex items-center justify-center gap-2">
      <LoadingSpinner />
      {{ loadingText }}
    </span>
    <span v-else>✨ 生成图片</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGeneration } from '@/composables/useGeneration'
import { useGenerationStore } from '@/stores/generation'
import LoadingSpinner from './common/LoadingSpinner.vue'

const store = useGenerationStore()
const { generate, isLoading, progress } = useGeneration()

const prompt = computed(() => store.prompt)
const mode = computed(() => store.mode)
const selectedStyle = computed(() => store.selectedStyle)

const loadingText = computed(() => {
  if (progress.value < 30) return 'AI正在构思...'
  if (progress.value < 60) return 'AI正在绘制...'
  if (progress.value < 90) return 'AI正在完善细节...'
  return '即将完成...'
})

const handleGenerate = async () => {
  if (!prompt.value || isLoading.value) return
  try {
    await generate({
      prompt: prompt.value,
      mode: mode.value,
      style: selectedStyle.value || undefined,
    })
  } catch (error) {
    console.error('生成失败:', error)
  }
}
</script>
