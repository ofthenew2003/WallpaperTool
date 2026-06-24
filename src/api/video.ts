import { siliconflowClient, videoApiClient } from './client'
import type { SceneImage, SceneClip } from '@/types'

/**
 * 通过 SiliconFlow LLM 生成 3 组分镜提示词。
 * 若 API 不可用，回退到本地模板。
 */
export const generateScenePrompts = async (
  productName: string,
  sellingPoints: string,
  style: string
): Promise<string[]> => {
  try {
    const response = await siliconflowClient.post('/chat/completions', {
      model: import.meta.env.VITE_SILICONFLOW_CHAT_MODEL || 'Qwen/Qwen2.5-7B-Instruct',
      messages: [
        {
          role: 'system',
          content: `你是一个宠物带货视频导演。根据产品信息和视频风格，生成3个分镜提示词。每个提示词描述一个5秒镜头，用于后续AI文生图。格式: 纯文本，每行一个提示词，不要编号。`,
        },
        {
          role: 'user',
          content: `产品: ${productName}\n卖点: ${sellingPoints}\n风格: ${style}\n请生成3个分镜提示词。`,
        },
      ],
      max_tokens: 600,
      temperature: 0.8,
    })

    const text: string = response.data?.choices?.[0]?.message?.content || ''
    const lines = text
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0)
      .slice(0, 3)

    if (lines.length >= 3) return lines
    throw new Error('LLM 返回分镜不足')
  } catch (err) {
    console.warn('LLM 分镜生成失败，使用本地模板:', err)
    const { SCENE_PROMPT_TEMPLATES } = await import('@/utils/constants')
    const templates = SCENE_PROMPT_TEMPLATES[style] || SCENE_PROMPT_TEMPLATES['cute']
    return templates.map((t: string) =>
      t.replace('{pet}', '宠物').replace('{product}', productName)
    )
  }
}

/**
 * 通过 SiliconFlow 文生图生成场景图。
 */
export const generateSceneImage = async (
  prompt: string
): Promise<SceneImage> => {
  const response = await siliconflowClient.post('/images/generations', {
    model: import.meta.env.VITE_SILICONFLOW_MODEL || 'Kwai-Kolors/Kolors',
    prompt,
    negative_prompt: '模糊, 变形, 丑陋, 低质量',
    width: 1024,
    height: 1024,
    num_images: 1,
    steps: 25,
    guidance_scale: 5,
    seed: Math.floor(Math.random() * 1000000),
  })

  const data = response.data?.data?.[0]
  return {
    index: 0, // caller fills
    prompt,
    imageUrl: data?.url || '',
    imageBase64: data?.b64_json ? `data:image/png;base64,${data.b64_json}` : undefined,
  }
}

/**
 * 图转视频。
 * 若配置了 VITE_VIDEO_API_KEY，调用外部 I2V API（Kling / Runway / Minimax）。
 * 未配置时自动降级为客户端幻灯片生成。
 */
export const imageToVideo = async (
  imageBase64: string,
  _prompt: string,
  _duration: number = 5
): Promise<SceneClip> => {
  const apiKey = import.meta.env.VITE_MINIMAX_API_KEY || import.meta.env.VITE_VIDEO_API_KEY
  if (apiKey) {
    console.log('[video] Minimax API key 长度:', apiKey.length, '前缀:', apiKey.substring(0, 10))
    try {
      return await imageToVideoApi(imageBase64, _prompt, _duration)
    } catch (err) {
      console.error('[video] Minimax I2V 失败，降级幻灯片:', err)
      return { index: 0, videoUrl: '' }
    }
  }
  console.info('[video] 未配置 VITE_MINIMAX_API_KEY，I2V 降级为幻灯片模式')
  return { index: 0, videoUrl: '' }
}

/**
 * 调用 Minimax 图转视频 API。
 * 文档: https://platform.minimaxi.com/docs
 */
const imageToVideoApi = async (
  imageBase64: string,
  _prompt: string,
  _duration: number
): Promise<SceneClip> => {
  // Minimax: POST /video_generation
  console.log('[video] 调用 Minimax I2V, prompt:', _prompt.substring(0, 40) + '...')
  const response = await videoApiClient.post('/video_generation', {
    model: import.meta.env.VITE_VIDEO_MODEL || 'video-01',
    prompt: _prompt,
    first_frame_image: imageBase64,
    duration: _duration * 1000, // 秒 → 毫秒
  })
  console.log('[video] Minimax 响应:', JSON.stringify(response.data).substring(0, 200))

  const baseResp = response.data?.base_resp
  if (baseResp?.status_code !== 0) {
    throw new Error(`Minimax 创建任务失败: ${baseResp?.status_msg || '未知错误'} (code: ${baseResp?.status_code})`)
  }

  const taskId = response.data?.task_id
  if (!taskId) throw new Error('Minimax 未返回 task_id')
  console.log('[video] Minimax task_id:', taskId)

  const videoUrl = await pollMinimaxTask(taskId)
  return { index: 0, videoUrl }
}

/**
 * 轮询 Minimax 视频生成任务，完成后返回视频 URL。
 */
const pollMinimaxTask = async (
  taskId: string,
  maxRetries = 60,
  interval = 5000
): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    await sleep(interval)
    const response = await videoApiClient.get('/query/video_generation', {
      params: { task_id: taskId },
    })
    const status = response.data?.status
    console.log(`[video] 轮询 ${i + 1}/${maxRetries}, 状态:`, status)
    if (status === 'Success') {
      const url = response.data?.video_url || ''
      console.log('[video] Minimax 生成成功:', url.substring(0, 60) + '...')
      return url
    }
    if (status === 'Fail') {
      throw new Error('Minimax 视频生成失败')
    }
    // Queueing / Processing → continue polling
  }
  throw new Error('Minimax 视频生成超时（5分钟）')
}

/**
 * 合成最终视频。
 * - 有 I2V 片段 → 拼接真实视频
 * - 只有场景图 → 客户端生成幻灯片（每图 5s，Ken Burns 平移效果）
 */
export const stitchVideos = async (
  clipUrls: string[],
  sceneImages: string[]
): Promise<Blob> => {
  // 有真实视频片段 → 拼接
  const validClips = clipUrls.filter(Boolean)
  if (validClips.length > 0) {
    const stitchApiUrl = import.meta.env.VITE_STITCH_API_URL
    if (stitchApiUrl) {
      try {
        const response = await fetch(stitchApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: validClips }),
        })
        if (response.ok) return response.blob()
      } catch {
        console.warn('服务端拼接失败，降级客户端拼接')
      }
    }
    const { stitchClipsClient } = await import('@/utils/videoHelpers')
    return stitchClipsClient(validClips)
  }

  // 无视频片段 → 用场景图生成幻灯片视频
  const { sceneImagesToVideo } = await import('@/utils/videoHelpers')
  return sceneImagesToVideo(sceneImages)
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
