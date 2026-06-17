import { ref, computed } from 'vue'
import { generateImage } from '@/api/siliconflow'
import type { GenerationRequest, GenerationResult } from '@/types'
import { useGenerationStore } from '@/stores/generation'
import { useHistoryStore } from '@/stores/history'

export const useGeneration = () => {
  const store = useGenerationStore()
  const historyStore = useHistoryStore()

  const isLoading = ref(false)
  const progress = ref(0)
  const error = ref<string | null>(null)

  const getImageSize = (mode: 'wallpaper' | 'avatar'): { width: number; height: number } => {
    if (mode === 'wallpaper') {
      return { width: 1024, height: 1792 }
    }
    return { width: 1024, height: 1024 }
  }

  const generate = async (request: GenerationRequest) => {
    isLoading.value = true
    error.value = null
    progress.value = 10
    store.setLoading(true)

    try {
      const fullPrompt = request.style
        ? `${request.prompt}, ${request.style}风格`
        : request.prompt

      progress.value = 30

      const size = getImageSize(request.mode)

      const apiRequest = {
        model: import.meta.env.VITE_SILICONFLOW_MODEL || 'Kwai-Kolors/Kolors',
        prompt: fullPrompt,
        width: size.width,
        height: size.height,
        steps: request.steps || 25,
        guidance_scale: request.guidanceScale || 5,
        seed: request.seed || Math.floor(Math.random() * 1000000),
        num_images: 1,
      }

      progress.value = 50

      const response = await generateImage(apiRequest)

      progress.value = 80

      const imageData = response.data[0]
      const resultData: GenerationResult = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        prompt: fullPrompt,
        mode: request.mode,
        imageUrl: imageData.url || '',
        imageBase64: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : '',
        timestamp: Date.now(),
        style: request.style,
      }

      store.setResult(resultData)
      historyStore.addResult(resultData)

      progress.value = 100
      isLoading.value = false
      store.setLoading(false)

      return resultData

    } catch (err: unknown) {
      let errorMessage = '生成失败，请稍后重试'

      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr.response?.status === 429) {
          errorMessage = '生成请求过于频繁，请稍后再试'
        } else if (axiosErr.response?.status === 400) {
          errorMessage = '提示词包含违规内容，请修改后重试'
        } else if (axiosErr.response?.status && axiosErr.response.status >= 500) {
          errorMessage = '服务器繁忙，请稍后重试'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      error.value = errorMessage
      store.setError(errorMessage)
      isLoading.value = false
      store.setLoading(false)
      throw err
    }
  }

  const regenerate = async (request: GenerationRequest) => {
    error.value = null
    store.setError(null)
    return generate({
      ...request,
      seed: Math.floor(Math.random() * 1000000),
    })
  }

  const reset = () => {
    isLoading.value = false
    progress.value = 0
    error.value = null
    store.reset()
  }

  return {
    isLoading: computed(() => isLoading.value),
    progress: computed(() => progress.value),
    error: computed(() => error.value),
    currentResult: computed(() => store.currentResult),
    generate,
    regenerate,
    reset,
  }
}
