<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="container mx-auto max-w-2xl px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          🎨 AI壁纸/头像生成器
        </h1>
        <p class="text-gray-500 mt-2">
          输入灵感，AI为你创作
        </p>
      </header>

      <!-- 模式选择 -->
      <ModeSelector />

      <!-- 提示词输入 -->
      <PromptInput />

      <!-- 风格标签 -->
      <StyleTags />

      <!-- 生成按钮 -->
      <GenerateButton />

      <!-- 结果展示 -->
      <ResultDisplay />

      <!-- 历史记录 -->
      <HistoryGallery />

      <footer class="text-center text-gray-400 text-sm mt-8">
        图片由AI生成，仅供个人使用参考
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModeSelector from './components/ModeSelector.vue'
import PromptInput from './components/PromptInput.vue'
import StyleTags from './components/StyleTags.vue'
import GenerateButton from './components/GenerateButton.vue'
import ResultDisplay from './components/ResultDisplay.vue'
import HistoryGallery from './components/HistoryGallery.vue'
</script>
