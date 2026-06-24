// 生成模式
export type GenerationMode = 'wallpaper' | 'avatar'

// 图片生成请求
export interface GenerationRequest {
  prompt: string
  mode: GenerationMode
  style?: string
  seed?: number
  steps?: number
  guidanceScale?: number
}

// 图片生成结果
export interface GenerationResult {
  id: string
  prompt: string
  mode: GenerationMode
  imageUrl: string
  imageBase64?: string
  timestamp: number
  style?: string
  isFavorite?: boolean
}

// 会话历史
export interface SessionHistory {
  sessionId: string
  results: GenerationResult[]
  lastMode: GenerationMode
  createdAt: number
  updatedAt: number
}

// 硅基流动API请求参数
export interface SiliconFlowImageRequest {
  model: string
  prompt: string
  negative_prompt?: string
  width: number
  height: number
  num_images?: number
  steps?: number
  guidance_scale?: number
  seed?: number
}

// 硅基流动API响应
export interface SiliconFlowImageResponse {
  id: string
  model: string
  data: Array<{
    url: string
    b64_json?: string
  }>
  usage?: {
    total_tokens: number
  }
}

// ==================== 宠物带货视频 ====================

export type VideoStyle = 'cute' | 'cool' | 'natural' | 'funny' | 'luxury'

export type VideoStage =
  | 'idle'
  | 'uploading'
  | 'prompts'
  | 'images'
  | 'videos'
  | 'stitching'
  | 'done'

export interface ScenePrompt {
  index: number
  prompt: string
}

export interface SceneImage {
  index: number
  prompt: string
  imageUrl: string
  imageBase64?: string
}

export interface SceneClip {
  index: number
  videoUrl: string
  videoBlob?: Blob
}

export interface PetVideoRequest {
  petImageBase64: string
  productImageBase64: string
  productName: string
  sellingPoints: string
  style: VideoStyle
}

export interface PetVideoResult {
  id: string
  petImage: string
  productImage: string
  productName: string
  videoUrl: string
  videoBlob?: Blob
  scenes: SceneClip[]
  timestamp: number
}
