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
        "Life Grid visualization (80 years)",
        "3 preset moods (Happy, Focused, Sad)",
        "Basic life statistics",
        "Dark mode",
        "1 default theme",
        "Up to 3 goals",
        "Local data storage",
        "Mobile responsive",
        "JSON export"
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
        "Everything in Vivid, plus:",
        "Unlimited custom moods",
        "All 4 theme presets",
        "Life insights dashboard",
        "Mood distribution charts",
        "Trend analysis",
        "Unlimited goals",
        "Goal analytics",
        "PDF & image export",
        "Weekly reflection prompts",
        "Priority email support"
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
        "Everything in Vivente, plus:",
        "Lifetime access to all features",
        "Custom CSS theming",
        "Mood templates & hierarchies",
        "Time capsules (notes to future you)",
        "AI-powered insights",
        "Life milestones timeline",
        "API access",
        "Private community access",
        "Founding member badge",
        "Vote on new features",
        "All future updates included"
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
        <h1 className={`text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
          Choose How You Want to Live Vividly
        </h1>
        <p className={`text-lg md:text-xl mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Start free. Upgrade when you're ready to unlock deeper insights into your life's journey.
        </p>

        {/* Trust Indicators */}
        <div className={`flex flex-wrap justify-center gap-6 text-sm ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Your data stays yours - 100% local storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Cancel anytime. No hidden fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const isHighlighted = tier.highlighted;

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`relative rounded-3xl p-8 backdrop-blur-xl border flex flex-col shadow-xl ${
                isHighlighted
                  ? darkMode
                    ? "bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/50 shadow-blue-500/20"
                    : "bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 border-blue-300/50 shadow-blue-500/20"
                  : darkMode
                  ? "bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 shadow-slate-900/20"
                  : "bg-white/60 border-slate-200/50 hover:border-slate-300/50 shadow-slate-900/10"
              } ${isHighlighted ? "md:scale-105" : ""} transition-all duration-300 hover:shadow-2xl`}
              style={{
                backgroundImage: isHighlighted
                  ? darkMode
                    ? 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 50%)'
                    : 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.1), transparent 50%)'
                  : 'none'
              }}
            >
              {/* Badge */}
              {tier.badge && (
                <div
                  className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${theme.primary} text-white shadow-lg`}
                >
                  {tier.badge}
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${theme.iconBg} mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Tier Name */}
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                {tier.name}
              </h3>

              {/* Tagline */}
              <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                {tier.tagline}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {tier.originalPrice && (
                    <span className={`text-lg line-through ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
                      {tier.originalPrice}
                    </span>
                  )}
                  <span className={`text-4xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                    {tier.price}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                  {tier.period}
                </p>
                {tier.monthlyPrice && (
                  <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                    or {tier.monthlyPrice}
                  </p>
                )}
                {tier.savings && (
                  <p className="text-sm text-green-500 font-semibold mt-1">
                    {tier.savings}
                  </p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    {feature.includes("Everything in") ? (
                      <span className={`text-sm font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                        {feature}
                      </span>
                    ) : (
                      <>
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          isHighlighted ? "text-blue-500" : "text-green-500"
                        }`} />
                        <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                          {feature}
                        </span>
                      </>
                    )}
                  </li>
                ))}
              </ul>

              {/* CTA Button - Fixed at bottom */}
              <div className="mt-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-300 ${
                  tier.ctaStyle === "primary"
                    ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg hover:shadow-xl`
                    : tier.ctaStyle === "premium"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/30"
                    : darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-white shadow-md hover:shadow-lg"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-900 shadow-md hover:shadow-lg"
                } ${isHighlighted ? 'shadow-blue-500/30' : ''}`}
              >
                {tier.cta}
              </motion.button>

              {tier.name === "Vivente" && (
                <p className={`text-xs text-center mt-2 ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
                  7-day free trial, cancel anytime
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
        className={`rounded-2xl p-8 ${darkMode ? "premium-card-dark" : "premium-card"}`}
      >
        <h2 className={`text-3xl font-bold mb-8 text-center ${darkMode ? "text-white" : "text-slate-900"}`}>
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              What happens to my data if I cancel?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              You keep all your data - it's stored locally on your device. You'll simply drop back to the free Vivid tier features. Your data won't be deleted, just locked until you resubscribe.
            </p>
          </div>

          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Is my data really private?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Absolutely. 100% of your data lives on your device. We don't have servers storing your life information. Even with Pro features, everything remains local-first.
            </p>
          </div>

          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Can I switch from monthly to yearly?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Yes! Upgrade anytime from your account settings. We'll credit any unused monthly time toward your yearly subscription.
            </p>
          </div>

          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Do you offer refunds?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Yes. 30-day money-back guarantee on all paid tiers, no questions asked. We want you to love Viventiva or get your money back.
            </p>
          </div>

          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Will the Pro price increase to $149?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Yes. We're offering $99 to early supporters during our launch period. Current Pro users are grandfathered at their purchase price.
            </p>
          </div>

          <div>
            <h3 className={`font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Student/teacher discount?
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              Yes! Email support@viventiva.com with proof of status for a 40% education discount.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-12"
      >
        <p className={`text-lg mb-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          We believe everyone deserves to live vividly.
        </p>
        <p className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-600"}`}>
          Questions? Email us at{" "}
          <a href="mailto:support@viventiva.com" className="text-blue-500 hover:underline">
            support@viventiva.com
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default PricingPage;
