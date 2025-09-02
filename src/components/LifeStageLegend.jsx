import { motion } from "framer-motion";
import { lifeStages } from "../utils/constants";

const LifeStageLegend = ({ darkMode = false }) => {
  if (!lifeStages || typeof lifeStages !== 'object') {
    return null;
  }
  
  return (
    <motion.div
      className={`p-4 mb-4 rounded-xl border ${
        darkMode 
          ? "bg-slate-800/30 border-slate-700" 
          : "bg-white border-slate-200"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className={`text-sm font-semibold mb-3 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
        Life Stages
      </h4>
      <div className="flex flex-wrap gap-3">
        {Object.entries(lifeStages).map(([key, stage]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className={`w-4 h-4 border-2 ${
                darkMode ? stage.darkColor : stage.color
              } rounded`}
            />
            <span className={`text-xs font-medium ${
              darkMode ? "text-slate-300" : "text-slate-700"
            }`}>
              {stage.label}
            </span>
            <span className={`text-xs ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              ({stage.start}-{stage.end === 100 ? '80+' : stage.end})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LifeStageLegend;