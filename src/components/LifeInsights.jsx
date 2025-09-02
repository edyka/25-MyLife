import { Clock, Users, Zap, Calendar } from "lucide-react";
import { calculateRelationshipInsights } from "../utils/constants";

const LifeInsights = ({ 
  milestones = {}, 
  birthYear, 
  _birthMonth, 
  _birthDay, 
  lifeExpectancy, 
  darkMode 
}) => {
  // Add error handling for insights calculation
  let insights;
  try {
    insights = calculateRelationshipInsights(milestones, birthYear, lifeExpectancy);
  } catch (error) {
    console.error('Error calculating relationship insights:', error);
    insights = {
      relationshipStats: {},
      totalWeeks: 0,
      currentWeek: 0,
      remainingWeeks: 0,
      lifeProgress: 0
    };
  }
  
  const ProgressBar = ({ percentage, color, label, count }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          {label}
        </span>
        <span className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {count} weeks ({percentage}%)
        </span>
      </div>
      <div className={`w-full rounded-full h-2 ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}>
        <div
          className={`h-2 rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 hover:scale-105 ${
        darkMode 
          ? "bg-slate-800/50 border-slate-700" 
          : "bg-white border-slate-200"
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h4 className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
          {title}
        </h4>
      </div>
      <div className={`text-2xl font-bold ${darkMode ? "text-slate-100" : "text-slate-900"}`}>
        {value}
      </div>
      {subtitle && (
        <div className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {subtitle}
        </div>
      )}
    </div>
  );

  // Simplified render to avoid errors
  if (!birthYear || !lifeExpectancy) {
    return (
      <div className={`p-6 rounded-xl border ${
        darkMode 
          ? "bg-slate-800/30 border-slate-700" 
          : "bg-white border-slate-200"
      }`}>
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          📊 Life Insights
        </h3>
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Complete your profile to see detailed life insights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Life Progress Overview */}
      <div className={`p-6 rounded-xl border ${
        darkMode 
          ? "bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-slate-600" 
          : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
      }`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          📊 Life Progress
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Calendar}
            title="Life Progress"
            value={`${insights.lifeProgress || 0}%`}
            subtitle={`Week ${insights.currentWeek || 0} of ${insights.totalWeeks || 0}`}
            color="bg-orange-500"
          />
          <StatCard
            icon={Clock}
            title="Weeks Remaining"
            value={insights.remainingWeeks || 0}
            subtitle="Precious time ahead"
            color="bg-blue-500"
          />
          <StatCard
            icon={Users}
            title="Relationship Weeks"
            value={insights.relationshipStats ? Object.values(insights.relationshipStats).reduce((sum, stat) => sum + (stat?.totalWeeks || 0), 0) : 0}
            subtitle="Time with others"
            color="bg-cyan-500"
          />
          <StatCard
            icon={Zap}
            title="Experience Weeks"
            value={milestones ? Object.values(milestones).filter(m => 
              m?.category && ['travel', 'learning', 'fitness', 'adventure', 'milestone'].includes(m.category)
            ).length : 0}
            subtitle="Adventures & growth"
            color="bg-emerald-500"
          />
        </div>
      </div>

      {/* Relationship Time Breakdown */}
      {insights.relationshipStats && Object.keys(insights.relationshipStats).some(key => insights.relationshipStats[key]?.totalWeeks > 0) && (
        <div className={`p-6 rounded-xl border ${
          darkMode 
            ? "bg-slate-800/30 border-slate-700" 
            : "bg-white border-slate-200"
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
            👥 Relationship Time Analysis
          </h3>
          <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            How you're spending time with the people that matter most
          </p>
          
          {Object.entries(insights.relationshipStats || {}).map(([key, stat]) => {
            if (!stat || !stat.totalWeeks || stat.totalWeeks === 0) return null;
            
            return (
              <ProgressBar
                key={key}
                percentage={stat.percentage || 0}
                color={stat.category?.color ? stat.category.color.replace('bg-', 'bg-gradient-to-r from-').concat('/80 to-').concat(stat.category.color.replace('bg-', '')).concat('/60') : 'bg-gray-400'}
                label={stat.category?.label || 'Unknown'}
                count={stat.totalWeeks}
              />
            );
          })}
        </div>
      )}

      {/* Motivational Insight */}
      <div
        className={`p-6 rounded-xl border-2 border-dashed animate-pulse ${
          darkMode 
            ? "border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10" 
            : "border-orange-300 bg-gradient-to-r from-orange-50 to-red-50"
        }`}
      >
        <h3 className={`text-lg font-bold mb-2 ${darkMode ? "text-orange-200" : "text-orange-800"}`}>
          💎 Weekly Wisdom
        </h3>
        <p className={`${darkMode ? "text-orange-300/90" : "text-orange-700/90"}`}>
          "Those are your weeks and they're all you've got." Each colored square represents a precious, 
          finite resource. Use them intentionally with the people and experiences that matter most.
        </p>
      </div>
    </div>
  );
};

export default LifeInsights;