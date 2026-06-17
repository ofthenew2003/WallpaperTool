# 技术设计文档：极简AI壁纸/头像生成器（Vue3版）

---

## 1. 技术栈

### 前端框架与工具
- **框架**：Vue 3 + TypeScript（Composition API）
- **构建工具**：Vite（极速冷启动，HMR热更新）
- **UI框架**：Tailwind CSS（原子化样式，快速构建毛玻璃效果）
- **路由**：无需路由（单页应用，所有功能在首屏完成）
- **状态管理**：Pinia（轻量级状态管理，替代Vuex）
- **HTTP客户端**：Axios（拦截器统一处理请求/响应）
- **响应式工具**：VueUse（常用组合式函数集合）

### AI绘图服务
- **核心API**：硅基流动（SiliconFlow）Kwai-Kolors/Kolors 模型
  - API端点：`https://api.siliconflow.cn/v1`
  - 模型名称：`Kwai-Kolors/Kolors`
  - **特点**：该模型目前支持免费图像生成，适合MVP阶段使用
- **图像处理**：Canvas API（前端实现简单裁剪/格式转换）
- **内容审核**：硅基流动API自带内容过滤，前端增加敏感词黑名单初步拦截

### 存储方案
- **LocalStorage**：存储当前会话的生成历史（图片base64缩略图 + 提示词）
- **SessionStorage**：缓存用户最后一次选择的生成模式（壁纸/头像）

### 辅助库
- **文件下载**：原生 `fetch` + `Blob`（无需额外库）
- **图标库**：Lucide Vue（轻量级开源图标库的Vue版本）
- **加载动画**：纯CSS实现（避免引入额外动画库）
- **工具库**：lodash-es（防抖、节流等工具函数）

---

## 2. 项目结构

```
src/
├── api/
│   ├── siliconflow.ts    # 硅基流动API封装
│   ├── client.ts         # Axios实例配置
│   └── types.ts          # API请求/响应类型定义
├── components/
│   ├── common/
│   │   ├── BaseButton.vue    # 通用按钮组件
│   │   ├── LoadingSpinner.vue # 加载动画
│   │   └── GlassCard.vue     # 毛玻璃卡片容器
│   ├── ModeSelector.vue      # 壁纸/头像切换
│   ├── PromptInput.vue       # 提示词输入框 + 字数统计
│   ├── StyleTags.vue         # 风格标签快捷按钮
│   ├── GenerateButton.vue    # 生成按钮 + 状态管理
│   ├── ResultDisplay.vue     # 生成结果展示区
│   ├── HistoryGallery.vue    # 历史记录缩略图列表
│   └── InspirationDice.vue   # 灵感骰子组件
├── composables/
│   ├── useGeneration.ts      # 图片生成逻辑Composable
│   ├── useHistory.ts         # 历史记录管理Composable
│   └── useLocalStorage.ts    # LocalStorage操作封装
├── stores/
│   ├── generation.ts         # 生成状态Pinia Store
│   ├── history.ts            # 历史记录Pinia Store
│   └── settings.ts           # 用户设置Pinia Store
├── utils/
│   ├── constants.ts          # 常量配置（默认提示词、风格标签等）
│   ├── validators.ts         # 输入校验（敏感词过滤、字数限制）
│   ├── imageHelpers.ts       # 图片处理工具（base64转Blob、下载）
│   └── storage.ts            # 存储操作工具函数
├── types/
│   └── index.ts              # 全局类型定义
├── styles/
│   └── globals.css           # 全局样式 + Tailwind导入
├── App.vue                   # 根组件
└── main.ts                   # 入口文件
```

---

## 3. 数据结构

### 3.1 核心数据类型

