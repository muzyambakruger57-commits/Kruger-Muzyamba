import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Map, 
  Flower, 
  Wind, 
  Moon, 
  Sliders, 
  Calendar, 
  RefreshCw, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  Award,
  ChevronRight,
  Info
} from 'lucide-react';
import { World, GardenItem, SavedState } from './types';
import { audioEngine } from './utils/audio';
import { getRandomQuote } from './utils/quotes';

// Subcomponents
import SettingsPanel from './components/SettingsPanel';
import BreathingGuide from './components/BreathingGuide';
import SleepMode from './components/SleepMode';
import MeditationGarden from './components/MeditationGarden';
import GameCanvas from './components/GameCanvas';

const WORLD_PRESETS: World[] = [
  {
    id: 1,
    name: 'Forest World',
    description: 'Listen to the rustle of emerald canopy leaves and let tension drain.',
    colorTheme: { bg: 'from-emerald-50 to-green-100', primary: 'text-emerald-600', secondary: 'bg-emerald-100', accent: 'bg-emerald-500', card: 'bg-emerald-500/10', text: 'text-slate-800' },
    levelsRange: [1, 30]
  },
  {
    id: 2,
    name: 'Ocean World',
    description: 'Breathe with expanding rolling tides under sunset horizons.',
    colorTheme: { bg: 'from-blue-50 to-cyan-100', primary: 'text-blue-600', secondary: 'bg-blue-100', accent: 'bg-blue-500', card: 'bg-blue-500/10', text: 'text-slate-800' },
    levelsRange: [31, 60]
  },
  {
    id: 3,
    name: 'Mountain World',
    description: 'Ascend slowly above floating cloud levels into cold wind stillness.',
    colorTheme: { bg: 'from-slate-100 to-amber-50', primary: 'text-slate-600', secondary: 'bg-slate-250', accent: 'bg-slate-600', card: 'bg-slate-600/10', text: 'text-slate-800' },
    levelsRange: [61, 95]
  },
  {
    id: 4,
    name: 'Night Sky World',
    description: 'Gaze into infinite cosmic dimensions of comforting darkness.',
    colorTheme: { bg: 'from-slate-900 to-indigo-950', primary: 'text-indigo-400', secondary: 'bg-indigo-950/40', accent: 'bg-indigo-505', card: 'bg-indigo-500/10', text: 'text-slate-100' },
    levelsRange: [96, 135]
  },
  {
    id: 5,
    name: 'Japanese Garden World',
    description: 'Balance sand grooves and moss rocks slowly inside silent teahouses.',
    colorTheme: { bg: 'from-amber-50 to-orange-100', primary: 'text-amber-700', secondary: 'bg-amber-100', accent: 'bg-amber-500', card: 'bg-amber-500/10', text: 'text-slate-800' },
    levelsRange: [136, 180]
  },
  {
    id: 6,
    name: 'Dream World',
    description: 'Let standard physics vanish as objects hover inside purple nebulae.',
    colorTheme: { bg: 'from-purple-50 to-violet-100', primary: 'text-purple-600', secondary: 'bg-purple-100', accent: 'bg-purple-505', card: 'bg-purple-500/10', text: 'text-slate-800' },
    levelsRange: [181, 230]
  },
  {
    id: 7,
    name: 'Aurora World',
    description: 'Walk on frozen ice rivers under curtains of magnetic glowing light.',
    colorTheme: { bg: 'from-teal-50 to-emerald-100', primary: 'text-teal-600', secondary: 'bg-teal-100', accent: 'bg-teal-500', card: 'bg-teal-550/10', text: 'text-slate-800' },
    levelsRange: [231, 290]
  },
  {
    id: 8,
    name: 'Celestial World',
    description: 'Find complete ultimate quiet and integration among glowing stardrafts.',
    colorTheme: { bg: 'from-violet-50 to-amber-100', primary: 'text-violet-600', secondary: 'bg-violet-100', accent: 'bg-violet-500', card: 'bg-violet-550/10', text: 'text-slate-800' },
    levelsRange: [291, 560]
  }
];

