import Footer from "./Footer";
import LifeCalculator from "./LifeCalculator";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  LogIn,
  UserPlus,
  Calendar,
  Smile,
  Target,
  Clock,
  Zap,
  Shield,
  Heart,
  Sun,
  Moon
} from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useState } from "react";
import LoginModal from "./LoginModal";
import WaitlistPage from "./WaitlistPage";

// Toggle this to switch between waitlist and full homepage
const WAITLIST_MODE = true;


const HOW_IT_WORKS = [
  {
    icon: Calendar,
    title: "Input Your Birth Date",
    description: "We calculate your precise life progress based on statistical data."
  },
  {
    icon: Clock,
    title: "Visualize Your Time",
    description: "See your life as a grid of weeks. Every box is a week of your life."
  },
  {
    icon: Target,
    title: "Plan Your Legacy",
    description: "Set goals, track moods, and make every remaining week count."
  }
];

const BENEFITS = [
  {
    icon: Zap,
    title: "Laser Focus",
    description: "Stop drifting through life. See exactly how much time you have to achieve your dreams."
  },
  {
    icon: Smile,
    title: "Perspective Shift",
    description: "Small worries fade away when you see the big picture of your life's journey."
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your life data is yours alone. We use bank-level encryption to keep it safe."
  }
];

