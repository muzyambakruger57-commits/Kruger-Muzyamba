import React, { useState, useEffect, useRef } from 'react';
import { Moon, Star, Bell, Clock, Volume2, CloudRain, Wind, Play, Square, Navigation, ArrowLeft } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface StarObj {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDir: number;
}

export default function SleepMode({ onClose }: { onClose: () => void }) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [stars, setStars] = useState<StarObj[]>([]);
  const [soundProfile, setSoundProfile] = useState<{
    rain: boolean;
    waves: boolean;
    drone: boolean;
  }>({
    rain: false,
    waves: false,
    drone: true, // start with peaceful warm ambient drone
  });

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const countdownIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Generate background starry positions
  useEffect(() => {
    const initialStars: StarObj[] = [];
    for (let i = 0; i < 45; i++) {
      initialStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 80, // keep high in sky
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.8,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      });
    }
    setStars(initialStars);

    // Initialise audio engine on mount for Sleep Mode if playing
    if (isPlaying) {
      applyAudioSettings();
    }

    return () => {
      audioEngine.stopAll();
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update bedtime clock display
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hrs = now.getHours();
      let mins = now.getMinutes();
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12; // 0 should be 12
      const minStr = mins < 10 ? '0' + mins : mins;
      setTimeStr(`${hrs}:${minStr} ${ampm}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Twinkle stars frame loop
  useEffect(() => {
    const animateStars = () => {
      setStars((prevStars) => 
        prevStars.map((star) => {
          let newOpacity = star.opacity + star.twinkleDir * 0.012;
          let newDir = star.twinkleDir;

          if (newOpacity >= 1) {
            newOpacity = 1;
            newDir = -1;
          } else if (newOpacity <= 0.1) {
            newOpacity = 0.1;
            newDir = 1;
          }

          return { ...star, opacity: newOpacity, twinkleDir: newDir };
        })
      );
      animationFrameRef.current = requestAnimationFrame(animateStars);
    };

    animationFrameRef.current = requestAnimationFrame(animateStars);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Sync state to audio synthesizer engine
  const applyAudioSettings = () => {
    if (!isPlaying) {
      audioEngine.stopAll();
      return;
    }

    // Prepare context
    audioEngine.init();

    // Sum coefficients representing selected tracks
    // Multiply coefficients relative to individual volumes
    const droneVol = soundProfile.drone ? 0.6 : 0;
    const rainVol = soundProfile.rain ? 0.5 : 0;
    const wavesVol = soundProfile.waves ? 0.6 : 0;

    audioEngine.setVolumes(0.4, droneVol, Math.max(rainVol, wavesVol));
  };

  useEffect(() => {
    applyAudioSettings();
  }, [soundProfile, isPlaying]);

  // Audio countdown logic
  useEffect(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (sleepTimerMinutes === null || !isPlaying) return;

    let secRemaining = sleepTimerMinutes * 60;
    setTimerSecondsRemaining(secRemaining);

    countdownIntervalRef.current = window.setInterval(() => {
      secRemaining -= 1;
      setTimerSecondsRemaining(secRemaining);

      if (secRemaining <= 0) {
        setIsPlaying(false);
        setSleepTimerMinutes(null);
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [sleepTimerMinutes, isPlaying]);

  const toggleSound = (profileKey: keyof typeof soundProfile) => {
    setSoundProfile((prev) => ({
      ...prev,
      [profileKey]: !prev[profileKey],
    }));
  };

  const formatTimerOffset = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-200 z-50 flex flex-col justify-between overflow-y-auto p-6 select-none">
      
      {/* Decorative starry background canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute rounded-full bg-white blur-[0.5px]"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}

        {/* Floating moon */}
        <div className="absolute right-12 top-16 w-16 h-16 rounded-full bg-slate-200/20 shadow-inner flex items-center justify-center opacity-40">
          <div className="w-12 h-12 rounded-full bg-slate-950 transform translate-x-3 -translate-y-1" />
        </div>
      </div>

      {/* Sleep header */}
      <div className="relative flex justify-between items-center w-full max-w-lg mx-auto z-10 pt-2">
        <button 
          id="sleep-back-btn"
          onClick={() => {
            audioEngine.stopAll();
            onClose();
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 cursor-pointer font-medium text-sm transition-colors py-2 px-3 hover:bg-slate-900 rounded-2xl"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Leave Sleep Mode</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Offline Sound Synthesizer Active</span>
        </div>
      </div>

      {/* Bedtime Clock and Timer stats */}
      <div className="relative flex flex-col items-center justify-center text-center z-10 py-8 flex-grow">
        <Moon className="w-14 h-14 text-indigo-300 md:mb-4 animate-pulse opacity-75" />
        
        <h1 className="text-4xl md:text-5xl font-mono tracking-widest text-slate-100 font-medium my-4">
          {timeStr || '--:--'}
        </h1>

        <p className="text-sm font-light text-slate-400 max-w-xs italic font-serif">
          "Quiet your thoughts, let your eyelids grow heavy, and drift on a wave of warm sound."
        </p>

        {sleepTimerMinutes !== null && isPlaying && (
          <div className="mt-8 flex items-center gap-2 py-1.5 px-4 bg-indigo-950/40 border border-indigo-900/30 rounded-full font-mono text-sm text-indigo-300">
            <Clock className="w-4 h-4" />
            <span>Fading in: {formatTimerOffset(timerSecondsRemaining)}</span>
          </div>
        )}
      </div>

      {/* Bedtime Controls Panel */}
      <div className="relative w-full max-w-lg mx-auto bg-slate-900/55 border border-indigo-950/20 p-6 rounded-3xl backdrop-blur-xl z-10 mb-2">
        <h3 className="text-sm font-sans font-medium text-slate-400 mb-4 tracking-wide uppercase flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-indigo-400" /> Choose Bedtime Ambient Tones
        </h3>

        {/* Ambient togglers */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            id="sleep-toggle-drone"
            onClick={() => toggleSound('drone')}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
              soundProfile.drone 
                ? 'bg-indigo-950/60 border-indigo-550 text-indigo-300 shadow-md scale-[1.03]' 
                : 'bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-350'
            }`}
          >
            <Wind className="w-5 h-5" />
            <span className="text-xs font-sans font-medium">Cosmic Drone</span>
          </button>

          <button
            id="sleep-toggle-rain"
            onClick={() => toggleSound('rain')}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
              soundProfile.rain 
                ? 'bg-indigo-950/60 border-indigo-550 text-indigo-300 shadow-md scale-[1.03]' 
                : 'bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-350'
            }`}
          >
            <CloudRain className="w-5 h-5" />
            <span className="text-xs font-sans font-medium">Warm Rain</span>
          </button>

          <button
            id="sleep-toggle-waves"
            onClick={() => toggleSound('waves')}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all cursor-pointer ${
              soundProfile.waves 
                ? 'bg-indigo-950/60 border-indigo-550 text-indigo-300 shadow-md scale-[1.03]' 
                : 'bg-slate-950/30 border-slate-900 text-slate-500 hover:text-slate-350'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-xs font-sans font-medium">Shore Waves</span>
          </button>
        </div>

        {/* Sleep Timers */}
        <div className="border-t border-slate-900 pt-4">
          <h4 className="text-xs font-sans font-medium text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-450" /> Set Sleep Shutoff Timer
          </h4>
          <div className="flex flex-wrap gap-2">
            {[5, 15, 30, 45, 60].map((mins) => (
              <button
                id={`sleep-timer-btn-${mins}`}
                key={mins}
                onClick={() => setSleepTimerMinutes(sleepTimerMinutes === mins ? null : mins)}
                className={`py-1.5 px-3 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer ${
                  sleepTimerMinutes === mins
                    ? 'bg-indigo-550 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:bg-slate-950/70 hover:text-slate-200'
                }`}
              >
                {mins}m
              </button>
            ))}

            {sleepTimerMinutes !== null && (
              <button
                id="sleep-cancel-timer-btn"
                onClick={() => setSleepTimerMinutes(null)}
                className="py-1.5 px-3 rounded-xl text-xs font-sans text-rose-450 border border-transparent hover:bg-rose-950/15 cursor-pointer ml-auto"
              >
                Disable Timer
              </button>
            )}
          </div>
        </div>

        {/* Master Play Stop */}
        <div className="flex justify-between items-center mt-6 border-t border-slate-900 pt-4">
          <span className="text-xs text-slate-500 font-sans italic">Synthesizer Master Switch</span>
          <button
            id="sleep-audio-master-switch"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 py-2 px-5 rounded-2xl text-xs font-sans font-semibold cursor-pointer shadow transition-all ${
              isPlaying
                ? 'bg-indigo-550 hover:bg-indigo-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Mute Sounds</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Chimes</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
