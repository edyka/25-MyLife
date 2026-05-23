// This file was renamed from PrivacyPolicy.jsx to AppPolicy.jsx to avoid browser extension blocking issues.
// ...existing PrivacyPolicy.jsx code will be moved here...
import { motion } from 'framer-motion'
import { ArrowLeft, Shield, FileText } from 'lucide-react'
import { useUIStore } from '../stores/useUIStore'
import { getTheme } from '../utils/themeConfig'

const AppPolicy = ({ darkMode, onBack }) => {
  // Get current theme state
  const themePreset = useUIStore(state => state.themePreset)

  // Get current theme configuration
  const theme = getTheme(themePreset)
  const lastUpdated = 'January 2025'

  const sections = [
    {
      icon: Shield,
      title: 'Introduction',
      content: [
        "Viventiva ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our life visualization application.",
        'By using Viventiva, you consent to the data practices described in this policy. If you do not agree with the practices described, please do not use the application.',
        'This policy applies to all users of Viventiva, including those who access the application via web browsers or mobile devices.',
      ],
    },
    {
      icon: FileText,
      title: 'Information We Collect',
      content: [
        'Personal Information: When you create an account, we collect your email address, name (if provided), and authentication credentials through secure OAuth providers (Google, Facebook, Apple) or email/password.',
        'Profile Data: We store your birth date (day, month, year) and life expectancy preference to calculate and display your life grid.',
        'Usage Data: We collect information about how you interact with the application, including which weeks you mark, moods you assign, milestones you create, and goals you set.',
        'Settings Data: We store your UI preferences including dark mode, theme selection, and display preferences.',
        'Technical Data: We may collect device information, browser type, IP address, and usage patterns for security and performance purposes.',
      ],
    },
    {
      icon: Shield,
      title: 'How We Use Your Information',
      content: [
        'To Provide Services: We use your information to create and maintain your account, calculate your life grid, and store your milestones, goals, and preferences.',
        "To Improve Services: We analyze usage patterns to improve the application's functionality and user experience.",
        'To Communicate: We may send you important updates about the service, security notifications, or respond to your inquiries.',
        'For Security: We use your information to detect and prevent fraud, abuse, and security threats.',
        'For Legal Compliance: We may use your information to comply with legal obligations or respond to lawful requests.',
      ],
    },
    {
      icon: Shield,
      title: 'Data Storage and Security',
      content: [
        'Data Storage: Your data is stored securely in Supabase (PostgreSQL database) with encryption at rest and in transit.',
        'Authentication: We use industry-standard OAuth 2.0 and secure password hashing (via Supabase) to protect your account.',
        'Row-Level Security: All database tables use Row-Level Security (RLS) policies ensuring you can only access your own data.',
        'Local Storage: Some preferences are stored locally in your browser for faster loading, but sensitive data is always synced to secure cloud storage.',
        "Data Backup: Your data is automatically backed up and can be exported at any time through the application's export feature.",
      ],
    },
    {
      icon: Shield,
      title: 'Data Sharing and Disclosure',
      content: [
        'We Do Not Sell Your Data: We never sell, rent, or trade your personal information to third parties.',
        'Service Providers: We use trusted third-party services (Supabase for database, Netlify for hosting) that are contractually obligated to protect your data.',
        'Legal Requirements: We may disclose your information if required by law, court order, or government regulation.',
        'Business Transfers: In the event of a merger, acquisition, or sale, your data may be transferred, but this policy will continue to apply.',
        'With Your Consent: We will only share your data with third parties if you explicitly consent.',
      ],
    },
    {
      icon: Shield,
      title: 'Your Rights (GDPR Compliance)',
      content: [
        "Right to Access: You can access all your personal data through the application's export feature or by contacting us.",
        'Right to Rectification: You can update your profile information, birth date, and preferences at any time through the application.',
        "Right to Erasure: You can delete your account and all associated data at any time through the application's settings or by contacting us.",
        'Right to Data Portability: You can export your data in JSON format for use in other services.',
        'Right to Object: You can opt out of non-essential data processing by adjusting your settings or contacting us.',
        'Right to Restrict Processing: You can request that we limit how we process your data.',
        'Right to Withdraw Consent: You can withdraw consent for data processing at any time by deleting your account.',
      ],
    },
    {
      icon: Shield,
      title: 'Cookies and Tracking',
      content: [
        'Essential Cookies: We use essential cookies to maintain your session and remember your preferences.',
        'Analytics: We may use analytics tools (with your consent) to understand how users interact with the application.',
        'Third-Party Cookies: We use Supabase for authentication and data storage, which may set necessary cookies for security.',
        'Cookie Consent: You can manage cookie preferences through the cookie consent banner that appears when you first visit the application.',
        'No Tracking: We do not use tracking cookies for advertising or cross-site tracking.',
      ],
    },
    {
      icon: Shield,
      title: 'Data Retention',
      content: [
        'Active Accounts: We retain your data for as long as your account is active or as needed to provide services.',
        'Deleted Accounts: When you delete your account, we permanently delete all your personal data within 30 days, except where legal retention requirements apply.',
        'Backup Data: Deleted data may remain in backups for up to 90 days before being permanently removed.',
        'Legal Requirements: We may retain certain data longer if required by law or for legitimate business purposes.',
      ],
    },
    {
      icon: Shield,
      title: "Children's Privacy",
      content: [
        'Age Requirement: Viventiva is not intended for children under 13 years of age.',
        'No Collection: We do not knowingly collect personal information from children under 13.',
        'Parental Consent: If you are under 18, you should have parental consent before using the application.',
        'Removal: If we discover that we have collected information from a child under 13, we will delete it immediately.',
      ],
    },
    {
      icon: Shield,
      title: 'International Data Transfers',
      content: [
        "Data Location: Your data is stored in Supabase's data centers, which may be located outside your country of residence.",
        'Adequate Protection: We ensure that international data transfers comply with applicable data protection laws, including GDPR.',
        'Safeguards: We use standard contractual clauses and other legal mechanisms to protect your data when transferred internationally.',
      ],
    },
    {
      icon: Shield,
      title: 'Changes to This Policy',
      content: [
        'Updates: We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
        "Notification: We will notify you of significant changes by posting the new policy on this page and updating the 'Last Updated' date.",
        'Continued Use: Your continued use of the application after changes constitutes acceptance of the updated policy.',
        'Review: We encourage you to review this policy periodically to stay informed about how we protect your information.',
      ],
    },
    {
      icon: Shield,
      title: 'Contact Us',
      content: [
        'Questions: If you have questions about this Privacy Policy or our data practices, please contact us at privacy@viventiva.com.',
        'Data Requests: To exercise your rights under GDPR or other privacy laws, please email us at privacy@viventiva.com with your request.',
        'Response Time: We will respond to your privacy-related inquiries within 30 days as required by GDPR.',
        'Complaints: If you believe we have not addressed your privacy concerns, you have the right to file a complaint with your local data protection authority.',
      ],
    },
  ]

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white'
          : `bg-gradient-to-br ${theme.onboardingLight.replace('bg-gradient-to-r', '').replace('from-', 'from-').replace(' to-', '-50 to-')}-50 text-gray-900`
      }`}
    >
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={onBack}
            className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Shield className={`w-8 h-8 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">App Privacy Policy</h1>
              <div className="text-xs font-medium opacity-70">Last updated: {lastUpdated}</div>
            </div>
          </div>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl mb-8 ${
            darkMode
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white/70 border border-gray-200/50'
          }`}
        >
          <h2 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Your Privacy Matters
          </h2>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            At Viventiva, we believe your personal data belongs to you. We are committed to
            transparency, security, and giving you control over your information. This policy
            explains exactly what data we collect, how we use it, and your rights regarding your
            personal information.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-6 rounded-xl ${
                  darkMode
                    ? 'bg-gray-800/50 border border-gray-700/50'
                    : 'bg-white/70 border border-gray-200/50'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent
                    className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}
                  />
                  <h3
                    className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p
                      key={pIndex}
                      className={`leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Final Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className={`mt-8 p-6 rounded-xl ${
            darkMode
              ? 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20'
              : 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className={`w-6 h-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Our Commitment to Privacy
            </h3>
          </div>
          <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Viventiva was built with privacy as a core principle. We don't sell your data, we don't
            track you across the web, and we give you full control over your information. Your life
            visualization is personal and private, and we're committed to keeping it that way.
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Last updated: {lastUpdated} | For questions: privacy@viventiva.com
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default AppPolicy
