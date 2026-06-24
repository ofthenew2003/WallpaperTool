<template>
  <div
    v-if="result"
    class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
  >
    <h3 class="text-gray-700 font-semibold mb-4">🎥 生成结果</h3>

    <!-- 视频播放器 -->
    <div class="rounded-xl overflow-hidden bg-black mb-4">
      <video
        ref="videoEl"
        :src="videoSrc"
        controls
        class="w-full max-h-96"
        autoplay
        loop
      />
    </div>

    <!-- 动作按钮 -->
    <div class="flex gap-3">
      <button
        class="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition shadow-md flex items-center justify-center gap-2"
        @click="$emit('download')"
      >
        <span>⬇️</span> 下载视频
      </button>
      <button
        class="px-4 py-3 rounded-xl font-medium text-gray-600 bg-white/80 border border-gray-200 hover:bg-gray-50 transition flex items-center gap-2"
        @click="$emit('regenerate')"
      >
        <span>🔄</span> 重新生成
      </button>
    </div>

    <p class="text-xs text-gray-400 text-center mt-3">
      视频由 AI 生成，仅供个人使用参考
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PetVideoResult } from '@/types'

const props = defineProps<{
  result: PetVideoResult | null
}>()

defineEmits<{
  download: []
  regenerate: []
}>()

const videoSrc = computed(() => {
  if (!props.result?.videoBlob) return ''
  return URL.createObjectURL(props.result.videoBlob)
})
</script>
