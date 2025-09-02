import { motion } from "framer-motion";
import {
  Heart,
  Mail,
  Github,
  Instagram,
  Facebook,
  X,
  AtSign,
  Shield,
  FileText,
  Info,
} from "lucide-react";

const Footer = ({ darkMode, onNavigate }) => {
  const currentYear = new Date().getFullYear();

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
      label: "Twitter",
      href: "https://x.com/Viventiva_",
      color: "text-sky-500 hover:text-sky-600",
    },
    {
      icon: Github,
      label: "GitHub",
      href: "#",
      color:
        "text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white",
    },
  ];

  const footerLinks = [
    { icon: Info, label: "About", action: () => onNavigate('about') },
    { icon: Mail, label: "Contact", href: "mailto:contact@viventiva.com" },
    { icon: Shield, label: "Privacy Policy", action: () => onNavigate('privacy') },
    { icon: FileText, label: "Terms of Service", action: () => onNavigate('terms') },
  ];

  return (
    <footer
      className={`mt-16 border-t transition-all duration-300 ${
        darkMode
          ? "bg-slate-900/50 border-slate-700/50 backdrop-blur-sm"
          : "bg-white/50 border-orange-200/50 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-0.5 w-4 h-4">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white/90 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border border-white shadow-sm"></div>
              </div>
              <h3
                className={`text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent ${
                  darkMode ? "drop-shadow-sm" : ""
                }`}
              >
                Viventiva
              </h3>
            </div>
            <p
              className={`text-sm leading-relaxed mb-6 max-w-md ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              A meaningful way to visualize your life's journey. Each week
              matters, each moment counts. Transform how you see time and make
              every week intentional.
            </p>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold ${
                darkMode
                  ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30"
                  : "bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 border border-orange-200"
              }`}
            >
              Made with <Heart className="w-3 h-3 text-red-500" /> for
              intentional living
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className={`font-bold mb-4 text-lg ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Quick Links
            </h4>
            <ul className="space-y-3">
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
                      className={`flex items-center gap-3 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        darkMode
                          ? "text-slate-300 hover:text-slate-100"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconComponent className="w-4 h-4" />
                      {link.label}
                    </Component>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4
              className={`font-bold mb-4 text-lg ${
                darkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Connect
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      darkMode
                        ? "bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:scale-110"
                        : "bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:scale-110"
                    }`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.label}
                  >
                    <IconComponent className={`w-4 h-4 ${social.color}`} />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div
          className={`border-t pt-8 ${
            darkMode ? "border-slate-700/50" : "border-orange-200/50"
          }`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div
              className={`text-sm font-medium ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              © {currentYear} Viventiva. All rights reserved.
            </div>

            {/* Tech Stack Credit */}
            <div
              className={`text-xs flex items-center gap-3 font-medium ${
                darkMode ? "text-slate-500" : "text-slate-500"
              }`}
            >
              <span>Built with React, Tailwind CSS & Framer Motion</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
