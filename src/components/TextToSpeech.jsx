import { useState, useEffect, useRef, useCallback } from 'react'

function splitIntoChunks(text) {
  // Split on sentence boundaries to prevent browser cutoff on long text
  const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text]
  const chunks = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > 200) {
      if (current) chunks.push(current.trim())
      current = s
    } else {
      current += s
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks.length > 0 ? chunks : [text]
}

function TextToSpeech({ text, label, size = 'normal' }) {
  const [state, setState] = useState('idle') // idle | playing | paused
  const [speed, setSpeed] = useState(() => {
    try { return parseFloat(localStorage.getItem('tts-speed')) || 1 } catch { return 1 }
  })
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(() => {
    try { return localStorage.getItem('tts-voice') || '' } catch { return '' }
  })
  const [showControls, setShowControls] = useState(false)
  const chunksRef = useRef([])
  const chunkIndexRef = useRef(0)
  const utteranceRef = useRef(null)

  // Check support
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  const synth = window.speechSynthesis

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const v = synth.getVoices().filter((voice) => voice.lang.startsWith('en'))
      setVoices(v)
      if (!selectedVoice && v.length > 0) {
        setSelectedVoice(v[0].name)
      }
    }
    loadVoices()
    synth.addEventListener('voiceschanged', loadVoices)
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices)
      synth.cancel()
    }
  }, [])

  // Cancel on unmount or text change
  useEffect(() => {
    return () => { synth.cancel(); setState('idle') }
  }, [text])

  const getVoice = useCallback(() => {
    return voices.find((v) => v.name === selectedVoice) || voices[0] || null
  }, [voices, selectedVoice])

  const speakChunk = useCallback((index) => {
    if (index >= chunksRef.current.length) {
      setState('idle')
      return
    }
    chunkIndexRef.current = index
    const utt = new SpeechSynthesisUtterance(chunksRef.current[index])
    utt.rate = speed
    const voice = getVoice()
    if (voice) utt.voice = voice
    utt.onend = () => speakChunk(index + 1)
    utt.onerror = (e) => { if (e.error !== 'canceled') setState('idle') }
    utteranceRef.current = utt
    synth.speak(utt)
  }, [speed, getVoice])

  const handlePlay = () => {
    if (state === 'idle') {
      synth.cancel()
      chunksRef.current = splitIntoChunks(text)
      chunkIndexRef.current = 0
      setState('playing')
      speakChunk(0)
    } else if (state === 'playing') {
      synth.pause()
      setState('paused')
    } else if (state === 'paused') {
      synth.resume()
      setState('playing')
    }
  }

  const handleStop = () => {
    synth.cancel()
    setState('idle')
  }

  const handleSpeedChange = (s) => {
    setSpeed(s)
    try { localStorage.setItem('tts-speed', s.toString()) } catch {}
    if (state === 'playing') {
      // Restart from current chunk with new speed
      synth.cancel()
      const idx = chunkIndexRef.current
      setTimeout(() => {
        setState('playing')
        const utt = new SpeechSynthesisUtterance(chunksRef.current[idx])
        utt.rate = s
        const voice = getVoice()
        if (voice) utt.voice = voice
        utt.onend = () => speakChunk(idx + 1)
        utt.onerror = () => setState('idle')
        utteranceRef.current = utt
        synth.speak(utt)
      }, 50)
    }
  }

  const handleVoiceChange = (name) => {
    setSelectedVoice(name)
    try { localStorage.setItem('tts-voice', name) } catch {}
  }

  const isSmall = size === 'small'
  const btnBase = `inline-flex items-center gap-1.5 rounded-lg border transition-colors font-medium ${
    isSmall ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
  }`

  const playLabel = state === 'idle' ? (label || 'Listen') : state === 'playing' ? 'Pause' : 'Resume'
  const playIcon = state === 'playing' ? '⏸' : '▶'

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <button
        onClick={handlePlay}
        aria-label={playLabel}
        className={`${btnBase} ${
          state === 'playing'
            ? 'border-green-500 text-green-400 bg-green-500/10 tts-pulse'
            : state === 'paused'
            ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
            : 'border-gray-700 text-gray-400 hover:border-green-500/50 hover:text-green-400'
        }`}
      >
        <span>{playIcon}</span>
        {!isSmall && <span>{playLabel}</span>}
      </button>

      {state !== 'idle' && (
        <button
          onClick={handleStop}
          aria-label="Stop"
          className={`${btnBase} border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500`}
        >
          ■{!isSmall && <span>Stop</span>}
        </button>
      )}

      <button
        onClick={() => setShowControls(!showControls)}
        aria-label="Speech settings"
        className="text-gray-600 hover:text-gray-400 transition-colors p-1"
      >
        <svg className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {showControls && (
        <div className="flex items-center gap-2 flex-wrap animate-fade-in">
          <div className="flex items-center gap-1">
            {[0.75, 1, 1.25, 1.5].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-1.5 py-0.5 text-xs rounded transition-colors ${
                  speed === s
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
          {voices.length > 1 && (
            <select
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="bg-[#0f172a] border border-gray-700 text-gray-400 text-xs rounded px-1.5 py-0.5 focus:outline-none focus:border-green-500 max-w-[120px]"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>{v.name.split(' ').slice(0, 2).join(' ')}</option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  )
}

export default TextToSpeech
