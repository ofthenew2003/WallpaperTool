import { computed } from 'vue'
import type { PetVideoRequest, PetVideoResult, SceneClip } from '@/types'
import { usePetVideoStore } from '@/stores/petVideo'
import { generateScenePrompts, generateSceneImage, imageToVideo, stitchVideos } from '@/api/video'
import { downloadVideo, generateVideoFilename } from '@/utils/videoHelpers'

export const usePetVideo = () => {
  const store = usePetVideoStore()

  const generate = async (request: PetVideoRequest): Promise<PetVideoResult> => {
    store.reset()
    store.setStage('uploading')
    store.setProgress(5)

    // 1. 生成分镜提示词
    store.setStage('prompts')
    store.setProgress(15)
    store.setStageMessage('AI 正在构思分镜…')

    const scenePrompts = await generateScenePrompts(
      request.productName,
      request.sellingPoints,
      request.style
    )
    store.setProgress(25)

    // 2. 为每个分镜生成场景图
    store.setStage('images')
    const sceneClips: SceneClip[] = []
    const sceneImageList: string[] = []

    for (let i = 0; i < scenePrompts.length; i++) {
      store.setStageMessage(`AI 正在绘制第 ${i + 1} 张场景…`)
      store.setProgress(30 + (i / scenePrompts.length) * 30)

      const sceneImage = await generateSceneImage(scenePrompts[i])
      const imageData = sceneImage.imageBase64 || sceneImage.imageUrl
      console.log(`[petVideo] 场景 ${i + 1} 图:`, imageData.substring(0, 80) + '...')
      sceneImageList.push(imageData)
      store.addSceneImage(imageData)  // 实时更新 UI 分镜预览

      // I2V（有 API key 则真实生成，无则返回空，降级幻灯片）
      store.setStage('videos')
      store.setStageMessage(`AI 正在生成第 ${i + 1} 段视频…`)
      store.setProgress(60 + (i / scenePrompts.length) * 30)

      const clip = await imageToVideo(imageData, scenePrompts[i], 5)
      console.log(`[petVideo] 镜头 ${i + 1} 视频:`, clip.videoUrl || '(幻灯片降级)')
      sceneClips.push({ ...clip, index: i })
      store.addSceneClip(sceneClips[i])
    }

    // 4. 合成最终视频（真实视频拼接 or 幻灯片降级）
    store.setStage('stitching')
    store.setProgress(95)
    store.setStageMessage('正在合成最终视频…')

    const clipUrls = sceneClips.map((c) => c.videoUrl).filter(Boolean)
    console.log(`[petVideo] 视频片段: ${clipUrls.length}/3, 场景图: ${sceneImageList.length}`)
    const videoBlob = await stitchVideos(clipUrls, sceneImageList)
    console.log(`[petVideo] 合成完成, 大小: ${(videoBlob.size / 1024).toFixed(1)} KB`)

    // 5. 完成
    store.setStage('done')
    store.setProgress(100)
    store.setStageMessage('生成完成！')

    const result: PetVideoResult = {
      id: `pv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      petImage: request.petImageBase64,
      productImage: request.productImageBase64,
      productName: request.productName,
      videoUrl: '',
      videoBlob,
      scenes: sceneClips,
      timestamp: Date.now(),
    }
    store.setResult(result)
    return result
  }

  const doDownload = () => {
    if (!store.result?.videoBlob) return
    downloadVideo(store.result.videoBlob, generateVideoFilename())
  }

  return {
    // raw store for v-model two-way binding on state fields
    store,

    // readonly computed for template display
    stage: computed(() => store.stage),
    progress: computed(() => store.progress),
    error: computed(() => store.error),
    stageMessage: computed(() => store.stageMessage),
    scenes: computed(() => store.scenes),
    result: computed(() => store.result),
    canGenerate: computed(() => store.canGenerate),

    // actions
    setStyle: store.setStyle,
    resetAll: store.resetAll,

    generate,
    downloadVideo: doDownload,
  }
}
