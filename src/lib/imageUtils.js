export function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase()
}

export async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  // Don't compress GIFs — they lose animation
  if (file.type === 'image/gif') return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      // Skip if already under thresholds
      if (width <= maxWidth && height <= maxHeight && file.size < 1024 * 1024) {
        resolve(file)
        return
      }

      // Calculate new dimensions
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      const outputQuality = file.type === 'image/png' ? undefined : quality

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: outputType }))
      }, outputType, outputQuality)
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

export function validateImage(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowed.includes(file.type)) return 'Only JPG, PNG, GIF, and WebP files are supported'
  if (file.size > 5 * 1024 * 1024) return 'Image must be under 5MB'
  return null
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
