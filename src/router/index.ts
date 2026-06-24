import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomePage.vue'),
    },
    {
      path: '/wallpaper',
      name: 'wallpaper',
      component: () => import('@/views/WallpaperTool.vue'),
    },
    {
      path: '/pet-video',
      name: 'pet-video',
      component: () => import('@/views/PetVideoTool.vue'),
    },
  ],
})

export default router
