import { useState, useRef } from 'react'
import { validateImage, formatFileSize } from '../lib/imageUtils'

function FeedImageUpload({ onImageSelected, onImageRemoved, currentImage }) {
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState(null)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    setError(null)
    const err = validateImage(file)
    if (err) { setError(err); return }

    const url = URL.createObjectURL(file)
    setPreview({ url, name: file.name, size: file.size, isGif: file.type === 'image/gif' })
    onImageSelected(file)
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url)
    setPreview(null)
    setError(null)
    onImageRemoved()
  }

  if (preview || currentImage) {
    const img = preview || currentImage
    return (
      <div className="relative inline-block mt-2">
        <img src={img.url} alt="Preview" className="max-w-[200px] max-h-[150px] rounded-lg border border-gray-700 object-cover" />
        {img.isGif && (
          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">GIF</span>
        )}
        <button onClick={handleRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-gray-700 hover:bg-red-600 text-white text-xs rounded-full flex items-center justify-center transition-colors">
          ✕
        </button>
        <p className="text-[10px] text-gray-600 mt-1">{img.name} ({formatFileSize(img.size)})</p>
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-2 border-2 border-dashed rounded-lg px-4 py-3 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <p className="text-xs text-gray-500">{dragOver ? 'Drop image here' : '📷 Add image'}</p>
        <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleChange} className="hidden" />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

export default FeedImageUpload
