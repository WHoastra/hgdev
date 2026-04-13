import { Link } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

function Landing() {
  let isSignedIn = false
  try {
    const result = useUser()
    isSignedIn = result.isSignedIn
  } catch {}
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
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Features</a>
            <a href="#mission" onClick={scrollToMission} className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Mission</a>
            {isSignedIn ? (
              <Link to="/courses" className="text-sm font-medium text-green-400 border border-green-500/50 rounded-full px-4 py-1.5 hover:bg-green-500/10 transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link to="/sign-in" className="text-sm font-medium text-green-400 border border-green-500/50 rounded-full px-4 py-1.5 hover:bg-green-500/10 transition-colors">
                Sign In
              </Link>
            )}
          </div>
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
            Learn AI development. Build real projects. Grow with a community of developers in Southern Louisiana. Free courses, hands-on tools, and everything you need to go from curious to capable.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 anim-fade-down" style={{ animationDelay: '0.3s' }}>
            <Link
              to={isSignedIn ? '/courses' : '/sign-up'}
              className="px-7 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors text-sm"
            >
              {isSignedIn ? 'Go to your dashboard' : 'Start building — it\'s free'}
            </Link>
            <a
              href="#features"
              className="px-7 py-3 border border-gray-600 text-gray-300 font-medium rounded-lg hover:border-gray-400 hover:text-white transition-colors text-sm"
            >
              See what's inside
            </a>
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-14 flex-wrap anim-fade-up" style={{ animationDelay: '0.5s' }}>
            <Stat number="10+" label="Free courses" />
            <div className="w-px h-10 bg-gray-700 hidden sm:block" />
            <Stat number="130+" label="Hands-on lessons" />
            <div className="w-px h-10 bg-gray-700 hidden sm:block" />
            <Stat number="AI" label="Personal coach" />
            <div className="w-px h-10 bg-gray-700 hidden sm:block" />
            <Stat number="100%" label="Free forever" />
          </div>
        </div>
      </section>

      {/* FEATURES OVERVIEW */}
      <section id="features" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">Everything you need to become a developer</h2>
            <p className="text-[#94a3b8] max-w-[550px] mx-auto">Not just courses. A complete platform for learning, building, and growing with a real community.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon="📚"
              title="Structured Courses"
              description="From prompt engineering to full-stack development. Each course has modules, lessons, quizzes, and flashcards to lock in what you learn."
              color="green"
            />
            <FeatureCard
              icon="🤖"
              title="AI Coach"
              description="A personal AI tutor that knows your current lesson. Ask questions, get unstuck, and deepen your understanding — right inside every page."
              color="blue"
            />
            <FeatureCard
              icon="🚀"
              title="Community Projects"
              description="Create or join real collaborative projects. Assign tasks, track progress on a kanban board, and build your portfolio with other developers."
              color="purple"
            />
            <FeatureCard
              icon="💬"
              title="Community Channels"
              description="Topic-based chat channels for discussions, questions, and connecting with other learners. Share images, reply to messages, and build relationships."
              color="orange"
            />
            <FeatureCard
              icon="🏆"
              title="Badges & Certificates"
              description="Earn badges as you hit milestones. Complete a course and get a shareable certificate to prove your skills to employers."
              color="yellow"
            />
            <FeatureCard
              icon="🗳️"
              title="Project Voting"
              description="Project founders can create polls so the community votes on what features to build next. Your voice shapes real projects."
              color="pink"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - EXPANDED */}
      <section className="py-20 sm:py-28 px-6 bg-[#0c1322]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">How it works</h2>
            <p className="text-[#94a3b8]">From zero to building real projects — here's the path.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StepCard number="01" title="Learn the fundamentals" description="Start with beginner courses: terminal, Git, prompt engineering. Each lesson is hands-on with quizzes and flashcards to reinforce what you learn." />
            <StepCard number="02" title="Get help from AI" description="Every page has an AI coach that knows your context. Stuck on a lesson? Ask it. Working through a quiz? It can guide you. You're never alone." />
            <StepCard number="03" title="Join the community" description="Connect in topic channels, DM other learners, and find your people. Southern Louisiana developers building together — from Houma to Lafayette." />
            <StepCard number="04" title="Build real projects" description="Once you finish beginner courses, create or join community projects. Get assigned tasks, collaborate on GitHub, and ship something real." />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <CurriculumCard badge="Beginner" badgeColor="bg-green-900 text-green-300" title="Terminal & Command Line" description="Master the command line from scratch. Navigate files, run commands, and set up your development environment like a pro." />
            <CurriculumCard badge="Beginner" badgeColor="bg-green-900 text-green-300" title="Git & GitHub Essentials" description="Version control, branching, pull requests — the collaboration skills every developer needs. Build your GitHub identity." />
            <CurriculumCard badge="Beginner" badgeColor="bg-green-900 text-green-300" title="Prompt Engineering" description="Learn how to think with AI. Write prompts that solve real problems — the foundational skill of the next decade." />
            <CurriculumCard badge="Intermediate" badgeColor="bg-blue-900 text-blue-300" title="Claude API Development" description="Build real applications powered by Claude. APIs, tool use, function calling — ship something that actually works." />
            <CurriculumCard badge="Intermediate" badgeColor="bg-blue-900 text-blue-300" title="AI Agents & MCP" description="Build autonomous AI agents. Learn the Model Context Protocol and advanced patterns for multi-step AI workflows." />
            <CurriculumCard badge="Beginner" badgeColor="bg-amber-900 text-amber-300" title="AI Safety & Ethics" description="Power comes with responsibility. Build AI that's fair, transparent, and actually helpful." />
          </div>
        </div>
      </section>

      {/* COMMUNITY PROJECTS SHOWCASE */}
      <section className="py-20 sm:py-28 px-6 bg-[#0c1322]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-3">Build together, not alone</h2>
            <p className="text-[#94a3b8] max-w-[550px] mx-auto">Community Projects let you collaborate on real software with other developers. It's the closest thing to a job before you have one.</p>
          </div>
          <div className="bg-[#1e293b] border border-gray-700 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🚀</span>
              <div>
                <h3 className="text-lg font-bold text-white">Community Projects include:</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <ProjectFeature icon="📋" text="Kanban task board — Open, In Progress, Review, Done" />
              <ProjectFeature icon="👥" text="Team members with founder, admin, and member roles" />
              <ProjectFeature icon="🔗" text="GitHub integration — stars, forks, language auto-synced" />
              <ProjectFeature icon="🗳️" text="Polls to vote on features and direction" />
              <ProjectFeature icon="💬" text="Discussion threads with image and video uploads" />
              <ProjectFeature icon="📌" text="Task assignment — founders assign work to members" />
            </div>
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
      <section className="py-20 sm:py-28 px-6 bg-[#0c1322]">
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

      {/* PLATFORM STATS / SOCIAL PROOF */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-14">Built for real learning</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <BigStat number="10+" label="Courses" sub="Beginner to advanced" />
            <BigStat number="130+" label="Lessons" sub="Hands-on, practical" />
            <BigStat number="24/7" label="AI Coach" sub="Always available" />
            <BigStat number="0" label="Cost" sub="Free forever" prefix="$" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 sm:py-32 px-6 text-center bg-[#0c1322]">
        <h2 className="font-heading font-extrabold text-white mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}>
          The future doesn't get <span className="text-green-500">imported.</span><br />
          It gets <span className="text-green-500">built.</span>
        </h2>
        <p className="text-[#94a3b8] text-lg mb-4 max-w-[500px] mx-auto">
          Courses. Projects. Community. AI coaching. Everything you need — nothing you have to pay for.
        </p>
        <p className="text-gray-600 text-sm mb-10">
          No tuition. No gatekeepers. No excuses. Just the work.
        </p>
        <Link
          to={isSignedIn ? '/courses' : '/sign-up'}
          className="inline-block px-8 py-3.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-500 transition-colors text-sm"
        >
          {isSignedIn ? 'Go to your dashboard' : 'Start your first lesson'}
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1e293b] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-500 mb-1">HGDev &mdash; Homegrown Developers &copy; 2026</p>
            <p className="text-xs text-gray-600">Built in Houma, LA. For Southern Louisiana. By the community.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy</Link>
          </div>
        </div>
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

function BigStat({ number, label, sub, prefix }) {
  return (
    <div className="text-center">
      <p className="font-heading text-3xl sm:text-4xl font-bold text-white">{prefix}{number}</p>
      <p className="text-sm font-medium text-green-400 mt-1">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description, color }) {
  const borderColors = {
    green: 'hover:border-t-green-500',
    blue: 'hover:border-t-blue-500',
    purple: 'hover:border-t-purple-500',
    orange: 'hover:border-t-orange-500',
    yellow: 'hover:border-t-yellow-500',
    pink: 'hover:border-t-pink-500',
  }
  const bgColors = {
    green: 'bg-green-500/15',
    blue: 'bg-blue-500/15',
    purple: 'bg-purple-500/15',
    orange: 'bg-orange-500/15',
    yellow: 'bg-yellow-500/15',
    pink: 'bg-pink-500/15',
  }
  return (
    <div className={`group bg-[#111827] border border-gray-800 rounded-2xl p-6 transition-all duration-400 hover:-translate-y-1 hover:border-t-2 ${borderColors[color]}`}>
      <div className={`w-[52px] h-[52px] rounded-xl ${bgColors[color]} flex items-center justify-center text-2xl mb-5`}>
        {icon}
      </div>
      <h3 className="font-heading font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="relative bg-[#111827] border border-gray-800 rounded-2xl p-6">
      <span className="text-5xl font-heading font-extrabold text-green-500/10 absolute top-4 right-5">{number}</span>
      <div className="relative">
        <p className="text-xs font-medium text-green-500 uppercase tracking-wider mb-2">Step {number}</p>
        <h3 className="font-heading font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
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

function ProjectFeature({ icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg shrink-0">{icon}</span>
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  )
}

export default Landing
