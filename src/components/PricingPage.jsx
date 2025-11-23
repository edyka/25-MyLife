import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";

const PricingPage = ({ darkMode }) => {
  const themePreset = useUIStore((state) => state.themePreset);
  const theme = getTheme(themePreset);

  const tiers = [
    {
      name: "Vivid",
      tagline: "Start your intentional living journey",
      price: "Free",
      period: "Forever",
      icon: Sparkles,
      features: [
        { text: "Life Grid visualization (80 years)", active: true },
        { text: "3 preset moods (Happy, Focused, Sad)", active: true },
        { text: "Basic life statistics", active: true },
        { text: "Dark mode", active: true },
        { text: "1 default theme", active: true },
        { text: "Up to 3 goals", active: true },
        { text: "Secure cloud sync", active: true },
        { text: "Mobile responsive", active: true },
        { text: "JSON export", active: false }
      ],
      cta: "Start Your Journey",
      ctaStyle: "secondary",
      highlighted: false
    },
    {
      name: "Vivente",
      tagline: "Live with intention and insight",
      price: "$39.99",
      period: "per year",
      monthlyPrice: "$4.99/month",
      icon: Zap,
      badge: "Most Popular",
      features: [
        { text: "Everything in Vivid, plus:", active: true, bold: true },
        { text: "Unlimited custom moods", active: true },
        { text: "All 4 theme presets", active: true },
        { text: "Life insights dashboard", active: true },
        { text: "Mood distribution charts", active: false },
        { text: "Trend analysis", active: false },
        { text: "Unlimited goals", active: true },
        { text: "Goal analytics", active: false },
        { text: "PDF & image export", active: false },
        { text: "Weekly reflection prompts", active: false },
        { text: "Priority email support", active: true }
      ],
      cta: "Unlock Full Insights",
      ctaStyle: "primary",
      highlighted: true,
      savings: "Save 33%"
    },
    {
      name: "Viventiva Pro",
      tagline: "Own your legacy forever",
      price: "$99",
      period: "Lifetime",
      originalPrice: "$149",
      icon: Crown,
      badge: "Best Value",
      features: [
        { text: "Everything in Vivente, plus:", active: true, bold: true },
        { text: "Lifetime access to all features", active: true },
        { text: "Custom CSS theming", active: false },
        { text: "Mood templates & hierarchies", active: false },
        { text: "Time capsules (notes to future you)", active: false },
        { text: "AI-powered insights", active: false },
        { text: "Life milestones timeline", active: true },
        { text: "API access", active: false },
        { text: "Private community access", active: false },
        { text: "Founding member badge", active: true },
        { text: "Vote on new features", active: true },
        { text: "All future updates included", active: true }
      ],
      cta: "Get Lifetime Access",
      ctaStyle: "premium",
      highlighted: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${darkMode ? `bg-${theme.primary.split('-')[1]}-900/30 text-${theme.primary.split('-')[1]}-400` : `bg-${theme.primary.split('-')[1]}-100 text-${theme.primary.split('-')[1]}-600`}`}>
          <Sparkles className="w-3 h-3" />
          Invest in Yourself
        </div>
        <h1 className={`text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Choose How You Want to Live Vividly
        </h1>
        <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Start free. Upgrade when you're ready to unlock deeper insights into your life's journey.
        </p>

        {/* Trust Indicators */}
        <div className={`flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          <div className="flex items-center gap-2 bg-slate-500/10 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
            <span>Secure Cloud Sync</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-500/10 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-500/10 px-3 py-1.5 rounded-full">
            <Check className="w-4 h-4 text-green-500" />
            <span>30-Day Guarantee</span>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const isHighlighted = tier.highlighted;
          const isPro = tier.name === "Viventiva Pro";

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`relative rounded-3xl p-8 flex flex-col backdrop-blur-xl ${isHighlighted
                ? darkMode
                  ? `bg-white/5 border border-white/10 shadow-2xl shadow-${theme.primary.split('-')[1]}-500/10 ring-1 ring-${theme.primary.split('-')[1]}-500/20`
                  : `bg-white/60 border border-white/20 shadow-2xl shadow-${theme.primary.split('-')[1]}-500/5 ring-1 ring-${theme.primary.split('-')[1]}-400/30`
                : isPro
                  ? darkMode
                    ? "bg-gradient-to-b from-white/5 to-white/[0.02] border border-amber-500/20 shadow-xl shadow-amber-500/5"
                    : "bg-gradient-to-b from-white/70 to-white/40 border border-amber-200/40 shadow-xl shadow-amber-500/5"
                  : darkMode
                    ? "bg-white/[0.03] border border-white/5 shadow-xl"
                    : "bg-white/50 border border-white/20 shadow-xl"
                } ${isHighlighted ? "md:-mt-4 md:mb-4 md:scale-105 z-10" : ""} transition-all duration-500`}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${isPro
                    ? "bg-gradient-to-r from-amber-400/90 to-orange-500/90 text-white border border-white/20"
                    : `bg-gradient-to-r ${theme.primary.replace('from-', 'from-').replace('to-', 'to-')}/90 backdrop-blur-md text-white border border-white/20`
                    }`}
                  style={{
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                >
                  {tier.badge}
                </div>
              )}

              {/* Header */}
              <div className="mb-8">
                <div className={`inline-flex p-4 rounded-2xl mb-6 backdrop-blur-md ${isPro
                  ? "bg-gradient-to-br from-amber-400/20 to-orange-600/20 shadow-lg shadow-amber-500/10 border border-amber-300/20"
                  : isHighlighted
                    ? `bg-gradient-to-br ${theme.primary.replace('from-', 'from-').replace('to-', 'to-')}/20 shadow-lg border border-white/10`
                    : darkMode ? "bg-white/5 border border-white/5" : "bg-white/30 border border-white/20"
                  }`}>
                  <Icon className={`w-7 h-7 ${isPro ? "text-amber-500" : isHighlighted ? `text-${theme.primary.split('-')[1]}-500` : darkMode ? "text-slate-400" : "text-slate-600"}`} />
                </div>

                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {tier.tagline}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2 mb-3">
                  {tier.originalPrice && (
                    <span className={`text-lg line-through decoration-2 ${darkMode ? "text-slate-600 decoration-slate-600" : "text-slate-400 decoration-slate-400"}`}>
                      {tier.originalPrice}
                    </span>
                  )}
                  <span className={`text-5xl font-black tracking-tight ${isPro
                    ? "bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent"
                    : darkMode ? "text-white" : "text-slate-900"
                    }`}>
                    {tier.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    {tier.period}
                  </p>
                  {tier.savings && (
                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                      {tier.savings}
                    </span>
                  )}
                </div>
                {tier.monthlyPrice && (
                  <p className={`text-xs mt-2 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    or {tier.monthlyPrice}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className={`h-px w-full mb-8 ${darkMode ? "bg-white/5" : "bg-slate-200/50"}`} />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-3 ${!feature.active ? "opacity-40" : ""}`}>
                    {feature.bold ? (
                      <span className={`text-sm font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                        {feature.text}
                      </span>
                    ) : (
                      <>
                        <div className={`mt-0.5 p-1 rounded-full backdrop-blur-sm ${!feature.active
                          ? darkMode ? "bg-white/5 text-slate-500" : "bg-slate-200/50 text-slate-400"
                          : isPro
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : isHighlighted
                              ? `bg-${theme.primary.split('-')[1]}-500/10 text-${theme.primary.split('-')[1]}-500 border border-${theme.primary.split('-')[1]}-500/20`
                              : darkMode ? "bg-white/5 text-slate-400" : "bg-slate-200/30 text-slate-600"
                          }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                            {feature.text}
                          </span>
                          {!feature.active && (
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-1">
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 backdrop-blur-md ${tier.ctaStyle === "primary"
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg shadow-${theme.primary.split('-')[1]}-500/20 hover:shadow-xl border border-white/10`
                    : tier.ctaStyle === "premium"
                      ? "bg-gradient-to-r from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl border border-white/10"
                      : darkMode
                        ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                        : "bg-white/40 hover:bg-white/60 text-slate-900 border border-white/20"
                    }`}
                >
                  {tier.cta}
                </motion.button>

                {tier.name === "Vivente" && (
                  <p className={`text-xs text-center mt-3 font-medium ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
                    7-day free trial • Cancel anytime
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`rounded-[2.5rem] p-8 md:p-12 ${darkMode ? "bg-slate-800/30 border border-slate-700/50" : "bg-white shadow-xl border border-slate-100"}`}
      >
        <h2 className={`text-3xl font-black mb-12 text-center ${darkMode ? "text-white" : "text-slate-900"}`}>
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {[
            {
              q: "What happens to my data if I cancel?",
              a: "You keep all your data - it's stored locally on your device. You'll simply drop back to the free Vivid tier features. Your data won't be deleted, just locked until you resubscribe."
            },
            {
              q: "Is my data really private?",
              a: "Absolutely. 100% of your data lives on your device. We don't have servers storing your life information. Even with Pro features, everything remains local-first."
            },
            {
              q: "Can I switch from monthly to yearly?",
              a: "Yes! Upgrade anytime from your account settings. We'll credit any unused monthly time toward your yearly subscription."
            },
            {
              q: "Do you offer refunds?",
              a: "Yes. 30-day money-back guarantee on all paid tiers, no questions asked. We want you to love Viventiva or get your money back."
            },
            {
              q: "Will the Pro price increase to $149?",
              a: "Yes. We're offering $99 to early supporters during our launch period. Current Pro users are grandfathered at their purchase price."
            },
            {
              q: "Student/teacher discount?",
              a: "Yes! Email support@viventiva.com with proof of status for a 40% education discount."
            }
          ].map((faq, i) => (
            <div key={i}>
              <h3 className={`font-bold text-lg mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}>
                {faq.q}
              </h3>
              <p className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <p className={`text-lg mb-4 font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          We believe everyone deserves to live vividly.
        </p>
        <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
          Questions? Email us at{" "}
          <a href="mailto:support@viventiva.com" className={`font-bold hover:underline ${darkMode ? "text-white" : "text-slate-900"}`}>
            support@viventiva.com
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default PricingPage;
