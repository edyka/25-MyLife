import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";
import { usePremiumStore } from "../stores/usePremiumStore";
import { getTheme } from "../utils/themeConfig";

const UpgradeModal = ({ isOpen, onClose, feature }) => {
    const darkMode = useUIStore((state) => state.darkMode);
    const themePreset = useUIStore((state) => state.themePreset);
    const theme = getTheme(themePreset);
    const mockUpgrade = usePremiumStore((state) => state.mockUpgrade);

    const handleUpgrade = (tier) => {
        mockUpgrade(tier);
        onClose();
        // In production, this would redirect to payment page
    };

    if (!isOpen) return null;

    const tiers = [
        {
            name: "Vivente",
            price: "$39.99/year",
            icon: Zap,
            features: [
                "Unlimited custom moods",
                "Advanced analytics",
                "Premium themes",
                "PDF export",
                "Unlimited goals"
            ],
            tier: "vivente"
        },
        {
            name: "Pro",
            price: "$99 lifetime",
            icon: Crown,
            features: [
                "Everything in Vivente",
                "AI-powered insights",
                "Custom CSS theming",
                "Lifetime access",
                "Priority support"
            ],
            tier: "pro",
            highlighted: true
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border ${darkMode
                            ? "bg-slate-900 border-slate-700"
                            : "bg-white border-slate-200"
                        }`}
                >
                    {/* Header */}
                    <div className={`sticky top-0 z-10 p-6 border-b ${darkMode ? "border-slate-800 bg-slate-900/95" : "border-slate-100 bg-white/95"} backdrop-blur-md flex items-center justify-between`}>
                        <div>
                            <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                                Unlock Premium Features
                            </h2>
                            {feature && (
                                <p className={`text-sm mt-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                    {feature} requires a premium subscription
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full hover:bg-black/5 transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-400 hover:text-slate-900"}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Pricing Cards */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tiers.map((tier) => {
                            const Icon = tier.icon;
                            return (
                                <motion.div
                                    key={tier.name}
                                    whileHover={{ y: -4 }}
                                    className={`relative p-6 rounded-2xl border transition-all ${tier.highlighted
                                            ? darkMode
                                                ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/50"
                                                : "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300/50"
                                            : darkMode
                                                ? "bg-slate-800/50 border-slate-700"
                                                : "bg-slate-50 border-slate-200"
                                        }`}
                                >
                                    {tier.highlighted && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                            Best Value
                                        </div>
                                    )}

                                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${theme.iconBg} mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                        {tier.name}
                                    </h3>

                                    <div className="mb-4">
                                        <span className={`text-3xl font-black ${darkMode ? "text-white" : "text-slate-900"}`}>
                                            {tier.price.split('/')[0]}
                                        </span>
                                        {tier.price.includes('/') && (
                                            <span className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                                /{tier.price.split('/')[1]}
                                            </span>
                                        )}
                                    </div>

                                    <ul className="space-y-2 mb-6">
                                        {tier.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                                                <span className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <motion.button
                                        onClick={() => handleUpgrade(tier.tier)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${tier.highlighted
                                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl"
                                                : `bg-gradient-to-r ${theme.primary} text-white shadow-md hover:shadow-lg`
                                            }`}
                                    >
                                        Upgrade to {tier.name}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className={`p-6 border-t text-center ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                            30-day money-back guarantee • Cancel anytime
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UpgradeModal;
