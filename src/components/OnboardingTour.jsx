import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles, Palette, Target, Calendar } from 'lucide-react';
import { useUIStore } from '../stores/useUIStore';
import { getTheme } from '../utils/themeConfig';

const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const darkMode = useUIStore(state => state.darkMode);
  const themePreset = useUIStore(state => state.themePreset);
  const theme = getTheme(themePreset);

  // Check if user has seen the tour before
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('viventiva_onboarding_complete');
    if (!hasSeenTour) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps = [
    {
      icon: Sparkles,
      title: 'Welcome to Viventiva!',
      description: 'Your life visualized as a grid of weeks. Each square represents one week of your life. Let\'s take a quick tour.',
      position: 'center',
    },
    {
      icon: Calendar,
      title: 'Your Life Grid',
      description: 'The grid shows all the weeks in your life. Past weeks are grayed out, current week is highlighted, and future weeks are ready for you to paint.',
      position: 'center',
    },
    {
      icon: Palette,
      title: 'Paint Your Weeks',
      description: 'Click on any week to paint it with a mood or color. This helps you track your life\'s journey and reflect on meaningful moments.',
      position: 'center',
    },
    {
      icon: Target,
      title: 'Set Goals & Milestones',
      description: 'Mark important weeks, set goals, and create milestones. Your life visualization helps you stay intentional and focused.',
      position: 'center',
    },
    {
      icon: Sparkles,
      title: 'You\'re All Set!',
      description: 'Start painting your weeks and make every moment count. Remember: each week matters, each moment counts.',
      position: 'center',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('viventiva_onboarding_complete', 'true');
    setIsOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative max-w-md w-full rounded-3xl p-8 shadow-2xl ${
            darkMode
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-white border border-slate-200'
          }`}
        >
          {/* Close Button */}
          <button
            onClick={handleSkip}
            className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
              darkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${theme.primary} bg-opacity-10`}>
              <IconComponent className={`w-8 h-8 ${theme.accent}`} />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}>
              {currentStepData.title}
            </h2>
            <p className={`text-base leading-relaxed ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {currentStepData.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? `bg-gradient-to-r ${theme.primary} w-8`
                    : darkMode
                    ? 'bg-slate-600 w-2'
                    : 'bg-slate-300 w-2'
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold text-white transition-all bg-gradient-to-r ${theme.primary} hover:opacity-90 shadow-lg`}
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

          {/* Skip Link */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className={`text-sm font-medium transition-colors ${
                darkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Skip tour
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;

