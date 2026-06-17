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
