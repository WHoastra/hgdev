import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCertificateByNumber } from '../lib/certificate'
import Certificate from '../components/Certificate'

function CertificateView() {
  const { certificateNumber } = useParams()
  const [cert, setCert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const certRef = useRef(null)

  useEffect(() => {
    async function fetch() {
      const data = await getCertificateByNumber(certificateNumber)
      if (data) setCert(data)
      else setNotFound(true)
      setLoading(false)
    }
    fetch()
  }, [certificateNumber])

  const handleDownloadPdf = async () => {
    const el = document.getElementById('certificate-content')
    if (!el) return

    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#0a0e17', useCORS: true })
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'in', format: 'letter' })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`HGDev-Certificate-${certificateNumber}.pdf`)
  }

  const handlePrint = () => window.print()

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-2xl text-gray-400 mb-4">Certificate not found</p>
          <p className="text-gray-500 text-sm mb-6">This certificate number doesn't exist in our records. Please check the number and try again.</p>
          <Link to="/" className="text-green-400 hover:text-green-300 text-sm">Back to HGDev</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] py-10 px-4 print:p-0 print:bg-white">
      <div className="max-w-[950px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8 print:hidden">
          <Link to="/" className="font-heading text-xl font-bold text-green-500">HGDev</Link>
          <h1 className="text-2xl font-bold text-white mt-4">Certificate of Completion 🎉</h1>
          <p className="text-gray-500 text-sm mt-1">Verified credential from HGDev & Whoastra Labs</p>
        </div>

        {/* Certificate */}
        <div ref={certRef}>
          <Certificate certificate={cert} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 mt-8 print:hidden">
          <button onClick={handleDownloadPdf}
            className="px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-500 transition-colors">
            Download PDF
          </button>
          <button onClick={handlePrint}
            className="px-5 py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:border-gray-500 transition-colors">
            Print
          </button>
          <button onClick={handleShare}
            className="px-5 py-2.5 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:border-gray-500 transition-colors">
            {copied ? 'Link copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CertificateView
