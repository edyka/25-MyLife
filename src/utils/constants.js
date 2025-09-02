import { 
  Smile, Frown, Zap, Heart, CloudRain, X, TreePine, Lightbulb, Flower2,
  Sun, Moon, Meh, Coffee
} from 'lucide-react';

export const categories = {
  // Essential Emotional States
  happy: { color: 'bg-green-400', icon: Smile, label: 'Happy' },
  sad: { color: 'bg-blue-400', icon: Frown, label: 'Sad' },
  love: { color: 'bg-pink-400', icon: Heart, label: 'Love' },
  energetic: { color: 'bg-yellow-400', icon: Zap, label: 'Energetic' },
  difficult: { color: 'bg-red-400', icon: CloudRain, label: 'Difficult' },
  
  // Core Life Experiences
  growth: { color: 'bg-purple-500', icon: TreePine, label: 'Growth' },
  creative: { color: 'bg-orange-500', icon: Lightbulb, label: 'Creative' },
  peaceful: { color: 'bg-teal-400', icon: Flower2, label: 'Peaceful' }
};

export const getColorOptions = (customCategories = {}) => ({
  none: { color: 'bg-white border-gray-400', icon: X, label: 'Clear' },
  ...categories,
  ...customCategories
});

export const getAllCategories = (customCategories = {}) => ({
  ...categories,
  ...customCategories
});

export const colorOptions = {
  none: { color: 'bg-white border-gray-400', icon: X, label: 'Clear' },
  ...categories
};

// Organized category functions for MoodPalette
export const getEmotionalCategories = () => ({
  happy: { color: 'bg-green-400', icon: Smile, label: 'Happy' },
  sad: { color: 'bg-blue-400', icon: Frown, label: 'Sad' },
  energetic: { color: 'bg-yellow-400', icon: Zap, label: 'Energetic' },
  difficult: { color: 'bg-red-400', icon: CloudRain, label: 'Difficult' },
  peaceful: { color: 'bg-teal-400', icon: Flower2, label: 'Peaceful' },
  excited: { color: 'bg-orange-400', icon: Sun, label: 'Excited' },
  calm: { color: 'bg-blue-300', icon: Moon, label: 'Calm' },
  neutral: { color: 'bg-gray-400', icon: Meh, label: 'Neutral' }
});

export const getRelationshipCategories = () => ({
  love: { color: 'bg-pink-400', icon: Heart, label: 'Love' },
  social: { color: 'bg-purple-400', icon: Coffee, label: 'Social' }
});

export const getExperienceCategories = () => ({
  growth: { color: 'bg-purple-500', icon: TreePine, label: 'Growth' },
  creative: { color: 'bg-orange-500', icon: Lightbulb, label: 'Creative' }
});

// Life stages for visualization
export const lifeStages = {
  childhood: {
    label: 'Childhood',
    start: 0,
    end: 12,
    color: 'bg-yellow-200 border-yellow-400',
    darkColor: 'bg-yellow-800 border-yellow-600'
  },
  adolescence: {
    label: 'Adolescence', 
    start: 13,
    end: 17,
    color: 'bg-orange-200 border-orange-400',
    darkColor: 'bg-orange-800 border-orange-600'
  },
  youngAdult: {
    label: 'Young Adult',
    start: 18,
    end: 29,
    color: 'bg-green-200 border-green-400',
    darkColor: 'bg-green-800 border-green-600'
  },
  adult: {
    label: 'Adult',
    start: 30,
    end: 49,
    color: 'bg-blue-200 border-blue-400',
    darkColor: 'bg-blue-800 border-blue-600'
  },
  middleAge: {
    label: 'Middle Age',
    start: 50,
    end: 64,
    color: 'bg-purple-200 border-purple-400',
    darkColor: 'bg-purple-800 border-purple-600'
  },
  senior: {
    label: 'Senior',
    start: 65,
    end: 100,
    color: 'bg-gray-200 border-gray-400',
    darkColor: 'bg-gray-700 border-gray-500'
  }
};

// Calculate relationship insights from milestones
export const calculateRelationshipInsights = (milestones = {}, birthYear, lifeExpectancy = 80) => {
  const currentYear = new Date().getFullYear();
  const currentAge = currentYear - birthYear;
  const totalWeeks = lifeExpectancy * 52;
  const currentWeek = Math.floor(currentAge * 52);
  const remainingWeeks = totalWeeks - currentWeek;
  const lifeProgress = Math.round((currentWeek / totalWeeks) * 100);

  // Initialize relationship stats
  const relationshipStats = {};
  const relationshipCategories = {
    family: { color: 'bg-pink-500', label: 'Family Time' },
    friends: { color: 'bg-purple-500', label: 'Friends' },
    romance: { color: 'bg-red-500', label: 'Romance' },
    social: { color: 'bg-blue-500', label: 'Social Life' }
  };

  // Count relationship-related milestones
  Object.values(milestones || {}).forEach(milestone => {
    if (milestone?.category && relationshipCategories[milestone.category]) {
      if (!relationshipStats[milestone.category]) {
        relationshipStats[milestone.category] = {
          totalWeeks: 0,
          category: relationshipCategories[milestone.category],
          percentage: 0
        };
      }
      relationshipStats[milestone.category].totalWeeks += 1;
    }
  });

  // Calculate percentages
  Object.keys(relationshipStats).forEach(category => {
    relationshipStats[category].percentage = Math.round(
      (relationshipStats[category].totalWeeks / totalWeeks) * 100
    );
  });

  return {
    relationshipStats,
    totalWeeks,
    currentWeek,
    remainingWeeks,
    lifeProgress
  };
};