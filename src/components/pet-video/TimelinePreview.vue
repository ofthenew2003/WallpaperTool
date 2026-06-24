<template>
  <div v-if="sceneImages.length > 0" class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
    <h3 class="text-gray-700 font-semibold mb-4">📋 分镜时间线</h3>
    <div class="flex gap-4 overflow-x-auto pb-2">
      <div
        v-for="(img, idx) in sceneImages"
        :key="idx"
        class="flex-shrink-0 w-40 rounded-xl overflow-hidden border-2 transition-all"
        :class="[
          scenes[idx]?.videoUrl
            ? 'border-green-300'
            : 'border-gray-200',
        ]"
      >
        <!-- 场景图预览 -->
        <div class="h-24 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            v-if="img"
            :src="img"
            :alt="'场景 ' + (idx + 1)"
            class="w-full h-full object-cover"
          />
          <LoadingSpinner v-else />
        </div>
        <div class="p-2 text-center bg-white/80">
          <p class="text-xs text-gray-500">镜头 {{ idx + 1 }}</p>
          <p class="text-xs" :class="scenes[idx]?.videoUrl ? 'text-green-500' : 'text-gray-400'">
            {{ scenes[idx]?.videoUrl ? '视频 ✓' : '生成中…' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SceneClip } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

defineProps<{
  sceneImages: string[]
  scenes: SceneClip[]
}>()
</script>
