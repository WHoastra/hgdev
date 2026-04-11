import { Link } from 'react-router-dom'

function Landing() {
  const scrollToMission = (e) => {
    e.preventDefault()
    document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="font-heading text-xl font-bold text-green-500">
            HGDev
          </Link>
          <Link
            to="/courses"
            className="text-sm font-medium text-green-400 border border-green-500/50 rounded-full px-4 py-1.5 hover:bg-green-500/10 transition-colors"
          >
            Join the movement
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 overflow-hidden">
        <div className="hero-glow" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block border border-green-500/40 text-green-400 text-xs font-medium px-3 py-1 rounded-full mb-8 anim-fade-down" style={{ animationDelay: '0s' }}>
            Southern Louisiana
          </span>
          <h1 className="font-heading font-extrabold leading-[1.05] mb-6 anim-fade-down" style={{ animationDelay: '0.1s', fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}>
            They're not coming.<br />
            So we're building<br />
            <span className="text-green-500">our own.</span>
          </h1>
          <p className="text-[#94a3b8] text-lg max-w-[600px] mx-auto mb-10 leading-relaxed anim-fade-down" style={{ animationDelay: '0.2s' }}>
            Southern Louisiana doesn't need to wait for tech companies to move here. We're growing our own AI developers, our own builders, our own future — from the ground up, together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 anim-fade-down" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/courses"
              className="px-7 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors text-sm"
            >
              Start building
            </Link>
            <a
              href="#mission"
              onClick={scrollToMission}
              className="px-7 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-gray-400 hover:text-white transition-colors text-sm"
            >
              Read our mission
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 sm:gap-14 anim-fade-up" style={{ animationDelay: '0.5s' }}>
            <Stat number="6" label="Free courses" />
            <div className="w-px h-10 bg-gray-700" />
            <Stat number="50+" label="Hands-on lessons" />
            <div className="w-px h-10 bg-gray-700" />
            <Stat number="100%" label="Community powered" />
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section id="mission" className="py-20 sm:py-28 px-6">
        <div className="max-w-[700px] mx-auto">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-12 text-center">Why we exist</h2>
          <div className="space-y-6 text-[#94a3b8] text-lg leading-[1.8]">
            <p>The tech industry has a geography problem. The jobs, the mentors, the networks — they cluster in the same few cities. If you didn't grow up near one of them, you're supposed to move. We think that's broken.</p>
            <p>HGDev exists because we believe the next generation of AI builders is already here in Southern Louisiana. They don't need to leave. They need access — to knowledge, to each other, and to someone who believes they can do this.</p>
            <p>This isn't charity. This is investment. When we build developers here, they build companies here. They hire here. They mentor the next wave. That's how you change a region — not by importing talent, but by growing it.</p>
          </div>
          <div className="border-t border-gray-800 mt-14 pt-10">
            <blockquote className="font-heading text-xl sm:text-2xl font-bold text-white text-center leading-snug">
              "First principles: don't ask 'who's coming to save us.' Ask 'what can we build with what we have.'"
            </blockquote>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">What we believe</h2>
            <p className="text-[#94a3b8]">The principles behind everything we build.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <ValueCard symbol="△" title="First principles thinking" description="Don't memorize answers. Learn to break any problem down to its foundation and build back up. That's the skill that never becomes obsolete." />
            <ValueCard symbol="♡" title="Humanity first" description="Technology is a tool, not a destination. We build AI that serves people, solves real problems, and makes our community stronger." />
            <ValueCard symbol="⬡" title="Community is the network" description="Forget LinkedIn. Your network is the person next to you learning the same thing. We grow together, teach each other, and open doors for each other." />
            <ValueCard symbol="⌂" title="Build where you are" description="You don't need to move to Austin or San Francisco. The internet doesn't care about your zip code. Build from right here and let the work speak." />
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">The curriculum</h2>
            <p className="text-[#94a3b8]">From your first prompt to your first production app.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CurriculumCard
              badge="Prompt Engineering"
              badgeColor="bg-green-900 text-green-300"
              title="Start talking to AI"
              description="Learn how to think with AI. Write prompts that solve real problems — not toy examples. This is the foundational skill of the next decade."
            />
            <CurriculumCard
              badge="Development"
              badgeColor="bg-blue-900 text-blue-300"
              title="Build real applications"
              description="APIs, databases, deployment. Build apps powered by Claude that actually work in the real world. Ship something you're proud of."
            />
            <CurriculumCard
              badge="AI Safety & Ethics"
              badgeColor="bg-amber-900 text-amber-300"
              title="Think about what matters"
              description="Power comes with responsibility. Learn to build AI that's fair, transparent, and actually helpful. The world needs builders who think about this."
            />
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-[600px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">The journey</h2>
            <p className="text-[#94a3b8]">Every expert started exactly where you are.</p>
          </div>
          <div className="space-y-0">
            <TimelineStep step="01" title="Show up curious" description="You don't need experience. You don't need a CS degree. You need a laptop, internet access, and the willingness to try. That's it." />
            <TimelineStep step="02" title="Learn by building" description="Every lesson has you building something real. Not reading theory — doing the work. You'll struggle, you'll debug, you'll figure it out. That's the process." />
            <TimelineStep step="03" title="Connect with your people" description="Meet other builders in Southern Louisiana who are on the same journey. Study together, build together, push each other. Your network starts here." />
            <TimelineStep step="04" title="Become the person who stays" description="Get certified. Build your portfolio. Start freelancing, get hired, or launch something of your own. Then reach back and help the next person coming up behind you." last />
          </div>
        </div>
      </section>

      {/* COMMUNITY */}
      <section className="py-20 sm:py-28 px-6 bg-[#0c1322]">
        <div className="max-w-[650px] mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-8">This is bigger than code</h2>
          <p className="text-[#94a3b8] text-lg leading-[1.8] mb-14">
            Every developer we grow here is a job creator, a mentor, a proof of concept. We're not just teaching people to code. We're building an ecosystem — a Southern Louisiana tech community that didn't exist before, built by the people who refused to wait for it.
          </p>
          <div className="flex items-center justify-center gap-10 sm:gap-16">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Built in</p>
              <p className="font-heading font-bold text-green-500">Houma, LA</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">For</p>
              <p className="font-heading font-bold text-green-500">Southern Louisiana</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">By</p>
              <p className="font-heading font-bold text-green-500">The community</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 sm:py-32 px-6 text-center">
        <h2 className="font-heading font-extrabold text-white mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
          The future doesn't get <span className="text-green-500">imported.</span><br />
          It gets <span className="text-green-500">built.</span>
        </h2>
        <p className="text-[#94a3b8] text-lg mb-10">
          No tuition. No gatekeepers. No excuses. Just the work.
        </p>
        <Link
          to="/courses"
          className="inline-block px-8 py-3.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors text-sm"
        >
          Start your first lesson
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1e293b] py-10 px-6 text-center">
        <p className="text-sm text-gray-500 mb-1">HGDev &mdash; Homegrown Developers &copy; 2026</p>
        <p className="text-xs text-gray-600 mb-1">Southern Louisiana</p>
        <p className="text-xs text-gray-600">Building local talent, one lesson at a time.</p>
      </footer>
    </div>
  )
}

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <p className="font-heading text-2xl sm:text-3xl font-bold text-green-500">{number}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function ValueCard({ symbol, title, description }) {
  return (
    <div className="group bg-[#111827] border border-gray-800 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-1 hover:border-t-green-500 hover:border-t-2">
      <div className="w-[52px] h-[52px] rounded-xl bg-green-500/15 flex items-center justify-center text-green-400 text-xl mb-5">
        {symbol}
      </div>
      <h3 className="font-heading font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function CurriculumCard({ badge, badgeColor, title, description }) {
  return (
    <div className="group bg-[#111827] border border-gray-800 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-1 hover:border-t-green-500 hover:border-t-2">
      <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full mb-4 ${badgeColor}`}>
        {badge}
      </span>
      <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function TimelineStep({ step, title, description, last }) {
  return (
    <div className="relative pl-10 pb-10">
      {/* Connector line */}
      {!last && <div className="absolute left-[11px] top-[28px] bottom-0 w-px bg-gray-800" />}
      {/* Dot */}
      <div className="absolute left-0 top-[6px] w-[23px] h-[23px] rounded-full border-2 border-green-500 bg-[#0f172a] flex items-center justify-center">
        <div className="w-[9px] h-[9px] rounded-full bg-green-500 timeline-pulse" />
      </div>
      <p className="text-xs font-medium text-green-500 uppercase tracking-wider mb-1">Step {step}</p>
      <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

export default Landing
