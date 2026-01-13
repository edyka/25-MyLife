import Footer from './Footer'
import LifeCalculator from './LifeCalculator'
import { motion } from 'framer-motion'
import { Sparkles, LogIn, Calendar, Target, Clock, Sun, Moon } from 'lucide-react'
import { getTheme } from '../utils/themeConfig'
import { useUIStore } from '../stores/useUIStore'
import { useState } from 'react'
import LoginModal from './LoginModal'
import WaitlistPage from './WaitlistPage'

import { WAITLIST_MODE } from '../utils/constants'

const HomePage = ({ darkMode, onLogin }) => {
  const themePreset = useUIStore(state => state.themePreset)
  const setDarkMode = useUIStore(state => state.setDarkMode)
  const setCurrentPage = useUIStore(state => state.setCurrentPage)
  const theme = getTheme(themePreset)

  // Map presets to full Tailwind classes (dynamic class names don't work with Tailwind purge)
  const themeClasses = {
    emerald: {
      textLight: 'text-emerald-400',
      textDark: 'text-emerald-600',
      gradient: 'from-emerald-400 to-teal-500',
      buttonBg:
        'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
      buttonShadow: 'shadow-emerald-500/30 hover:shadow-emerald-500/50',
      bgLight: 'bg-emerald-200',
      bgDark: 'bg-emerald-900',
      iconColor: 'text-emerald-500',
      borderHover: 'group-hover:border-emerald-500/50',
      glowShadow: 'group-hover:shadow-emerald-500/20',
    },
    ocean: {
      textLight: 'text-blue-400',
      textDark: 'text-blue-600',
      gradient: 'from-blue-400 to-cyan-500',
      buttonBg: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700',
      buttonShadow: 'shadow-blue-500/30 hover:shadow-blue-500/50',
      bgLight: 'bg-blue-200',
      bgDark: 'bg-blue-900',
      iconColor: 'text-blue-500',
      borderHover: 'group-hover:border-blue-500/50',
      glowShadow: 'group-hover:shadow-blue-500/20',
    },
    sunset: {
      textLight: 'text-orange-400',
      textDark: 'text-orange-600',
      gradient: 'from-orange-400 to-red-500',
      buttonBg:
        'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700',
      buttonShadow: 'shadow-orange-500/30 hover:shadow-orange-500/50',
      bgLight: 'bg-orange-200',
      bgDark: 'bg-orange-900',
      iconColor: 'text-orange-500',
      borderHover: 'group-hover:border-orange-500/50',
      glowShadow: 'group-hover:shadow-orange-500/20',
    },
    purple: {
      textLight: 'text-purple-400',
      textDark: 'text-purple-600',
      gradient: 'from-purple-400 to-violet-500',
      buttonBg:
        'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700',
      buttonShadow: 'shadow-purple-500/30 hover:shadow-purple-500/50',
      bgLight: 'bg-purple-200',
      bgDark: 'bg-purple-900',
      iconColor: 'text-purple-500',
      borderHover: 'group-hover:border-purple-500/50',
      glowShadow: 'group-hover:shadow-purple-500/20',
    },
  }
  const activeTheme = themeClasses[themePreset] || themeClasses.sunset

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isSignUpMode, setIsSignUpMode] = useState(false)
  const [initialAuthData, setInitialAuthData] = useState(null)

  const handleLoginClick = () => {
    setIsSignUpMode(false)
    setInitialAuthData(null)
    setShowLoginModal(true)
  }

  const handleSignUpClick = (data = null) => {
    setIsSignUpMode(true)
    // If data is passed (from LifeCalculator), store it
    if (data && data.birthDate) {
      setInitialAuthData(data)
    } else {
      setInitialAuthData(null)
    }
    setShowLoginModal(true)
  }

  const handleLoginComplete = async () => {
    setShowLoginModal(false)
    onLogin()
  }

  // Show waitlist page if in waitlist mode
  if (WAITLIST_MODE) {
    return <WaitlistPage />
  }

  return (
    <main
      id="main-content"
      role="main"
      aria-label="Viventiva homepage"
      className={`min-h-screen flex flex-col relative overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}
    >
      {/* Aurora Background - Global (behind everything) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse-slow ${darkMode ? activeTheme.bgDark : activeTheme.bgLight}`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse-slow delay-1000 ${darkMode ? activeTheme.bgDark : activeTheme.bgLight}`}
        />
      </div>

      {/* Top Right Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed right-4 z-[60] flex items-center gap-3"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            darkMode
              ? 'bg-slate-800/80 backdrop-blur-xl text-yellow-400 hover:bg-slate-700 border border-slate-700'
              : 'bg-white/80 backdrop-blur-xl text-slate-700 hover:bg-white border border-slate-200'
          } shadow-lg hover:shadow-xl`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            handleLoginClick()
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
            darkMode
              ? 'bg-slate-800/80 backdrop-blur-xl text-white hover:bg-slate-700 border border-slate-700'
              : 'bg-white/80 backdrop-blur-xl text-slate-900 hover:bg-white border border-slate-200'
          } shadow-lg hover:shadow-xl`}
        >
          <LogIn className="w-4 h-4" />
          Log In
        </button>
      </motion.div>

      {/* SECTION 1: HERO */}
      <section className="relative z-10 w-full min-h-screen flex items-center justify-center pt-20 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Floating Week Squares Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`float-${i}`}
              className={`absolute w-3 h-3 rounded-sm opacity-30 ${
                [
                  'bg-amber-400',
                  'bg-emerald-400',
                  'bg-rose-400',
                  'bg-sky-400',
                  'bg-violet-400',
                  'bg-orange-400',
                  'bg-teal-400',
                ][i % 7]
              }`}
              style={{ left: `${(i * 7) % 100}%` }}
              initial={{
                y: -20,
                opacity: 0,
              }}
              animate={{
                y: '120vh',
                opacity: [0, 0.4, 0],
                rotate: 180,
              }}
              transition={{
                duration: 12 + Math.random() * 8,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'linear',
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Logo + Brand Name */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-10 flex justify-center items-center gap-4"
          >
            <div className="relative">
              <div
                className={`w-14 h-14 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-xl ${theme.shadow} flex items-center justify-center group`}
              >
                <div className="grid grid-cols-3 gap-1 w-7 h-7">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"
                    ></div>
                  ))}
                </div>
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-lg animate-pulse`}
              ></div>
            </div>
            <span
              className={`text-2xl sm:text-3xl uppercase tracking-[0.15em] font-semibold ${darkMode ? activeTheme.textLight : activeTheme.textDark}`}
            >
              Viventiva
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight mb-6 leading-[1.1] tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}
          >
            Your life is
            <br />
            <span
              className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${activeTheme.gradient}`}
            >
              {(4000).toLocaleString()} weeks.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-lg md:text-xl font-light max-w-xl mx-auto mb-10 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
          >
            See them all. Color the ones that matter.
            <br className="hidden sm:block" />
            Stop counting days. Start making weeks count.
          </p>

          {/* Week Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <div
              className={`inline-flex items-center gap-1.5 p-5 rounded-2xl ${darkMode ? 'bg-slate-800/80 backdrop-blur-sm border border-slate-700/50' : 'bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/50 border border-slate-200/50'}`}
            >
              {/* Past weeks - colored */}
              {[
                'bg-amber-400',
                'bg-emerald-400',
                'bg-rose-400',
                'bg-sky-400',
                'bg-violet-400',
                'bg-orange-400',
                'bg-teal-400',
              ].map((color, i) => (
                <motion.div
                  key={`past-${i}`}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-sm ${color}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                />
              ))}

              {/* Current week - pulsing */}
              <motion.div
                className={`w-5 h-5 md:w-6 md:h-6 rounded-sm ${darkMode ? 'bg-white' : 'bg-slate-900'}`}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Future weeks - empty */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={`future-${i}`}
                  className={`w-5 h-5 md:w-6 md:h-6 rounded-sm border-2 ${darkMode ? 'border-slate-600' : 'border-slate-300'}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.0 + i * 0.08 }}
                />
              ))}
            </div>

            <p className={`text-sm mt-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Past ·{' '}
              <span className={`${darkMode ? 'text-white' : 'text-slate-900'} font-medium`}>
                Now
              </span>{' '}
              · Future
            </p>
            <p className={`text-lg mt-4 italic ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
              "The trouble is, you think you have time."{' '}
              <span className="not-italic">— Buddha</span>
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignUpClick}
              className={`group relative px-8 py-4 rounded-xl font-medium text-lg shadow-xl ${activeTheme.buttonShadow} overflow-hidden`}
            >
              <div
                className={`absolute inset-0 ${activeTheme.buttonBg} transition-transform duration-300 group-hover:scale-105`}
              />
              <span className="relative text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Visualize My Life
              </span>
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className={`mt-8 text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}
          >
            Free to start · No credit card required
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className={`mt-3 text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}
          >
            By continuing, you agree to our{' '}
            <button
              onClick={() => setCurrentPage('terms')}
              className={`underline hover:no-underline transition-all ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Terms
            </button>{' '}
            and{' '}
            <button
              onClick={() => setCurrentPage('privacy')}
              className={`underline hover:no-underline transition-all ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Privacy Policy
            </button>
          </motion.p>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 8, 0] }}
            transition={{ delay: 1.2, y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
            className="mt-12"
          >
            <div
              className={`w-6 h-10 mx-auto rounded-full border-2 ${darkMode ? 'border-slate-600' : 'border-slate-300'} flex justify-center pt-2`}
            >
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`}
              />
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              Scroll
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* THREE SIMPLE STEPS Section */}
      <section
        className={`relative z-10 w-full py-24 px-4 sm:px-6 ${darkMode ? 'bg-slate-800/30' : 'bg-white/60'} backdrop-blur-sm`}
      >
        <div className="max-w-6xl mx-auto">
          {/* HOW IT WORKS */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2
                className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}
              >
                Three Simple Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <div
                className={`hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
              />

              {[
                {
                  icon: Calendar,
                  title: 'Input Your Birth Date',
                  desc: 'We calculate your precise life progress based on statistical data.',
                },
                {
                  icon: Clock,
                  title: 'Visualize Your Time',
                  desc: 'See your life as a grid of weeks. Every box is a week of your life.',
                },
                {
                  icon: Target,
                  title: 'Plan Your Legacy',
                  desc: 'Set goals, track moods, and make every remaining week count.',
                },
              ].map((item, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group">
                  <div
                    className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center text-3xl font-bold transition-all duration-300 relative z-10 ${
                      darkMode
                        ? `bg-slate-900 border-2 border-slate-800 ${activeTheme.borderHover} group-hover:shadow-xl`
                        : `bg-white border-2 border-slate-100 ${activeTheme.borderHover} group-hover:shadow-xl`
                    }`}
                  >
                    <div
                      className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {i + 1}
                    </div>
                    <item.icon className={`w-10 h-10 ${activeTheme.iconColor}`} />
                  </div>
                  <h3
                    className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                  >
                    {item.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed max-w-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button after steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12 mb-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSignUpClick}
                className={`group relative px-10 py-5 rounded-xl font-medium text-lg shadow-xl ${activeTheme.buttonShadow} overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 ${activeTheme.buttonBg} transition-transform duration-300 group-hover:scale-105`}
                />
                <span className="relative text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Visualize My Life
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Life Calculator - Merged into same section */}
          <div className="mt-8">
            <LifeCalculator darkMode={darkMode} onSignUp={handleSignUpClick} />
          </div>
        </div>
      </section>

      {/* SECTION 4: CTA & SOCIAL PROOF (Alternate BG) */}
      <section
        className={`relative z-10 w-full pt-0 pb-8 px-4 sm:px-6 ${darkMode ? 'bg-slate-800/30' : 'bg-white/60'} backdrop-blur-sm`}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* CTA Button */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignUpClick}
                className={`group relative px-10 py-5 rounded-xl font-medium text-lg shadow-xl ${activeTheme.buttonShadow} overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 ${activeTheme.buttonBg} transition-transform duration-300 group-hover:scale-110`}
                />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Visualize My Life
                </span>
              </motion.button>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className="max-w-7xl mx-auto">
            {/* Stats */}
            <div className="text-center mb-16">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${darkMode ? 'bg-slate-800/50 border border-slate-700/50' : 'bg-white/50 border border-slate-200'} backdrop-blur-sm`}
              >
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
                    S
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    K
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    G
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                >
                  Join people visualizing their lives
                </span>
              </div>
              <h2
                className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}
              >
                Loved Worldwide
              </h2>
            </div>

            {/* Testimonials Grid - 4 Columns for International Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  stars: 5,
                  text: 'This completely changed how I think about time. Seeing my life in weeks made me realize I need to stop procrastinating.',
                  initials: 'SM',
                  name: 'Sarah M.',
                  role: 'Designer',
                  country: 'USA',
                  flag: '🇺🇸',
                  gradient: 'from-pink-500 to-rose-500',
                },
                {
                  stars: 5,
                  text: 'Efficiency and clarity in one app. The visualization is exactly what I needed to structure my long-term goals.',
                  initials: 'KW',
                  name: 'Klaus W.',
                  role: 'Engineer',
                  country: 'Germany',
                  flag: '🇩🇪',
                  gradient: 'from-blue-500 to-indigo-500',
                },
                {
                  stars: 5,
                  text: 'Bellissimo! The design is stunning and it really helps me appreciate every single week of my life.',
                  initials: 'GR',
                  name: 'Giulia R.',
                  role: 'Artist',
                  country: 'Italy',
                  flag: '🇮🇹',
                  gradient: 'from-emerald-500 to-teal-500',
                },
                {
                  stars: 5,
                  text: 'Life changing. I use it every Sunday to plan my week. It gives me a sense of urgency and purpose.',
                  initials: 'RS',
                  name: 'Rafael S.',
                  role: 'Entrepreneur',
                  country: 'Brazil',
                  flag: '🇧🇷',
                  gradient: 'from-amber-500 to-orange-500',
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className={`p-6 rounded-2xl backdrop-blur-xl border flex flex-col h-full ${darkMode ? 'bg-slate-800/30 border-slate-700/50' : 'bg-white/40 border-white/50'}`}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, j) => (
                      <span key={j} className="text-yellow-400 text-xs">
                        ★
                      </span>
                    ))}
                  </div>
                  <p
                    className={`text-sm leading-relaxed mb-6 flex-grow ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  >
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {testimonial.initials}
                    </div>
                    <div>
                      <div
                        className={`font-bold text-sm flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}
                      >
                        {testimonial.name}{' '}
                        <span className="text-base" role="img" aria-label={testimonial.country}>
                          {testimonial.flag}
                        </span>
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Shared Footer */}
      <Footer
        darkMode={darkMode}
        isAuthenticated={false}
        onNavigate={page => {
          if (page === 'login') handleLoginClick()
          else if (page === 'signup') handleSignUpClick()
          else setCurrentPage(page)
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginComplete}
        initialMode={isSignUpMode ? 'signup' : 'login'}
        initialData={initialAuthData}
      />
    </main>
  )
}

export default HomePage
