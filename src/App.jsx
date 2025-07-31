import { useState, useEffect } from 'react';
import SetupPage from './components/SetupPage';
import SettingsPage from './components/SettingsPage';
import MainApp from './components/MainApp';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/storageUtils';
import { loadTheme, applyTheme } from './utils/themeUtils';

const App = () => {
  const [currentPage, setCurrentPage] = useState('setup');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [lifeExpectancy, setLifeExpectancy] = useState('');
  const [milestones, setMilestones] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [customCategories, setCustomCategories] = useState({});
  const [goals, setGoals] = useState([]);

  // Save data to localStorage
  useEffect(() => {
    saveToLocalStorage(birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories, goals);
  }, [birthDay, birthMonth, birthYear, lifeExpectancy, milestones, customCategories, goals]);

  // Load data from localStorage
  useEffect(() => {
    const data = loadFromLocalStorage();
    if (data) {
      if (data.birthDay) setBirthDay(data.birthDay);
      if (data.birthMonth) setBirthMonth(data.birthMonth);
      if (data.birthYear) setBirthYear(data.birthYear);
      if (data.lifeExpectancy) setLifeExpectancy(data.lifeExpectancy);
      if (data.milestones) setMilestones(data.milestones);
      if (data.customCategories) setCustomCategories(data.customCategories);
      if (data.goals) setGoals(data.goals);
      if (data.birthYear && data.birthMonth && data.birthDay) {
        setCurrentPage('main');
      }
    }
    
    // Load theme
    const theme = loadTheme();
    setDarkMode(theme === 'dark');
    applyTheme(theme);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    applyTheme(theme);
  }, [darkMode]);

  if (currentPage === 'setup') {
    return (
      <SetupPage
        birthDay={birthDay}
        setBirthDay={setBirthDay}
        birthMonth={birthMonth}
        setBirthMonth={setBirthMonth}
        birthYear={birthYear}
        setBirthYear={setBirthYear}
        lifeExpectancy={lifeExpectancy}
        setLifeExpectancy={setLifeExpectancy}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
    );
  }

  if (currentPage === 'settings') {
    return (
      <SettingsPage
        birthDay={birthDay}
        setBirthDay={setBirthDay}
        birthMonth={birthMonth}
        setBirthMonth={setBirthMonth}
        birthYear={birthYear}
        setBirthYear={setBirthYear}
        lifeExpectancy={lifeExpectancy}
        setLifeExpectancy={setLifeExpectancy}
        milestones={milestones}
        setMilestones={setMilestones}
        setCurrentPage={setCurrentPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        customCategories={customCategories}
        setCustomCategories={setCustomCategories}
      />
    );
  }

  return (
    <MainApp
      birthDay={birthDay}
      birthMonth={birthMonth}
      birthYear={birthYear}
      lifeExpectancy={lifeExpectancy}
      milestones={milestones}
      setMilestones={setMilestones}
      setCurrentPage={setCurrentPage}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      customCategories={customCategories}
      setCustomCategories={setCustomCategories}
      goals={goals}
      setGoals={setGoals}
    />
  );
};

export default App;