import React, { useState, useEffect, useRef } from 'react';
import { Wind, Play, Pause, RotateCcw, VolumeX, Volume2, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../utils/audio';

type BreathType = 'box' | 'relax' | 'coherent';

interface BreathConfig {
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  color: string;
}

const BREATH_PRESETS: Record<BreathType, BreathConfig> = {
  box: {
    name: 'Box Breathing',
    description: 'Promotes deep mental clarity and helps lower rapid stress triggers.',
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    color: 'from-emerald-400 to-teal-500',
  },
  relax: {
    name: '4-7-8 Grounding',
    description: 'Acts as a natural tranquilizer for the nervous system, excellent for restful sleep.',
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    color: 'from-sky-400 to-indigo-500',
  },
  coherent: {
    name: 'Coherent Harmony',
    description: 'Brings heart rate variability into balance and stabilizes emotional swings.',
    inhale: 6,
    hold1: 0,
    exhale: 6,
    hold2: 0,
    color: 'from-pink-400 to-rose-450',
  },
};

export default function BreathingGuide({ onClose }: { onClose: () => void }) {
  const [activePreset, setActivePreset] = useState<BreathType>('box');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPhase, setCurrentPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest' | 'Get Ready'>('Get Ready');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(3);
  const [totalCycles, setTotalCycles] = useState<number>(0);
  const [soundCuesEnabled, setSoundCuesEnabled] = useState<boolean>(true);

  const config = BREATH_PRESETS[activePreset];
  const timerRef = useRef<number | null>(null);

  // Restart trigger when preset changes
  useEffect(() => {
    resetExercise();
  }, [activePreset]);

  // Handle countdowns and phase flips
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Time to swap the phase!
          transitionToNextPhase();
          return 0; // Temp placeholder, will override in transition
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentPhase, activePreset]);

  const transitionToNextPhase = () => {
    if (soundCuesEnabled) {
      // Gentle chime triggers aligned on phase swap
      audioEngine.playWaterDrip();
    }

    switch (currentPhase) {
      case 'Get Ready':
        setCurrentPhase('Inhale');
        setPhaseSecondsLeft(config.inhale);
        break;

      case 'Inhale':
        if (config.hold1 > 0) {
          setCurrentPhase('Hold');
          setPhaseSecondsLeft(config.hold1);
        } else {
          setCurrentPhase('Exhale');
          setPhaseSecondsLeft(config.exhale);
        }
        break;

      case 'Hold':
        setCurrentPhase('Exhale');
        setPhaseSecondsLeft(config.exhale);
        break;

      case 'Exhale':
        if (config.hold2 > 0) {
          setCurrentPhase('Rest');
          setPhaseSecondsLeft(config.hold2);
        } else {
          setCurrentPhase('Inhale');
          setPhaseSecondsLeft(config.inhale);
          setTotalCycles((c) => c + 1);
        }
        break;

      case 'Rest':
        setCurrentPhase('Inhale');
        setPhaseSecondsLeft(config.inhale);
        setTotalCycles((c) => c + 1);
        break;

      default:
        setCurrentPhase('Inhale');
        setPhaseSecondsLeft(config.inhale);
    }
  };

  const startExercise = () => {
    audioEngine.resume();
    setIsPlaying(true);
    if (currentPhase === 'Get Ready' && phaseSecondsLeft === 3) {
      setPhaseSecondsLeft(3); // Start buffer
    }
  };

  const pauseExercise = () => {
    setIsPlaying(false);
  };

  const resetExercise = () => {
    setIsPlaying(false);
    setCurrentPhase('Get Ready');
    setPhaseSecondsLeft(3);
    setTotalCycles(0);
  };

  // Determine current scaling factor of the flower for CSS animation
  // Calculated relative to timing
  const getFlowerScale = () => {
    if (!isPlaying) return 1.0;
    if (currentPhase === 'Get Ready') return 1.0;

    const fullDuration = 
      currentPhase === 'Inhale' ? config.inhale :
      currentPhase === 'Hold' ? config.hold1 :
      currentPhase === 'Exhale' ? config.exhale :
      currentPhase === 'Rest' ? config.hold2 : 1;

    const elapsed = fullDuration - phaseSecondsLeft;
    const ratio = Math.min(Math.max(elapsed / fullDuration, 0), 1);

    if (currentPhase === 'Inhale') {
      // Expand from 1.0 to 2.2
      return 1.0 + ratio * 1.2;
    } else if (currentPhase === 'Hold') {
      // Hold at maximum expansion 2.2
      return 2.2;
    } else if (currentPhase === 'Exhale') {
      // Shrink from 2.2 back to 1.0
      return 2.2 - ratio * 1.2;
    } else { // Rest / Hold2
      // Hold at bottom size 1.0
      return 1.0;
    }
  };

  const flowerScale = getFlowerScale();

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-40 flex flex-col justify-between overflow-y-auto font-sans p-6 text-slate-800 dark:text-slate-100">
      
      {/* Header bar */}
      <div className="flex justify-between items-center w-full max-w-xl mx-auto pt-2">
        <button 
          id="btn-breathing-back"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Guide</span>
        </button>

        <button 
          id="btn-audio-cue-toggle"
          onClick={() => setSoundCuesEnabled(!soundCuesEnabled)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full cursor-pointer transition-colors"
          title={soundCuesEnabled ? "Mute phase cues" : "Unmute phase cues"}
        >
          {soundCuesEnabled ? <Volume2 className="w-5 h-5 text-emerald-500" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full my-6">
        
        {/* Preset selections */}
        <div className="grid grid-cols-3 gap-2 w-full mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
          {(Object.keys(BREATH_PRESETS) as BreathType[]).map((type) => (
            <button
              id={`preset-btn-${type}`}
              key={type}
              onClick={() => setActivePreset(type)}
              className={`py-2 px-1 text-xs md:text-sm font-sans font-medium rounded-xl transition-all cursor-pointer ${
                activePreset === type 
                  ? 'bg-white dark:bg-slate-850 shadow-md text-emerald-600 dark:text-emerald-400 scale-[1.02]' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {BREATH_PRESETS[type].name}
            </button>
          ))}
        </div>

        {/* Preset Description */}
        <p className="text-xs text-center text-slate-400 dark:text-slate-400 max-w-sm mb-12">
          {config.description}
        </p>

        {/* Dynamic Expanding Mind Mandala / Flower */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-12">
          
          {/* Pulsing Outer rings */}
          <div className="absolute inset-0 border border-emerald-500/10 rounded-full animate-ping opacity-40 scale-[1.1]" />
          <div className="absolute inset-0 border border-emerald-500/5 rounded-full animate-pulse opacity-20 scale-[1.3]" />
          
          {/* Animated Petals Flower using pure CSS nested scales and shadows */}
          <div 
            id="breathing-mandala"
            className="relative w-28 h-28 flex items-center justify-center transition-all duration-1000 ease-linear"
            style={{ transform: `scale(${flowerScale})` }}
          >
            {/* Center core */}
            <div className={`absolute w-12 h-12 rounded-full bg-gradient-to-tr ${config.color} shadow-lg z-10 opacity-90`} />
            
            {/* Petals */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, k) => (
              <div 
                key={k}
                className={`absolute w-10 h-10 rounded-t-full rounded-br-full bg-gradient-to-tr ${config.color} opacity-40 blur-[1px]`}
                style={{
                  transform: `rotate(${angle}deg) translate(0px, -24px) scale(0.85)`,
                  transformOrigin: 'bottom center',
                }}
              />
            ))}
          </div>

          {/* Current Phase text inside outer layout, not scaled */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-serif tracking-wide font-semibold text-slate-800 dark:text-slate-100 transition-all duration-300">
              {currentPhase}
            </span>
            <span className="text-xl font-mono text-emerald-500 font-medium mt-1">
              {phaseSecondsLeft}s
            </span>
          </div>
        </div>

        {/* Cycles Counter */}
        <div className="text-xs font-mono py-1 px-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full mb-8 font-semibold">
          Completed Cycles: {totalCycles}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-6 justify-center">
          <button
            id="breath-reset-btn"
            onClick={resetExercise}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5 text-slate-500" />
          </button>

          <button
            id="breath-play-toggle-btn"
            onClick={isPlaying ? pauseExercise : startExercise}
            className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-3xl shadow-lg hover:shadow-xl active:scale-95 cursor-pointer transition-all"
            title={isPlaying ? "Pause" : "Start"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
          </button>

          <div className="w-11 h-11" /> {/* Spacer balance */}
        </div>

      </div>

      <div className="w-full max-w-xl mx-auto pb-4 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600 font-serif italic">
          "Feel your lungs expand like the sails of a ship navigating peaceful quiet waters."
        </p>
      </div>

    </div>
  );
}