```typescript
// src/types/index.ts

// 生成模式
export type GenerationMode = 'wallpaper' | 'avatar';

// 图片生成请求
export interface GenerationRequest {
  prompt: string;          // 用户提示词
  mode: GenerationMode;    // 壁纸(9:16) 或 头像(1:1)
  style?: string;          // 可选：风格标签
  seed?: number;           // 可选：随机种子（用于复现）
  steps?: number;          // 推理步数（默认25-50）
  guidanceScale?: number;  // 匹配度/引导尺度（默认5-7.5）
}

// 图片生成结果
export interface GenerationResult {
  id: string;              // 唯一ID (时间戳 + 随机数)
  prompt: string;          // 最终使用的完整提示词
  mode: GenerationMode;    // 生成模式
  imageUrl: string;        // 图片URL
  imageBase64?: string;    // base64编码（用于LocalStorage缓存）
  timestamp: number;       // 生成时间戳
  style?: string;          // 使用的风格标签
  isFavorite?: boolean;    // 是否收藏（留作V2扩展）
}

// 会话历史
export interface SessionHistory {
  sessionId: string;       // 会话ID（基于时间戳）
  results: GenerationResult[];
  lastMode: GenerationMode;
  createdAt: number;
  updatedAt: number;
}

// 硅基流动API请求参数
export interface SiliconFlowImageRequest {
  model: string;           // 'Kwai-Kolors/Kolors'
  prompt: string;
  negative_prompt?: string; // 反向提示词
  width: number;           // 图片宽度
  height: number;          // 图片高度
  num_images?: number;     // 生成数量（默认1）
  steps?: number;          // 推理步数 1-50 
  guidance_scale?: number; // 匹配度 0-20 
  seed?: number;           // 随机种子
}

// 硅基流动API响应
export interface SiliconFlowImageResponse {
  id: string;
  model: string;
  data: Array<{
    url: string;
    b64_json?: string;
  }>;
  usage?: {
    total_tokens: number;
  };
}
```

### 3.2 Pinia Store 状态管理

```typescript
// src/stores/generation.ts
import { defineStore } from 'pinia';
import type { GenerationMode, GenerationResult } from '@/types';

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
    // 是否有结果
    hasResult: (state) => state.currentResult !== null,
    
    // 完整提示词（包含风格）
    fullPrompt: (state) => {
      if (state.selectedStyle && state.prompt) {
        return `${state.prompt}, ${state.selectedStyle}风格`;
      }
      return state.prompt;
    },
  },
  
  actions: {
    setMode(mode: GenerationMode) {
      this.mode = mode;
    },
    
    setPrompt(prompt: string) {
      this.prompt = prompt;
    },
    
    setStyle(style: string | null) {
      this.selectedStyle = style;
    },
    
    setLoading(loading: boolean) {
      this.isLoading = loading;
    },
    
    setProgress(progress: number) {
      this.progress = progress;
    },
    
    setError(error: string | null) {
      this.error = error;
    },
    
    setResult(result: GenerationResult | null) {
      this.currentResult = result;
    },
    
    reset() {
      this.prompt = '';
      this.selectedStyle = null;
      this.isLoading = false;
      this.progress = 0;
      this.error = null;
      this.currentResult = null;
    },
  },
});

// src/stores/history.ts
import { defineStore } from 'pinia';
import type { GenerationResult } from '@/types';

export const useHistoryStore = defineStore('history', {
  state: () => ({
    results: [] as GenerationResult[],
    maxSize: 20, // 最多保存20条
  }),
  
  getters: {
    // 按时间降序排列（最新的在前）
    sortedResults: (state) => {
      return [...state.results].sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // 壁纸生成数量
    wallpaperCount: (state) => {
      return state.results.filter(r => r.mode === 'wallpaper').length;
    },
    
    // 头像生成数量
    avatarCount: (state) => {
      return state.results.filter(r => r.mode === 'avatar').length;
    },
  },
  
  actions: {
    addResult(result: GenerationResult) {
      this.results.unshift(result);
      // 限制数量
      if (this.results.length > this.maxSize) {
        this.results = this.results.slice(0, this.maxSize);
      }
      // 保存到LocalStorage
      this.saveToStorage();
    },
    
    deleteResult(id: string) {
      this.results = this.results.filter(r => r.id !== id);
      this.saveToStorage();
    },
    
    clearHistory() {
      this.results = [];
      this.saveToStorage();
    },
    
    saveToStorage() {
      try {
        localStorage.setItem('wallpaper_history', JSON.stringify({
          results: this.results,
          updatedAt: Date.now(),
        }));
      } catch (e) {
        console.error('保存历史记录失败:', e);
      }
    },
    
    loadFromStorage() {
      try {
        const data = localStorage.getItem('wallpaper_history');
        if (data) {
          const parsed = JSON.parse(data);
          this.results = parsed.results || [];
        }
      } catch (e) {
        console.error('加载历史记录失败:', e);
      }
    },
  },
});
```

---

## 4. API调用设计

### 4.1 硅基流动API封装

