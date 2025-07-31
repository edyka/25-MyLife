export const saveTheme = (theme) => {
  localStorage.setItem('lifeWeeksTheme', theme);
};

export const loadTheme = () => {
  const saved = localStorage.getItem('lifeWeeksTheme');
  return saved || 'light';
};

export const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};