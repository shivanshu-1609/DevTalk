
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { THEMES } from '../constants';
import { PaletteIcon } from './Icons';

export const ThemeSwitcher: React.FC = () => {
  const { state, dispatch, getTheme } = useAppContext();
  const theme = getTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName: string) => {
    dispatch({ type: 'SET_THEME', payload: themeName });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 p-2 rounded-md ${theme.classes.accent} ${theme.classes.secondaryText} transition-colors`}
      >
        <PaletteIcon className="w-5 h-5" />
        Themes
      </button>
      {isOpen && (
        <div 
          className={`absolute bottom-full mb-2 w-48 ${theme.classes.secondaryBg} border ${theme.classes.border} rounded-md shadow-lg z-20`}
        >
          {THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => handleThemeChange(t.name)}
              className={`w-full text-left px-4 py-2 text-sm ${t.classes.secondaryText} ${t.classes.accent} ${state.themeName === t.name ? t.classes.primary.replace('bg-', 'bg-opacity-50 ') + t.classes.accentText : ''}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