const INITIAL_GARDEN_ITEMS: GardenItem[] = [
  { id: 'stone-lantern', name: 'Lotus Stone Lantern', description: 'Brings dynamic warm light firefly embers.', icon: '🏮', unlockedAtWorld: 'Forest World', unlockedAtLevel: 10, isUnlocked: false },
  { id: 'koi-pond', name: 'Golden Koi Pond', description: 'Watch colorful fish splash in pure water.', icon: '🎏', unlockedAtWorld: 'Ocean World', unlockedAtLevel: 40, isUnlocked: false },
  { id: 'wind-chimes', name: 'Wind Chimes Accent', description: 'Sheds metallic chimes in seasonal wind loops.', icon: '🎐', unlockedAtWorld: 'Japanese Garden World', unlockedAtLevel: 150, isUnlocked: false },
  { id: 'bonsai', name: 'Pine Mini Bonsai', description: 'Grooms fresh air and deep green energy.', icon: '🪴', unlockedAtWorld: 'Japanese Garden World', unlockedAtLevel: 170, isUnlocked: false },
  { id: 'mountain-shrine', name: 'Mountain Gate Arch', description: 'Provides wooden balance and entrance security.', icon: '⛩️', unlockedAtWorld: 'Mountain World', unlockedAtLevel: 80, isUnlocked: false },
  { id: 'astral-globe', name: 'Moonglow Star Globe', description: 'Glows in absolute beautiful deep orbit hues.', icon: '🔮', unlockedAtWorld: 'Night Sky World', unlockedAtLevel: 120, isUnlocked: false },
  { id: 'dream-catcher', name: 'Dreamcatcher Loom', description: 'Absorbs bad thoughts inside purple webbing.', icon: '🕸️', unlockedAtWorld: 'Dream World', unlockedAtLevel: 210, isUnlocked: false },
  { id: 'celestial-fountain', name: 'Lotus Fountain Stem', description: 'Flows warm hotspring water over pebbles.', icon: '🌋', unlockedAtWorld: 'Celestial World', unlockedAtLevel: 320, isUnlocked: false }
];

const DEFAULT_STATE: SavedState = {
  completedLevels: [],
  unlockedWorlds: ['Forest World'],
  gardenItems: INITIAL_GARDEN_ITEMS,
  unlockedSounds: ['Piano Drone', 'Wind Chimes'],
  settings: {
    masterVolume: 0.5,
    bgmVolume: 0.4,
    sfxVolume: 0.5,
    vibrationEnabled: true,
    colorblindFriendly: false,
    leftHandedMode: false,
    largeTouchTargets: false
  },
  lastPlayedWorldId: 1
};

