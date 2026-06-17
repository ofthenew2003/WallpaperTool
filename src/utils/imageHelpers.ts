export const downloadImage = (imageData: string, filename: string) => {
  if (imageData.startsWith('data:image')) {
    const link = document.createElement('a')
    link.href = imageData
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
      .catch(() => {
        window.open(imageData, '_blank')
      })
  }
}

export const generateFilename = (mode: string, timestamp: number): string => {
  const date = new Date(timestamp)
  const dateStr = date.toISOString().slice(0, 10)
  return `ai_${mode}_${dateStr}_${timestamp}.png`
}

export const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