```typescript
// src/api/client.ts
import axios from 'axios';

const API_BASE_URL = 'https://api.siliconflow.cn/v1';
const API_KEY = import.meta.env.VITE_SILICONFLOW_API_KEY;

export const siliconflowClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60秒超时
});

// 请求拦截器
siliconflowClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加请求日志
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
siliconflowClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    console.error('API请求失败:', error);
    return Promise.reject(error);
  }
);
```

```typescript
// src/api/siliconflow.ts
import { siliconflowClient } from './client';
import type { SiliconFlowImageRequest, SiliconFlowImageResponse } from '@/types';

// 图像生成API
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
    });
    
    return response.data;
  } catch (error) {
    console.error('硅基流动API调用失败:', error);
    throw error;
  }
};
```

### 4.2 环境变量配置

```env
# .env.local
VITE_SILICONFLOW_API_KEY=your_siliconflow_api_key_here
VITE_SILICONFLOW_MODEL=Kwai-Kolors/Kolors
VITE_SILICONFLOW_TIMEOUT=60000
VITE_ENABLE_DEBUG=false
```

### 4.3 图片生成Composable

```typescript
// src/composables/useGeneration.ts
import { ref, computed } from 'vue';
import { generateImage } from '@/api/siliconflow';
import type { GenerationRequest, GenerationResult } from '@/types';
import { useGenerationStore } from '@/stores/generation';
import { useHistoryStore } from '@/stores/history';

export const useGeneration = () => {
  const store = useGenerationStore();
  const historyStore = useHistoryStore();
  
  // 本地状态
  const isLoading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);
  
  // 根据模式获取尺寸
  const getImageSize = (mode: 'wallpaper' | 'avatar'): { width: number; height: number } => {
    if (mode === 'wallpaper') {
      return { width: 1024, height: 1792 };
    }
    return { width: 1024, height: 1024 };
  };
  
  // 生成图片
  const generate = async (request: GenerationRequest) => {
    isLoading.value = true;
    error.value = null;
    progress.value = 10;
    store.setLoading(true);
    
    try {
      // 构建完整提示词
      const fullPrompt = request.style 
        ? `${request.prompt}, ${request.style}风格` 
        : request.prompt;
      
      progress.value = 30;
      
      const size = getImageSize(request.mode);
      
      const apiRequest = {
        model: import.meta.env.VITE_SILICONFLOW_MODEL || 'Kwai-Kolors/Kolors',
        prompt: fullPrompt,
        width: size.width,
        height: size.height,
        steps: request.steps || 25,
        guidance_scale: request.guidanceScale || 5,
        seed: request.seed || Math.floor(Math.random() * 1000000),
        num_images: 1,
      };
      
      progress.value = 50;
      
      const response = await generateImage(apiRequest);
      
      progress.value = 80;
      
      // 处理响应
      const imageData = response.data[0];
      const resultData: GenerationResult = {
        id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        prompt: fullPrompt,
        mode: request.mode,
        imageUrl: imageData.url || '',
        imageBase64: imageData.b64_json ? `data:image/png;base64,${imageData.b64_json}` : '',
        timestamp: Date.now(),
        style: request.style,
      };
      
      // 更新状态
      store.setResult(resultData);
      historyStore.addResult(resultData);
      
      progress.value = 100;
      isLoading.value = false;
      store.setLoading(false);
      
      return resultData;
      
    } catch (err) {
      let errorMessage = '生成失败，请稍后重试';
      
      if (err.response?.status === 429) {
        errorMessage = '生成请求过于频繁，请稍后再试';
      } else if (err.response?.status === 400) {
        errorMessage = '提示词包含违规内容，请修改后重试';
      } else if (err.response?.status >= 500) {
        errorMessage = '服务器繁忙，请稍后重试';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      error.value = errorMessage;
      store.setError(errorMessage);
      isLoading.value = false;
      store.setLoading(false);
      throw err;
    }
  };
  
  // 重新生成
  const regenerate = async (request: GenerationRequest) => {
    error.value = null;
    store.setError(null);
    return generate({ 
      ...request, 
      seed: Math.floor(Math.random() * 1000000) 
    });
  };
  
  // 重置状态
  const reset = () => {
    isLoading.value = false;
    progress.value = 0;
    error.value = null;
    store.reset();
  };
  
  return {
    // 状态
    isLoading: computed(() => isLoading.value),
    progress: computed(() => progress.value),
    error: computed(() => error.value),
    currentResult: computed(() => store.currentResult),
    
    // 方法
    generate,
    regenerate,
    reset,
  };
};
```

---

## 5. 核心组件实现

