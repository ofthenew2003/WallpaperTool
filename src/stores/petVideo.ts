import { defineStore } from 'pinia'
import type { PetVideoResult, SceneClip, VideoStyle, VideoStage } from '@/types'

export const usePetVideoStore = defineStore('petVideo', {
  state: () => ({
    petImage: '' as string,
    productImage: '' as string,
    productName: '' as string,
    sellingPoints: '' as string,
    style: 'cute' as VideoStyle,

    stage: 'idle' as VideoStage,
    progress: 0,
    error: null as string | null,
    stageMessage: '' as string,

    sceneImages: [] as string[],   // 分镜场景图 base64，供 TimelinePreview 展示
    scenes: [] as SceneClip[],     // 分镜视频片段
    result: null as PetVideoResult | null,
  }),

  getters: {
    canGenerate: (state) =>
      state.petImage !== '' &&
      state.productImage !== '' &&
      state.productName.trim() !== '',
  },

  actions: {
    setPetImage(img: string) { this.petImage = img },
    setProductImage(img: string) { this.productImage = img },
    setProductName(name: string) { this.productName = name },
    setSellingPoints(points: string) { this.sellingPoints = points },
    setStyle(style: VideoStyle) { this.style = style },

    setStage(stage: VideoStage) { this.stage = stage },
    setProgress(pct: number) { this.progress = pct },
    setError(msg: string | null) { this.error = msg },
    setStageMessage(msg: string) { this.stageMessage = msg },

    addSceneImage(b64: string) { this.sceneImages.push(b64) },

    addSceneClip(clip: SceneClip) {
      const idx = this.scenes.findIndex((s) => s.index === clip.index)
      if (idx >= 0) this.scenes[idx] = clip
      else this.scenes.push(clip)
    },

    setResult(result: PetVideoResult | null) { this.result = result },

    reset() {
      this.stage = 'idle'
      this.progress = 0
      this.error = null
      this.stageMessage = ''
      this.sceneImages = []
      this.scenes = []
      this.result = null
    },

    resetAll() {
      this.petImage = ''
      this.productImage = ''
      this.productName = ''
      this.sellingPoints = ''
      this.style = 'cute'
      this.reset()
    },
  },
})
