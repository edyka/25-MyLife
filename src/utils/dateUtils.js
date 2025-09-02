export const getCurrentWeek = (birthYear, birthMonth, birthDay) => {
  try {
    if (!birthYear || !birthMonth || !birthDay) return 1;

    const year = parseInt(birthYear);
    const month = parseInt(birthMonth);
    const day = parseInt(birthDay);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return 1;
    if (year < 1900 || year > 2100) return 1;
    if (month < 1 || month > 12) return 1;
    if (day < 1 || day > 31) return 1;

    const birth = new Date(year, month - 1, day);
    if (isNaN(birth.getTime())) return 1;

    const now = new Date();
    const diffTime = now - birth; // Remove Math.abs to handle future dates

    if (diffTime < 0) return 1; // Born in the future

    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return Math.max(1, diffWeeks + 1); // Ensure minimum week 1
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Error calculating current week:", error);
    }
    return 1;
  }
};

export const getTotalWeeks = (lifeExpectancy) => {
  try {
    const expectancy = parseInt(lifeExpectancy);
    if (isNaN(expectancy) || expectancy < 1 || expectancy > 150) {
      return 4160; // Default 80 years
    }
    return expectancy * 52;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Error calculating total weeks:", error);
    }
    return 4160;
  }
};

export const getQuarterFromWeek = (weekNum) => {
  try {
    const week = parseInt(weekNum);
    if (isNaN(week) || week < 1) return "Q1";

    const weekInYear = ((week - 1) % 52) + 1;
    if (weekInYear <= 13) return "Q1";
    if (weekInYear <= 26) return "Q2";
    if (weekInYear <= 39) return "Q3";
    return "Q4";
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Error calculating quarter:", error);
    }
    return "Q1";
  }
};

export const getYearFromWeek = (weekNum) => {
  try {
    const week = parseInt(weekNum);
    if (isNaN(week) || week < 1) return 0;
    return Math.floor((week - 1) / 52);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Error calculating year from week:", error);
    }
    return 0;
  }
};

export const getStats = (
  birthYear,
  birthMonth,
  birthDay,
  lifeExpectancy,
  milestones
) => {
  try {
    const currentWeek = getCurrentWeek(birthYear, birthMonth, birthDay);
    const totalWeeks = getTotalWeeks(lifeExpectancy);
    const remainingWeeks = Math.max(0, totalWeeks - currentWeek + 1);
    const livedPercent =
      totalWeeks > 0
        ? Math.min(100, (currentWeek / totalWeeks) * 100).toFixed(1)
        : 0;
    const milestoneCount =
      milestones && typeof milestones === "object"
        ? Object.keys(milestones).length
        : 0;
    const currentAge = Math.max(0, Math.floor((currentWeek - 1) / 52));

    return {
      currentWeek,
      totalWeeks,
      remainingWeeks,
      livedPercent,
      milestoneCount,
      currentAge,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Error calculating stats:", error);
    }
    return {
      currentWeek: 1,
      totalWeeks: 4160,
      remainingWeeks: 4159,
      livedPercent: "0.0",
      milestoneCount: 0,
      currentAge: 0,
    };
  }
};
