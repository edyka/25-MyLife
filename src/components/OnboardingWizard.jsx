import { motion, AnimatePresence } from "framer-motion";
import { User, Cake, Hourglass, Sparkles, ArrowRight, Check } from "lucide-react";
import { getTheme } from "../utils/themeConfig";
import { useUIStore } from "../stores/useUIStore";
import { useLifeStore } from "../stores/useLifeStore";
import { useState } from "react";
import { auth, database } from "../lib/supabase";

const OnboardingWizard = ({ darkMode, onComplete }) => {
    const themePreset = useUIStore((state) => state.themePreset);
    const theme = getTheme(themePreset);

    const [step, setStep] = useState(1);
    const [name, setName] = useState(useLifeStore((state) => state.userName) || "");
    const [birthDay, setBirthDay] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthYear, setBirthYear] = useState("");
    const [lifeExpectancy, setLifeExpectancy] = useState("80");
    const [loading, setLoading] = useState(false);
    const [calculatedStats, setCalculatedStats] = useState(null);

    const totalSteps = 4;

    const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

    const calculateStats = () => {
        const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        const today = new Date();
        const ageInMs = today - birthDate;
        const ageInYears = Math.floor(ageInMs / (365.25 * 24 * 60 * 60 * 1000));
        const weeksLived = Math.floor(ageInMs / (7 * 24 * 60 * 60 * 1000));
        const totalWeeks = lifeExpectancy * 52;
        const weeksRemaining = totalWeeks - weeksLived;
        const percentageLived = ((weeksLived / totalWeeks) * 100).toFixed(1);

        return {
            age: ageInYears,
            weeksLived,
            weeksRemaining,
            totalWeeks,
            percentageLived
        };
    };

    const handleFinish = async () => {
        try {
            setLoading(true);

            // Get the authenticated user
            const { user, error: userError } = await auth.getCurrentUser();

            if (userError || !user) {
                console.error("Error getting user:", userError);
                alert("Authentication error. Please try logging in again.");
                setLoading(false);
                return;
            }

            // Save to Zustand store (local state)
            const store = useLifeStore.getState();
            store.setBirthData(parseInt(birthDay), parseInt(birthMonth), parseInt(birthYear));
            store.setLifeExpectancy(parseInt(lifeExpectancy));
            if (name) {
                store.setUserName(name);
            }

            // Save to Supabase (remote database)
            await database.saveUserProfile(user.id, {
                name: name || 'User',
                birthDay: parseInt(birthDay),
                birthMonth: parseInt(birthMonth),
                birthYear: parseInt(birthYear),
                lifeExpectancy: parseInt(lifeExpectancy)
            });

            // Migrate anonymous painted weeks to Supabase
            const anonymousWeeks = localStorage.getItem('viventiva_anonymous_weeks');
            if (anonymousWeeks) {
                try {
                    const parsed = JSON.parse(anonymousWeeks);
                    await database.saveMilestones(user.id, parsed);

                    const { useMilestoneStore } = await import('../stores/useMilestoneStore');
                    const milestoneStore = useMilestoneStore.getState();
                    milestoneStore.setMilestones(parsed);

                    localStorage.removeItem('viventiva_anonymous_weeks');
                    localStorage.removeItem('viventiva_extended_limit');
                    localStorage.removeItem('viventiva_soft_prompt_shown');
                    sessionStorage.removeItem('viventiva_modal_dismissed');
                } catch (e) {
                    console.error('[Viventiva] Failed to migrate anonymous weeks:', e);
                }
            }

            // Mark profile as complete
            localStorage.setItem('viventiva_profile_complete', 'true');

            // Track profile completion
            try {
                const { trackUserAction } = await import('../utils/analytics');
                trackUserAction('profile_completed', {
                    hasName: !!name,
                    lifeExpectancy: parseInt(lifeExpectancy),
                });
            } catch (err) { }

            setLoading(false);

            try {
                const { toast } = await import('../utils/toast');
                toast.success('Profile saved successfully!');
            } catch (err) { }

            onComplete();
        } catch (err) {
            console.error("Error saving user data:", err);
            try {
                const { toast } = await import('../utils/toast');
                const { getUserFriendlyError } = await import('../utils/errorMessages');
                toast.error(getUserFriendlyError(err));
            } catch {
                alert("Error saving profile. Please try again.");
            }
            setLoading(false);
        }
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Determine if current step is valid
    const isStepValid = () => {
        if (step === 1) return name.trim().length > 0;
        if (step === 2) return birthDay && birthMonth && birthYear && birthYear.length === 4;
        if (step === 3) return lifeExpectancy > 0;
        return true;
    };

    const handleNext = () => {
        if (step === 3) {
            setCalculatedStats(calculateStats());
        }
        nextStep();
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
            {/* Background Elements */}
            <div className={`absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none`}>
                <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 bg-gradient-to-br ${theme.primary}`} />
                <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-3xl opacity-20 bg-gradient-to-tr ${theme.secondary}`} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-xl w-full p-8 md:p-12 rounded-3xl backdrop-blur-xl border shadow-2xl ${darkMode
                    ? "bg-slate-900/60 border-slate-700/50"
                    : "bg-white/80 border-slate-200/50"
                    }`}
            >
                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${theme.primary}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}>
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    Welcome! What's your name?
                                </h2>
                                <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
                                    Let's start your journey.
                                </p>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-6 py-4 text-lg text-center rounded-xl ${darkMode
                                    ? "bg-slate-800 text-white border-slate-700"
                                    : "bg-slate-50 text-slate-900 border-slate-200"
                                    } border-2 focus:outline-none focus:border-blue-500 transition-all`}
                                placeholder="Type your name..."
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && isStepValid() && handleNext()}
                            />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}>
                                    <Cake className="w-8 h-8 text-white" />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    When did your story begin?
                                </h2>
                                <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
                                    We'll visualize your life from this date.
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <input
                                    type="number"
                                    value={birthDay}
                                    onChange={(e) => setBirthDay(e.target.value)}
                                    className={`w-full px-4 py-4 text-lg text-center rounded-xl ${darkMode
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "bg-slate-50 text-slate-900 border-slate-200"
                                        } border-2 focus:outline-none focus:border-blue-500`}
                                    placeholder="DD"
                                    autoFocus
                                />
                                <select
                                    value={birthMonth}
                                    onChange={(e) => setBirthMonth(e.target.value)}
                                    className={`w-full px-4 py-4 text-lg rounded-xl ${darkMode
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "bg-slate-50 text-slate-900 border-slate-200"
                                        } border-2 focus:outline-none focus:border-blue-500`}
                                >
                                    <option value="">Month</option>
                                    {monthNames.map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={birthYear}
                                    onChange={(e) => setBirthYear(e.target.value)}
                                    className={`w-full px-4 py-4 text-lg text-center rounded-xl ${darkMode
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "bg-slate-50 text-slate-900 border-slate-200"
                                        } border-2 focus:outline-none focus:border-blue-500`}
                                    placeholder="YYYY"
                                    onKeyDown={(e) => e.key === "Enter" && isStepValid() && handleNext()}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="text-center">
                                <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-2xl shadow-lg flex items-center justify-center mb-6`}>
                                    <Hourglass className="w-8 h-8 text-white" />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    What is your target age?
                                </h2>
                                <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
                                    This sets the canvas size. You can change it anytime.
                                </p>
                            </div>
                            <div className="relative max-w-xs mx-auto">
                                <input
                                    type="number"
                                    value={lifeExpectancy}
                                    onChange={(e) => setLifeExpectancy(e.target.value)}
                                    className={`w-full px-6 py-4 text-3xl font-bold text-center rounded-xl ${darkMode
                                        ? "bg-slate-800 text-white border-slate-700"
                                        : "bg-slate-50 text-slate-900 border-slate-200"
                                        } border-2 focus:outline-none focus:border-blue-500`}
                                    autoFocus
                                    onKeyDown={(e) => e.key === "Enter" && isStepValid() && handleNext()}
                                />
                                <span className={`absolute right-8 top-1/2 -translate-y-1/2 text-lg font-medium ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                    years
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && calculatedStats && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8 text-center"
                        >
                            <div>
                                <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${theme.iconBg} rounded-full shadow-xl flex items-center justify-center mb-6 animate-bounce-slow`}>
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h2 className={`text-3xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                    Your Canvas is Ready
                                </h2>
                                <p className={darkMode ? "text-slate-400" : "text-slate-600"}>
                                    Here is your life so far, {name}.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                                    <div className={`text-2xl font-black bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                                        {calculatedStats.weeksLived.toLocaleString()}
                                    </div>
                                    <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                        Weeks Lived
                                    </div>
                                </div>
                                <div className={`p-4 rounded-2xl ${darkMode ? "bg-slate-800" : "bg-slate-50"}`}>
                                    <div className={`text-2xl font-black bg-gradient-to-r ${theme.secondary} bg-clip-text text-transparent`}>
                                        {calculatedStats.weeksRemaining.toLocaleString()}
                                    </div>
                                    <div className={`text-xs font-bold uppercase tracking-wider mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                        Weeks Left
                                    </div>
                                </div>
                            </div>

                            <div className={`p-6 rounded-2xl border ${darkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50/50"}`}>
                                <div className="flex justify-between text-sm mb-2 font-medium">
                                    <span className={darkMode ? "text-slate-400" : "text-slate-600"}>Life Progress</span>
                                    <span className={darkMode ? "text-white" : "text-slate-900"}>{calculatedStats.percentageLived}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${calculatedStats.percentageLived}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full bg-gradient-to-r ${theme.primary}`}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="mt-10 flex justify-between items-center">
                    {step > 1 && (
                        <button
                            onClick={prevStep}
                            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${darkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                                }`}
                        >
                            Back
                        </button>
                    )}

                    <div className="ml-auto">
                        {step < 4 ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isStepValid()
                                    ? `bg-gradient-to-r ${theme.primary} hover:shadow-xl hover:scale-105`
                                    : "bg-slate-400 cursor-not-allowed opacity-50"
                                    }`}
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${loading
                                    ? "bg-slate-500 cursor-wait"
                                    : `bg-gradient-to-r ${theme.primary} hover:shadow-xl hover:scale-105`
                                    }`}
                            >
                                {loading ? "Creating..." : "Start My Journey"} <Check className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingWizard;
