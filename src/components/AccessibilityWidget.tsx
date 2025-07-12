
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Settings, Volume2, Keyboard, Eye, Type } from 'lucide-react';

const AccessibilityWidget = () => {
  const { settings, updateSetting, speak } = useAccessibility();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
        aria-label="Accessibility Settings"
      >
        <Settings className="w-5 h-5" />
      </Button>
      
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-xl">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold text-sm mb-3">Quick Accessibility</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">High Contrast</span>
              </div>
              <Button
                variant={settings.highContrast ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
              >
                {settings.highContrast ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="text-sm">Dyslexia Font</span>
              </div>
              <Button
                variant={settings.dyslexiaFont ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
              >
                {settings.dyslexiaFont ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Text-to-Speech</span>
              </div>
              <Button
                variant={settings.textToSpeech ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('textToSpeech', !settings.textToSpeech)}
              >
                {settings.textToSpeech ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                <span className="text-sm">Keyboard Nav</span>
              </div>
              <Button
                variant={settings.keyboardNavigation ? "default" : "outline"}
                size="sm"
                onClick={() => updateSetting('keyboardNavigation', !settings.keyboardNavigation)}
              >
                {settings.keyboardNavigation ? 'ON' : 'OFF'}
              </Button>
            </div>
            
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak("Accessibility settings are now active. Use tab to navigate and enter to activate elements.")}
                className="w-full text-xs"
              >
                <Volume2 className="w-3 h-3 mr-1" />
                Test Voice
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessibilityWidget;