export default function App() {
  const [state, setState] = useState<SavedState>(DEFAULT_STATE);
  const [currentWorldIdx, setCurrentWorldIdx] = useState<number>(0);
  const [quote, setQuote] = useState(() => getRandomQuote());
  
  // Audio playback indicator
  const [audioIsActive, setAudioIsActive] = useState<boolean>(false);

  // Modular panels visibility togglers
  const [activePanel, setActivePanel] = useState<'main' | 'settings' | 'breathing' | 'sleep' | 'garden'>('main');
  const [activePlayLevelNum, setActivePlayLevelNum] = useState<number | null>(null);

  // Load from local storage securely
  useEffect(() => {
    const saved = localStorage.getItem('MIND_HAVEN_JOURNEY');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Safely merge with future structures to prevent schema breaks
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          settings: {
            ...DEFAULT_STATE.settings,
            ...(parsed.settings || {})
          }
        });
      } catch (err) {
        console.warn("Storage corrupt, using standard offline dataset: ", err);
      }
    }
  }, []);

  // Automatically focus last active world when returning to the dashboard or on initial load
  useEffect(() => {
    if (activePanel === 'main' && activePlayLevelNum === null && state.lastPlayedWorldId) {
      const idx = WORLD_PRESETS.findIndex((w) => w.id === state.lastPlayedWorldId);
      if (idx !== -1 && idx !== currentWorldIdx) {
        setCurrentWorldIdx(idx);
      }
    }
  }, [activePanel, activePlayLevelNum, state.lastPlayedWorldId, currentWorldIdx]);

  // Save changes to local storage helper
  const saveState = (newState: SavedState) => {
    setState(newState);
    localStorage.setItem('MIND_HAVEN_JOURNEY', JSON.stringify(newState));
  };

  // Toggle synthesized ambient soundtrack
  const handleToggleSoundscape = () => {
    if (audioIsActive) {
      audioEngine.stopAll();
      setAudioIsActive(false);
    } else {
      audioEngine.init();
      audioEngine.setVolumes(
        state.settings.masterVolume,
        state.settings.bgmVolume,
        state.settings.sfxVolume
      );
      setAudioIsActive(true);
    }
  };

  // Handle Level Win completions
  const handleLevelComplete = (levelNum: number) => {
    // Add completed levels to list
    const updatedCompleted = Array.from(new Set([...state.completedLevels, levelNum]));
    
    // Check next unlocks
    // Automatically flag unlockable Garden treasures based on level complete milestone
    const updatedGarden = state.gardenItems.map((item) => {
      if (item.unlockedAtLevel && levelNum >= item.unlockedAtLevel) {
        return { ...item, isUnlocked: true };
      }
      return item;
    });

    // Determine current highest completed level
    const maxCompleted = Math.max(...updatedCompleted, 0);

    // Dynamic World unlocks sequence based on completion:
    const updatedWorlds = [...state.unlockedWorlds];
    if (maxCompleted >= 30 && !updatedWorlds.includes('Ocean World')) updatedWorlds.push('Ocean World');
    if (maxCompleted >= 60 && !updatedWorlds.includes('Mountain World')) updatedWorlds.push('Mountain World');
    if (maxCompleted >= 95 && !updatedWorlds.includes('Night Sky World')) updatedWorlds.push('Night Sky World');
    if (maxCompleted >= 135 && !updatedWorlds.includes('Japanese Garden World')) updatedWorlds.push('Japanese Garden World');
    if (maxCompleted >= 180 && !updatedWorlds.includes('Dream World')) updatedWorlds.push('Dream World');
    if (maxCompleted >= 230 && !updatedWorlds.includes('Aurora World')) updatedWorlds.push('Aurora World');
    if (maxCompleted >= 290 && !updatedWorlds.includes('Celestial World')) updatedWorlds.push('Celestial World');

    const nextState: SavedState = {
      ...state,
      completedLevels: updatedCompleted,
      unlockedWorlds: updatedWorlds,
      gardenItems: updatedGarden,
      lastPlayedWorldId: currentWorld.id
    };

    saveState(nextState);
    setActivePlayLevelNum(null); // return to scene world selector map
  };

  // Clear progress wiped completely
  const handleWipeProgress = () => {
    localStorage.removeItem('MIND_HAVEN_JOURNEY');
    setState(DEFAULT_STATE);
    setCurrentWorldIdx(0);
    setActivePanel('main');
    audioEngine.stopAll();
    setAudioIsActive(false);
  };

  const updateSettings = (newSettings: SavedState['settings']) => {
    const next = { ...state, settings: newSettings };
    saveState(next);
    // sync live sound engines if active
    if (audioIsActive) {
      audioEngine.setVolumes(newSettings.masterVolume, newSettings.bgmVolume, newSettings.sfxVolume);
    }
  };

  const updateGardenItems = (updatedItems: GardenItem[]) => {
    const next = { ...state, gardenItems: updatedItems };
    saveState(next);
  };

  const currentWorld = WORLD_PRESETS[currentWorldIdx];
  const totalCompletedCount = state.completedLevels.length;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 select-none ${
      state.settings.largeTouchTargets ? 'touch-target-friendly' : ''
    }`}>
      
      {/* 1. TOP NAV WORKSPACE */}
      <header className="border-b border-slate-100 dark:border-slate-900 bg-white/70 dark:bg-slate-950/70 backdrop-blur sticky top-0 z-30 px-4 py-3 md:py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⛲</span>
            <div>
              <h1 id="app-logo-title" className="text-xl font-serif font-black tracking-tight text-emerald-600 dark:text-emerald-400">Mind Haven</h1>
              <p className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">Offline Sanctuary</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            
            {/* Real-time procedurally synthesized chimes player toggle */}
            <button
              id="top-soundscape-toggle"
              onClick={handleToggleSoundscape}
              className={`flex items-center space-x-1 py-1.5 px-3 rounded-full text-xs font-medium cursor-pointer transition-all ${
                audioIsActive 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400'
              }`}
              title={audioIsActive ? "Mute chimes" : "Play chimes"}
            >
              {audioIsActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span>{audioIsActive ? 'Sound On' : 'Nature Chimes'}</span>
            </button>

            {/* Accessibility menu */}
            <button
              id="top-settings-btn"
              onClick={() => setActivePanel('settings')}
              className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 rounded-full text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
              title="Accessibility & Volume Adjuster"
            >
              <Sliders className="w-4 h-4" />
            </button>

          </div>
        </div>
      </header>

      {/* 2. CHOOSE VIEWS OR ACTIVE SUB PANELS */}
      {activePanel === 'settings' && (
        <div key="panel-settings">
          <SettingsPanel 
            state={state} 
            onUpdateSettings={updateSettings} 
            onClose={() => setActivePanel('main')} 
            onClearProgress={handleWipeProgress}
          />
        </div>
      )}

      {activePanel === 'breathing' && (
        <div key="panel-breathing">
          <BreathingGuide 
            onClose={() => setActivePanel('main')} 
          />
        </div>
      )}

      {activePanel === 'sleep' && (
        <div key="panel-sleep">
          <SleepMode 
            onClose={() => setActivePanel('main')} 
          />
        </div>
      )}

      {activePanel === 'garden' && (
        <div key="panel-garden">
          <MeditationGarden 
            state={state} 
            onUpdateGardenItems={updateGardenItems} 
            onClose={() => {
              audioEngine.stopAll();
              setAudioIsActive(false);
              setActivePanel('main');
            }} 
          />
        </div>
      )}

      {activePlayLevelNum !== null && (
        <div key={`panel-level-${activePlayLevelNum}`}>
          <GameCanvas 
            levelNumber={activePlayLevelNum} 
            world={currentWorld} 
            state={state} 
            onClose={() => {
              audioEngine.stopAll();
              setAudioIsActive(false);
              setActivePlayLevelNum(null);
            }} 
            onLevelComplete={handleLevelComplete}
          />
        </div>
      )}

      {/* 3. CORE RESILIENT MAIN PANEL LAYOUT */}
      {activePanel === 'main' && activePlayLevelNum === null && (
        <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-24">
          
          {/* A. Dynamic Weather welcome / stats bento block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div id="stat-card-journey" className="md:col-span-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 text-[10rem] opacity-10 font-sans pointer-events-none select-none">🕊️</div>
              <div className="max-w-md">
                <span className="text-[10px] font-mono tracking-widest bg-white/20 px-2.5 py-1 rounded-full uppercase font-bold text-white mb-2 inline-block">Mind Haven Garden State</span>
                <h2 className="text-2xl md:text-3xl font-serif tracking-tight font-medium">Breathe. Relax. Reconnect.</h2>
                <p className="text-xs text-slate-100 font-sans mt-2">
                  Take a calm, screen-meditating breath as you step through procedural balance levels of stones, constellation stargazing, and Sand Garden rakes. No limits, stress indices, or timers.
                </p>
              </div>

              <div className="flex gap-4 items-center pt-2">
                <div className="text-center bg-white/10 px-4 py-2 rounded-2xl">
                  <span className="text-xs text-slate-205 font-sans font-medium block">Levels Solved</span>
                  <span className="text-lg font-mono font-bold">{totalCompletedCount}</span>
                </div>

                <div className="text-center bg-white/10 px-4 py-2 rounded-2xl">
                  <span className="text-xs text-slate-205 font-sans font-medium block">Current World</span>
                  <span className="text-lg font-mono font-bold truncate max-w-[120px]">{currentWorld.name}</span>
                </div>
              </div>
            </div>

            {/* Micro Quick-Action Bento Buttons */}
            <div className="grid grid-cols-2 gap-3">
              
              <button
                id="main-bento-guided-breathing"
                onClick={() => {
                  audioEngine.stopAll();
                  setAudioIsActive(false);
                  setActivePanel('breathing');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-115 transition-transform text-xl">
                  🌬️
                </div>
                <span className="text-xs font-sans font-bold">Breathing</span>
                <span className="text-[9px] text-slate-400">Box, 4-7-8 rhythm</span>
              </button>

              <button
                id="main-bento-sleep-mode"
                onClick={() => {
                  audioEngine.stopAll();
                  setAudioIsActive(false);
                  setActivePanel('sleep');
                }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:scale-[1.03] active:scale-95 shadow-sm hover:shadow"
              >
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950/40 text-indigo-450 flex items-center justify-center mb-2 group-hover:scale-115 transition-transform text-xl">
                  💤
                </div>
                <span className="text-xs font-sans font-bold">Sleep Ambient</span>
                <span className="text-[9px] text-slate-400">Night sky & timers</span>
              </button>

              <button
                id="main-bento-zen-garden"
                onClick={() => {
                  audioEngine.stopAll();
                  setAudioIsActive(false);
                  setActivePanel('garden');
                }}
                className="col-span-2 bg-gradient-to-r from-emerald-50 to-teal-105 dark:from-emerald-950/20 dark:to-teal-950/30 border border-emerald-100/40 p-3.5 rounded-3xl flex items-center justify-between group cursor-pointer transition-all hover:scale-[1.01] active:scale-98 shadow-sm"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-550 text-white flex items-center justify-center text-lg shadow-inner">
                    🌸
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-sans font-bold block">Sanctuary Garden</span>
                    <span className="text-[10px] text-slate-500">Design placement sandbox</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

          </div>

          {/* B. WORLDS LEVEL MATRIX DISPATCHER CHART */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
            
            {/* World Selection Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-slate-850 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-semibold tracking-wide flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-500" />
                  Select calming world dimensions
                </h3>
                <p className="text-xs text-slate-405 mt-0.5 max-w-md">
                  Unlock more realms as you clear levels sequentially. Select a theme below to view its maps.
                </p>
              </div>

              {/* Worlds Tab select buttons */}
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0 max-w-full">
                {WORLD_PRESETS.map((world, idx) => {
                  const isWorldUnlocked = idx === 0 || state.unlockedWorlds.includes(world.name);

                  return (
                    <button
                      id={`world-tab-select-${world.name}`}
                      key={world.name}
                      onClick={() => {
                        if (isWorldUnlocked) {
                          setCurrentWorldIdx(idx);
                          saveState({
                            ...state,
                            lastPlayedWorldId: world.id
                          });
                        }
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-sans font-semibold border transition-all cursor-pointer ${
                        currentWorldIdx === idx
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : isWorldUnlocked
                          ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850'
                          : 'bg-slate-105 border-transparent text-slate-350 dark:text-slate-700 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {isWorldUnlocked ? '' : '🔒 '}{world.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Active World Details layout */}
            <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border border-slate-100 dark:border-slate-900">
              <div className="max-w-md">
                <span className="text-[10px] font-mono tracking-widest text-emerald-500 uppercase font-black">Currently active focus</span>
                <h4 className="text-md font-serif font-bold tracking-tight text-slate-800 dark:text-slate-100">{currentWorld.name}</h4>
                <p className="text-xs text-slate-400 mt-1 italic">{currentWorld.description}</p>
              </div>

              <div className="mt-3 md:mt-0 flex gap-2">
                <span className="text-xs font-mono py-1 px-3 bg-white dark:bg-slate-900 text-slate-500 rounded-full font-bold shadow-sm">
                  Levels: {currentWorld.levelsRange[0]} - {currentWorld.levelsRange[1]}
                </span>
              </div>
            </div>

            {/* PECI-NODE FLOW MAP (Select individual levels inside world) */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-3">Clear level sequentially</span>
              
              <div className="flex flex-wrap gap-3 p-4 bg-slate-50/50 dark:bg-slate-950/30 rounded-3xl border border-slate-100 dark:border-slate-950 min-h-[140px] justify-center sm:justify-start">
                {Array.from(
                  { length: currentWorld.levelsRange[1] - currentWorld.levelsRange[0] + 1 },
                  (_, i) => currentWorld.levelsRange[0] + i
                ).map((levelNum, index) => {
                  
                  // Validation unlocks check:
                  // level 1 is always unlocked. Or a level is unlocked if its index is 0 or if the previous level is in completed array!
                  const isLevelCompleted = state.completedLevels.includes(levelNum);
                  
                  const isFirstInWorld = levelNum === currentWorld.levelsRange[0];
                  
                  // Check if previous general level is solved
                  const isPreviousLevelCompleted = levelNum === 1 || state.completedLevels.includes(levelNum - 1);
                  
                  const isLevelUnlocked = isFirstInWorld || isPreviousLevelCompleted;

                  return (
                    <button
                      id={`level-node-${levelNum}`}
                      key={levelNum}
                      onClick={() => {
                        if (isLevelUnlocked) {
                          setActivePlayLevelNum(levelNum);
                          saveState({
                            ...state,
                            lastPlayedWorldId: currentWorld.id
                          });
                        }
                      }}
                      disabled={!isLevelUnlocked}
                      className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        isLevelCompleted
                          ? 'bg-emerald-500 text-white shadow shadow-emerald-500/20 hover:scale-105 active:scale-95 cursor-pointer font-bold'
                          : isLevelUnlocked
                          ? 'bg-white border-2 border-emerald-400 text-emerald-600 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 active:scale-95 cursor-pointer font-bold animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-350 dark:text-slate-700 cursor-not-allowed pointer-events-none'
                      }`}
                    >
                      {isLevelCompleted ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : !isLevelUnlocked ? (
                        <span className="text-xs">🔒</span>
                      ) : (
                        <span className="text-xs font-mono font-black">{levelNum}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* C. Quote Cards / Calming reminder block */}
          <div className="bg-slate-100/60 dark:bg-slate-900/40 p-6 md:p-8 rounded-[2rem] text-center border border-slate-200/40 space-y-4 max-w-2xl mx-auto">
            <span className="text-xs text-emerald-500 font-mono font-bold uppercase tracking-widest block">Daily mindfulness check-in</span>
            <p className="font-serif italic text-sm md:text-md text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              "Within you, there is a stillness and a sanctuary to which you can retreat at any time."
            </p>
            <div className="text-[10px] font-mono tracking-wider text-slate-400 select-none">
              — HERMANN HESSE
            </div>
          </div>

        </main>
      )}

      {/* 4. FOOTER CREDITS */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-white/80 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-900 text-center text-[10px] text-slate-400 pointer-events-none select-none z-20">
        <span>Mind Haven • Offline-First Relaxation Game. Designed for Peace and Deep Clarity.</span>
      </footer>

    </div>
  );
}
