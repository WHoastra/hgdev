import { useState, useRef } from 'react'
import { compressImage, sanitizeFilename } from '../lib/imageUtils'
import { supabase } from '../lib/supabase'

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

function ProjectMediaUpload({ userId, onUpload, onCancel }) {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [mediaKind, setMediaKind] = useState(null) // 'image' | 'gif' | 'video'
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  const handleFileSelect = (f) => {
    setError('')
    if (IMAGE_TYPES.includes(f.type)) {
      if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return }
      setMediaKind(f.type === 'image/gif' ? 'gif' : 'image')
    } else if (VIDEO_TYPES.includes(f.type)) {
      if (f.size > 50 * 1024 * 1024) { setError('Video must be under 50MB'); return }
      setMediaKind('video')
    } else {
      setError('Supported: JPG, PNG, GIF, WebP, MP4, WebM')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleUpload = async () => {
    if (!file || !userId) return
    setUploading(true)
    try {
      let toUpload = file
      if (mediaKind === 'image') {
        toUpload = await compressImage(file)
      }
      const filename = `${Date.now()}-${sanitizeFilename(file.name)}`
      const path = `${userId}/${filename}`
      const { error: uploadErr } = await supabase.storage.from('project-media').upload(path, toUpload)
      if (uploadErr) { setError('Upload failed'); setUploading(false); return }
      const { data: urlData } = supabase.storage.from('project-media').getPublicUrl(path)
      onUpload(urlData.publicUrl, mediaKind)
    } catch {
      setError('Upload failed')
    }
    setUploading(false)
  }

  return (
    <div className="bg-[#0f172a] border border-gray-700 rounded-lg p-3">
      {!file ? (
        <div>
          <button onClick={() => inputRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:border-green-500/50 hover:text-green-400 transition-colors">
            Click to select image or video
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime" className="hidden"
            onChange={(e) => { if (e.target.files[0]) handleFileSelect(e.target.files[0]) }} />
        </div>
      ) : (
        <div>
          {mediaKind === 'video' ? (
            <video src={preview} controls className="max-h-48 rounded-lg mx-auto" />
          ) : (
            <img src={preview} alt="Preview" className="max-h-48 rounded-lg mx-auto object-contain" />
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-500">{file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
            <div className="flex gap-2">
              <button onClick={() => { setFile(null); setPreview(null); setMediaKind(null); onCancel?.() }}
                className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors">Remove</button>
              <button onClick={handleUpload} disabled={uploading}
                className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  )
}

export default ProjectMediaUpload
