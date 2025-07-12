
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  dyslexiaFont: boolean;
  textToSpeech: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  speak: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const stored = localStorage.getItem('rewear-accessibility');
    return stored ? JSON.parse(stored) : {
      highContrast: false,
      dyslexiaFont: false,
      textToSpeech: false,
      keyboardNavigation: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('rewear-accessibility', JSON.stringify(settings));
    
    // Apply high contrast
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    
    // Apply dyslexia font
    document.documentElement.classList.toggle('dyslexia-font', settings.dyslexiaFont);
    
    // Apply keyboard navigation styles
    document.documentElement.classList.toggle('keyboard-nav', settings.keyboardNavigation);
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const speak = (text: string) => {
    if (settings.textToSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, speak }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
