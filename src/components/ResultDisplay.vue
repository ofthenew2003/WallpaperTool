<template>
  <div v-if="currentResult" class="mb-6">
    <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-sm">
      <img
        :src="displayImage"
        :alt="currentResult.prompt"
        class="w-full rounded-xl object-cover max-h-[60vh]"
      />
      <div class="flex gap-3 mt-4">
        <button
          @click="handleDownload"
          class="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:shadow-md transition-all"
        >
          📥 下载图片
        </button>
        <button
          @click="handleRegenerate"
          :disabled="isLoading"
          class="flex-1 py-2.5 rounded-lg bg-white/90 text-gray-700 font-medium hover:bg-white hover:shadow-md transition-all"
        >
          🔄 再次生成
        </button>
      </div>
    </div>
  </div>

  <div v-if="error" class="mb-4 p-4 bg-red-50 rounded-xl text-red-600 text-sm">
    {{ error }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGeneration } from '@/composables/useGeneration'
import { useGenerationStore } from '@/stores/generation'
import { downloadImage, generateFilename } from '@/utils/imageHelpers'

const store = useGenerationStore()
const { regenerate, isLoading } = useGeneration()

const currentResult = computed(() => store.currentResult)
const error = computed(() => store.error)

const displayImage = computed(() => {
  if (!currentResult.value) return ''
  return currentResult.value.imageBase64 || currentResult.value.imageUrl
})

const handleDownload = () => {
  if (!currentResult.value) return
  const imageData = currentResult.value.imageBase64 || currentResult.value.imageUrl
  const filename = generateFilename(currentResult.value.mode, currentResult.value.timestamp)
  downloadImage(imageData, filename)
}

const handleRegenerate = async () => {
  if (!currentResult.value) return
  try {
    await regenerate({
      prompt: currentResult.value.prompt,
      mode: currentResult.value.mode,
      style: currentResult.value.style,
    })
  } catch (error) {
    console.error('重新生成失败:', error)
  }
}
</script>
