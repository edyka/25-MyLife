import { motion } from "framer-motion";
import { ArrowLeft, Heart, Clock, Target, Lightbulb, Code, Quote, Star, Calendar, Palette, Shield } from "lucide-react";

const About = ({ darkMode, onBack }) => {
  const features = [
    {
      icon: Calendar,
      title: "Life Visualization",
      description: "See your entire life as a grid of weeks, making time tangible and meaningful."
    },
    {
      icon: Palette,
      title: "Mood Tracking",
      description: "Color-code your weeks with emotions and create custom categories that matter to you."
    },
    {
      icon: Target,
      title: "Goal Setting",
      description: "Set life goals and track your progress towards the things that truly matter."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "All your data stays on your device with client-side encryption. No servers, no tracking."
    }
  ];

  const philosophy = [
    {
      icon: Clock,
      title: "Time Awareness",
      description: "Understanding the finite nature of time helps us make more intentional choices about how we spend our weeks."
    },
    {
      icon: Heart,
      title: "Meaningful Living",
      description: "By visualizing life's brevity, we're inspired to prioritize what truly matters and live with greater purpose."
    },
    {
      icon: Lightbulb,
      title: "Conscious Reflection",
      description: "Regular reflection on our experiences helps us learn, grow, and make better decisions for the future."
    }
  ];

  const stats = [
    { number: "4,160", label: "Weeks in 80 years", description: "Each square represents one week of life" },
    { number: "100%", label: "Local Storage", description: "Your data never leaves your device" },
    { number: "8", label: "Mood Categories", description: "Plus unlimited custom categories" },
    { number: "∞", label: "Goals & Milestones", description: "Track unlimited life objectives" }
  ];

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" 
        : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900"
    }`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
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

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className={`w-3 h-12 rounded-full ${
                  darkMode
                    ? "bg-gradient-to-b from-purple-400 to-blue-500"
                    : "bg-gradient-to-b from-purple-600 to-blue-600"
                }`}
              />
              <h1 className={`text-5xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Viventiva
              </h1>
            </div>
            <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}>
              A philosophical tool for conscious living that transforms your finite weeks into a visual canvas for intentional existence.
            </p>
          </div>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-8 rounded-2xl mb-12 text-center ${
            darkMode 
              ? "bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20" 
              : "bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200"
          }`}
        >
          <Quote className={`w-12 h-12 mx-auto mb-4 ${
            darkMode ? "text-purple-400" : "text-purple-600"
          }`} />
          <blockquote className={`text-2xl font-medium mb-4 italic ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            "It is not that we have a short time to live, but that we waste a lot of it."
          </blockquote>
          <p className={`text-lg ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            — Seneca, On the Shortness of Life
          </p>
        </motion.div>

        {/* Philosophy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Our Philosophy
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {philosophy.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className={`p-6 rounded-xl text-center ${
                    darkMode 
                      ? "bg-gray-800/50 border border-gray-700/50" 
                      : "bg-white/70 border border-gray-200/50"
                  }`}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-purple-500/20" : "bg-purple-100"
                  }`}>
                    <IconComponent className={`w-8 h-8 ${
                      darkMode ? "text-purple-400" : "text-purple-600"
                    }`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {item.title}
                  </h3>
                  <p className={`leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`p-6 rounded-xl ${
                    darkMode 
                      ? "bg-gray-800/50 border border-gray-700/50" 
                      : "bg-white/70 border border-gray-200/50"
                  }`}
                >
                  <IconComponent className={`w-8 h-8 mb-4 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`} />
                  <h3 className={`text-lg font-semibold mb-2 ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className={`text-3xl font-bold text-center mb-12 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            By the Numbers
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`p-6 rounded-xl text-center ${
                  darkMode 
                    ? "bg-gradient-to-br from-gray-800/50 to-gray-700/30 border border-gray-700/50" 
                    : "bg-gradient-to-br from-white/70 to-gray-50/50 border border-gray-200/50"
                }`}
              >
                <div className={`text-3xl font-bold mb-2 ${
                  darkMode ? "text-purple-400" : "text-purple-600"
                }`}>
                  {stat.number}
                </div>
                <div className={`text-sm font-semibold mb-1 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}>
                  {stat.label}
                </div>
                <div className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  {stat.description}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Technology Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={`p-8 rounded-2xl mb-12 ${
            darkMode 
              ? "bg-gray-800/50 border border-gray-700/50" 
              : "bg-white/70 border border-gray-200/50"
          }`}
        >
          <div className="flex items-center gap-3 mb-6">
            <Code className={`w-8 h-8 ${
              darkMode ? "text-green-400" : "text-green-600"
            }`} />
            <h2 className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}>
              Built with Modern Technology
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Frontend
              </h3>
              <ul className={`space-y-2 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                <li>• React 18 with modern hooks and concurrent features</li>
                <li>• Tailwind CSS for responsive design</li>
                <li>• Framer Motion for smooth animations</li>
                <li>• Vite for lightning-fast development</li>
              </ul>
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${
                darkMode ? "text-white" : "text-gray-900"
              }`}>
                Privacy & Security
              </h3>
              <ul className={`space-y-2 text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                <li>• Client-side AES encryption</li>
                <li>• Local storage only - no servers</li>
                <li>• Session-based encryption keys</li>
                <li>• Open source and transparent</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className={`text-center p-8 rounded-2xl ${
            darkMode 
              ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20" 
              : "bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200"
          }`}
        >
          <Star className={`w-12 h-12 mx-auto mb-4 ${
            darkMode ? "text-pink-400" : "text-pink-600"
          }`} />
          <h2 className={`text-2xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}>
            Our Mission
          </h2>
          <p className={`text-lg leading-relaxed max-w-3xl mx-auto ${
            darkMode ? "text-gray-300" : "text-gray-700"
          }`}>
            To help people live more intentionally by making time visible, finite, and meaningful. 
            We believe that understanding life's brevity is not morbid, but liberating—it frees us 
            to focus on what truly matters and live each week with greater purpose and awareness.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;