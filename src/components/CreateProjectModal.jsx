import { useState } from 'react'

function CreateProjectModal({ onClose, onCreate }) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleNameChange = (val) => {
    setName(val)
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) { setError('Name and slug are required'); return }
    setSubmitting(true)
    setError('')
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean)
    const result = await onCreate(name.trim(), slug.trim(), description.trim(), githubUrl.trim() || null, tagArray)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="bg-[#1e293b] border border-gray-700 rounded-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-4">Create a Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Project Name *</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} maxLength={80}
              className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="My Awesome Project" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Slug *</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} maxLength={60}
              className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 font-mono" placeholder="my-awesome-project" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={500}
              className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500 resize-none" placeholder="What is this project about?" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">GitHub URL (optional)</label>
            <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="https://github.com/user/repo" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tags (comma-separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" placeholder="react, supabase, tailwind" />
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors">
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