### 5.1 主应用组件

```vue
<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="container mx-auto max-w-2xl px-4 py-8">
      <header class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">
          🎨 AI壁纸/头像生成器
        </h1>
        <p class="text-gray-500 mt-2">
          输入灵感，AI为你创作
        </p>
      </header>
      
      <!-- 模式选择 -->
      <ModeSelector />
      
      <!-- 提示词输入 -->
      <PromptInput />
      
      <!-- 风格标签 -->
      <StyleTags />
      
      <!-- 生成按钮 -->
      <GenerateButton />
      
      <!-- 结果展示 -->
      <ResultDisplay />
      
      <!-- 历史记录 -->
      <HistoryGallery />
      
      <footer class="text-center text-gray-400 text-sm mt-8">
        图片由AI生成，仅供个人使用参考
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModeSelector from './components/ModeSelector.vue';
import PromptInput from './components/PromptInput.vue';
import StyleTags from './components/StyleTags.vue';
import GenerateButton from './components/GenerateButton.vue';
import ResultDisplay from './components/ResultDisplay.vue';
import HistoryGallery from './components/HistoryGallery.vue';
</script>
```

### 5.2 模式选择组件

```vue
<!-- src/components/ModeSelector.vue -->
<template>
  <div class="flex gap-4 mb-6">
    <button
      v-for="option in options"
      :key="option.value"
      @click="selectMode(option.value)"
      class="flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200"
      :class="[
        mode === option.value
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
          : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90'
      ]"
    >
      <span class="mr-2">{{ option.icon }}</span>
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGenerationStore } from '@/stores/generation';
import type { GenerationMode } from '@/types';

const store = useGenerationStore();
const mode = computed(() => store.mode);

const options = [
  { value: 'wallpaper' as const, label: '壁纸', icon: '🖼️' },
  { value: 'avatar' as const, label: '头像', icon: '👤' },
];

const selectMode = (mode: GenerationMode) => {
  store.setMode(mode);
};
</script>
```

### 5.3 提示词输入组件

```vue
<!-- src/components/PromptInput.vue -->
<template>
  <div class="mb-4">
    <div class="relative">
      <textarea
        v-model="prompt"
        :placeholder="placeholder"
        rows="3"
        maxlength="200"
        class="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
        @input="handleInput"
      />
      
      <!-- 字数统计 -->
      <div class="absolute bottom-2 right-3 text-xs text-gray-400">
        {{ prompt.length }}/200
      </div>
    </div>
    
    <!-- 灵感骰子 -->
    <div class="mt-2 flex justify-end">
      <button
        @click="fillInspiration"
        class="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
      >
        <span>🎲</span> 灵感骰子
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGenerationStore } from '@/stores/generation';
import { INSPIRATION_PROMPTS } from '@/utils/constants';
import { debounce } from 'lodash-es';

const store = useGenerationStore();
const prompt = ref(store.prompt);

const placeholder = '描述你想要的画面，例如："一座漂浮在云端的未来城市"';

// 输入处理（防抖）
const handleInput = debounce(() => {
  store.setPrompt(prompt.value);
}, 300);

// 灵感骰子
const fillInspiration = () => {
  const randomIndex = Math.floor(Math.random() * INSPIRATION_PROMPTS.length);
  prompt.value = INSPIRATION_PROMPTS[randomIndex];
  store.setPrompt(prompt.value);
};

// 监听store变化
watch(() => store.prompt, (newVal) => {
  if (newVal !== prompt.value) {
    prompt.value = newVal;
  }
});
</script>
```

### 5.4 生成按钮组件

```vue
<!-- src/components/GenerateButton.vue -->
<template>
  <button
    @click="handleGenerate"
    :disabled="isLoading || !prompt"
    class="w-full py-4 rounded-xl font-semibold text-lg transition-all duration-200"
    :class="[
      !isLoading && prompt
        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    ]"
  >
    <span v-if="isLoading" class="flex items-center justify-center gap-2">
      <LoadingSpinner />
      {{ loadingText }}
    </span>
    <span v-else>
      ✨ 生成图片
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGeneration } from '@/composables/useGeneration';
import { useGenerationStore } from '@/stores/generation';
import LoadingSpinner from './common/LoadingSpinner.vue';

const store = useGenerationStore();
const { generate, isLoading, progress } = useGeneration();

const prompt = computed(() => store.prompt);
const mode = computed(() => store.mode);
const selectedStyle = computed(() => store.selectedStyle);

const loadingText = computed(() => {
  if (progress.value < 30) return 'AI正在构思...';
  if (progress.value < 60) return 'AI正在绘制...';
  if (progress.value < 90) return 'AI正在完善细节...';
  return '即将完成...';
});

const handleGenerate = async () => {
  if (!prompt.value || isLoading.value) return;
  
  try {
    await generate({
      prompt: prompt.value,
      mode: mode.value,
      style: selectedStyle.value || undefined,
    });
  } catch (error) {
    // 错误已在useGeneration中处理
    console.error('生成失败:', error);
  }
};
</script>
```

