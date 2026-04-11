import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import SkillTag from './SkillTag'

const CITIES = ['Houma','Thibodaux','Morgan City','New Iberia','Lafayette','Lake Charles','Baton Rouge','Gonzales','Hammond','Slidell','Covington','Mandeville','Raceland','Larose','Galliano','Cut Off','Golden Meadow','Lockport','Mathews','Chauvin','Dulac','Montegut','Schriever','Gray','Bayou Cane','Terrebonne']
const PARISHES = ['Terrebonne','Lafourche','St. Mary','Iberia','Lafayette','Calcasieu','East Baton Rouge','Ascension','Tangipahoa','St. Tammany','Assumption','St. Martin','Vermilion','Acadia','St. Landry','Jefferson','Orleans','Plaquemines','St. Bernard','St. Charles','St. James','St. John the Baptist','Other']
const AGE_RANGES = [{v:'under_16',l:'Under 16'},{v:'16_18',l:'16-18'},{v:'19_24',l:'19-24'},{v:'25_34',l:'25-34'},{v:'35_plus',l:'35+'}]
const EXP_LEVELS = [
  {v:'brand_new',l:'Brand New',d:"I've never written code before"},
  {v:'some_experience',l:'Some Experience',d:"I've done a few tutorials or courses"},
  {v:'self_taught',l:'Self-Taught',d:"I've been learning on my own for a while"},
  {v:'student',l:'Student',d:"I'm currently studying CS or a related field"},
  {v:'working_professional',l:'Working Professional',d:'I write code for my job'},
  {v:'career_changer',l:'Career Changer',d:"I'm transitioning from another field"},
]
const GOALS = ['Learn to code','Build AI applications','Get certified','Find a tech job','Start freelancing','Build a startup','Switch careers','Help my current business','Mentor others','Build my portfolio','Connect with other developers','Learn for fun']
const INTERESTS = ['Prompt Engineering','Web Development','Mobile Apps','AI / Machine Learning','Data Analysis','Python','JavaScript','React','Databases','API Development','DevOps / Deployment','UI/UX Design','Cybersecurity','Game Development','Automation','Open Source']
const SKILL_SUGGESTIONS = ['Python','JavaScript','TypeScript','React','Vue','Angular','Node.js','HTML','CSS','Tailwind','SQL','PostgreSQL','MongoDB','Git','Docker','AWS','Supabase','Firebase','REST APIs','GraphQL','Claude API','Prompt Engineering','Linux','Bash','VS Code','Figma','Photoshop','Excel','Data Analysis','Machine Learning','ChatGPT','Claude','MCP','Cursor','Claude Code']
const AVAILABILITIES = ['Weekday mornings','Weekday evenings','Weekends','Flexible schedule','Limited availability']
const CONTACT_PREFS = [{v:'in_app',l:'In-app messaging'},{v:'email',l:'Email'},{v:'discord',l:'Discord'},{v:'slack',l:'Slack'}]

function calcCompletion(p) {
  let filled = 0; let total = 8
  if (p.display_name) filled++
  if (p.bio) filled++
  if (p.location) filled++
  if (p.parish) filled++
  if (p.experience_level) filled++
  if (p.goals?.length > 0) filled++
  if (p.interests?.length > 0) filled++
  if (p.skills?.length > 0) filled++
  return Math.round((filled / total) * 100)
}

