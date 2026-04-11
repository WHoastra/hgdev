const diffBadge = { beginner: 'bg-green-900 text-green-300', intermediate: 'bg-yellow-900 text-yellow-300', advanced: 'bg-red-900 text-red-300' }

function Certificate({ certificate, forPrint }) {
  const date = new Date(certificate.issued_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div id="certificate-content" className={`relative mx-auto ${forPrint ? '' : 'max-w-[900px]'}`} style={{ aspectRatio: '11/8.5', background: '#0a0e17' }}>
      {/* Outer border */}
      <div className="absolute inset-3 border border-green-500/40 rounded-sm" />
      <div className="absolute inset-5 border-2 border-green-500/60 rounded-sm" />

      {/* Corner accents */}
      {['top-7 left-7', 'top-7 right-7 rotate-90', 'bottom-7 left-7 -rotate-90', 'bottom-7 right-7 rotate-180'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-6 h-6`}>
          <div className="absolute top-0 left-0 w-full h-px bg-green-500/50" />
          <div className="absolute top-0 left-0 h-full w-px bg-green-500/50" />
        </div>
      ))}

      {/* Content */}
      <div className="absolute inset-8 flex flex-col items-center justify-between py-6 px-8 text-center">
        {/* Partner logos */}
        <div>
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="font-heading text-xl font-bold text-green-500">HGDev</span>
            <span className="text-gray-600">·</span>
            <span className="text-xl font-medium text-white">Whoastra Labs</span>
          </div>
          <p className="text-[10px] text-gray-500 italic">Partners in Building Southern Louisiana's Tech Future</p>
          <div className="w-48 h-px bg-green-500/30 mx-auto mt-4 relative">
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 border border-green-500/50 rotate-45" />
          </div>
        </div>

        {/* Title */}
        <div>
          <p className="text-gray-400 text-xs tracking-[0.3em] uppercase mb-1">Certificate</p>
          <p className="font-heading text-3xl font-bold text-white">of Completion</p>
        </div>

        {/* Recipient */}
        <div>
          <p className="text-gray-400 text-sm italic mb-3">This certifies that</p>
          <p className="font-heading text-4xl font-bold text-green-500 mb-1">{certificate.recipient_name}</p>
          <div className="w-64 h-px bg-green-500/40 mx-auto" />
        </div>

        {/* Achievement */}
        <div>
          <p className="text-gray-400 text-sm mb-2">has successfully completed all modules and lessons in</p>
          <p className="font-heading text-2xl font-bold text-white mb-2">{certificate.course_title}</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            {certificate.course_category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">{certificate.course_category}</span>}
            {certificate.course_difficulty && <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffBadge[certificate.course_difficulty] || 'bg-gray-800 text-gray-300'}`}>{certificate.course_difficulty}</span>}
            <span className="text-[10px] text-gray-500">{certificate.total_modules} modules · {certificate.total_lessons} lessons</span>
          </div>
          <p className="text-gray-500 text-xs">through the HGDev — Homegrown Developers training program</p>
        </div>

        {/* Date + Number + Signatures */}
        <div className="w-full">
          <div className="flex items-end justify-between mb-6">
            <div className="text-left">
              <p className="text-[10px] text-gray-500 mb-1">Date Issued</p>
              <p className="text-sm text-white">{date}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500 mb-1">Certificate No.</p>
              <p className="text-sm text-white font-mono">{certificate.certificate_number}</p>
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div className="text-center w-40">
              <div className="w-full h-px bg-gray-700 mb-1" />
              <p className="text-xs text-gray-400">HGDev Program</p>
              <p className="text-[10px] text-gray-600">Homegrown Developers</p>
            </div>
            <div className="text-center w-40">
              <div className="w-full h-px bg-gray-700 mb-1" />
              <p className="text-xs text-gray-400">Whoastra Labs</p>
              <p className="text-[10px] text-gray-600">Technology Partner</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div>
          <div className="w-full h-px bg-green-500/30 mb-2" />
          <p className="text-[9px] text-gray-600">Verify at hgdev-xi.vercel.app/certificate/{certificate.certificate_number}</p>
          <p className="text-[9px] text-gray-600">Building local talent, one lesson at a time · Southern Louisiana</p>
        </div>
      </div>
    </div>
  )
}

export default Certificate