---

## 6. 核心功能实现

### 6.1 图片下载工具

```typescript
// src/utils/imageHelpers.ts

// 下载图片
export const downloadImage = (imageData: string, filename: string) => {
  if (imageData.startsWith('data:image')) {
    // Base64下载
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    // URL下载
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open(imageData, '_blank');
      });
  }
};

// 生成文件名
export const generateFilename = (mode: string, timestamp: number): string => {
  const date = new Date(timestamp);
  const dateStr = date.toISOString().slice(0, 10);
  return `ai_${mode}_${dateStr}_${timestamp}.png`;
};

// 将URL转换为Base64
export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
```

### 6.2 灵感骰子数据

```typescript
// src/utils/constants.ts

export const INSPIRATION_PROMPTS = [
  '一只在月球上钓鱼的猫，星空背景，梦幻风格',
  '赛博朋克城市，霓虹灯，雨夜，未来感',
  '梦幻森林，发光蘑菇，精灵，魔法',
  '极光下的雪山，星空，宁静',
  '水墨画风格，山水，云雾缭绕',
  '动漫少女，樱花树，春日',
  '海底世界，珊瑚，热带鱼，五彩斑斓',
  '太空站，地球，银河，科幻',
  '古风庭院，梅花，雪景，诗意',
  '抽象艺术，色彩爆炸，现代感',
];

export const STYLE_TAGS = [
  { label: '🎨 油画风格', value: '油画' },
  { label: '🌟 3D卡通', value: '3D卡通' },
  { label: '💧 水彩画', value: '水彩' },
  { label: '🌌 赛博朋克', value: '赛博朋克' },
  { label: '📷 写实摄影', value: '写实' },
  { label: '🔮 梦幻唯美', value: '梦幻' },
];
```

---

## 7. 性能优化

### 7.1 路由懒加载（Vue3）

```typescript
// 虽然单页应用无需路由，但如果需要扩展，可使用异步组件
import { defineAsyncComponent } from 'vue';

const ResultDisplay = defineAsyncComponent(() => 
  import('./components/ResultDisplay.vue')
);
```

### 7.2 图片懒加载

```vue
<!-- 历史记录缩略图懒加载 -->
<template>
  <img 
    v-lazy="result.imageUrl"
    :alt="result.prompt"
    class="w-20 h-20 object-cover rounded-lg"
  />
</template>

<script setup>
// 使用vue3-lazy或自定义指令
</script>
```

### 7.3 Vite构建优化

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
          'axios-vendor': ['axios'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## 8. 错误处理与边界

### 8.1 全局错误处理

```typescript
// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';

const app = createApp(App);

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err, info);
  // 可上报到错误监控服务
};

app.use(createPinia());
app.mount('#app');
```

### 8.2 组件级错误边界

```vue
<!-- src/components/common/ErrorBoundary.vue -->
<template>
  <slot v-if="!error" />
  <div v-else class="p-4 bg-red-50 rounded-xl text-red-600">
    <h3 class="font-semibold">出错了</h3>
    <p class="text-sm">{{ error }}</p>
    <button @click="reset" class="mt-2 text-sm text-red-500 underline">
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const error = ref<string | null>(null);

onErrorCaptured((err) => {
  error.value = err.message || '未知错误';
  return false; // 阻止错误继续传播
});

const reset = () => {
  error.value = null;
};
</script>
```

---

## 9. 部署方案

### 9.1 环境配置

```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 9.2 Vercel部署

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SILICONFLOW_API_KEY": "@siliconflow_api_key"
  }
}
```

### 9.3 环境变量

```env
# .env.production
VITE_SILICONFLOW_API_KEY=${SILICONFLOW_API_KEY}
VITE_SILICONFLOW_MODEL=Kwai-Kolors/Kolors
VITE_SILICONFLOW_TIMEOUT=60000
```