function ProfileForm({ profile, userId, onSaved }) {
  const [form, setForm] = useState({ ...profile })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [skillInput, setSkillInput] = useState('')
  const [skillLevel, setSkillLevel] = useState('learning')
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false)
  const [citySuggestions, setCitySuggestions] = useState([])
  const saveTimer = useRef(null)
  const msgTimer = useRef(null)

  const completion = calcCompletion(form)

  const update = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave({ ...form, [field]: value }), 2000)
  }, [form])

  const autoSave = async (data) => {
    setSaving(true)
    const isComplete = calcCompletion(data) >= 100
    const payload = {
      display_name: data.display_name || null,
      bio: data.bio || null,
      location: data.location || null,
      parish: data.parish || null,
      age_range: data.age_range || null,
      experience_level: data.experience_level || null,
      goals: data.goals || [],
      interests: data.interests || [],
      skills: data.skills || [],
      availability: data.availability || null,
      open_to_mentor: data.open_to_mentor || false,
      looking_for_mentor: data.looking_for_mentor || false,
      open_to_collaborate: data.open_to_collaborate || false,
      contact_preference: data.contact_preference || null,
      contact_info: data.contact_info || null,
      github_url: data.github_url || null,
      linkedin_url: data.linkedin_url || null,
      portfolio_url: data.portfolio_url || null,
      is_public: data.is_public !== false,
      profile_complete: isComplete,
      updated_at: new Date().toISOString(),
    }
    const { error } = await supabase.from('user_profiles').update(payload).eq('user_id', userId)
    setSaving(false)
    if (error) {
      showMsg('Error saving')
    } else {
      showMsg('Saved')
      if (onSaved) onSaved()
    }
  }

  const showMsg = (msg) => {
    setSaveMsg(msg)
    if (msgTimer.current) clearTimeout(msgTimer.current)
    msgTimer.current = setTimeout(() => setSaveMsg(null), 2000)
  }

  const handleSave = async () => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    await autoSave(form)
  }

  const toggleArrayItem = (field, item) => {
    const arr = form[field] || []
    const next = arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
    update(field, next)
  }

  const addSkill = () => {
    if (!skillInput.trim() || (form.skills || []).length >= 20) return
    if ((form.skills || []).some((s) => s.name.toLowerCase() === skillInput.trim().toLowerCase())) return
    const newSkills = [...(form.skills || []), { name: skillInput.trim(), level: skillLevel }]
    update('skills', newSkills)
    setSkillInput('')
    setShowSkillSuggestions(false)
  }

  const removeSkill = (name) => {
    update('skills', (form.skills || []).filter((s) => s.name !== name))
  }

  const filteredSuggestions = skillInput.length > 0
    ? SKILL_SUGGESTIONS.filter((s) => s.toLowerCase().includes(skillInput.toLowerCase()) && !(form.skills || []).some((sk) => sk.name === s))
    : []

  const inputClass = 'w-full bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors placeholder-gray-600'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'
  const sectionClass = 'mb-10'

  return (
    <div>
      {/* Completion bar */}
      <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-4 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-300">Profile {completion}% complete</span>
          <span className="text-xs text-gray-500">{saving ? 'Saving...' : saveMsg ? `${saveMsg} ✓` : ''}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </div>

      {/* BASICS */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Basics</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Display Name *</label>
            <input className={inputClass} value={form.display_name || ''} onChange={(e) => update('display_name', e.target.value)} placeholder="How you want to be known" />
          </div>
          <div>
            <label className={labelClass}>Bio</label>
            <textarea className={`${inputClass} resize-none`} rows={3} maxLength={500} value={form.bio || ''} onChange={(e) => update('bio', e.target.value)} placeholder="Tell the community about yourself. What drives you? What are you building?" />
            <p className="text-xs text-gray-600 mt-1">{(form.bio || '').length}/500</p>
          </div>
          <div>
            <label className={labelClass}>Age Range</label>
            <select className={inputClass} value={form.age_range || ''} onChange={(e) => update('age_range', e.target.value)}>
              <option value="">Select...</option>
              {AGE_RANGES.map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* LOCATION */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className={labelClass}>City</label>
            <input className={inputClass} value={form.location || ''} onChange={(e) => {
              update('location', e.target.value)
              setCitySuggestions(e.target.value.length > 0 ? CITIES.filter((c) => c.toLowerCase().startsWith(e.target.value.toLowerCase())) : [])
            }} onBlur={() => setTimeout(() => setCitySuggestions([]), 200)} placeholder="Your city" />
            {citySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {citySuggestions.map((c) => (
                  <button key={c} onMouseDown={() => { update('location', c); setCitySuggestions([]) }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50">{c}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Parish</label>
            <select className={inputClass} value={form.parish || ''} onChange={(e) => update('parish', e.target.value)}>
              <option value="">Select parish...</option>
              {PARISHES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* EXPERIENCE & GOALS */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Experience & Goals</h3>
        <label className={labelClass}>Experience Level</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {EXP_LEVELS.map((e) => (
            <button key={e.v} onClick={() => update('experience_level', e.v)}
              className={`text-left p-3 rounded-lg border transition-colors ${form.experience_level === e.v ? 'border-green-500 bg-green-500/10' : 'border-gray-700 hover:border-gray-500'}`}>
              <p className="text-sm font-medium text-white">{e.l}</p>
              <p className="text-xs text-gray-500 mt-0.5">{e.d}</p>
            </button>
          ))}
        </div>

        <label className={labelClass}>Goals</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {GOALS.map((g) => (
            <button key={g} onClick={() => toggleArrayItem('goals', g)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${(form.goals || []).includes(g) ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {g}
            </button>
          ))}
        </div>

        <label className={labelClass}>Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button key={i} onClick={() => toggleArrayItem('interests', i)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${(form.interests || []).includes(i) ? 'border-green-500 bg-green-500/15 text-green-400' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* SKILLS */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Skills</h3>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <input className={inputClass} value={skillInput} onChange={(e) => { setSkillInput(e.target.value); setShowSkillSuggestions(true) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
              placeholder="Type a skill..." />
            {showSkillSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-[#1e293b] border border-gray-700 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                {filteredSuggestions.slice(0, 8).map((s) => (
                  <button key={s} onMouseDown={() => { setSkillInput(s); setShowSkillSuggestions(false) }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700/50">{s}</button>
                ))}
              </div>
            )}
          </div>
          <select className="bg-[#0f172a] text-gray-300 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500" value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)}>
            <option value="learning">Learning</option>
            <option value="comfortable">Comfortable</option>
            <option value="confident">Confident</option>
          </select>
          <button onClick={addSkill} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-500 transition-colors shrink-0">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(form.skills || []).map((s) => (
            <SkillTag key={s.name} name={s.name} level={s.level} removable onRemove={() => removeSkill(s.name)} />
          ))}
        </div>
        {(form.skills || []).length > 0 && <p className="text-xs text-gray-600 mt-2">{(form.skills || []).length}/20 skills</p>}
      </div>

      {/* COMMUNITY */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Community & Networking</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className={labelClass}>Availability</label>
            <select className={inputClass} value={form.availability || ''} onChange={(e) => update('availability', e.target.value)}>
              <option value="">Select...</option>
              {AVAILABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          {[
            { field: 'open_to_mentor', label: "I'm open to mentoring others", desc: 'Help newer learners by sharing your knowledge and experience' },
            { field: 'looking_for_mentor', label: "I'm looking for a mentor", desc: 'Get guidance from someone further along in their journey' },
            { field: 'open_to_collaborate', label: "I'm open to collaborating on projects", desc: 'Build things together with other developers' },
          ].map(({ field, label, desc }) => (
            <label key={field} className="flex items-start gap-3 cursor-pointer">
              <div className="relative mt-0.5">
                <input type="checkbox" checked={form[field] || false} onChange={(e) => update(field, e.target.checked)} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
              </div>
              <div>
                <p className="text-sm text-gray-300">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Contact Preference</label>
            <select className={inputClass} value={form.contact_preference || ''} onChange={(e) => update('contact_preference', e.target.value)}>
              <option value="">Select...</option>
              {CONTACT_PREFS.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Contact Info</label>
            <input className={inputClass} value={form.contact_info || ''} onChange={(e) => update('contact_info', e.target.value)}
              placeholder={form.contact_preference === 'discord' ? 'Your Discord handle' : form.contact_preference === 'slack' ? 'Your Slack handle' : 'Your email'} />
            <p className="text-xs text-gray-600 mt-1">Only shared with people you connect with</p>
          </div>
        </div>
      </div>

      {/* LINKS */}
      <div className={sectionClass}>
        <h3 className="text-lg font-semibold text-white mb-4">Links</h3>
        <div className="space-y-4">
          <div><label className={labelClass}>GitHub</label><input className={inputClass} value={form.github_url || ''} onChange={(e) => update('github_url', e.target.value)} placeholder="https://github.com/yourusername" /></div>
          <div><label className={labelClass}>LinkedIn</label><input className={inputClass} value={form.linkedin_url || ''} onChange={(e) => update('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourusername" /></div>
          <div><label className={labelClass}>Portfolio</label><input className={inputClass} value={form.portfolio_url || ''} onChange={(e) => update('portfolio_url', e.target.value)} placeholder="https://yoursite.com" /></div>
        </div>
      </div>

      {/* PRIVACY */}
      <div className={sectionClass}>
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5">
            <input type="checkbox" checked={form.is_public !== false} onChange={(e) => update('is_public', e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-700 rounded-full peer peer-checked:bg-green-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
          </div>
          <div>
            <p className="text-sm text-gray-300">Make my profile visible to other HGDev members</p>
            <p className="text-xs text-gray-500">When enabled, other learners can find you by skills and location. Your contact info is always private until you choose to share it.</p>
          </div>
        </label>
      </div>

      <button onClick={handleSave} className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors">
        Save Profile
      </button>
    </div>
  )
}

export default ProfileForm
