import { 
  Smile, Frown, MapPin, Zap, Heart, Meh, Sparkles, Skull, Sun, CloudRain, X,
  Target, Brain, Compass, TreePine, Users, BookOpen, Mountain, Lightbulb, Shield, Flower2
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