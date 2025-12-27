import { memo } from 'react';
import { getTheme } from '../utils/themeConfig';

const SettingsTab = memo(({
  darkMode,
  themePreset,
  gridLayout,
  pastWeekStyle,
  currentWeek,
  setGridLayout,
  setPastWeekStyle,
  setThemePreset,
  setCurrentPage,
  handleUpdateProfile
}) => {
  const theme = getTheme(themePreset);

  return (
    <div className="mt-8 mx-auto w-full max-w-6xl px-4">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-black bg-gradient-to-r ${themePreset ? theme.primary : 'from-emerald-500 to-teal-600'} bg-clip-text text-transparent mb-2`}>
            Settings & Preferences
          </h2>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            Customize your life visualization experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Settings */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.iconBg} shadow-lg`}>
                <span className="text-2xl">👤</span>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                Profile
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Current Age
                  </span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${theme.primary} bg-clip-text text-transparent`}>
                    {Math.floor((currentWeek - 1) / 52)}y
                  </span>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? "bg-slate-800/50" : "bg-slate-50"}`}>
                  <span className={`block text-xs font-medium mb-1 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    Current Week
                  </span>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${theme.secondary} bg-clip-text text-transparent`}>
                    {currentWeek}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage("setup")}
                  className={`flex-1 py-3 px-6 bg-gradient-to-r ${theme.secondary} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg`}
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className={`flex-1 py-3 px-6 bg-gradient-to-r ${theme.primary} text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg ${theme.shadow}`}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.tertiary} shadow-lg`}>
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                Grid Style
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Layout
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'standard', label: 'Standard', icon: '▦' },
                    { key: 'compact', label: 'Compact', icon: '▧' },
                    { key: 'quarterly', label: 'Quarterly', icon: '▨' }
                  ].map((layout) => (
                    <button
                      key={layout.key}
                      onClick={() => setGridLayout(layout.key)}
                      className={`p-3 rounded-xl transition-all duration-200 ${gridLayout === layout.key
                        ? `bg-gradient-to-br ${theme.primary} text-white shadow-lg`
                        : darkMode ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      <div className="text-xl mb-1">{layout.icon}</div>
                      <div className="text-xs font-semibold">{layout.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Past Week Style
                </span>
                <div className="flex gap-2">
                  {[
                    { key: 'none', label: 'None' },
                    { key: 'hatch', label: 'Hatch' },
                    { key: 'corner', label: 'Corner' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setPastWeekStyle(opt.key)}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${pastWeekStyle === opt.key
                        ? `bg-gradient-to-r ${theme.tertiary} text-white shadow-lg`
                        : darkMode ? "bg-slate-800/50 text-slate-300" : "bg-slate-100 text-slate-700"
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Theme Color */}
          <div className={`p-6 rounded-2xl ${darkMode ? 'premium-card-dark' : 'premium-card'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${theme.quaternary} shadow-lg`}>
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
                Theme Color
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <span className={`block text-sm font-medium mb-3 ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  Stats Page Theme
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'emerald', label: 'Emerald', preview: 'from-emerald-500 to-teal-600' },
                    { key: 'ocean', label: 'Ocean', preview: 'from-blue-500 to-cyan-600' },
                    { key: 'sunset', label: 'Sunset', preview: 'from-orange-500 to-red-600' },
                    { key: 'purple', label: 'Purple', preview: 'from-purple-500 to-violet-600' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setThemePreset(t.key)}
                      className={`p-4 rounded-xl transition-all duration-200 ${themePreset === t.key
                        ? `bg-gradient-to-br ${t.preview} text-white shadow-lg scale-105`
                        : darkMode ? "bg-slate-800/50 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                    >
                      <div className={`h-8 rounded-lg bg-gradient-to-r ${t.preview} mb-2 ${themePreset === t.key ? 'ring-2 ring-white/50' : ''}`} />
                      <div className="text-xs font-semibold">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SettingsTab.displayName = "SettingsTab";

export default SettingsTab;

