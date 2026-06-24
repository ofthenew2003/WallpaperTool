/**
 * 触发浏览器下载视频文件。
 */
export const downloadVideo = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 生成视频文件名。
 */
export const generateVideoFilename = (timestamp: number = Date.now()): string => {
  const date = new Date(timestamp)
  const dateStr = date.toISOString().slice(0, 10)
  return `ai_pet_video_${dateStr}_${timestamp}.mp4`
}

/**
 * 用场景图生成幻灯片视频（每图 5 秒，Ken Burns 缓慢缩放效果）。
 * 使用 requestAnimationFrame 确保 MediaRecorder 正确捕获每一帧。
 */
export const sceneImagesToVideo = async (imageBase64List: string[]): Promise<Blob> => {
  console.log('[videoHelpers] sceneImagesToVideo 开始, 图片数:', imageBase64List.length)

  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const stream = canvas.captureStream(30)
  // 用最广泛支持的 mime 格式
  let mimeType = 'video/webm'
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    mimeType = 'video/webm;codecs=vp8'
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    mimeType = 'video/webm;codecs=vp9'
  }
  console.log('[videoHelpers] MediaRecorder mime:', mimeType)

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5000000,
  })
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    console.log('[videoHelpers] dataavailable:', e.data.size, 'bytes')
    if (e.data.size > 0) chunks.push(e.data)
  }

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      console.log('[videoHelpers] recorder stop, chunks:', chunks.length)
      const blob = new Blob(chunks, { type: mimeType })
      console.log('[videoHelpers] final blob:', (blob.size / 1024).toFixed(1), 'KB')
      resolve(blob)
    }
  })

  recorder.start()

  // 预加载所有图片
  const images = await Promise.all(
    imageBase64List.map((b64, i) => {
      const img = new Image()
      img.src = b64
      return new Promise<HTMLImageElement>((resolve, reject) => {
        img.onload = () => {
          console.log(`[videoHelpers] 图片 ${i + 1} 加载成功: ${img.width}x${img.height}`)
          resolve(img)
        }
        img.onerror = (e) => {
          console.error(`[videoHelpers] 图片 ${i + 1} 加载失败:`, e)
          reject(new Error(`图片 ${i + 1} 加载失败`))
        }
      })
    })
  )

  const fps = 30
  const secondsPerImage = 5

  for (let i = 0; i < images.length; i++) {
    console.log(`[videoHelpers] 渲染幻灯片 ${i + 1}/${images.length}`)
    await renderKenBurns(canvas, ctx, images[i], secondsPerImage, fps)
  }

  // 等待最后一帧写入
  await new Promise((r) => setTimeout(r, 100))
  recorder.stop()
  return done
}

/**
 * 单张图片的 Ken Burns 效果渲染。
 * 使用 requestAnimationFrame 确保与 MediaRecorder 捕获同步。
 */
const renderKenBurns = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  seconds: number,
  fps: number
): Promise<void> => {
  return new Promise((resolve) => {
    const totalFrames = seconds * fps
    let frame = 0
    const frameInterval = 1000 / fps

    let lastTime = performance.now()

    const draw = (now: number) => {
      if (frame >= totalFrames) {
        resolve()
        return
      }

      const elapsed = now - lastTime
      if (elapsed < frameInterval) {
        requestAnimationFrame(draw)
        return
      }
      lastTime = now

      const progress = frame / totalFrames
      const scale = 1.0 + progress * 0.1

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 居中裁剪源图，然后缩放绘制
      const srcSize = Math.min(img.width, img.height)
      const sx = (img.width - srcSize) / 2
      const sy = (img.height - srcSize) / 2

      const dw = canvas.width * scale
      const dh = canvas.height * scale
      const dx = (canvas.width - dw) / 2
      const dy = (canvas.height - dh) / 2

      ctx.drawImage(img, sx, sy, srcSize, srcSize, dx, dy, dw, dh)
      frame++
      requestAnimationFrame(draw)
    }
    requestAnimationFrame(draw)
  })
}

/**
 * 客户端 Canvas + MediaRecorder 拼接真实视频片段。
 */
export const stitchClipsClient = async (clipUrls: string[]): Promise<Blob> => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const stream = canvas.captureStream(30)
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
    ? 'video/webm;codecs=vp8'
    : 'video/webm'
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 })
  const chunks: Blob[] = []

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }))
  })

  recorder.start()

  for (const url of clipUrls) {
    const video = await loadVideoElement(url)
    await playVideoOnCanvas(video, canvas, ctx)
  }

  await new Promise((r) => setTimeout(r, 100))
  recorder.stop()
  return done
}

const loadVideoElement = (url: string): Promise<HTMLVideoElement> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.src = url
    video.onloadeddata = () => resolve(video)
    video.onerror = reject
  })
}

const playVideoOnCanvas = (
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
): Promise<void> => {
  return new Promise((resolve) => {
    video.play()
    const draw = () => {
      if (video.ended) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        resolve()
        return
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      requestAnimationFrame(draw)
    }
    video.ondurationchange = null
    draw()
  })
}
