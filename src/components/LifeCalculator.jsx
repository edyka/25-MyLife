import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';

// Full Tailwind class mappings (dynamic class names don't work with Tailwind purge)
const themeClasses = {
    emerald: {
        bgGlow: 'bg-emerald-500/20',
        badgeBg: 'bg-emerald-100',
        badgeBgDark: 'bg-emerald-900/30',
        badgeText: 'text-emerald-600',
        badgeTextDark: 'text-emerald-400',
        focusBorder: 'focus:border-emerald-500',
        selectedBg: 'bg-emerald-500',
        accentText: 'text-emerald-500',
        buttonGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        accentColor: '#10b981'
    },
    ocean: {
        bgGlow: 'bg-blue-500/20',
        badgeBg: 'bg-blue-100',
        badgeBgDark: 'bg-blue-900/30',
        badgeText: 'text-blue-600',
        badgeTextDark: 'text-blue-400',
        focusBorder: 'focus:border-blue-500',
        selectedBg: 'bg-blue-500',
        accentText: 'text-blue-500',
        buttonGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
        accentColor: '#3b82f6'
    },
    sunset: {
        bgGlow: 'bg-orange-500/20',
        badgeBg: 'bg-orange-100',
        badgeBgDark: 'bg-orange-900/30',
        badgeText: 'text-orange-600',
        badgeTextDark: 'text-orange-400',
        focusBorder: 'focus:border-orange-500',
        selectedBg: 'bg-orange-500',
        accentText: 'text-orange-500',
        buttonGradient: 'bg-gradient-to-r from-orange-500 to-orange-600',
        accentColor: '#f97316'
    },
    purple: {
        bgGlow: 'bg-purple-500/20',
        badgeBg: 'bg-purple-100',
        badgeBgDark: 'bg-purple-900/30',
        badgeText: 'text-purple-600',
        badgeTextDark: 'text-purple-400',
        focusBorder: 'focus:border-purple-500',
        selectedBg: 'bg-purple-500',
        accentText: 'text-purple-500',
        buttonGradient: 'bg-gradient-to-r from-purple-500 to-purple-600',
        accentColor: '#a855f7'
    }
};

