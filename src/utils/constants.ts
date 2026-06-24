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
]

// ==================== 宠物带货视频 ====================

export const VIDEO_STYLES = [
  { label: '🐱 可爱', value: 'cute' },
  { label: '🔥 炫酷', value: 'cool' },
  { label: '🌿 自然', value: 'natural' },
  { label: '🤪 搞笑', value: 'funny' },
  { label: '✨ 高级感', value: 'luxury' },
] as const

export const SCENE_PROMPT_TEMPLATES: Record<string, string[]> = {
  cute: [
    '{pet}趴在{product}旁边，歪头看镜头，粉色柔光背景，萌宠风格',
    '{pet}开心地玩{product}，跳跃抓拍，明亮阳光，温馨可爱',
    '{pet}抱着{product}睡觉，安静特写，柔焦效果，治愈系',
  ],
  cool: [
    '{pet}戴着墨镜站在{product}前，霓虹灯光，赛博朋克风格',
    '{pet}慢动作跃过{product}，粒子特效，大片质感',
    '{pet}和{product}的剪影，逆光拍摄，炫酷收尾',
  ],
  natural: [
    '{pet}在草地上发现{product}，自然光，清新户外',
    '{pet}在阳光下使用{product}，温暖色调，生活感',
    '{pet}和{product}的温馨日常，柔光，自然收尾',
  ],
  funny: [
    '{pet}对{product}做鬼脸，夸张表情，喜剧风格',
    '{pet}追着{product}转圈，搞笑加速，卡通音效感',
    '{pet}被{product}吓了一跳，慢动作回放，滑稽收尾',
  ],
  luxury: [
    '{pet}优雅地走向{product}，金色灯光，高端质感',
    '{pet}与{product}的精致特写，景深虚化，奢侈品广告风',
    '{pet}和{product}定格pose，闪光灯，杂志封面感',
  ],
}

export const STYLE_TAGS = [
  { label: '🎨 油画风格', value: '油画' },
  { label: '🌟 3D卡通', value: '3D卡通' },
  { label: '💧 水彩画', value: '水彩' },
  { label: '🌌 赛博朋克', value: '赛博朋克' },
  { label: '📷 写实摄影', value: '写实' },
  { label: '🔮 梦幻唯美', value: '梦幻' },
]
