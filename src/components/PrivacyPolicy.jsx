import { motion } from "framer-motion";
import { ArrowLeft, Shield, Eye, Lock, Server, Users, Cookie, Mail } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

const PrivacyPolicy = ({ darkMode, onBack }) => {
  // Get current theme state
  const themePreset = useUIStore(state => state.themePreset);

  // Get current theme configuration
  const theme = getTheme(themePreset);
  const lastUpdated = "January 2025";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Personal Information: We collect your birth date and life expectancy to calculate your life visualization. This data is stored locally on your device and is never transmitted to our servers.",
        "Mood and Milestone Data: Your weekly mood selections, custom categories, life goals, and milestone entries are stored locally on your device using encrypted browser storage.",
        "Usage Analytics: We may collect anonymous usage statistics to improve the application, but this data cannot be linked back to you personally."
      ]
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: [
        "Local Storage Only: All your personal data is stored locally on your device using AES encryption. We never have access to your personal information.",
        "Session-Based Keys: Encryption keys are generated uniquely for each session and are not stored permanently.",
        "No Account Required: Viventiva works entirely offline without requiring account creation or personal identification.",
        "Data Migration: When you upgrade the app, your data is automatically migrated while maintaining the same level of security."
      ]
    },
    {
      icon: Server,
      title: "Data Storage and Retention",
      content: [
        "Local Browser Storage: Your data is stored in your browser's secure storage and remains on your device at all times.",
        "Export Capability: You can export your data at any time as an encrypted backup file.",
        "Data Removal: You can delete all your data instantly through the application settings. This action is irreversible.",
        "No Cloud Storage: We do not store any of your personal data on our servers or in any cloud service."
      ]
    },
    {
      icon: Users,
      title: "Data Sharing",
      content: [
        "No Third-Party Sharing: We do not share, sell, or rent your personal information to any third parties.",
        "Analytics: We may use privacy-focused analytics tools that collect anonymous usage patterns without identifying individual users.",
        "Legal Requirements: We may disclose information if required by law, but since we don't collect personal data on our servers, there is typically nothing to disclose."
      ]
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: [
        "Essential Cookies: We use minimal cookies necessary for the application to function, such as storing your theme preferences.",
        "No Tracking Cookies: We do not use tracking cookies for advertising or cross-site tracking purposes.",
        "Local Storage: Most data is stored using browser local storage rather than cookies.",
        "Third-Party Services: We do not integrate with third-party tracking services or advertising networks."
      ]
    },
    {
      icon: Mail,
      title: "Contact and Rights",
      content: [
        "Contact Us: If you have questions about this privacy policy, contact us at privacy@viventiva.com",
        "Data Access: Since all data is stored locally on your device, you have complete access to and control over your information.",
        "Data Portability: You can export your data in JSON format at any time.",
        "Right to Deletion: You can delete all your data instantly through the application settings."
      ]
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        : `bg-gradient-to-br ${theme.onboardingLight.replace('bg-gradient-to-r', '').replace('from-', 'from-').replace(' to-', '-50 to-')}-50 text-gray-900`
    }`}>
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
                ? "text-gray-300 hover:text-white hover:bg-gray-800"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${
              darkMode ? "bg-purple-500/20" : "bg-purple-100"
            }`}>
              <Shield className={`w-8 h-8 ${
                darkMode ? "text-purple-400" : "text-purple-600"
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Privacy Policy
              </h1>
              <p className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}>
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <p className={`text-lg leading-relaxed ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            At Viventiva, we believe your life data is deeply personal. This privacy policy explains how we handle your information with the utmost care and respect for your privacy.
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-6 rounded-xl mb-8 ${
            darkMode 
              ? "bg-gray-800/50 border border-gray-700/50" 
              : "bg-white/70 border border-gray-200/50"
          }`}
        >
          <h2 className={`text-xl font-semibold mb-3 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Our Commitment to Your Privacy
          </h2>
          <p className={`${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            Viventiva is designed with privacy by design principles. Your personal life data never leaves your device. 
            We use client-side encryption and local storage to ensure that your life visualization remains completely private and under your control.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={`p-6 rounded-xl ${
                  darkMode 
                    ? "bg-gray-800/50 border border-gray-700/50" 
                    : "bg-white/70 border border-gray-200/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent className={`w-6 h-6 ${
                    darkMode ? "text-purple-400" : "text-purple-600"
                  }`} />
                  <h3 className={`text-xl font-semibold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {section.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className={`leading-relaxed ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 p-6 rounded-xl text-center ${
            darkMode 
              ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20" 
              : "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-2 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Questions About Your Privacy?
          </h3>
          <p className={`mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            We're here to help. Contact us with any privacy-related questions or concerns.
          </p>
          <a
            href="mailto:privacy@viventiva.com"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode
                ? "bg-purple-500 hover:bg-purple-600 text-white"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
          >
            <Mail className="w-4 h-4" />
            Contact Privacy Team
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;