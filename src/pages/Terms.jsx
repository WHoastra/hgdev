import { Link } from 'react-router-dom'

function Terms() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/courses"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>

        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 space-y-6 text-gray-300 text-sm leading-6">
          <p className="text-gray-400">Last updated: April 11, 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using HGDev ("the Platform"), operated by Whoastra Labs LLC ("we", "us", or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service</h2>
            <p>HGDev is a course tracking and learning platform designed for local developer training. The Platform allows users to browse courses, track lesson progress, and take personal notes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. User Responsibilities</h2>
            <p>You agree to use the Platform only for lawful purposes and in accordance with these Terms. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Intellectual Property</h2>
            <p>All content, features, and functionality of the Platform are owned by Whoastra Labs LLC and are protected by copyright, trademark, and other intellectual property laws. Course materials and content are provided for educational purposes only.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Platform will be uninterrupted, secure, or error-free.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, Whoastra Labs LLC shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Platform. Your continued use of the Platform constitutes acceptance of the modified Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Contact</h2>
            <p>For questions about these Terms, please contact Whoastra Labs LLC.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Terms
