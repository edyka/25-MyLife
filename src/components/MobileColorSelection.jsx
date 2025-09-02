import { X } from "lucide-react";

const MobileColorSelection = ({ 
  colorOptions, 
  selectedColor, 
  setSelectedColor, 
  darkMode 
}) => {
  return (
    <div
      className={`md:hidden rounded-xl shadow-lg p-4 mb-4 ${
        darkMode
          ? "bg-gray-800/90 border border-gray-700"
          : "bg-white/90 border border-gray-200"
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-3 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Paint Colors
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(colorOptions).map(([key, option]) => {
          const IconComponent = option.icon;
          const isSelected = selectedColor === key;

          return (
            <button
              key={key}
              onClick={() => {
                setSelectedColor(selectedColor === key ? null : key);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg border text-sm ${
                isSelected
                  ? darkMode
                    ? "border-blue-400 bg-blue-500/20 text-blue-300"
                    : "border-blue-500 bg-blue-50 text-blue-700"
                  : darkMode
                  ? "border-gray-600 bg-gray-700/50 text-gray-300"
                  : "border-gray-200 bg-white text-gray-700"
              }`}
            >
              <div
                className={`w-3 h-3 ${
                  key === "none"
                    ? darkMode
                      ? "bg-gray-600 border border-gray-500"
                      : "bg-white border border-gray-400"
                    : option.color
                }`}
              >
                {key === "none" && <X className="w-2 h-2 text-gray-500" />}
              </div>
              <IconComponent className="w-3 h-3" />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileColorSelection;