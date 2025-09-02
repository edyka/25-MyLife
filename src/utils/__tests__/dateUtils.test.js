import { describe, it, expect } from 'vitest';
import { 
  getCurrentWeek, 
  getTotalWeeks, 
  getQuarterFromWeek, 
  getYearFromWeek, 
  getStats 
} from '../dateUtils';

describe('dateUtils', () => {
  describe('getCurrentWeek', () => {
    it('should return 1 for invalid inputs', () => {
      expect(getCurrentWeek('', '', '')).toBe(1);
      expect(getCurrentWeek(null, null, null)).toBe(1);
      expect(getCurrentWeek('invalid', 'invalid', 'invalid')).toBe(1);
    });

    it('should handle valid birth dates', () => {
      const result = getCurrentWeek('1990', '1', '1');
      expect(result).toBeGreaterThan(1000); // Should be a reasonable number for someone born in 1990
    });

    it('should handle future birth dates', () => {
      const futureYear = new Date().getFullYear() + 1;
      expect(getCurrentWeek(futureYear.toString(), '1', '1')).toBe(1);
    });

    it('should handle edge cases for dates', () => {
      expect(getCurrentWeek('1800', '1', '1')).toBe(1); // Too old
      expect(getCurrentWeek('2200', '1', '1')).toBe(1); // Too far future
      expect(getCurrentWeek('2000', '13', '1')).toBe(1); // Invalid month
      expect(getCurrentWeek('2000', '1', '32')).toBe(1); // Invalid day
    });
  });

  describe('getTotalWeeks', () => {
    it('should return correct weeks for valid life expectancy', () => {
      expect(getTotalWeeks('80')).toBe(4160);
      expect(getTotalWeeks('90')).toBe(4680);
      expect(getTotalWeeks('70')).toBe(3640);
    });

    it('should return default for invalid inputs', () => {
      expect(getTotalWeeks('')).toBe(4160);
      expect(getTotalWeeks('invalid')).toBe(4160);
      expect(getTotalWeeks('0')).toBe(4160);
      expect(getTotalWeeks('200')).toBe(4160); // Too high
    });
  });

  describe('getQuarterFromWeek', () => {
    it('should return correct quarters', () => {
      expect(getQuarterFromWeek(1)).toBe('Q1');
      expect(getQuarterFromWeek(13)).toBe('Q1');
      expect(getQuarterFromWeek(14)).toBe('Q2');
      expect(getQuarterFromWeek(26)).toBe('Q2');
      expect(getQuarterFromWeek(27)).toBe('Q3');
      expect(getQuarterFromWeek(39)).toBe('Q3');
      expect(getQuarterFromWeek(40)).toBe('Q4');
      expect(getQuarterFromWeek(52)).toBe('Q4');
    });

    it('should handle invalid inputs', () => {
      expect(getQuarterFromWeek('invalid')).toBe('Q1');
      expect(getQuarterFromWeek(0)).toBe('Q1');
      expect(getQuarterFromWeek(-1)).toBe('Q1');
    });
  });

  describe('getYearFromWeek', () => {
    it('should return correct year', () => {
      expect(getYearFromWeek(1)).toBe(0);
      expect(getYearFromWeek(52)).toBe(0);
      expect(getYearFromWeek(53)).toBe(1);
      expect(getYearFromWeek(104)).toBe(1);
      expect(getYearFromWeek(105)).toBe(2);
    });

    it('should handle invalid inputs', () => {
      expect(getYearFromWeek('invalid')).toBe(0);
      expect(getYearFromWeek(0)).toBe(0);
      expect(getYearFromWeek(-1)).toBe(0);
    });
  });

  describe('getStats', () => {
    it('should return valid stats for normal inputs', () => {
      const stats = getStats('1990', '1', '1', '80', {});
      
      expect(stats.currentWeek).toBeGreaterThan(1000);
      expect(stats.totalWeeks).toBe(4160);
      expect(stats.remainingWeeks).toBeGreaterThan(0);
      expect(parseFloat(stats.livedPercent)).toBeGreaterThan(0);
      expect(parseFloat(stats.livedPercent)).toBeLessThanOrEqual(100);
      expect(stats.milestoneCount).toBe(0);
      expect(stats.currentAge).toBeGreaterThan(30);
    });

    it('should handle milestones count', () => {
      const milestones = { '100': {}, '200': {}, '300': {} };
      const stats = getStats('1990', '1', '1', '80', milestones);
      expect(stats.milestoneCount).toBe(3);
    });

    it('should handle invalid inputs gracefully', () => {
      const stats = getStats('', '', '', '', null);
      
      expect(stats.currentWeek).toBe(1);
      expect(stats.totalWeeks).toBe(4160);
      expect(stats.remainingWeeks).toBe(4160);
      expect(stats.livedPercent).toBe('0.0');
      expect(stats.milestoneCount).toBe(0);
      expect(stats.currentAge).toBe(0);
    });
  });
});