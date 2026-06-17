import { siliconflowClient } from './client'
import type { SiliconFlowImageRequest, SiliconFlowImageResponse } from '@/types'

export const generateImage = async (
  request: SiliconFlowImageRequest
): Promise<SiliconFlowImageResponse> => {
  try {
    const response = await siliconflowClient.post('/images/generations', {
      model: request.model || 'Kwai-Kolors/Kolors',
      prompt: request.prompt,
      negative_prompt: request.negative_prompt || '',
      width: request.width,
      height: request.height,
      num_images: request.num_images || 1,
      steps: request.steps || 25,
      guidance_scale: request.guidance_scale || 5,
      seed: request.seed,
    })

    return response.data
  } catch (error) {
    console.error('硅基流动API调用失败:', error)
    throw error
  }
}
