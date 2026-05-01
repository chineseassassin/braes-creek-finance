"use client";

import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: 150, height: 44 }} />;

  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div 
      onClick={toggleTheme}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 150,
        height: 44,
        borderRadius: 24,
        padding: 4,
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.3s ease',
        background: isDark ? '#141414' : '#e5e7eb',
        border: isDark ? '1px solid #333' : '1px solid transparent',
      }}
    >
      {/* Text Container */}
      <div style={{
        position: 'absolute',
        width: '100%',
        left: 0,
        display: 'flex',
        alignItems: 'center',
        padding: isDark ? '0 16px 0 0' : '0 0 0 16px',
        pointerEvents: 'none',
        justifyContent: isDark ? 'flex-end' : 'flex-start'
      }}>
        <span style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          letterSpacing: 0.5,
          color: isDark ? '#fff' : '#000',
        }}>
          {isDark ? 'NIGHT MODE' : 'DAY MODE'}
        </span>
      </div>

      {/* Thumb */}
      <div 
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: isDark ? 'translateX(0)' : 'translateX(106px)',
          boxShadow: isDark ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
          border: isDark ? '1px solid #333' : '1px solid #ddd',
          zIndex: 2
        }}
      >
        {isDark ? (
          <Moon size={16} color="#000" strokeWidth={2} />
        ) : (
          <Sun size={16} color="#000" strokeWidth={2} />
        )}
      </div>
    </div>
  );
}
