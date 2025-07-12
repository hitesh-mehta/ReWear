
import React, { useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

interface AccessibilityReaderProps {
  children: React.ReactNode;
}

const AccessibilityReader: React.FC<AccessibilityReaderProps> = ({ children }) => {
  const { settings, speak } = useAccessibility();

  useEffect(() => {
    if (!settings.textToSpeech) return;

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      let textToSpeak = '';

      // Priority order for text extraction
      if (target.getAttribute('aria-label')) {
        textToSpeak = target.getAttribute('aria-label')!;
      } else if (target.getAttribute('title')) {
        textToSpeak = target.getAttribute('title')!;
      } else if (target.tagName === 'BUTTON' || target.tagName === 'A') {
        textToSpeak = target.textContent?.trim() || '';
      } else if (target.tagName === 'IMG') {
        textToSpeak = target.getAttribute('alt') || 'Image';
      } else if (target.textContent && target.textContent.trim().length < 100) {
        textToSpeak = target.textContent.trim();
      }

      if (textToSpeak && textToSpeak.length > 0) {
        speak(textToSpeak);
      }
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      let textToSpeak = '';

      if (target.getAttribute('aria-label')) {
        textToSpeak = target.getAttribute('aria-label')!;
      } else if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        const label = document.querySelector(`label[for="${target.id}"]`);
        textToSpeak = label?.textContent || target.getAttribute('placeholder') || 'Input field';
      } else if (target.textContent) {
        textToSpeak = target.textContent.trim();
      }

      if (textToSpeak) {
        speak(textToSpeak);
      }
    };

    // Add event listeners to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, [role="button"], [tabindex]');
    
    interactiveElements.forEach(element => {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('focus', handleFocus);
    });

    return () => {
      interactiveElements.forEach(element => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('focus', handleFocus);
      });
    };
  }, [settings.textToSpeech, speak]);

  return <>{children}</>;
};

export default AccessibilityReader;
