import { memo } from 'react';
import { getTheme } from '../utils/themeConfig';

const PrivacyPolicyTab = memo(({ darkMode, themePreset, theme }) => {
  return (
    <div className="mt-8 mx-auto w-full max-w-5xl px-4 pb-16">
      <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} p-8 sm:p-12`}>
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${getTheme(themePreset || 'emerald').iconBg} shadow-lg`}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className={`text-4xl font-black bg-gradient-to-r ${getTheme(themePreset || 'emerald').primary} bg-clip-text text-transparent`}>
                Privacy Policy
              </h1>
              <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className={`space-y-10 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          {/* Introduction */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Introduction
            </h2>
            <p className="leading-relaxed mb-4">
              At Viventiva, we believe your personal data should belong to you and only you. This Privacy Policy explains our
              commitment to protecting your privacy and outlines how we handle information when you use our life visualization application.
            </p>
            <p className="leading-relaxed">
              By using Viventiva, you agree to the practices described in this policy. We encourage you to read this document
              carefully to understand how we safeguard your information.
            </p>
          </section>

          {/* Information Collection */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Information We Collect
            </h2>
            <div className={`p-6 rounded-xl mb-6 ${darkMode ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                Personal Data You Provide
              </h3>
              <p className="leading-relaxed mb-4">
                When you use Viventiva, you may choose to provide the following information, which is stored locally on your device:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                  <span><strong>Birth Information:</strong> Your birth date (day, month, year) used to calculate your current age and journey timeline</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                  <span><strong>Life Expectancy:</strong> Your estimated life expectancy used to visualize remaining time</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                  <span><strong>Milestones & Events:</strong> Personal life events, memories, and colored weeks you choose to track</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                  <span><strong>Goals & Categories:</strong> Personal goals and custom categorization you create</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-3 mt-1 w-1.5 h-1.5 rounded-full ${darkMode ? "bg-emerald-400" : "bg-emerald-600"}`}></span>
                  <span><strong>Preferences:</strong> UI settings including dark mode, grid layout, theme colors, and display preferences</span>
                </li>
              </ul>
            </div>

            <div className={`p-6 rounded-xl ${darkMode ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-emerald-50 border border-emerald-200"}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                Information We Do NOT Collect
              </h3>
              <p className="leading-relaxed">
                We do not collect, transmit, or store any of your personal information on our servers. We do not use cookies,
                tracking pixels, analytics services, or any other data collection mechanisms. Your information never leaves your device.
              </p>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              All data you enter into Viventiva is used exclusively on your device to:
            </p>
            <div className="grid gap-4 ml-6">
              <div className="flex items-start">
                <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                <div>
                  <strong>Visualize your life:</strong> Display your timeline, calculate statistics, and show your progress through time
                </div>
              </div>
              <div className="flex items-start">
                <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                <div>
                  <strong>Track milestones:</strong> Color and categorize important weeks, events, and relationships in your life
                </div>
              </div>
              <div className="flex items-start">
                <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                <div>
                  <strong>Manage goals:</strong> Help you set, track, and visualize personal goals and aspirations
                </div>
              </div>
              <div className="flex items-start">
                <span className={`mr-3 mt-1 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>•</span>
                <div>
                  <strong>Personalize experience:</strong> Remember your UI preferences for a better user experience
                </div>
              </div>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Data Storage & Security
            </h2>
            <div className={`p-6 rounded-xl mb-4 ${darkMode ? "bg-slate-800/50 border border-slate-700" : "bg-slate-50 border border-slate-200"}`}>
              <h3 className={`font-bold mb-3 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                Local Storage Technology
              </h3>
              <p className="leading-relaxed">
                All your data is stored using your browser's localStorage technology. This means:
              </p>
              <ul className="space-y-2 mt-3 ml-6">
                <li className="flex items-start">
                  <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                  <span>Data persists only in your browser on your device</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                  <span>No data is transmitted over the internet to any server</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                  <span>Clearing your browser data will delete all Viventiva information</span>
                </li>
                <li className="flex items-start">
                  <span className={`mr-2 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>→</span>
                  <span>Using the app on different devices or browsers creates separate, isolated data</span>
                </li>
              </ul>
            </div>
            <p className="leading-relaxed">
              We recommend backing up your data regularly if it's important to you. Since everything is stored locally,
              losing or clearing your browser data will result in permanent data loss.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Third-Party Services
            </h2>
            <p className="leading-relaxed mb-4">
              Viventiva does not integrate with any third-party services, analytics platforms, advertising networks, or data brokers.
              We do not share, sell, rent, or otherwise transfer your information to any third parties because we simply don't have
              access to it.
            </p>
            <p className="leading-relaxed">
              The application runs entirely in your browser without making network requests for user data. Any data you see
              comes from your local storage, not from external servers.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Your Rights & Control
            </h2>
            <p className="leading-relaxed mb-4">
              You have complete control over your data:
            </p>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Access & Export</h4>
                <p className="text-sm leading-relaxed">
                  You can access all your data at any time through the application. Export functionality allows you to download
                  your data for backup or transfer purposes.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>Modification & Deletion</h4>
                <p className="text-sm leading-relaxed">
                  You can modify or delete any information at any time through the application's interface. You can also clear
                  all data by clearing your browser's local storage.
                </p>
              </div>
              <div className={`p-4 rounded-lg ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
                <h4 className={`font-semibold mb-2 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>No Account Required</h4>
                <p className="text-sm leading-relaxed">
                  You don't need to create an account, provide an email address, or register in any way to use Viventiva.
                  Start using the app immediately without sharing any identifying information.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className={`text-2xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Changes to This Policy
            </h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons.
              Any changes will be posted on this page with an updated effective date. We encourage you to review this policy
              periodically to stay informed about how we protect your privacy.
            </p>
          </section>

          {/* Contact */}
          <section className={`p-8 rounded-2xl border-2 ${darkMode ? `border-${theme.primary.split('-')[1]}-500/30 bg-gradient-to-br ${theme.primary.replace('from-', 'from-').replace(' to-', '/5 to-')}/5` : `border-${theme.primary.split('-')[1]}-300 bg-gradient-to-br ${theme.primary.replace('from-', 'from-').replace(' to-', '-50 to-')}-50`}`}>
            <h2 className={`text-xl font-bold mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
              Contact Us
            </h2>
            <p className="leading-relaxed mb-4">
              If you have any questions, concerns, or suggestions about this Privacy Policy or our privacy practices,
              please don't hesitate to contact us:
            </p>
            <div className="space-y-2">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:privacy@viventiva.com" className={`font-semibold underline ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} transition-colors`}>
                  privacy@viventiva.com
                </a>
              </p>
              <p>
                <strong>Support:</strong>{' '}
                <a href="mailto:support@viventiva.com" className={`font-semibold underline ${darkMode ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} transition-colors`}>
                  support@viventiva.com
                </a>
              </p>
            </div>
          </section>

          {/* Final Note */}
          <div className={`p-6 rounded-xl text-center ${darkMode ? "bg-slate-800/30" : "bg-slate-50"}`}>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Your privacy is our priority. We built Viventiva to help you visualize your life without compromising your personal data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PrivacyPolicyTab.displayName = "PrivacyPolicyTab";

export default PrivacyPolicyTab;

