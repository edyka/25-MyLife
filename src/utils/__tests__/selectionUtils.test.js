import { describe, it, expect } from 'vitest';

/**
 * Selection utility functions for testing the week selection system
 */

// Calculate rectangular selection area
export const calculateRectangularSelection = (startWeek, endWeek, weeksPerRow = 52) => {
  const startYear = Math.floor((startWeek - 1) / weeksPerRow);
  const startWeekInYear = (startWeek - 1) % weeksPerRow;
  const endYear = Math.floor((endWeek - 1) / weeksPerRow);
  const endWeekInYear = (endWeek - 1) % weeksPerRow;
  
  const minYear = Math.min(startYear, endYear);
  const maxYear = Math.max(startYear, endYear);
  const minWeekInYear = Math.min(startWeekInYear, endWeekInYear);
  const maxWeekInYear = Math.max(startWeekInYear, endWeekInYear);
  
  const selectedWeeks = new Set();
  
  for (let year = minYear; year <= maxYear; year++) {
    for (let weekInYear = minWeekInYear; weekInYear <= maxWeekInYear; weekInYear++) {
      const calculatedWeekNum = year * weeksPerRow + weekInYear + 1;
      selectedWeeks.add(calculatedWeekNum);
    }
  }
  
  return selectedWeeks;
};

// Get week coordinates (year, week in year)
export const getWeekCoordinates = (weekNum, weeksPerRow = 52) => {
  const year = Math.floor((weekNum - 1) / weeksPerRow);
  const weekInYear = (weekNum - 1) % weeksPerRow;
  return { year, weekInYear };
};

// Calculate distance between two weeks
export const getWeekDistance = (week1, week2) => {
  const coords1 = getWeekCoordinates(week1);
  const coords2 = getWeekCoordinates(week2);
  
  return {
    yearDistance: Math.abs(coords2.year - coords1.year),
    weekDistance: Math.abs(coords2.weekInYear - coords1.weekInYear),
    totalDistance: Math.abs(week2 - week1)
  };
};

// Validate selection bounds
export const validateSelectionBounds = (startWeek, endWeek, maxWeeks) => {
  return {
    isValid: startWeek >= 1 && endWeek >= 1 && startWeek <= maxWeeks && endWeek <= maxWeeks,
    errors: [
      ...(startWeek < 1 ? ['Start week cannot be less than 1'] : []),
      ...(endWeek < 1 ? ['End week cannot be less than 1'] : []),
      ...(startWeek > maxWeeks ? [`Start week cannot exceed ${maxWeeks}`] : []),
      ...(endWeek > maxWeeks ? [`End week cannot exceed ${maxWeeks}`] : [])
    ]
  };
};

describe('Selection Utils', () => {
  describe('calculateRectangularSelection', () => {
    it('should calculate single week selection correctly', () => {
      const selection = calculateRectangularSelection(1, 1);
      expect(selection.has(1)).toBe(true);
      expect(selection.size).toBe(1);
    });

    it('should calculate horizontal selection within same year', () => {
      const selection = calculateRectangularSelection(1, 10);
      expect(selection.size).toBe(10);
      for (let i = 1; i <= 10; i++) {
        expect(selection.has(i)).toBe(true);
      }
    });

    it('should calculate vertical selection across multiple years', () => {
      const selection = calculateRectangularSelection(1, 53); // Week 1 of year 1 to week 1 of year 2
      expect(selection.has(1)).toBe(true);
      expect(selection.has(53)).toBe(true);
      expect(selection.size).toBe(2);
    });

    it('should calculate diagonal rectangular selection', () => {
      // Select from week 1 (year 0, week 0) to week 55 (year 1, week 2)
      const selection = calculateRectangularSelection(1, 55);
      
      // Should include weeks 1-3 from year 0 and weeks 53-55 from year 1
      expect(selection.has(1)).toBe(true);
      expect(selection.has(2)).toBe(true);
      expect(selection.has(3)).toBe(true);
      expect(selection.has(53)).toBe(true);
      expect(selection.has(54)).toBe(true);
      expect(selection.has(55)).toBe(true);
      expect(selection.size).toBe(6);
    });

    it('should handle reverse selection (end before start)', () => {
      const selection = calculateRectangularSelection(10, 1);
      expect(selection.size).toBe(10);
      for (let i = 1; i <= 10; i++) {
        expect(selection.has(i)).toBe(true);
      }
    });

    it('should handle large rectangular selections', () => {
      // Select from week 1 to week 106 (Year 0 week 0 to Year 2 week 1)
      const selection = calculateRectangularSelection(1, 106);
      expect(selection.size).toBe(6); // Weeks 1-2 from years 0, 1, and 2
    });
  });

  describe('getWeekCoordinates', () => {
    it('should calculate coordinates for first week', () => {
      const coords = getWeekCoordinates(1);
      expect(coords.year).toBe(0);
      expect(coords.weekInYear).toBe(0);
    });

    it('should calculate coordinates for last week of first year', () => {
      const coords = getWeekCoordinates(52);
      expect(coords.year).toBe(0);
      expect(coords.weekInYear).toBe(51);
    });

    it('should calculate coordinates for first week of second year', () => {
      const coords = getWeekCoordinates(53);
      expect(coords.year).toBe(1);
      expect(coords.weekInYear).toBe(0);
    });

    it('should handle different weeks per row', () => {
      const coords = getWeekCoordinates(25, 24); // 24 weeks per row
      expect(coords.year).toBe(1);
      expect(coords.weekInYear).toBe(0);
    });
  });

  describe('getWeekDistance', () => {
    it('should calculate distance between adjacent weeks', () => {
      const distance = getWeekDistance(1, 2);
      expect(distance.yearDistance).toBe(0);
      expect(distance.weekDistance).toBe(1);
      expect(distance.totalDistance).toBe(1);
    });

    it('should calculate distance between weeks in different years', () => {
      const distance = getWeekDistance(1, 53);
      expect(distance.yearDistance).toBe(1);
      expect(distance.weekDistance).toBe(0);
      expect(distance.totalDistance).toBe(52);
    });

    it('should calculate diagonal distance', () => {
      const distance = getWeekDistance(1, 55); // Year 0 week 0 to Year 1 week 2
      expect(distance.yearDistance).toBe(1);
      expect(distance.weekDistance).toBe(2);
      expect(distance.totalDistance).toBe(54);
    });
  });

  describe('validateSelectionBounds', () => {
    it('should validate correct bounds', () => {
      const validation = validateSelectionBounds(1, 100, 4160); // 80 years * 52 weeks
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should catch negative start week', () => {
      const validation = validateSelectionBounds(-1, 10, 4160);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Start week cannot be less than 1');
    });

    it('should catch excessive end week', () => {
      const validation = validateSelectionBounds(1, 5000, 4160);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('End week cannot exceed 4160');
    });

    it('should catch multiple validation errors', () => {
      const validation = validateSelectionBounds(-5, 5000, 4160);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toHaveLength(2);
    });
  });
});