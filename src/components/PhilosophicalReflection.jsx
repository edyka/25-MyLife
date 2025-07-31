import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Clock, Target, Sparkles, ChevronRight } from 'lucide-react';

const PhilosophicalReflection = ({ darkMode, currentWeek }) => {
  const [showReflection, setShowReflection] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [reflectionPrompt, setReflectionPrompt] = useState(0);

  // Philosophical quotes about time and living
  const wisdomQuotes = [
    {
      text: "It is not that we have a short time to live, but that we waste a lot of it.",
      author: "Seneca",
      theme: "time"
    },
    {
      text: "The unexamined life is not worth living.",
      author: "Socrates",
      theme: "reflection"
    },
    {
      text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.",
      author: "Meister Eckhart",
      theme: "intention"
    },
    {
      text: "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.",
      author: "Bill Keane",
      theme: "presence"
    },
    {
      text: "The meaning of life is not to be discovered only after death in some hidden, mysterious realm; on the contrary, it can be found by eating the succulent fruit of the Tree of Life and by living in the here and now as true daughters and sons of the living God.",
      author: "Paul Tillich",
      theme: "meaning"
    },
    {
      text: "Time is what we want most, but what we use worst.",
      author: "William Penn",
      theme: "time"
    }
  ];

  // Deep reflection prompts
  const reflectionPrompts = [
    {
      title: "Temporal Mindfulness",
      question: "This week will never come again. What would make it feel meaningful, regardless of what you accomplish?",
      icon: Clock,
      category: "presence"
    },
    {
      title: "Authenticity Check",
      question: "Are you living according to your own values this week, or others' expectations?",
      icon: Heart,
      category: "authenticity"
    },
    {
      title: "Legacy Lens",
      question: "What from this week will outlast you? How did you influence others' stories?",
      icon: Sparkles,
      category: "legacy"
    },
    {
      title: "Wisdom Integration",
      question: "What did you learn about yourself this week? How did you grow in wisdom or compassion?",
      icon: Brain,
      category: "growth"
    },
    {
      title: "Purpose Alignment",
      question: "How are you using your unique combination of weeks to serve something larger than yourself?",
      icon: Target,
      category: "purpose"
    }
  ];

  // Rotate quotes weekly
  useEffect(() => {
    const weekBasedIndex = Math.floor(currentWeek / 7) % wisdomQuotes.length;
    setCurrentQuote(weekBasedIndex);
    
    const promptIndex = Math.floor(currentWeek / 4) % reflectionPrompts.length;
    setReflectionPrompt(promptIndex);
  }, [currentWeek]);

  const currentPromptData = reflectionPrompts[reflectionPrompt];
  const IconComponent = currentPromptData.icon;

  return (
    <div className={`rounded-2xl shadow-xl p-6 mb-6 transition-all duration-300 ${
      darkMode 
        ? 'bg-gray-800 shadow-gray-900/50 border border-gray-700' 
        : 'bg-white shadow-xl border border-gray-100'
    }`}>

      {/* Present Week Ritual */}
      <div className={`p-4 rounded-lg mb-4 ${
        darkMode 
          ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 rounded-full animate-pulse ${
            darkMode ? 'bg-red-400' : 'bg-red-500'
          }`}></div>
          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Week {currentWeek} - This Moment in Your One Life
          </h4>
        </div>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          You are living in week {currentWeek} of your finite existence. This exact week will never come again. 
          How will you honor this irreplaceable fragment of time?
        </p>
      </div>

      {/* Philosophical Reflection Prompt */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <motion.button
          onClick={() => setShowReflection(!showReflection)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
            darkMode 
              ? 'hover:bg-gray-700 text-gray-200' 
              : 'hover:bg-gray-50 text-gray-700'
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-3">
            <IconComponent className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className="font-medium">Weekly Philosophical Reflection</span>
          </div>
          <motion.div
            animate={{ rotate: showReflection ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {showReflection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className={`p-4 rounded-lg ${
                darkMode 
                  ? 'bg-gray-700 border border-gray-600' 
                  : 'bg-gray-50 border border-gray-200'
              }`}>
                <h5 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {currentPromptData.title}
                </h5>
                <p className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {currentPromptData.question}
                </p>
                
                <textarea
                  placeholder="Take a moment to reflect deeply on this question..."
                  className={`w-full p-3 rounded border resize-none ${
                    darkMode 
                      ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 placeholder-gray-500'
                  }`}
                  rows={4}
                />
                
                <div className="flex justify-between items-center mt-3">
                  <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Category: {currentPromptData.category}
                  </span>
                  <motion.button
                    className={`px-4 py-2 rounded text-sm font-medium ${
                      darkMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Reflection
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhilosophicalReflection;