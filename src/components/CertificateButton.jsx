import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkAndCreateCertificate } from '../lib/certificate'

function CertificateButton({ courseId, userId, courseProgress }) {
  const navigate = useNavigate()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (courseProgress < 100 || !userId || !courseId) return
    setLoading(true)
    checkAndCreateCertificate(userId, courseId).then((c) => {
      setCert(c)
      setLoading(false)
    })
  }, [courseProgress, userId, courseId])

  if (courseProgress < 100) return null
  if (loading) return <span className="text-xs text-gray-500">Generating certificate...</span>
  if (!cert) return null

  return (
    <button
      onClick={() => navigate(`/certificate/${cert.certificate_number}`)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
        bg-gradient-to-r from-green-600 to-emerald-500 text-white
        hover:from-green-500 hover:to-emerald-400 transition-all
        shadow-lg shadow-green-500/20"
    >
      🏆 View Certificate
    </button>
  )
}

export default CertificateButton
