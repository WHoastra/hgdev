import { useState, useEffect, useMemo } from 'react'
import { useUserId } from '../lib/useUserId'
import { getChannels, getMyChannels, joinChannel, autoJoinDefaults } from '../lib/channels'
import { getProjects, getMyProjects, joinProject, createProject, seedHGDevProject } from '../lib/projects'
import ChannelCard from '../components/ChannelCard'
import ProjectCard from '../components/ProjectCard'
import CreateProjectModal from '../components/CreateProjectModal'

function Channels() {
  const { userId } = useUserId()
  const [allChannels, setAllChannels] = useState([])
  const [myChannels, setMyChannels] = useState([])
  const [projects, setProjects] = useState([])
  const [myProjects, setMyProjects] = useState([])
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    if (!userId) return
    await autoJoinDefaults(userId)
    await seedHGDevProject(userId)
    const [all, mine, allProj, myProj] = await Promise.all([
      getChannels(), getMyChannels(userId), getProjects(), getMyProjects(userId)
    ])
    setAllChannels(all)
    setMyChannels(mine)
    setProjects(allProj)
    setMyProjects(myProj)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [userId])

  const myChannelIds = useMemo(() => new Set(myChannels.map((c) => c.id)), [myChannels])
  const unreadMap = useMemo(() => {
    const m = {}; myChannels.forEach((c) => { m[c.id] = c.unreadCount || 0 }); return m
  }, [myChannels])

  const filtered = useMemo(() => {
    let list = allChannels
    if (tab !== 'all') list = list.filter((c) => c.category === tab)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
    }
    return list
  }, [allChannels, tab, search])

  const handleJoin = async (channelId) => {
    await joinChannel(channelId, userId)
    fetchData()
  }

  const handleJoinProject = async (projectId) => {
    await joinProject(projectId, userId)
    fetchData()
  }

  const handleCreateProject = async (name, slug, description, githubUrl, tags) => {
    const result = await createProject(name, slug, description, githubUrl, tags, userId)
    if (result?.error) return result
    setShowCreateProject(false)
    fetchData()
    return result
  }

  const myProjectIds = useMemo(() => new Set(myProjects.map((p) => p.id)), [myProjects])

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'general', label: 'General' },
    { key: 'topic', label: 'Topics' },
    { key: 'parish', label: 'Parishes' },
    { key: 'course', label: 'Courses' },
  ]

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* === Community Projects (BIG, TOP) === */}
        <div className="mb-12">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-4xl">🚀</span> Community Projects
              </h1>
              <p className="text-gray-400 mt-1">Collaborate on real projects with the community</p>
            </div>
            <button onClick={() => setShowCreateProject(true)}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors shrink-0">
              + New Project
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} isMember={myProjectIds.has(p.id)} onJoin={handleJoinProject} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-gray-700">
              <p className="text-gray-500">No projects yet. Be the first to create one!</p>
            </div>
          )}
        </div>

        {showCreateProject && (
          <CreateProjectModal onClose={() => setShowCreateProject(false)} onCreate={handleCreateProject} />
        )}

        {/* Divider */}
        <div className="border-t border-gray-700 mb-10" />

        {/* === Community Channels === */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Channels</h1>
            <p className="text-gray-400 mt-1">Join conversations and connect with the community</p>
          </div>
        </div>

        {/* My Channels */}
        {myChannels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-gray-400 mb-3">Your Channels</h2>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {myChannels.map((c) => (
                <a key={c.id} href={`/channels/${c.slug}`}
                  className="flex items-center gap-2 px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-lg shrink-0 hover:border-gray-600 transition-colors">
                  <span className="text-sm">{c.icon}</span>
                  <span className={`text-xs ${c.unreadCount > 0 ? 'text-white font-semibold' : 'text-gray-400'}`}>{c.name}</span>
                  {c.unreadCount > 0 && <span className="bg-green-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{c.unreadCount > 9 ? '9+' : c.unreadCount}</span>}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="space-y-3 mb-6">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search channels..."
            className="w-full bg-[#1e293b] text-gray-300 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-600" />
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors shrink-0 ${tab === t.key ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ChannelCard key={c.id} channel={c} isMember={myChannelIds.has(c.id)} unreadCount={unreadMap[c.id] || 0} onJoin={handleJoin} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400">No channels match your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Channels