const LifeCalculator = ({ darkMode, onSignUp }) => {
    const themePreset = useUIStore((state) => state.themePreset);
    const theme = themeClasses[themePreset] || themeClasses.sunset;
    const [name, setName] = useState('');
    const [birthDay, setBirthDay] = useState('');
    const [showDayPicker, setShowDayPicker] = useState(false);
    const [birthMonth, setBirthMonth] = useState('');
    const [birthYear, setBirthYear] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [lifeExpectancy, setLifeExpectancy] = useState(80);
    const [stats, setStats] = useState(null);

    const handleDateChange = (field, value) => {
        let d = field === 'day' ? value : birthDay;
        let m = field === 'month' ? value : birthMonth;
        let y = field === 'year' ? value : birthYear;

        if (field === 'day') setBirthDay(value);
        if (field === 'month') setBirthMonth(value);
        if (field === 'year') setBirthYear(value);

        if (d && m && y && y.length === 4) {
            const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                setBirthDate(dateStr);
            }
        }
    };

    const calculateLifeStats = (date, expectancy) => {
        if (!date) return;

        const birth = new Date(date);
        const now = new Date();
        const totalWeeks = expectancy * 52;

        const diffTime = Math.abs(now - birth);
        const weeksLived = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
        const weeksLeft = Math.max(0, totalWeeks - weeksLived);
        const percentage = Math.min(100, Math.max(0, (weeksLived / totalWeeks) * 100));

        setStats({ weeksLived, weeksLeft, percentage });
    };

    useEffect(() => {
        if (birthDate) {
            calculateLifeStats(birthDate, lifeExpectancy);
        }
    }, [birthDate, lifeExpectancy]);

    return (
        <section className="relative z-10 w-full py-8 px-4 sm:px-6">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
            >
                <div className={`rounded-[2.5rem] p-8 md:p-12 overflow-hidden relative ${darkMode ? "bg-slate-800/50 border border-slate-700" : "bg-white shadow-2xl border border-slate-100"}`}>
                    {/* Background Glow */}
                    <div className={`absolute top-0 right-0 w-64 h-64 ${theme.bgGlow} blur-[100px] rounded-full pointer-events-none`} />
                    <div className={`absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none`} />

                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                        {/* Input Section */}
                        <div className="flex-1 w-full text-center md:text-left">
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 ${darkMode ? `${theme.badgeBgDark} ${theme.badgeTextDark}` : `${theme.badgeBg} ${theme.badgeText}`}`}>
                                <Sparkles className="w-3 h-3" />
                                Try it now
                            </div>
                            <h2 className={`text-3xl md:text-4xl font-black mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}>
                                See Your Numbers
                            </h2>
                            <p className={`text-lg mb-8 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                Enter your details to instantly visualize where you stand in your journey.
                            </p>

                            <div className="space-y-6 max-w-xs mx-auto md:mx-0">
                                {/* Name Input */}
                                <div>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`w-full px-4 py-3 rounded-xl font-medium outline-none border-2 transition-all ${theme.focusBorder} ${darkMode
                                            ? "bg-slate-900/50 border-slate-700 text-white"
                                            : "bg-slate-50 border-slate-200 text-slate-900"
                                            }`}
                                    />
                                </div>

                                {/* Date Input - Clean Dropdowns */}
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Day</label>
                                        <button
                                            type="button"
                                            onClick={() => setShowDayPicker(!showDayPicker)}
                                            className={`w-full px-3 py-3.5 rounded-xl text-center font-semibold outline-none border-2 transition-all cursor-pointer ${darkMode
                                                ? `bg-slate-800 border-slate-700 text-white hover:border-slate-600 ${showDayPicker ? 'border-orange-500' : ''}`
                                                : `bg-white border-slate-200 text-slate-900 hover:border-slate-300 ${showDayPicker ? 'border-orange-500' : ''}`
                                                }`}
                                        >
                                            {birthDay || 'Day'}
                                        </button>
                                        
                                        {/* Day Picker Grid */}
                                        {showDayPicker && (
                                            <div className={`absolute bottom-full left-0 mb-1 p-3 rounded-2xl shadow-2xl z-50 w-64 ${darkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {Array.from({ length: 31 }, (_, i) => (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            onClick={() => {
                                                                handleDateChange('day', String(i + 1));
                                                                setShowDayPicker(false);
                                                            }}
                                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                                                                birthDay === String(i + 1)
                                                                    ? `${theme.selectedBg} text-white`
                                                                    : darkMode
                                                                        ? "text-slate-300 hover:bg-slate-700"
                                                                        : "text-slate-700 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Month</label>
                                        <select
                                            value={birthMonth}
                                            onChange={(e) => handleDateChange('month', e.target.value)}
                                            className={`w-full px-3 py-3.5 rounded-xl text-center font-semibold outline-none border-2 transition-all cursor-pointer ${theme.focusBorder} ${darkMode
                                                ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                                                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                                                }`}
                                        >
                                            <option value="">Month</option>
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                                                <option key={i} value={i + 1}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${darkMode ? "text-slate-500" : "text-slate-500"}`}>Year</label>
                                        <select
                                            value={birthYear}
                                            onChange={(e) => handleDateChange('year', e.target.value)}
                                            className={`w-full px-3 py-3.5 rounded-xl text-center font-semibold outline-none border-2 transition-all cursor-pointer ${theme.focusBorder} ${darkMode
                                                ? "bg-slate-800 border-slate-700 text-white hover:border-slate-600"
                                                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300"
                                                }`}
                                        >
                                            <option value="">Year</option>
                                            {Array.from({ length: new Date().getFullYear() - 1919 }, (_, i) => {
                                                const year = new Date().getFullYear() - i;
                                                return <option key={year} value={year}>{year}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>
                                {/* Life Expectancy Slider */}
                                <div className={`p-4 rounded-xl border-2 ${darkMode ? "bg-slate-900/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className={`text-sm font-semibold ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                                            Life Expectancy
                                        </label>
                                        <span className={`text-lg font-bold ${theme.accentText}`}>
                                            {lifeExpectancy} years
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="120"
                                        value={lifeExpectancy}
                                        onChange={(e) => setLifeExpectancy(parseInt(e.target.value))}
                                        className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${darkMode ? "bg-slate-700" : "bg-slate-300"}`}
                                        style={{
                                            accentColor: theme.accentColor
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="flex-1 w-full">
                            <AnimatePresence mode="wait">
                                {stats ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className={`p-6 rounded-2xl text-center ${darkMode ? "bg-slate-900/80" : "bg-slate-50"}`}>
                                            <div className={`text-4xl md:text-5xl font-black mb-2 ${theme.accentText}`}>
                                                {stats.weeksLived.toLocaleString()}
                                            </div>
                                            <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                Weeks Lived
                                            </div>
                                        </div>
                                        <div className={`p-6 rounded-2xl text-center ${darkMode ? "bg-slate-900/80" : "bg-slate-50"}`}>
                                            <div className="text-4xl md:text-5xl font-black mb-2 text-slate-400">
                                                {stats.weeksLeft.toLocaleString()}
                                            </div>
                                            <div className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                                Weeks Left
                                            </div>
                                        </div>
                                        <div className="col-span-2 mt-4">
                                            <button
                                                onClick={() => onSignUp({ name, birthDate, lifeExpectancy })}
                                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${theme.buttonGradient}`}
                                            >
                                                Visualize My Entire Life
                                                <ArrowRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex items-center justify-center ${darkMode ? "border-slate-700 bg-slate-900/30" : "border-slate-200 bg-slate-50/50"}`}
                                    >
                                        <div className={`text-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p className="font-medium">Select a date to begin</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default LifeCalculator;
