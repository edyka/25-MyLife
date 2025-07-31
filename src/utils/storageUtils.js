export const saveToLocalStorage = (birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories = {}, goals = []) => {
  const data = { birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories, goals };
  localStorage.setItem('lifeWeeksData', JSON.stringify(data));
};

export const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('lifeWeeksData');
  if (saved) {
    return JSON.parse(saved);
  }
  return null;
};

export const exportData = (birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories = {}, goals = []) => {
  const data = { birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories, goals };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'my-life-in-weeks.json';
  a.click();
};