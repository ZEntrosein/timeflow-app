import React, { useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { useUIStore } from './store';
import './App.css';

function App() {
  const { currentTheme } = useUIStore();

  // 初始化主题
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (currentTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [currentTheme]);

  return (
    <MainLayout />
  );
}

export default App; 