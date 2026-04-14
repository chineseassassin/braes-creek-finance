'use client';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const theme = localStorage.getItem('app-theme');
      if (theme === 'light') {
        setIsLightMode(true);
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !isLightMode;
    setIsLightMode(nextMode);
    if (nextMode) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('app-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('app-theme', 'dark');
    }
  };

  return (
    <button 
      className="btn btn-ghost btn-icon"
      onClick={toggleTheme}
      title={isLightMode ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
      style={{ marginRight: '8px' }}
    >
      <span style={{ fontSize: 18 }}>{isLightMode ? '🌙' : '☀️'}</span>
    </button>
  );
}
