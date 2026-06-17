<template>
  <div v-if="sortedResults.length" class="mt-8">
    <h2 class="text-lg font-semibold text-gray-700 mb-3">生图记录</h2>
    <div class="flex gap-3 overflow-x-auto pb-2">
      <div
        v-for="result in sortedResults"
        :key="result.id"
        @click="selectResult(result.id)"
        class="flex-shrink-0 cursor-pointer rounded-xl overflow-hidden border-2 transition-all"
        :class="[
          currentResult?.id === result.id
            ? 'border-blue-500 shadow-md'
            : 'border-transparent hover:border-gray-300'
        ]"
      >
        <img
          v-if="result.imageUrl || result.imageBase64"
          :src="result.imageBase64 || result.imageUrl"
          :alt="result.prompt"
          class="w-20 h-20 object-cover"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHistoryStore } from '@/stores/history'
import { useGenerationStore } from '@/stores/generation'

const historyStore = useHistoryStore()
const generationStore = useGenerationStore()

const sortedResults = computed(() => historyStore.sortedResults)
const currentResult = computed(() => generationStore.currentResult)

const selectResult = (id: string) => {
  const result = historyStore.results.find(r => r.id === id)
  if (result) {
    generationStore.setResult(result)
  }
}
</script>
