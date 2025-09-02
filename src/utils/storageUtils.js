import {
  saveToSecureStorage,
  loadFromSecureStorage,
  exportSecureData,
  migrateFromLegacyStorage,
} from "./secureStorage.js";

export const saveToLocalStorage = (
  birthDay,
  birthMonth,
  birthYear,
  lifeExpectancy,
  milestones,
  customCategories = {},
  goals = []
) => {
  try {
    return saveToSecureStorage(
      birthDay,
      birthMonth,
      birthYear,
      lifeExpectancy,
      milestones,
      customCategories,
      goals
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Failed to save data:", error);
    }
    return false;
  }
};

export const loadFromLocalStorage = () => {
  try {
    migrateFromLegacyStorage();
    return loadFromSecureStorage();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Failed to load data:", error);
    }
    return null;
  }
};

export const exportData = (
  birthDay,
  birthMonth,
  birthYear,
  lifeExpectancy,
  milestones,
  customCategories = {},
  goals = []
) => {
  try {
    return exportSecureData(
      birthDay,
      birthMonth,
      birthYear,
      lifeExpectancy,
      milestones,
      customCategories,
      goals
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
       
      console.error("Failed to export data:", error);
    }
    return false;
  }
};
