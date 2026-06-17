import { defineStore } from 'pinia'
import type { GenerationResult } from '@/types'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    results: [] as GenerationResult[],
    maxSize: 20,
  }),

  getters: {
    sortedResults: (state) => {
      return [...state.results].sort((a, b) => b.timestamp - a.timestamp)
    },

    wallpaperCount: (state) => {
      return state.results.filter(r => r.mode === 'wallpaper').length
    },

    avatarCount: (state) => {
      return state.results.filter(r => r.mode === 'avatar').length
    },
  },

  actions: {
    addResult(result: GenerationResult) {
      this.results.unshift(result)
      if (this.results.length > this.maxSize) {
        this.results = this.results.slice(0, this.maxSize)
      }
      this.saveToStorage()
    },

    deleteResult(id: string) {
      this.results = this.results.filter(r => r.id !== id)
      this.saveToStorage()
    },

    clearHistory() {
      this.results = []
      this.saveToStorage()
    },

    saveToStorage() {
      try {
        localStorage.setItem('wallpaper_history', JSON.stringify({
          results: this.results,
          updatedAt: Date.now(),
        }))
      } catch (e) {
        console.error('保存历史记录失败:', e)
      }
    },

    loadFromStorage() {
      try {
        const data = localStorage.getItem('wallpaper_history')
        if (data) {
          const parsed = JSON.parse(data)
          this.results = parsed.results || []
        }
      } catch (e) {
        console.error('加载历史记录失败:', e)
      }
    },
  },
})
