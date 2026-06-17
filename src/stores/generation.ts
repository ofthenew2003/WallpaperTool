import { defineStore } from 'pinia'
import type { GenerationMode, GenerationResult } from '@/types'

export const useGenerationStore = defineStore('generation', {
  state: () => ({
    mode: 'wallpaper' as GenerationMode,
    prompt: '',
    selectedStyle: null as string | null,
    isLoading: false,
    progress: 0,
    error: null as string | null,
    currentResult: null as GenerationResult | null,
  }),

  getters: {
    hasResult: (state) => state.currentResult !== null,

    fullPrompt: (state) => {
      if (state.selectedStyle && state.prompt) {
        return `${state.prompt}, ${state.selectedStyle}风格`
      }
      return state.prompt
    },
  },

  actions: {
    setMode(mode: GenerationMode) {
      this.mode = mode
    },

    setPrompt(prompt: string) {
      this.prompt = prompt
    },

    setStyle(style: string | null) {
      this.selectedStyle = style
    },

    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    setProgress(progress: number) {
      this.progress = progress
    },

    setError(error: string | null) {
      this.error = error
    },

    setResult(result: GenerationResult | null) {
      this.currentResult = result
    },

    reset() {
      this.prompt = ''
      this.selectedStyle = null
      this.isLoading = false
      this.progress = 0
      this.error = null
      this.currentResult = null
    },
  },
})
