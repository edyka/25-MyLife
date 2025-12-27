import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Users, Crown } from "lucide-react";
import { useEffect } from "react";
import { database } from "../lib/supabase";

const WaitlistPage = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [interest, setInterest] = useState("");
    const [status, setStatus] = useState("idle"); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState("");
    const [waitlistCount, setWaitlistCount] = useState(247); // Default, will be updated

    // Load waitlist count on mount
    useEffect(() => {
        const loadCount = async () => {
            try {
                const count = await database.getWaitlistCount();
                if (count) setWaitlistCount(count);
            } catch (error) {
                console.error('Error loading waitlist count:', error);
            }
        };
        loadCount();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const { error } = await database.saveWaitlistSignup(email, name, interest);

            if (error) {
                if (error.message?.includes('unique')) {
                    setErrorMessage("You're already on the waitlist!");
                } else {
                    setErrorMessage(error.message || "Something went wrong. Please try again.");
                }
                setStatus("error");
            } else {
                setStatus("success");
                setWaitlistCount(prev => prev + 1);
                // Clear form
                setEmail("");
                setName("");
                setInterest("");
            }
        } catch (error) {
            console.error('Waitlist signup error:', error);
            setErrorMessage("Something went wrong. Please try again.");
            setStatus("error");
        }
    };

    return (
        <div className="min-h-screen bg-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 mb-6">
                        <Sparkles className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-700">Launching Soon</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight">
                        Your Life in <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">4,160 Weeks</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-700 mb-4 max-w-3xl mx-auto">
                        Visualize your entire life on one page. Make every week count.
                    </p>

                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Join {waitlistCount.toLocaleString()}+ people waiting to transform how they see time and live with intention.
                    </p>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
                    {/* Left: Preview/Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="rounded-3xl bg-slate-50 border border-slate-200 backdrop-blur-xl p-8 shadow-xl">
                            <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl border border-slate-200 flex items-center justify-center">
                                <div className="grid grid-cols-12 gap-1 p-8">
                                    {Array.from({ length: 80 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={`w-2 h-2 rounded-sm ${i < 30
                                                ? "bg-orange-500"
                                                : i < 50
                                                    ? "bg-orange-400/70"
                                                    : "bg-slate-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-center text-slate-600 text-sm mt-4">
                                Each square = one week of your life
                            </p>
                        </div>
                    </motion.div>

                    {/* Right: Signup Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="rounded-3xl bg-white border border-slate-200 backdrop-blur-xl p-8 shadow-xl">
                            {status === "success" ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Check className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">You're on the list!</h3>
                                    <p className="text-slate-600 mb-6">
                                        We'll email you when we launch. Get ready to visualize your life.
                                    </p>
                                    <button
                                        onClick={() => setStatus("idle")}
                                        className="text-orange-600 hover:text-orange-700 font-semibold"
                                    >
                                        Add another email
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Join the Waitlist</h2>
                                    <p className="text-slate-600 mb-6">
                                        Be the first to know when we launch and get exclusive founding member benefits.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="you@example.com"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your name"
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                What interests you most?
                                            </label>
                                            <select
                                                value={interest}
                                                onChange={(e) => setInterest(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">Select...</option>
                                                <option value="life-planning">Life Planning & Goals</option>
                                                <option value="productivity">Productivity & Time Management</option>
                                                <option value="mindfulness">Mindfulness & Awareness</option>
                                                <option value="journaling">Journaling & Reflection</option>

                                            </select>
                                        </div>

                                        {errorMessage && (
                                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                                {errorMessage}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={status === "loading"}
                                            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {status === "loading" ? (
                                                "Joining..."
                                            ) : (
                                                <>
                                                    Join Waitlist
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <p className="text-xs text-slate-500 text-center mt-4">
                                        By joining, you agree to receive updates about the launch. Unsubscribe anytime.
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Benefits */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-6 mb-20"
                >
                    {[
                        {
                            icon: Crown,
                            title: "Founding Member Pricing",
                            description: "Lock in 50% off lifetime Pro access"
                        },
                        {
                            icon: Users,
                            title: "7-Day Early Access",
                            description: "Get in before the public launch"
                        },
                        {
                            icon: Sparkles,
                            title: "Exclusive Features",
                            description: "Vote on new features and shape the product"
                        }
                    ].map((benefit, i) => (
                        <div
                            key={i}
                            className="rounded-2xl bg-slate-50 border border-slate-200 backdrop-blur-xl p-6 hover:bg-slate-100 transition-all"
                        >
                            <benefit.icon className="w-8 h-8 text-orange-500 mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                            <p className="text-slate-600 text-sm">{benefit.description}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Footer */}
                <div className="text-center text-slate-500 text-sm">
                    <p>© 2025 Viventiva. Built with intention.</p>
                </div>
            </div>
        </div>
    );
};

export default WaitlistPage;
