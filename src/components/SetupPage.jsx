import React from "react";
import { Moon, Sun, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { saveTheme } from "../utils/themeUtils";

const SetupPage = ({
  birthDay,
  setBirthDay,
  birthMonth,
  setBirthMonth,
  birthYear,
  setBirthYear,
  lifeExpectancy,
  setLifeExpectancy,
  isLoading,
  setIsLoading,
  setCurrentPage,
  darkMode,
  setDarkMode,
}) => {
  // Auto-fill test data on component mount
  React.useEffect(() => {
    if (!birthDay && !birthMonth && !birthYear && !lifeExpectancy) {
      setBirthDay("27");
      setBirthMonth("11");
      setBirthYear("1979");
      setLifeExpectancy("90");
    }
  }, [
    birthDay,
    birthMonth,
    birthYear,
    lifeExpectancy,
    setBirthDay,
    setBirthMonth,
    setBirthYear,
    setLifeExpectancy,
  ]);
  
  const isFormValid = () => {
    const lifeExp = parseInt(lifeExpectancy);
    return (
      birthDay &&
      birthMonth &&
      birthYear &&
      parseInt(birthDay) >= 1 &&
      parseInt(birthDay) <= 31 &&
      parseInt(birthYear) >= 1920 &&
      parseInt(birthYear) <= new Date().getFullYear() &&
      parseInt(birthYear).toString().length === 4 &&
      lifeExpectancy &&
      !isNaN(lifeExp) &&
      lifeExp >= 50 &&
      lifeExp <= 110
    );
  };

  const handleStart = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    if (isFormValid()) {
      setCurrentPage("main");
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isFormValid() && !isLoading) {
      handleStart();
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    saveTheme(newTheme ? "dark" : "light");
  };

  return (
    <div
      className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
      }`}
    >
      <div className="max-w-md mx-auto">
        <div
          className={`rounded-3xl shadow-2xl p-8 md:p-10 transition-all duration-300 ${
            darkMode 
              ? "bg-slate-800/90 backdrop-blur-sm shadow-slate-900/50 border border-slate-700/50" 
              : "bg-white/95 backdrop-blur-sm shadow-xl border border-orange-100/50"
          }`}
        >
          {/* Theme Toggle */}
          <div className="flex justify-end mb-6">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all duration-300 hover:scale-105 ${
                darkMode
                  ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-700 shadow-lg"
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Logo and Brand */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-10"
          >
            {/* Logo Grid */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-1 w-8 h-8">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-white/90 rounded-sm"></div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>

            <h1
              className={`text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent ${
                darkMode ? "drop-shadow-sm" : ""
              }`}
            >
              Viventiva
            </h1>
            <p className="text-orange-500 dark:text-orange-400 text-lg font-medium mb-4">
              Remember to Live
            </p>
            <p
              className={`text-sm md:text-base mb-8 max-w-sm mx-auto leading-relaxed ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Transform your finite weeks into a canvas for intentional existence. 
              Visualize your life's journey through conscious living.
            </p>

            {/* Philosophical Quote */}
            <div
              className={`p-6 rounded-2xl border-l-4 border-orange-400 ${
                darkMode 
                  ? "bg-orange-900/20 border-orange-500/50" 
                  : "bg-orange-50/80 border-orange-400"
              }`}
            >
              <div className="flex items-start gap-4">
                <Brain
                  className={`w-6 h-6 mt-1 ${
                    darkMode ? "text-orange-400" : "text-orange-500"
                  }`}
                />
                <div>
                  <p
                    className={`text-sm font-medium mb-2 leading-relaxed ${
                      darkMode ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    "It is not that we have a short time to live, but that we
                    waste a lot of it."
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      darkMode ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    — Seneca
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6" onKeyDown={handleKeyDown}>
            {/* Birth Date Section */}
            <div>
              <label className={`block text-sm font-semibold mb-4 ${
                darkMode ? "text-slate-200" : "text-slate-800"
              }`}>
                📅 Your Birth Date
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-medium mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Day
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    placeholder="Day"
                    min="1"
                    max="31"
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-medium transition-all duration-200 ${
                      darkMode 
                        ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500" 
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Month
                  </label>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-medium transition-all duration-200 ${
                      darkMode 
                        ? "bg-slate-700 border-slate-600 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                    onKeyDown={handleKeyDown}
                  >
                    <option value="">Month</option>
                    <option value="1">Jan</option>
                    <option value="2">Feb</option>
                    <option value="3">Mar</option>
                    <option value="4">Apr</option>
                    <option value="5">May</option>
                    <option value="6">Jun</option>
                    <option value="7">Jul</option>
                    <option value="8">Aug</option>
                    <option value="9">Sep</option>
                    <option value="10">Oct</option>
                    <option value="11">Nov</option>
                    <option value="12">Dec</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-2 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}>
                    Year
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1990"
                    min="1920"
                    max={new Date().getFullYear()}
                    className={`w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-medium transition-all duration-200 ${
                      darkMode 
                        ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500" 
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>

            {/* Life Expectancy Section */}
            <div>
              <label className={`block text-sm font-semibold mb-4 ${
                darkMode ? "text-slate-200" : "text-slate-800"
              }`}>
                🎯 Life Expectancy (years)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(e.target.value)}
                min="50"
                max="110"
                className={`w-full p-4 border-2 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-medium transition-all duration-200 ${
                  darkMode 
                    ? "bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500" 
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                }`}
                onKeyDown={handleKeyDown}
                placeholder="80"
              />
              <div className={`text-xs text-center mt-3 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Enter age between 50-110 years
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={isLoading}
              className={`w-full p-5 rounded-2xl font-semibold text-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
                isLoading
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Your Timeline...
                </div>
              ) : (
                "Begin Conscious Living"
              )}
            </button>

            {/* Validation Errors */}
            {!isFormValid() &&
              (birthDay ||
                birthMonth ||
                birthYear ||
                lifeExpectancy !== "") && (
                <div className={`text-red-500 text-sm p-4 rounded-2xl border-2 ${
                  darkMode 
                    ? "bg-red-900/20 border-red-500/30" 
                    : "bg-red-50 border-red-200"
                }`}>
                  <p className="font-semibold mb-2">
                    Please check:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    {(!birthDay ||
                      parseInt(birthDay) < 1 ||
                      parseInt(birthDay) > 31) && (
                      <li>Day must be between 1-31</li>
                    )}
                    {!birthMonth && <li>Please select a month</li>}
                    {(!birthYear ||
                      parseInt(birthYear) < 1920 ||
                      parseInt(birthYear) > new Date().getFullYear()) && (
                      <li>
                        Year must be between 1920-{new Date().getFullYear()}
                      </li>
                    )}
                    {(!lifeExpectancy ||
                      parseInt(lifeExpectancy) < 50 ||
                      parseInt(lifeExpectancy) > 110) && (
                      <li>Life expectancy must be between 50-110 years</li>
                    )}
                  </ul>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupPage;
