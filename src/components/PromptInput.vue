<template>
  <div class="mb-4">
    <div class="relative">
      <textarea
        v-model="prompt"
        :placeholder="placeholderText"
        rows="3"
        maxlength="200"
        class="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
        @input="handleInput"
      />
      <div class="absolute bottom-2 right-3 text-xs text-gray-400">
        {{ prompt.length }}/200
      </div>
    </div>

    <div class="mt-2 flex justify-end">
      <button
        @click="fillInspiration"
        class="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
      >
        <span>🎲</span> 灵感骰子
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGenerationStore } from '@/stores/generation'
import { INSPIRATION_PROMPTS } from '@/utils/constants'
import { debounce } from 'lodash-es'

const store = useGenerationStore()
const prompt = ref(store.prompt)

const placeholderText = '描述你想要的画面，例如："一座漂浮在云端的未来城市"'

const handleInput = debounce(() => {
  store.setPrompt(prompt.value)
}, 300)

const fillInspiration = () => {
  const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length)
  prompt.value = INSPIRATION_PROMPTS[randomIndex]
  store.setPrompt(prompt.value)
}

watch(() => store.prompt, (newVal) => {
  if (newVal !== prompt.value) {
    prompt.value = newVal
  }
})
</script>
