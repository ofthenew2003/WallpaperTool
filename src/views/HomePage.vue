<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div class="container mx-auto max-w-5xl px-4 py-16">
      <!-- 头部 -->
      <header class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-800 mb-3">
          🛠️ AI 工具集
        </h1>
        <p class="text-gray-500 text-lg">
          精选AI工具，提升创作效率
        </p>
      </header>

      <!-- 工具卡片网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 壁纸头像生成器 -->
        <a
          href="#/wallpaper"
          target="_blank"
          class="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
        >
          <div class="text-5xl mb-4">🎨</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            AI壁纸/头像生成器
          </h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            输入文字描述，AI自动生成精美壁纸和头像。支持多种风格选择，9:16壁纸与1:1头像自由切换。
          </p>
          <div class="mt-4 flex items-center text-blue-500 text-sm font-medium">
            <span>立即使用</span>
            <span class="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </a>

        <!-- 宠物带货视频 -->
        <a
          href="#/pet-video"
          target="_blank"
          class="group block bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50"
        >
          <div class="text-5xl mb-4">🐾</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
            AI宠物带货视频
          </h3>
          <p class="text-gray-500 text-sm leading-relaxed">
            上传宠物照片和产品图片，AI自动生成15秒带货短视频，适用于宠物用品推广。
          </p>
          <div class="mt-4 flex items-center text-blue-500 text-sm font-medium">
            <span>立即使用</span>
            <span class="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
          </div>
        </a>

        <!-- 更多工具占位 -->
        <div
          class="block bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-dashed border-gray-300 flex flex-col items-center justify-center text-center min-h-[200px]"
        >
          <div class="text-4xl mb-3 opacity-50">🔜</div>
          <h3 class="text-lg font-medium text-gray-400">更多工具</h3>
          <p class="text-gray-400 text-sm mt-1">即将推出…</p>
        </div>
      </div>
    </div>
  </div>
</template>
