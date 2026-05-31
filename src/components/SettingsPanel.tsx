import React from 'react';
import { Volume2, Moon, Sliders, Check, HelpCircle, Eye } from 'lucide-react';
import { SavedState } from '../types';

interface SettingsPanelProps {
  state: SavedState;
  onUpdateSettings: (settings: SavedState['settings']) => void;
  onClose: () => void;
  onClearProgress: () => void;
  key?: any;
}

export default function SettingsPanel({ state, onUpdateSettings, onClose, onClearProgress }: SettingsPanelProps) {
  const { settings } = state;

  const handleChange = (key: keyof SavedState['settings'], value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        id="settings-card"
        className="bg-white/90 dark:bg-slate-900/95 shadow-xl rounded-3xl p-6 md:p-8 w-full max-w-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Sliders className="w-6 h-6 text-emerald-500" />
            <h2 className="text-2xl font-serif tracking-tight font-medium">Haven Settings</h2>
          </div>
          <button 
            id="close-settings-btn"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors font-sans text-sm font-medium"
          >
            Close
          </button>
        </div>

        {/* Dynamic Sound Controls */}
        <div className="space-y-6 mb-8">
          <h3 className="font-serif text-lg font-medium border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-500" />
            Audio Controls
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1 font-sans">
                <span className="font-medium">Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input 
                id="input-master-volume"
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => handleChange('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1 font-sans">
                <span className="font-medium">Music / Soundscapes</span>
                <span>{Math.round(settings.bgmVolume * 100)}%</span>
              </div>
              <input 
                id="input-bgm-volume"
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.bgmVolume}
                onChange={(e) => handleChange('bgmVolume', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1 font-sans">
                <span className="font-medium">Sound Effects & Ambient Bells</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input 
                id="input-sfx-volume"
                type="range" 
                min="0" 
                max="1" 
                step="0.05"
                value={settings.sfxVolume}
                onChange={(e) => handleChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Accessibility Panel */}
        <div className="space-y-4 mb-8">
          <h3 className="font-serif text-lg font-medium border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-500" />
            Accessibility & Controls
          </h3>

          <div className="space-y-4">
            {/* Colorblind Friendly Toggle */}
            <label id="lbl-colorblind-mode" className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="font-sans font-medium">Colorblind Friendly Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Adds visual motifs and tags to color blocks & puzzles</div>
              </div>
              <input 
                id="checkbox-colorblind-friendly"
                type="checkbox" 
                checked={settings.colorblindFriendly}
                onChange={(e) => handleChange('colorblindFriendly', e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-400 h-5 w-5 border-slate-300 dark:border-slate-700"
              />
            </label>

            {/* Left-Handed Mode Toggle */}
            <label id="lbl-left-handed-mode" className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="font-sans font-medium">Left-Handed Mode</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Adjusts the balance queues and panel docks to the left side</div>
              </div>
              <input 
                id="checkbox-left-handed"
                type="checkbox" 
                checked={settings.leftHandedMode}
                onChange={(e) => handleChange('leftHandedMode', e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-400 h-5 w-5 border-slate-300 dark:border-slate-700"
              />
            </label>

            {/* Large Touch Targets */}
            <label id="lbl-large-touch-targets" className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="font-sans font-medium">Large Touch Targets</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Enlarges level nodes & control buttons for high comfort</div>
              </div>
              <input 
                id="checkbox-large-targets"
                type="checkbox" 
                checked={settings.largeTouchTargets}
                onChange={(e) => handleChange('largeTouchTargets', e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-400 h-5 w-5 border-slate-300 dark:border-slate-700"
              />
            </label>

            {/* Haptic / Vibration Toggle */}
            <label id="lbl-vibration-feedback" className="flex items-center justify-between cursor-pointer group">
              <div className="pr-4">
                <div className="font-sans font-medium">Satisfying Tactile Feedback</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Gentle device rumble patterns during interactions (if supported)</div>
              </div>
              <input 
                id="checkbox-vibration-toggle"
                type="checkbox" 
                checked={settings.vibrationEnabled}
                onChange={(e) => handleChange('vibrationEnabled', e.target.checked)}
                className="rounded text-emerald-500 focus:ring-emerald-400 h-5 w-5 border-slate-300 dark:border-slate-700"
              />
            </label>
          </div>
        </div>

        {/* Clear Data & Reset */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 flex justify-between items-center">
          <button
            id="wipe-progress-btn"
            onClick={() => {
              if (window.confirm("Restore Mind Haven to its initial peaceful blank state? This will wipe your completed levels and garden!")) {
                onClearProgress();
              }
            }}
            className="text-xs font-sans text-rose-500 hover:text-rose-600 transition-colors py-2 px-3 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl"
          >
            Clear Stored Journey
          </button>

          <button
            id="save-settings-accept-btn"
            onClick={onClose}
            className="font-sans bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-sm font-semibold py-2.5 px-6 rounded-2xl shadow-md cursor-pointer transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
