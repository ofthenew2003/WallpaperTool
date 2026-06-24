<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="container mx-auto max-w-2xl px-4 py-8">
      <div class="mb-4">
        <a
          href="#/"
          target="_blank"
          class="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm"
        >
          <span class="mr-1">←</span> 返回工具集
        </a>
      </div>

      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          🐾 AI宠物带货视频
        </h1>
        <p class="text-gray-500 mt-2">
          上传宠物照片 + 产品图片，AI自动生成15秒带货短视频
        </p>
      </header>

      <!-- 图片上传区 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <ImageUploader
          v-model="store.petImage"
          label="宠物照片"
          icon="🐕"
        />
        <ImageUploader
          v-model="store.productImage"
          label="产品图片"
          icon="📦"
        />
      </div>

      <!-- 产品信息 -->
      <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
        <div class="space-y-4">
          <div>
            <label class="block text-gray-600 text-sm font-medium mb-2">产品名称</label>
            <input
              v-model="store.productName"
              type="text"
              placeholder="例如：宠物智能喂食器"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-gray-700"
            />
          </div>
          <div>
            <label class="block text-gray-600 text-sm font-medium mb-2">卖点文案</label>
            <textarea
              v-model="store.sellingPoints"
              rows="3"
              placeholder="例如：自动出粮、定时定量、新鲜锁味，毛孩子的最爱"
              class="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition text-gray-700 resize-none"
            />
          </div>
        </div>
      </div>

      <!-- 风格选择 -->
      <div class="mb-6">
        <VideoStyleTags v-model="store.style" />
      </div>

      <!-- 生成按钮 + 进度 -->
      <div class="mb-8">
        <VideoGenerateButton
          :loading="store.stage !== 'idle' && store.stage !== 'done'"
          :disabled="!canGenerate || (store.stage !== 'idle' && store.stage !== 'done')"
          :progress="store.progress"
          :stage-message="store.stageMessage"
          @generate="handleGenerate"
        />
      </div>

      <!-- 错误提示 -->
      <div
        v-if="store.error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
      >
        {{ store.error }}
      </div>

      <!-- 分镜时间线 -->
      <div class="mb-6">
        <TimelinePreview :scene-images="store.sceneImages" :scenes="store.scenes" />
      </div>

      <!-- 视频预览 + 下载 -->
      <VideoPreview
        :result="store.result"
        @download="handleDownload"
        @regenerate="handleRegenerate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageUploader from '@/components/pet-video/ImageUploader.vue'
import VideoStyleTags from '@/components/pet-video/VideoStyleTags.vue'
import VideoGenerateButton from '@/components/pet-video/VideoGenerateButton.vue'
import TimelinePreview from '@/components/pet-video/TimelinePreview.vue'
import VideoPreview from '@/components/pet-video/VideoPreview.vue'
import { usePetVideo } from '@/composables/usePetVideo'

const {
  store,
  canGenerate,
  generate,
  downloadVideo,
  resetAll,
} = usePetVideo()

const handleGenerate = async () => {
  if (!canGenerate.value) return

  try {
    await generate({
      petImageBase64: store.petImage,
      productImageBase64: store.productImage,
      productName: store.productName,
      sellingPoints: store.sellingPoints || '高品质宠物用品',
      style: store.style,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '视频生成失败，请稍后重试'
    store.setError(msg)
  }
}

const handleDownload = () => {
  downloadVideo()
}

const handleRegenerate = () => {
  resetAll()
}
</script>
