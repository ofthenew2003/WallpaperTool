<template>
  <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
    <div
      class="relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden"
      :class="[
        isDragging
          ? 'border-blue-400 bg-blue-50/50'
          : hasImage
            ? 'border-green-300 bg-green-50/30'
            : 'border-gray-300 hover:border-blue-300 bg-gray-50/30',
      ]"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
      @click="triggerInput"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="hidden"
        @change="onFileChange"
      />

      <div v-if="hasImage" class="relative group">
        <img
          :src="modelValue"
          :alt="label"
          class="w-full h-48 object-contain rounded-xl"
        />
        <div
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
        >
          <button
            type="button"
            class="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
            @click.stop="clearImage"
          >
            重新选择
          </button>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-10 px-4">
        <div class="text-4xl mb-2">{{ icon }}</div>
        <p class="text-gray-500 text-sm font-medium">{{ label }}</p>
        <p class="text-gray-400 text-xs mt-1">拖拽或点击上传 JPG/PNG</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: string
  label: string
  icon: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const hasImage = computed(() => props.modelValue.length > 0)

const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const b64 = await toBase64(file)
  emit('update:modelValue', b64)
}

const onDrop = async (e: DragEvent) => {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  const b64 = await toBase64(file)
  emit('update:modelValue', b64)
}

const triggerInput = () => {
  fileInput.value?.click()
}

const clearImage = () => {
  emit('update:modelValue', '')
  if (fileInput.value) fileInput.value.value = ''
}
</script>
