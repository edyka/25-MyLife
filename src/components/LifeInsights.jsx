import { Users, Sparkles } from "lucide-react";
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
        <span className={`text-sm font-semibold ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          {label}
        </span>
        <span className={`text-xs font-medium ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {count} weeks ({percentage}%)
        </span>
      </div>
      <div className={`relative h-3 rounded-full overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-200"}`}>
        <div
          className={`h-3 rounded-full ${color} transition-all duration-1000 ease-out relative`}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );

  // Simplified render to avoid errors
  if (!birthYear || !lifeExpectancy) {
    return (
      <div className={`p-8 rounded-2xl text-center ${
        darkMode
          ? "premium-card-dark"
          : "premium-card"
      }`}>
        <Sparkles className={`w-12 h-12 mx-auto mb-4 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`} />
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? "text-slate-100" : "text-slate-800"}`}>
          Unlock Your Life Insights
        </h3>
        <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          Complete your profile to see detailed relationship and experience analytics
        </p>
      </div>
    );
  }

  const hasRelationships = insights.relationshipStats && Object.keys(insights.relationshipStats).some(key => insights.relationshipStats[key]?.totalWeeks > 0);

  return (
    <div className="space-y-6">
      {/* Relationship Time Breakdown */}
      {hasRelationships && (
        <div className={`p-8 rounded-2xl ${
          darkMode
            ? "premium-card-dark"
            : "premium-card"
        }`}>
          <div className="flex items-center gap-3 mb-6">
            <Users className={`w-7 h-7 ${darkMode ? "text-cyan-400" : "text-cyan-600"}`} />
            <h3 className={`text-2xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent`}>
              Relationship Time
            </h3>
          </div>
          <p className={`text-sm mb-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            How you're spending time with the people that matter most
          </p>

          <div className="space-y-3">
            {Object.entries(insights.relationshipStats || {}).map(([key, stat]) => {
              if (!stat || !stat.totalWeeks || stat.totalWeeks === 0) return null;

              return (
                <ProgressBar
                  key={key}
                  percentage={stat.percentage || 0}
                  color={stat.category?.color ? `${stat.category.color} shadow-lg` : 'bg-gray-400'}
                  label={stat.category?.label || 'Unknown'}
                  count={stat.totalWeeks}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Insight */}
      <div
        className={`relative overflow-hidden p-8 rounded-2xl border-2 ${
          darkMode
            ? "premium-card-dark border-emerald-500/30"
            : "premium-card border-emerald-300/50"
        }`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className={`text-xl font-black ${darkMode ? "text-emerald-300" : "text-emerald-700"}`}>
              Weekly Wisdom
            </h3>
          </div>
          <p className={`text-base leading-relaxed ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
            <span className="font-bold">Those are your weeks and they're all you've got.</span>
            {" "}Each colored square represents a precious, finite resource. Use them intentionally with the people and experiences that matter most.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeInsights;