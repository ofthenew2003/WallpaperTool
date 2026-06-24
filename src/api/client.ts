import axios from 'axios'

const API_BASE_URL = 'https://api.siliconflow.cn/v1'
const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY

export const siliconflowClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
})

// 视频 API 客户端（Minimax，可替换为 Kling / Runway）
const VIDEO_API_BASE_URL = import.meta.env.VITE_VIDEO_API_URL || 'https://api.minimax.chat/v1'
const VIDEO_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY || import.meta.env.VITE_VIDEO_API_KEY || ''

export const videoApiClient = axios.create({
  baseURL: VIDEO_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${VIDEO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 120000,
})

videoApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('视频API请求失败:', error)
    return Promise.reject(error)
  }
)

siliconflowClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

siliconflowClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API请求失败:', error)
    return Promise.reject(error)
  }
)
