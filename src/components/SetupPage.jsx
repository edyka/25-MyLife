import React from 'react'; // eslint-disable-line no-unused-vars
import { Calendar, Moon, Sun, Hourglass, Brain, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { saveTheme } from '../utils/themeUtils';

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
  setDarkMode
}) => {
  // Auto-fill test data on component mount
  React.useEffect(() => {
    if (!birthDay && !birthMonth && !birthYear && !lifeExpectancy) {
      setBirthDay('27');
      setBirthMonth('11');
      setBirthYear('1979');
      setLifeExpectancy('90');
    }
  }, [birthDay, birthMonth, birthYear, lifeExpectancy, setBirthDay, setBirthMonth, setBirthYear, setLifeExpectancy]);
  const isFormValid = () => {
    const lifeExp = parseInt(lifeExpectancy);
    return birthDay && birthMonth && birthYear && 
           parseInt(birthDay) >= 1 && parseInt(birthDay) <= 31 &&
           parseInt(birthYear) >= 1920 && parseInt(birthYear) <= new Date().getFullYear() &&
           parseInt(birthYear).toString().length === 4 &&
           lifeExpectancy && !isNaN(lifeExp) && lifeExp >= 50 && lifeExp <= 110;
  };

  const handleStart = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    if (isFormValid()) {
      setCurrentPage('main');
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && isFormValid() && !isLoading) {
      handleStart();
    }
  };

  const toggleTheme = () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);
    saveTheme(newTheme ? 'dark' : 'light');
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="max-w-lg mx-auto">
        <div className={`rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800 shadow-gray-900/50' 
            : 'bg-white shadow-xl'
        }`}>
          {/* Theme Toggle */}
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
              <Hourglass className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Memento Vivere
            </h1>
            <p className="text-purple-600 dark:text-purple-400 text-lg italic mb-3">
              Remember to Live
            </p>
            <p className={`text-sm md:text-base mb-6 max-w-md mx-auto leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              A philosophical tool for conscious living. Transform your finite weeks into a canvas for intentional existence.
            </p>
            
            {/* Philosophical Introduction */}
            <div className={`p-4 rounded-lg border-l-4 border-purple-400 ${
              darkMode ? 'bg-purple-900/20' : 'bg-purple-50'
            }`}>
              <div className="flex items-start gap-3">
                <Brain className={`w-5 h-5 mt-0.5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <div>
                  <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    "It is not that we have a short time to live, but that we waste a lot of it."
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>— Seneca</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-4 md:space-y-6" onKeyPress={handleKeyPress}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 md:mb-3">
                📅 Your Birth Date
              </label>
              <div className="grid grid-cols-3 gap-2 md:gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Day</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    placeholder="Day"
                    min="1"
                    max="31"
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg text-center"
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Month</label>
                  <select
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg"
                    onKeyPress={handleKeyPress}
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
                  <label className="block text-xs text-gray-500 mb-1">Year</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder="1990"
                    min="1920"
                    max={new Date().getFullYear()}
                    className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg text-center"
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎯 Life Expectancy (years)
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(e.target.value)}
                min="50"
                max="110"
                className="w-full p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base md:text-lg text-center"
                onKeyPress={handleKeyPress}
                placeholder="80"
              />
              <div className="text-xs text-gray-500 text-center mt-1">
                Enter age between 50-110 years
              </div>
            </div>
            
            <button
              onClick={handleStart}
              disabled={isLoading}
              className={`w-full p-3 md:p-4 rounded-lg font-medium text-base md:text-lg transform ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 active:scale-95'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Your Timeline...
                </div>
              ) : (
                'Begin Conscious Living'
              )}
            </button>
            
            {!isFormValid() && (birthDay || birthMonth || birthYear || lifeExpectancy !== '') && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                <p><strong>Please check:</strong></p>
                <ul className="list-disc list-inside mt-1 text-xs">
                  {(!birthDay || parseInt(birthDay) < 1 || parseInt(birthDay) > 31) && <li>Day must be between 1-31</li>}
                  {!birthMonth && <li>Please select a month</li>}
                  {(!birthYear || parseInt(birthYear) < 1920 || parseInt(birthYear) > new Date().getFullYear()) && <li>Year must be between 1920-{new Date().getFullYear()}</li>}
                  {(!lifeExpectancy || parseInt(lifeExpectancy) < 50 || parseInt(lifeExpectancy) > 110) && <li>Life expectancy must be between 50-110 years</li>}
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