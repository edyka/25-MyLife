export const getCurrentWeek = (birthYear, birthMonth, birthDay) => {
  if (!birthYear || !birthMonth || !birthDay) return 1;
  const birth = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
  const now = new Date();
  const diffTime = Math.abs(now - birth);
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks + 1; // Add 1 to start from week 1
};

export const getTotalWeeks = (lifeExpectancy) => {
  return parseInt(lifeExpectancy) * 52 || 4160;
};

export const getQuarterFromWeek = (weekNum) => {
  const weekInYear = ((weekNum - 1) % 52) + 1;
  if (weekInYear <= 13) return 'Q1';
  if (weekInYear <= 26) return 'Q2';
  if (weekInYear <= 39) return 'Q3';
  return 'Q4';
};

export const getYearFromWeek = (weekNum) => {
  return Math.floor((weekNum - 1) / 52);
};

export const getStats = (birthYear, birthMonth, birthDay, lifeExpectancy, milestones) => {
  const currentWeek = getCurrentWeek(birthYear, birthMonth, birthDay);
  const totalWeeks = getTotalWeeks(lifeExpectancy);
  const remainingWeeks = totalWeeks - currentWeek + 1; // Adjust for 1-based weeks
  const livedPercent = totalWeeks > 0 ? ((currentWeek / totalWeeks) * 100).toFixed(1) : 0;
  
  return {
    currentWeek,
    totalWeeks,
    remainingWeeks,
    livedPercent,
    milestoneCount: Object.keys(milestones).length,
    currentAge: Math.floor((currentWeek - 1) / 52) // Adjust for 1-based weeks in age calculation
  };
};