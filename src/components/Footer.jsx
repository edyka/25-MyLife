import { motion } from "framer-motion";
import { useState } from "react";
import {
  Heart,
  Mail,
  Instagram,
  Facebook,
  X,
  AtSign,
  Shield,
  Info,
  FileText,
  Cookie,
  Lock,
} from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { usePremiumStore } from "../stores/usePremiumStore";
import { getTheme } from "../utils/themeConfig";
import UpgradeModal from "./UpgradeModal";

const Footer = ({ darkMode, onNavigate, isAuthenticated = true }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const setThemePreset = useUIStore((state) => state.setThemePreset);
  const theme = getTheme(themePreset);
  const currentYear = new Date().getFullYear();
  const [hoveredTheme, setHoveredTheme] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Feature gating for themes
  const hasPremiumThemes = usePremiumStore((state) => state.hasFeature('premiumThemes'));

  const themes = [
    { key: 'emerald', color: '#10b981', name: 'Emerald', premium: false },
    { key: 'ocean', color: '#3b82f6', name: 'Ocean', premium: true },
    { key: 'sunset', color: '#f97316', name: 'Sunset', premium: true },
    { key: 'purple', color: '#a855f7', name: 'Purple', premium: true },
  ];

  const handleThemeClick = (themeItem) => {
    if (themeItem.premium && !hasPremiumThemes) {
      setShowUpgradeModal(true);
    } else {
      setThemePreset(themeItem.key);
    }
  };

  const socialLinks = [
    {
      icon: Instagram,
      label: "Instagram",
      href: "https://www.instagram.com/vieventiva/",
      color: "text-pink-500 hover:text-pink-600",
    },
    {
      icon: AtSign,
      label: "Threads",
      href: "https://www.threads.com/@vieventiva",
      color: "text-purple-500 hover:text-purple-600",
    },
    {
      icon: Facebook,
      label: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61579073098304",
      color: "text-blue-600 hover:text-blue-700",
    },
    {
      icon: X,
      label: "Twitter/X",
      href: "https://x.com/Viventiva_",
      color: "text-sky-500 hover:text-sky-600",
    },
  ];

  const footerLinks = [
    { icon: Info, label: "About", action: () => onNavigate('about') },
    { icon: Mail, label: "Contact", href: "mailto:contact@viventiva.com" },
    { icon: Shield, label: "Privacy Policy", action: () => onNavigate('privacy') },
    { icon: FileText, label: "Terms of Service", action: () => onNavigate('terms') },
    {
      icon: Cookie, label: "Cookie Settings", action: () => {
        // Navigate to settings page and show privacy preferences
        const event = new CustomEvent('showPrivacySettings');
        window.dispatchEvent(event);
        onNavigate('settings');
      }
    },
  ];

  return (
    <footer
      className={`border-t-2 transition-all duration-500 ${darkMode
        ? "premium-card-dark border-slate-700/30"
        : "premium-card border-slate-200/30"
        } backdrop-blur-lg`}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Enhanced Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-5 mb-8">
              <div className="relative">
                <div className={`w-12 h-12 bg-gradient-to-br ${theme.iconBg} rounded-3xl shadow-xl ${theme.shadow} flex items-center justify-center group`}>
                  <div className="grid grid-cols-3 gap-1 w-6 h-6">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white/95 rounded-sm group-hover:bg-white transition-all duration-300"></div>
                    ))}
                  </div>
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br ${theme.iconBg} rounded-full border-2 border-white shadow-lg animate-pulse`}></div>
              </div>
              <div>
                <h3
                  className={`text-display font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent ${darkMode ? "drop-shadow-sm" : ""
                    }`}
                >
                  Viventiva
                </h3>
                <p className={`text-caption font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  Live Vividly
                </p>
              </div>
            </div>
            <p
              className={`text-body leading-relaxed mb-8 max-w-lg ${darkMode ? "text-slate-300" : "text-slate-600"
                }`}
            >
              Transform how you visualize your life's journey. Each week matters, each moment counts.
              Make every week intentional with beautiful, meaningful life tracking.
            </p>
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl group`}
              style={{
                background: darkMode
                  ? `linear-gradient(to right, ${theme.colors.primary}20, ${theme.colors.secondary}20)`
                  : `linear-gradient(to right, ${theme.colors.primary}0D, ${theme.colors.secondary}0D)`,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: darkMode ? `${theme.colors.primary}50` : `${theme.colors.primary}30`,
                color: theme.colors.primary
              }}
            >
              Made with <Heart className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-300" /> for
              intentional living
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div>
            <h4
              className={`text-heading mb-6 ${darkMode ? "text-slate-100" : "text-slate-800"
                }`}
            >
              Quick Links
            </h4>
            <ul className="space-y-4">
              {footerLinks.map((link, index) => {
                const IconComponent = link.icon;
                const Component = link.href ? motion.a : motion.button;
                const props = link.href
                  ? { href: link.href }
                  : { onClick: link.action, type: "button" };

                return (
                  <li key={index}>
                    <Component
                      {...props}
                      className={`interactive-element flex items-center gap-4 text-body font-semibold transition-all duration-300 px-3 py-2 rounded-xl ${darkMode
                        ? "text-slate-300 hover:text-slate-100 hover:bg-slate-800/40"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-100/60"
                        } group`}
                      whileHover={{ x: 6 }}
                      transition={{ duration: 0.3 }}
                    >
                      <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      {link.label}
                    </Component>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Enhanced Social Media */}
          <div>
            <h4
              className={`text-heading mb-6 ${darkMode ? "text-slate-100" : "text-slate-800"
                }`}
            >
              Connect With Us
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`interactive-element p-4 rounded-2xl transition-all duration-300 border-2 ${darkMode
                      ? "bg-slate-800/50 hover:bg-slate-700/60 border-slate-700/50 hover:border-slate-600"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200/50 hover:border-slate-300"
                      } shadow-lg hover:shadow-xl group`}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <IconComponent className={`w-6 h-6 ${social.color} group-hover:scale-110 transition-transform duration-300`} />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Divider */}
        <div
          className={`border-t-2 pt-8 ${darkMode ? "border-slate-700/30" : "border-slate-200/30"
            }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Enhanced Copyright */}
            <div
              className={`text-body font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"
                }`}
            >
              © {currentYear} Viventiva. All rights reserved.
            </div>

            {/* Theme Selector with Dots - Only show for authenticated users */}
            {isAuthenticated && (
              <div
                className={`text-caption flex items-center gap-4 font-semibold px-4 py-2 rounded-2xl border ${darkMode
                  ? "text-slate-400 bg-slate-800/40 border-slate-700/50"
                  : "text-slate-600 bg-slate-100/60 border-slate-200/50"
                  }`}
              >
                <span>Theme Colors</span>
                <div className="flex items-center gap-2 relative">
                  {themes.map((themeItem) => {
                    const isLocked = themeItem.premium && !hasPremiumThemes;
                    return (
                      <button
                        key={themeItem.key}
                        onClick={() => handleThemeClick(themeItem)}
                        onMouseEnter={() => setHoveredTheme(themeItem.key)}
                        onMouseLeave={() => setHoveredTheme(null)}
                        className={`relative w-3 h-3 rounded-full transition-all duration-300 ${themePreset === themeItem.key
                          ? 'ring-2 ring-offset-2 scale-125'
                          : 'hover:scale-125'
                          } ${darkMode ? 'ring-offset-slate-800' : 'ring-offset-white'
                          } ${isLocked ? 'opacity-60' : ''}`}
                        style={{
                          backgroundColor: themeItem.color,
                          ringColor: themeItem.color
                        }}
                        aria-label={`Switch to ${themeItem.name} theme${isLocked ? ' (Pro)' : ''}`}
                      >
                        {isLocked && (
                          <Lock className="w-2 h-2 text-white absolute -top-0.5 -right-0.5" />
                        )}
                      </button>
                    );
                  })}

                  {/* Tooltip */}
                  {hoveredTheme && (
                    <div
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${darkMode
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-900 text-white'
                        } shadow-lg z-50`}
                    >
                      {themes.find(t => t.key === hoveredTheme)?.name}
                      {themes.find(t => t.key === hoveredTheme)?.premium && !hasPremiumThemes && ' 🔒'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="Premium Themes"
      />
    </footer>
  );
};

export default Footer;
