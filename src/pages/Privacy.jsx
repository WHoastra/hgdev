import { Link } from 'react-router-dom'

function Privacy() {
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

        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="bg-[#1e293b] rounded-lg border border-gray-700 p-6 sm:p-8 space-y-6 text-gray-300 text-sm leading-6">
          <p className="text-gray-400">Last updated: April 11, 2026</p>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">1. Introduction</h2>
            <p>Whoastra Labs LLC ("we", "us", or "our") operates the HGDev platform. This Privacy Policy explains how we collect, use, and protect your information when you use our Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">2. Information We Collect</h2>
            <p className="mb-2">We may collect the following types of information:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Course progress and completion data</li>
              <li>Personal notes you create within the Platform</li>
              <li>Usage data such as pages visited and features used</li>
              <li>Device and browser information for analytics purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">3. How We Use Your Information</h2>
            <p className="mb-2">We use collected information to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Provide and maintain the Platform</li>
              <li>Track your learning progress across courses</li>
              <li>Improve and personalize your experience</li>
              <li>Analyze usage patterns to enhance the Platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">4. Data Storage</h2>
            <p>Your data is stored securely using Supabase, a cloud-hosted database service. We take reasonable measures to protect your information from unauthorized access, alteration, or destruction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">5. Data Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties. We may share anonymized, aggregated data for analytics purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">6. Cookies</h2>
            <p>The Platform may use cookies and similar technologies to maintain session state and improve your experience. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">7. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact Whoastra Labs LLC.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">9. Contact</h2>
            <p>For questions about this Privacy Policy, please contact Whoastra Labs LLC.</p>
          </section>
        </div>
      </div>
    </div>
  )
}

export default Privacy
