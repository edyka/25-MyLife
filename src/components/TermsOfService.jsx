import { motion } from "framer-motion";
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, Gavel, Heart } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { getTheme } from "../utils/themeConfig";

const TermsOfService = ({ darkMode, onBack }) => {
  // Get current theme state
  const themePreset = useUIStore(state => state.themePreset);

  // Get current theme configuration
  const theme = getTheme(themePreset);
  const lastUpdated = "January 2025";

  const sections = [
    {
      icon: Users,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using Viventiva, you accept and agree to be bound by these Terms of Service.",
        "If you do not agree to these terms, please do not use the application.",
        "We reserve the right to update these terms at any time. Continued use of the application constitutes acceptance of updated terms.",
        "You must be at least 13 years old to use Viventiva. If you are under 18, you should have parental consent."
      ]
    },
    {
      icon: FileText,
      title: "Description of Service",
      content: [
        "Viventiva is a life visualization application that helps you track and reflect on your life's journey by representing time as weekly squares.",
        "The service allows you to mark weeks with moods, create milestones, set goals, and gain perspective on time and mortality.",
        "All data is stored locally on your device and the application works entirely offline after initial load.",
        "We provide the software 'as is' and make no guarantees about its availability, accuracy, or suitability for any particular purpose."
      ]
    },
    {
      icon: Shield,
      title: "User Responsibilities",
      content: [
        "You are responsible for maintaining the confidentiality of your data and any export files you create.",
        "You agree to use the application for personal, non-commercial purposes only.",
        "You will not attempt to reverse engineer, hack, or exploit the application in any way.",
        "You understand that your data is stored locally and you are responsible for backing up important information.",
        "You will not use the application for any illegal or harmful purposes."
      ]
    },
    {
      icon: AlertTriangle,
      title: "Limitations and Disclaimers",
      content: [
        "Viventiva is not a medical device and should not be used for medical diagnosis or treatment decisions.",
        "The application is not intended to replace professional mental health, medical, or psychological services.",
        "Life expectancy calculations are estimates based on general statistics and should not be considered medical advice.",
        "We are not responsible for any emotional distress that may result from contemplating mortality or life visualization.",
        "If you experience distress while using the application, please consult with appropriate healthcare professionals."
      ]
    },
    {
      icon: Gavel,
      title: "Intellectual Property",
      content: [
        "The Viventiva application, including its design, code, and concept, is owned by us and protected by intellectual property laws.",
        "You may not copy, distribute, or create derivative works based on the application without our explicit permission.",
        "Your personal data and content created within the application remain your property.",
        "We grant you a limited, non-transferable license to use the application for personal purposes.",
        "Third-party libraries and components are used under their respective licenses."
      ]
    },
    {
      icon: Scale,
      title: "Liability and Indemnification",
      content: [
        "We provide Viventiva free of charge and without warranty of any kind, express or implied.",
        "We are not liable for any damages, losses, or issues arising from your use of the application.",
        "You agree to indemnify us against any claims arising from your use of the application.",
        "Our maximum liability, if any, is limited to the amount you paid for the application (which is zero for the free version).",
        "Some jurisdictions do not allow limitation of liability, so these limitations may not apply to you."
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
              darkMode ? "bg-blue-500/20" : "bg-blue-100"
            }`}>
              <FileText className={`w-8 h-8 ${
                darkMode ? "text-blue-400" : "text-blue-600"
              }`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Terms of Service
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
            These terms govern your use of Viventiva, a life visualization application designed to help you reflect on time and live more intentionally.
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
            Important Notice
          </h2>
          <p className={`${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            Viventiva deals with themes of mortality and time awareness. While designed to inspire intentional living, 
            some users may find these concepts emotionally challenging. Please use the application mindfully and 
            seek professional support if you experience distress.
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
                    darkMode ? "text-blue-400" : "text-blue-600"
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

        {/* Final Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`mt-8 p-6 rounded-xl ${
            darkMode 
              ? "bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20" 
              : "bg-gradient-to-r from-green-100 to-blue-100 border border-green-200"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Heart className={`w-6 h-6 ${
              darkMode ? "text-green-400" : "text-green-600"
            }`} />
            <h3 className={`text-lg font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Our Commitment
            </h3>
          </div>
          <p className={`mb-4 ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            Viventiva was created with the intention of helping people live more meaningful, intentional lives. 
            We are committed to keeping the application free, privacy-focused, and true to its philosophical foundations.
          </p>
          <p className={`text-sm ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}>
            For questions about these terms, contact us at legal@viventiva.com
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;