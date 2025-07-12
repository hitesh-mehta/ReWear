
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAccessibility } from '@/contexts/AccessibilityContext';
import { Volume2, Keyboard, Eye, Type } from 'lucide-react';

const AccessibilitySettings = () => {
  const { settings, updateSetting, speak } = useAccessibility();

  const testTextToSpeech = () => {
    speak("This is a test of the text-to-speech feature. Welcome to ReWear, where fashion meets sustainability!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Accessibility Settings</h1>
        
        <div className="space-y-6">
          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visual Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">High Contrast Mode</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Enhance contrast for better visibility
                  </p>
                </div>
                <Switch 
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => updateSetting('highContrast', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Dyslexia-Friendly Font
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use OpenDyslexic font for better readability
                  </p>
                </div>
                <Switch 
                  checked={settings.dyslexiaFont}
                  onCheckedChange={(checked) => updateSetting('dyslexiaFont', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Audio Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Text-to-Speech</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Auto playback for content when hovering or focusing
                  </p>
                </div>
                <Switch 
                  checked={settings.textToSpeech}
                  onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
                />
              </div>
              
              {settings.textToSpeech && (
                <Button 
                  onClick={testTextToSpeech}
                  variant="outline"
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Text-to-Speech
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-5 h-5" />
                Navigation Accessibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Enhanced Keyboard Navigation</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Improved focus indicators and keyboard shortcuts
                  </p>
                </div>
                <Switch 
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                />
              </div>
              
              {settings.keyboardNavigation && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Tab</kbd> - Navigate between elements</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> - Activate buttons/links</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> - Close modals/dropdowns</div>
                    <div><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Arrow Keys</kbd> - Navigate lists/grids</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;