const HomePage = ({ darkMode, onLogin }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const setDarkMode = useUIStore((state) => state.setDarkMode);
  const theme = getTheme(themePreset);

  // Map presets to Tailwind color names for dynamic classes
  const themeColors = {
    emerald: 'emerald',
    ocean: 'blue',
    sunset: 'orange',
    purple: 'purple'
  };
  const activeColor = themeColors[themePreset] || 'emerald';

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [initialAuthData, setInitialAuthData] = useState(null);

  const handleLoginClick = () => {
    setIsSignUpMode(false);
    setInitialAuthData(null);
    setShowLoginModal(true);
  };

  const handleSignUpClick = (data = null) => {
    setIsSignUpMode(true);
    // If data is passed (from LifeCalculator), store it
    if (data && data.birthDate) {
      setInitialAuthData(data);
    } else {
      setInitialAuthData(null);
    }
    setShowLoginModal(true);
  };

  const handleLoginComplete = async () => {
    setShowLoginModal(false);
    onLogin();
  };

  // Show waitlist page if in waitlist mode
  if (WAITLIST_MODE) {
    return <WaitlistPage />;
  }

  return (
    <main
      id="main-content"
      role="main"
      aria-label="Viventiva homepage"
      className={`min-h-screen flex flex-col relative overflow-hidden ${darkMode ? "bg-slate-900" : "bg-slate-50"}`}
    >
      {/* Aurora Background - Global (behind everything) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse-slow ${darkMode ? `bg-${activeColor}-900` : `bg-${activeColor}-200`}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse-slow delay-1000 ${darkMode ? `bg-${activeColor === 'purple' ? 'blue' : activeColor}-900` : `bg-${activeColor === 'purple' ? 'blue' : activeColor}-200`}`} />
      </div>

      {/* Top Right Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-6 right-6 z-[60] flex items-center gap-3"
      >
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-xl font-semibold text-sm transition-all duration-300 ${darkMode
            ? "bg-slate-800/80 backdrop-blur-xl text-yellow-400 hover:bg-slate-700 border border-slate-700"
            : "bg-white/80 backdrop-blur-xl text-slate-700 hover:bg-white border border-slate-200"
            } shadow-lg hover:shadow-xl`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLoginClick();
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${darkMode
            ? "bg-slate-800/80 backdrop-blur-xl text-white hover:bg-slate-700 border border-slate-700"
            : "bg-white/80 backdrop-blur-xl text-slate-900 hover:bg-white border border-slate-200"
            } shadow-lg hover:shadow-xl`}
        >
          <LogIn className="w-4 h-4" />
          Log In
        </button>
      </motion.div>


      {/* SECTION 1: HERO (Default BG) */}
      <section className="relative z-10 w-full pt-32 pb-20 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-8 flex justify-center">
            <div className="relative transform scale-150">
              <div className={`w-12 h-12 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-xl ${theme.shadow} flex items-center justify-center group`}>
                <div className="grid grid-cols-3 gap-1 w-6 h-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"></div>
                  ))}
                </div>
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-lg animate-pulse`}></div>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl font-black mb-8 tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}>
            Visualize <span className={`text-transparent bg-clip-text bg-gradient-to-r from-${activeColor}-400 to-${activeColor}-600`}>Your Life</span>
          </h1>

          <p className={`text-xl md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            See your entire life in weeks. Make every single one count.
          </p>

          <motion.figure
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <blockquote className={`text-lg italic font-serif ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              "The trouble is, you think you have time."
            </blockquote>
            <figcaption className={`text-sm mt-2 font-medium ${darkMode ? "text-slate-600" : "text-slate-400"}`}>— Buddha</figcaption>
          </motion.figure>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignUpClick}
            className={`group relative px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-${activeColor}-500/20 overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-${activeColor}-500 to-${activeColor}-600 transition-transform duration-300 group-hover:scale-110`} />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Visualize My Life
            </span>
          </motion.button>
        </motion.div>
      </section>

      {/* SECTION 2: HOW IT WORKS (Alternate BG) */}
      <section className={`relative z-10 w-full py-24 px-4 sm:px-6 ${darkMode ? "bg-slate-800/30" : "bg-white/60"} backdrop-blur-sm`}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className={`hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`} />

            {[
              { icon: Calendar, title: "Input Your Birth Date", desc: "We calculate your precise life progress based on statistical data." },
              { icon: Clock, title: "Visualize Your Time", desc: "See your life as a grid of weeks. Every box is a week of your life." },
              { icon: Target, title: "Plan Your Legacy", desc: "Set goals, track moods, and make every remaining week count." }
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                <div className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center text-3xl font-bold transition-all duration-300 relative z-10 ${darkMode
                  ? "bg-slate-900 border-2 border-slate-800 group-hover:border-" + activeColor + "-500/50 group-hover:shadow-[0_0_30px_-10px_rgba(var(--" + activeColor + "-500),0.3)]"
                  : "bg-white border-2 border-slate-100 group-hover:border-" + activeColor + "-500/50 group-hover:shadow-xl"
                  }`}>
                  <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${darkMode ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                    {i + 1}
                  </div>
                  <item.icon className={`w-10 h-10 text-${activeColor}-500`} />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed max-w-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Interactive Life Calculator */}
      <LifeCalculator
        darkMode={darkMode}
        activeColor={activeColor}
        onSignUp={handleSignUpClick}
      />

      {/* SECTION 3: WHY VIVENTIVA (Default BG) */}
      <section className="relative z-10 w-full py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className={`text-3xl md:text-4xl font-black mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Why Viventiva?
              </h2>
              <p className={`text-lg mb-10 leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                Most people live as if they have infinite time. Viventiva gives you the visual clarity to prioritize what truly matters.
              </p>
              <div className="space-y-6">
                {BENEFITS.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className={`flex items-start gap-5 p-4 rounded-2xl transition-all duration-300 ${darkMode ? "hover:bg-slate-800/50" : "hover:bg-white/50"}`}>
                      <div className={`p-3.5 rounded-2xl shadow-sm ${darkMode ? "bg-slate-800 text-" + activeColor + "-400" : "bg-white text-" + activeColor + "-600"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-lg mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>{benefit.title}</h4>
                        <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative transform md:translate-x-8">
              <div className={`aspect-square rounded-full bg-gradient-to-tr from-${activeColor}-500 to-purple-600 opacity-20 blur-[100px] absolute inset-0 animate-pulse-slow`}></div>
              <div className={`relative z-10 rounded-3xl p-8 border backdrop-blur-xl ${darkMode ? "bg-slate-900/80 border-slate-700" : "bg-white/80 border-slate-200"} shadow-2xl transform rotate-3 transition-transform duration-500 hover:rotate-0`}>
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Your Life Progress</div>
                    <div className={`text-sm font-bold text-${activeColor}-500`}>34%</div>
                  </div>
                  <div className={`h-4 rounded-full ${darkMode ? "bg-slate-800" : "bg-slate-100"} overflow-hidden`}>
                    <div className={`h-full rounded-full bg-gradient-to-r ${theme.primary} w-[34%]`}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className={`p-5 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                      <div className={`text-3xl font-black mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>2,840</div>
                      <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Weeks Left</div>
                    </div>
                    <div className={`p-5 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                      <div className={`text-3xl font-black mb-1 ${darkMode ? "text-white" : "text-slate-900"}`}>1,560</div>
                      <div className={`text-xs font-medium uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Weeks Lived</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 4: CTA & SOCIAL PROOF (Alternate BG) */}
      <section className={`relative z-10 w-full py-24 px-4 sm:px-6 ${darkMode ? "bg-slate-800/30" : "bg-white/60"} backdrop-blur-sm`}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          {/* CTA Button */}
          <div className="max-w-4xl mx-auto text-center mb-24">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignUpClick}
                className={`group relative px-10 py-5 rounded-full font-bold text-xl shadow-xl shadow-${activeColor}-500/30 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-${activeColor}-500 to-${activeColor}-600 transition-transform duration-300 group-hover:scale-110`} />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative text-white flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Visualize My Life
                </span>
              </motion.button>
            </div>
          </div>

          {/* Social Proof Section - Updated with Flags & Photos */}
          <div className="max-w-7xl mx-auto">
            {/* Stats */}
            <div className="text-center mb-16">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${darkMode ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/50 border border-slate-200"} backdrop-blur-sm`}>
                <div className="flex -space-x-2">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" />
                  <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" />
                  <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <span className={`text-sm font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Join 36,000+ people visualizing their lives
                </span>
              </div>
              <h2 className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>Loved Worldwide</h2>
            </div>

            {/* Testimonials Grid - 4 Columns for International Representation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  stars: 5,
                  text: "This completely changed how I think about time. Seeing my life in weeks made me realize I need to stop procrastinating.",
                  name: "Sarah Miller",
                  role: "Designer",
                  country: "USA",
                  flag: "🇺🇸",
                  img: "https://randomuser.me/api/portraits/women/44.jpg"
                },
                {
                  stars: 5,
                  text: "Efficiency and clarity in one app. The visualization is exactly what I needed to structure my long-term goals.",
                  name: "Klaus Weber",
                  role: "Engineer",
                  country: "Germany",
                  flag: "🇩🇪",
                  img: "https://randomuser.me/api/portraits/men/32.jpg"
                },
                {
                  stars: 5,
                  text: "Bellissimo! The design is stunning and it really helps me appreciate every single week of my life.",
                  name: "Giulia Romano",
                  role: "Artist",
                  country: "Italy",
                  flag: "🇮🇹",
                  img: "https://randomuser.me/api/portraits/women/68.jpg"
                },
                {
                  stars: 5,
                  text: "Life changing. I use it every Sunday to plan my week. It gives me a sense of urgency and purpose.",
                  name: "Rafael Silva",
                  role: "Entrepreneur",
                  country: "Brazil",
                  flag: "🇧🇷",
                  img: "https://randomuser.me/api/portraits/men/45.jpg"
                }
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * (i + 1) }}
                  className={`p-6 rounded-2xl backdrop-blur-xl border flex flex-col h-full ${darkMode ? "bg-slate-800/30 border-slate-700/50" : "bg-white/40 border-white/50"}`}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.stars)].map((_, j) => (
                      <span key={j} className="text-yellow-400 text-xs">★</span>
                    ))}
                  </div>
                  <p className={`text-sm leading-relaxed mb-6 flex-grow ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3 mt-auto">
                    <img src={testimonial.img} alt={testimonial.name} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className={`font-bold text-sm flex items-center gap-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                        {testimonial.name} <span className="text-base" role="img" aria-label={testimonial.country}>{testimonial.flag}</span>
                      </div>
                      <div className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-500"}`}>{testimonial.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Shared Footer */}
      <Footer darkMode={darkMode} onNavigate={(page) => {
        if (page === 'login') handleLoginClick();
        if (page === 'signup') handleSignUpClick();
      }} />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginComplete}
        initialMode={isSignUpMode ? 'signup' : 'login'}
        initialData={initialAuthData}
      />
    </main>
  );
};

export default HomePage;
