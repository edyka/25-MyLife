import { ArrowLeft } from 'lucide-react';
import { exportData } from '../utils/storageUtils';
import { useLifeStore } from '../stores/useLifeStore';
import { useUIStore } from '../stores/useUIStore';
import { useMilestoneStore } from '../stores/useMilestoneStore';
import { getTheme } from '../utils/themeConfig';

const SettingsPage = () => {
  // Use Zustand stores directly
  const birthDay = useLifeStore(state => state.birthDay);
  const birthMonth = useLifeStore(state => state.birthMonth);
  const birthYear = useLifeStore(state => state.birthYear);
  const lifeExpectancy = useLifeStore(state => state.lifeExpectancy);
  const setBirthData = useLifeStore(state => state.setBirthData);
  const setLifeExpectancy = useLifeStore(state => state.setLifeExpectancy);

  const setCurrentPage = useUIStore(state => state.setCurrentPage);
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);

  const milestones = useMilestoneStore(state => state.milestones);
  const setMilestones = useMilestoneStore(state => state.setMilestones);

  // Get current theme
  const theme = getTheme(themePreset);

  // Add missing change handlers
  const handleBirthDayChange = (value) => {
    console.log('Birth day changed to:', value);
    setBirthData(value, birthMonth, birthYear);
  };

  const handleBirthMonthChange = (value) => {
    console.log('Birth month changed to:', value);
    setBirthData(birthDay, value, birthYear);
  };

  const handleBirthYearChange = (value) => {
    console.log('Birth year changed to:', value);
    setBirthData(birthDay, birthMonth, value);
  };

  const handleUpdateProfile = () => {
    console.log('Update Profile button clicked - navigating to setup page');
    setCurrentPage('setup');
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'modern-bg-dark' : 'modern-bg'} transition-all duration-500 p-4`}>
      <div className="max-w-4xl mx-auto">
        <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} rounded-2xl p-4 md:p-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage('main')}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? `hover:bg-white/10 text-slate-300 hover:text-white`
                    : `hover:bg-slate-100 text-slate-600 hover:${theme.accent.replace('text-', 'text-')}`
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                Settings & Preferences
              </h1>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Personal Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Day</label>
                  <input
                    type="number"
                    value={birthDay}
                    onChange={(e) => handleBirthDayChange(e.target.value)}
                    min="1"
                    max="31"
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 ${
                      darkMode
                        ? `bg-white/5 border-white/10 text-slate-200 ${theme.formFocus.replace('border-', 'focus:border-').replace('focus:ring-', 'focus:ring-')} focus:bg-white/10`
                        : `${theme.inputBg} border-slate-200 text-slate-800 ${theme.formFocus}`
                    }`}
                    style={{ outline: 'none' }}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Month</label>
                  <select
                    value={birthMonth}
                    onChange={(e) => handleBirthMonthChange(e.target.value)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 ${
                      darkMode
                        ? `bg-white/5 border-white/10 text-slate-200 ${theme.formFocus.replace('border-', 'focus:border-').replace('focus:ring-', 'focus:ring-')} focus:bg-white/10`
                        : `${theme.inputBg} border-slate-200 text-slate-800 ${theme.formFocus}`
                    }`}
                    style={{ outline: 'none' }}
                  >
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
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Year</label>
                  <input
                    type="number"
                    value={birthYear}
                    onChange={(e) => handleBirthYearChange(e.target.value)}
                    min="1920"
                    max={new Date().getFullYear()}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 ${
                      darkMode
                        ? `bg-white/5 border-white/10 text-slate-200 ${theme.formFocus.replace('border-', 'focus:border-').replace('focus:ring-', 'focus:ring-')} focus:bg-white/10`
                        : `${theme.inputBg} border-slate-200 text-slate-800 ${theme.formFocus}`
                    }`}
                    style={{ outline: 'none' }}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Life Expectancy</label>
                  <input
                    type="number"
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(e.target.value)}
                    min="50"
                    max="110"
                    className={`w-full p-3 rounded-lg border transition-all duration-200 focus:ring-2 ${
                      darkMode
                        ? `bg-white/5 border-white/10 text-slate-200 ${theme.formFocus.replace('border-', 'focus:border-').replace('focus:ring-', 'focus:ring-')} focus:bg-white/10`
                        : `${theme.inputBg} border-slate-200 text-slate-800 ${theme.formFocus}`
                    }`}
                    style={{ outline: 'none' }}
                  />
                </div>
              </div>

              {/* Update Profile Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpdateProfile}
                  className={`${theme.buttonPrimary} px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-white shadow-lg hover:shadow-xl ${theme.shadow}`}
                >
                  Update Profile
                </button>
              </div>
            </div>

            <div className={`${darkMode ? 'premium-card-dark' : 'premium-card'} rounded-xl p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>Data Management</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => exportData(birthDay, birthMonth, birthYear, lifeExpectancy, milestones)}
                  className={`${theme.buttonPrimary} px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 text-white shadow-lg hover:shadow-xl ${theme.shadow}`}
                >
                  Export Data
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all milestones?')) {
                      setMilestones({});
                    }
                  }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 bg-gradient-to-r ${theme.error} hover:opacity-90 text-white shadow-lg hover:shadow-xl`}
                >
                  Clear All Milestones
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;