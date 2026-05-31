import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Eye, CheckCircle, Quote, Sparkles, Volume2, Award, ChevronRight } from 'lucide-react';
import { GameMode, SavedState, World } from '../types';
import { audioEngine } from '../utils/audio';
import { getRandomQuote } from '../utils/quotes';

interface GameCanvasProps {
  levelNumber: number;
  world: World;
  state: SavedState;
  onClose: () => void;
  onLevelComplete: (levelNum: number) => void;
  key?: any;
}

export default function GameCanvas({ levelNumber, world, state, onClose, onLevelComplete }: GameCanvasProps) {
  const { settings } = state;
  const [levelType, setLevelType] = useState<GameMode>('stone-stacking');
  const [isDone, setIsDone] = useState<boolean>(false);
  const [currentQuote, setCurrentQuote] = useState(() => getRandomQuote());
  const [resetKey, setResetKey] = useState<number>(0);

  // Determine the level type procedurally based on Level Number
  useEffect(() => {
    const modes: GameMode[] = [
      'stone-stacking',
      'water-ripples',
      'sand-garden',
      'constellation',
      'nature-restoration',
      'color-harmony'
    ];
    // Procedural assignments
    const modeIdx = (levelNumber - 1) % modes.length;
    setLevelType(modes[modeIdx]);
    setIsDone(false);
  }, [levelNumber, resetKey]);

  const handleSubGameComplete = () => {
    if (isDone) return;
    setIsDone(true);
    audioEngine.init();
    audioEngine.playMeditationBell(); // Low striking resonant key chimes on win
    // Trigger vibrating haptic pulse safely
    if (settings.vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleNextLevel = () => {
    onLevelComplete(levelNumber);
  };

  const triggerReset = () => {
    audioEngine.init();
    audioEngine.playStoneClick();
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-40 flex flex-col justify-between overflow-y-auto font-sans text-slate-800 dark:text-slate-100">
      
      {/* HUD Header */}
      <div className="sticky top-0 bg-slate-50/85 dark:bg-slate-950/85 backdrop-blur z-20 flex justify-between items-center px-4 md:px-6 py-3 border-b border-slate-100 dark:border-slate-900">
        <button
          id="btn-level-back-nav"
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Map</span>
        </button>

        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
            {world.name} • Level {levelNumber}
          </span>
          <h2 className="text-sm font-serif font-semibold text-slate-700 dark:text-slate-350 tracking-wide capitalize">
            {levelType.replace('-', ' ')}
          </h2>
        </div>

        <button
          id="btn-level-restart"
          onClick={triggerReset}
          className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-emerald-500 rounded-full cursor-pointer transition-colors"
          title="Restart static challenge"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Game Stage Wrapper */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {!isDone ? (
            /* Render active mini game stage based on current procedural selection */
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-900 rounded-[2rem] shadow-xl overflow-hidden p-4 md:p-6 min-h-[460px] flex flex-col justify-between">
              
              <div className="text-center mb-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  {levelType === 'stone-stacking' && 'Stack stones carefully from bottom queue, balance center-of-mass correctly.'}
                  {levelType === 'water-ripples' && 'Tap anywhere to spawn water ripples. Light up all target nodes.'}
                  {levelType === 'sand-garden' && 'Rake or drag pathways around rocks to clear sand. Achieve 90% coverage.'}
                  {levelType === 'constellation' && 'Drag pathways connecting celestial stars in sequential chains to form star shapes.'}
                  {levelType === 'nature-restoration' && 'Swipe or hover parched land plots to hydrate moss, flora & grow trees.'}
                  {levelType === 'color-harmony' && 'Tap adjacent cards to sort the color grids into a seamless rainbow spectrum.'}
                </p>
              </div>

              {/* Specific Sub Game Layout Viewports */}
              <div className="flex-1 flex items-center justify-center h-full relative">
                {levelType === 'stone-stacking' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <StoneStackingGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
                {levelType === 'water-ripples' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <WaterRipplesGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
                {levelType === 'sand-garden' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <SandGardenGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
                {levelType === 'constellation' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <ConstellationGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
                {levelType === 'nature-restoration' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <NatureRestorationGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
                {levelType === 'color-harmony' && (
                  <div key={resetKey} className="w-full flex justify-center">
                    <ColorHarmonyGame settings={settings} levelNumber={levelNumber} onComplete={handleSubGameComplete} />
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Level completion screen showing motivational artwork + quotes */
            <div className="bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-emerald-950/60 p-8 rounded-[2.5rem] shadow-2xl text-center flex flex-col items-center justify-center space-y-6 animate-fade-in max-w-md mx-auto">
              
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 dark:bg-emerald-505 flex items-center justify-center text-emerald-500 animate-pulse">
                <Award className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-serif text-2xl font-bold tracking-wide text-slate-800 dark:text-slate-100">Harmonized</h3>
                <p className="text-xs font-mono text-emerald-500 mt-1 uppercase tracking-widest font-semibold">Level {levelNumber} Complete</p>
              </div>

              {/* Mindful Quote Display */}
              <div className="max-w-xs py-4 px-3 border-y border-slate-100 dark:border-slate-800 font-serif italic text-slate-600 dark:text-slate-350 text-sm leading-relaxed relative">
                <span className="text-3xl text-emerald-300 absolute -top-1 left-2 pointer-events-none select-none">“</span>
                <p className="px-5">{currentQuote.text}</p>
                <div className="text-[10px] uppercase font-sans tracking-widest font-bold text-slate-400 mt-2 text-right">
                  — {currentQuote.author}
                </div>
              </div>

              {/* Decorative Items Unlocked Teaser Alert */}
              {levelNumber % 15 === 0 && (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-950 dark:to-orange-950/20 border border-amber-100 dark:border-amber-950/40 rounded-2xl w-full text-left">
                  <span className="text-3xl">🏺</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-500 tracking-wider block uppercase">Treasury Unlocked</span>
                    <span className="text-xs font-sans font-semibold text-slate-700 dark:text-slate-300">You earned a new item for your Zen Sanctuary Garden!</span>
                  </div>
                </div>
              )}

              <button
                id="btn-next-level-trigger"
                onClick={handleNextLevel}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-sans text-sm font-semibold rounded-2xl shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Settle & Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Safety warning spacer info */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-slate-400 dark:text-slate-600 italic">
          "Listen to structural coordinates. Rest your mind inside the task."
        </p>
      </div>

    </div>
  );
}




// ==========================================
// 1. ZEN STONE STACKING MINI GAME IMPLEMENTATION
// ==========================================
function StoneStackingGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Total target stones depends on level (min 3, max 6)
  const totalTargetStones = Math.min(3 + (levelNumber % 4), 6);
  
  const [stonesInQueue, setStonesInQueue] = useState<any[]>([]);
  const [stackedStones, setStackedStones] = useState<any[]>([]);
  const [currentSelectedStoneIdx, setCurrentSelectedStoneIdx] = useState<number | null>(null);
  const [tiltAngle, setTiltAngle] = useState<number>(0);
  const [isWobbly, setIsWobbly] = useState<boolean>(false);

  // Generate original colorful smooth stones
  useEffect(() => {
    const stoneColors = [
      '#E2E8F0', // Light slate
      '#FEE2E2', // Soft pastel red
      '#FEF3C7', // Pastel amber
      '#D1FAE5', // Soft Mint green
      '#DBEAFE', // Soft azure blue
      '#E0F2FE', // Ice blue
      '#F5E6D3', // Sand beige
      '#ECE0F8'  // Soft lavender
    ];

    const initialStones = [];
    for (let i = 0; i < totalTargetStones; i++) {
      // Deterministic widths based on index & levelNumber seeds
      const width = 110 - i * 15 - (levelNumber % 5) * 2;
      const height = 30 + Math.sin(i + levelNumber) * 6;
      const color = stoneColors[(i + levelNumber) % stoneColors.length];
      
      initialStones.push({
        id: i,
        width,
        height,
        color,
        // center coordinate tracking
        x: 150, 
        y: 350,
        tilt: 0
      });
    }
    setStonesInQueue(initialStones);
  }, [levelNumber]);

  // Handle Drag / Click of Stone
  const selectQueueStone = (idx: number) => {
    audioEngine.playStoneClick();
    setCurrentSelectedStoneIdx(idx);
  };

  const attemptPlaceSelectedStoneOnStack = () => {
    if (currentSelectedStoneIdx === null) return;
    audioEngine.playStoneClick();

    const placedStone = stonesInQueue[currentSelectedStoneIdx];

    // Align coordinates directly onto stack
    const newStack = [...stackedStones, {
      ...placedStone,
      // Random placement variation offset simulator (-15 to +15 pixels)
      offsetX: -12 + Math.random() * 24
    }];

    // Recalculate Tilt Balance Center of Mass
    // Offset balance = sum(offsetX * width) / sum(width)
    let cumulativeOffset = 0;
    let totalMass = 0;
    newStack.forEach((st, idx) => {
      cumulativeOffset += st.offsetX * (st.width / 50);
      totalMass += st.width / 50;
    });

    const averageOffset = totalMass > 0 ? (cumulativeOffset / totalMass) : 0;
    const computedTilt = averageOffset * 0.015; // scalar multiplier for angle radians

    // Update level states
    setStackedStones(newStack);
    setStonesInQueue(stonesInQueue.filter((_, idx) => idx !== currentSelectedStoneIdx));
    setCurrentSelectedStoneIdx(null);
    setTiltAngle(computedTilt);

    if (Math.abs(computedTilt) > 0.18) {
      // Wobbled too far! Collapse and restart automatically with soft pop
      setIsWobbly(true);
      setTimeout(() => {
        setIsWobbly(false);
        setStonesInQueue([...initialQueueStonesBackup()]);
        setStackedStones([]);
        setTiltAngle(0);
      }, 1000);
    } else {
      // Success check
      if (newStack.length === totalTargetStones) {
        setTimeout(onComplete, 800);
      }
    }
  };

  // Safe restoration queue backup
  const initialQueueStonesBackup = () => {
    const stoneColors = ['#E2E8F0', '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#E0F2FE', '#F5E6D3', '#ECE0F8'];
    const b = [];
    for (let i = 0; i < totalTargetStones; i++) {
      const width = 110 - i * 15 - (levelNumber % 5) * 2;
      const height = 30 + Math.sin(i + levelNumber) * 6;
      const color = stoneColors[(i + levelNumber) % stoneColors.length];
      b.push({ id: i, width, height, color, x: 150, y: 350, tilt: 0 });
    }
    return b;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-[380px]">
      
      {/* Wooden Stack Display */}
      <div 
        id="stacking-pedestal-scene"
        className={`relative w-full h-64 bg-emerald-50/10 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end items-center pb-4 ${
          isWobbly ? 'animate-bounce' : ''
        }`}
      >
        <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-400">
          Tilt: {(tiltAngle * 57.3).toFixed(1)}° / Limit 11.0°
        </div>

        {/* Stack Rendering */}
        <div 
          className="relative flex flex-col-reverse items-center"
          style={{
            transform: `rotate(${tiltAngle}rad)`,
            transformOrigin: 'bottom center',
            transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
          }}
        >
          {/* Base Stack Blocks */}
          {stackedStones.map((stone, idx) => {
            return (
              <div
                id={`stacked-stone-${idx}`}
                key={idx}
                className="relative rounded-full shadow-sm flex items-center justify-center font-sans text-[9px] font-bold text-slate-500 select-none cursor-pointer hover:brightness-95 transition-all duration-350"
                style={{
                  width: `${stone.width}px`,
                  height: `${stone.height}px`,
                  backgroundColor: stone.color,
                  transform: `translateX(${stone.offsetX}px)`,
                  // Curve/Pebble styling
                  borderRadius: '50% 50% 46% 46% / 60% 60% 40% 40%'
                }}
              >
                {/* Colorblind visual symbols overlay */}
                {settings.colorblindFriendly && (
                  <span className="opacity-40 font-mono">
                    {idx === 0 && '○'}
                    {idx === 1 && '▱'}
                    {idx === 2 && '△'}
                    {idx === 3 && '◈'}
                    {idx === 4 && '☾'}
                    {idx === 5 && '❦'}
                  </span>
                )}
              </div>
            );
          })}

          {/* Pedestal platform */}
          <div id="pedestal-flat" className="w-[180px] h-3 bg-amber-800 rounded-lg shadow-md z-10 border-b-2 border-amber-950" />
        </div>
      </div>

      {/* Stone Queues Selection and Placement mechanics */}
      <div className="w-full">
        {currentSelectedStoneIdx === null ? (
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center mb-2">Select block to Balance</span>
            <div className="flex gap-2 justify-center items-end py-2">
              {stonesInQueue.map((stone, idx) => (
                <button
                  id={`queue-stone-btn-${idx}`}
                  key={idx}
                  onClick={() => selectQueueStone(idx)}
                  className="rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 shadow border cursor-pointer border-slate-200 flex items-center justify-center text-[10px] text-slate-500 font-bold transition-transform hover:scale-105"
                  style={{
                    width: `${stone.width * 0.7}px`,
                    height: `${stone.height * 0.9}px`,
                    backgroundColor: stone.color,
                    borderRadius: '50% 50% 46% 46% / 60% 60% 40% 40%'
                  }}
                >
                  {settings.largeTouchTargets ? 'Tap' : '•'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-500 tracking-wider animate-pulse">Placing Stably on Stack...</span>
            <div className="flex gap-3 justify-center">
              <button
                id="btn-stack-stone-confirm"
                onClick={attemptPlaceSelectedStoneOnStack}
                className="py-2 px-6 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs text-white rounded-xl shadow cursor-pointer transition-all"
              >
                Place onto Stack Pedestal
              </button>

              <button
                id="btn-stack-stone-cancel"
                onClick={() => {
                  audioEngine.playStoneClick();
                  setCurrentSelectedStoneIdx(null);
                }}
                className="py-2 px-4 bg-slate-200 text-slate-600 hover:bg-slate-350 text-xs rounded-xl cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


// ==========================================
// 2. WATER RIPPLE PUZZLES MINI GAME IMPLEMENTATION
// ==========================================
function WaterRipplesGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [nodes, setNodes] = useState<any[]>([]);
  const [ripples, setRipples] = useState<any[]>([]);

  // Generate target nodes procedurally
  useEffect(() => {
    const totalNodes = Math.min(3 + (levelNumber % 3), 6);
    const initialNodes = [];
    // Deterministic positions based on mathematical polar circles
    for (let i = 0; i < totalNodes; i++) {
      const angle = (i * 2 * Math.PI) / totalNodes + (levelNumber * 0.3);
      const radius = 70 + (i % 2) * 15;
      const cx = 150 + Math.cos(angle) * radius;
      const cy = 130 + Math.sin(angle) * radius;

      initialNodes.push({
        id: i,
        x: cx,
        y: cy,
        isActive: false
      });
    }
    setNodes(initialNodes);
  }, [levelNumber]);

  // Main Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const frameLoop = () => {
      if (!isSubscribed) return;

      // Clear dark blue water theme
      ctx.fillStyle = '#0F172A'; // deep dark blue slate slate
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw active ripple rings
      setRipples((prevRipples) => {
        const updated = prevRipples
          .map((r) => ({
            ...r,
            currentRadius: r.currentRadius + 2.5,
            opacity: r.opacity - 0.012
          }))
          .filter((r) => r.opacity > 0);

        updated.forEach((r) => {
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.currentRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(52, 211, 153, ${r.opacity})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Intersect with and activate inactive nodes
          setNodes((prevNodes) => {
            let changesMade = false;
            const updatedNodes = prevNodes.map((node) => {
              if (node.isActive) return node;

              // Calculate geometric distance from wave center
              const dx = node.x - r.x;
              const dy = node.y - r.y;
              const distance = Math.hypot(dx, dy);

              // If wave circumference hits the node point within bounds, activate!
              if (Math.abs(distance - r.currentRadius) < 5) {
                changesMade = true;
                // Play melodic synth resonance sequence
                audioEngine.playStarConnect(300 + node.id * 150);
                return { ...node, isActive: true };
              }
              return node;
            });

            // Trigger success checks asynchronously if all active
            if (changesMade && updatedNodes.every((n) => n.isActive)) {
              setTimeout(onComplete, 900);
            }

            return updatedNodes;
          });
        });

        return updated;
      });

      // Draw connecting rings water grid lines
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.04)';
      ctx.beginPath();
      ctx.arc(150, 130, 80, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw individual target nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI);
        
        if (node.isActive) {
          ctx.fillStyle = 'rgba(52, 211, 153, 0.9)'; // bright turquoise
          ctx.shadowColor = '#34D399';
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = 'rgba(71, 85, 105, 0.6)'; // dark slate
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Circle outline
        ctx.strokeStyle = node.isActive ? '#10B981' : '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Accessible numeric index if colorblind mode is on
        if (settings.colorblindFriendly) {
          ctx.fillStyle = node.isActive ? '#064E3B' : '#E2E8F0';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((node.id + 1).toString(), node.x, node.y);
        }
      });

      requestAnimationFrame(frameLoop);
    };

    const animFrameId = requestAnimationFrame(frameLoop);

    return () => {
      isSubscribed = false;
      cancelAnimationFrame(animFrameId);
    };
  }, [nodes, settings]);

  const handleWaterTap = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    audioEngine.playWaterDrip();

    // Spawn a new concentric ripple expanding outwards
    setRipples((prev) => [
      ...prev,
      { x, y, currentRadius: 0, opacity: 0.9 }
    ]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <canvas
        id="ripple-water-canvas"
        ref={canvasRef}
        width={300}
        height={260}
        onClick={handleWaterTap}
        className="w-full max-w-[300px] aspect-[30/26] rounded-3xl bg-slate-950 border border-slate-900 shadow-md cursor-pointer mb-2"
      />
      <div className="text-[10px] font-medium text-slate-400 mt-1">
        Activated nodes: {nodes.filter((n) => n.isActive).length} / {nodes.length}
      </div>
    </div>
  );
}


// ==========================================
// 3. SAND GARDEN RE-DESIGN MINI GAME IMPLEMENTATION
// ==========================================
function SandGardenGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [rakedPercentage, setRakedPercentage] = useState<number>(0);
  const [mossPatches, setMossPatches] = useState<any[]>([]);

  // Setup moss patches / target stone coordinators
  useEffect(() => {
    const totalRocks = Math.min(2 + (levelNumber % 3), 4);
    const initialRocks = [];
    for (let i = 0; i < totalRocks; i++) {
      initialRocks.push({
        id: i,
        x: 60 + (i % 2) * 160 + Math.sin(i) * 20,
        y: 60 + Math.floor(i / 2) * 120 + Math.cos(i) * 20,
        size: 15 + (i * 6) % 15
      });
    }
    setMossPatches(initialRocks);

    // Initialise sand canvas drawing
    initSandCanvas();
  }, [levelNumber]);

  const initSandCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill beautiful soft sand light beige background
    ctx.fillStyle = '#E8D4BE'; // pure Japanese fine sand
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw little fine speckles on sand
    ctx.fillStyle = 'rgba(139, 115, 85, 0.08)';
    for (let i = 0; i < 900; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    rakeSand(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    rakeSand(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const rakeSand = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Play procedural sand scratching sound
    if (Math.random() > 0.82) {
      audioEngine.playSandRake();
    }

    // Draw rake lines centered around position coordinate
    ctx.beginPath();
    // Inner grooves (concentric arcs mimicking bamboo rake teeth)
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.strokeStyle = '#D5BFA4'; // dark raked groove shade indentation
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Track completed sandbox percentage
    setRakedPercentage((prev) => {
      const next = Math.min(prev + 0.35, 100);
      if (next >= 99) {
        setTimeout(onComplete, 900);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative rounded-3xl overflow-hidden border border-amber-200/50 shadow shadow-amber-900/10 mb-2">
        <canvas
          id="sand-garden-canvas"
          ref={canvasRef}
          width={300}
          height={240}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full max-w-[300px] aspect-[5/4] bg-[#E8D4BE] cursor-crosshair"
        />

        {/* Floating smooth stones placeable overlay */}
        {mossPatches.map((rock) => (
          <div
            id={`sand-stone-${rock.id}`}
            key={rock.id}
            className="absolute rounded-full bg-slate-500 shadow-md border border-slate-600 flex items-center justify-center select-none"
            style={{
              left: `${rock.x - rock.size}px`,
              top: `${rock.y - rock.size}px`,
              width: `${rock.size * 2}px`,
              height: `${rock.size * 2}px`,
              // Rock shape irregularity
              borderRadius: '55% 45% 50% 50% / 50% 60% 40% 50%'
            }}
          >
            <span className="text-[10px] select-none pointer-events-none">⛰️</span>
          </div>
        ))}
      </div>

      {/* Stats and guide text */}
      <div className="w-full max-w-[280px] flex justify-between items-center text-[10px] font-mono text-slate-400">
        <span>Raked Area: {Math.round(rakedPercentage)}%</span>
        <span>Goal: 100%</span>
      </div>
    </div>
  );
}


// ==========================================
// 4. CONSTELLATION DRAWING MINI GAME IMPLEMENTATION
// ==========================================
function ConstellationGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [stars, setStars] = useState<any[]>([]);
  const [connectionChain, setConnectionChain] = useState<number[]>([]);
  const [activeDragLine, setActiveDragLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);

  // Load a coordinate map representing a comforting shape (Star, Heart, Swan, Lotus, Mountain peak, Fish)
  useEffect(() => {
    const shapePresets = [
      // 0: Lotus (5 Stars)
      [{ id: 0, x: 150, y: 70 }, { id: 1, x: 90, y: 150 }, { id: 2, x: 150, y: 190 }, { id: 3, x: 210, y: 150 }, { id: 4, x: 150, y: 140 }],
      // 1: Swan (6 Stars)
      [{ id: 0, x: 60, y: 190 }, { id: 1, x: 110, y: 150 }, { id: 2, x: 160, y: 160 }, { id: 3, x: 210, y: 90 }, { id: 4, x: 250, y: 70 }, { id: 5, x: 150, y: 100 }],
      // 2: Ursa Major (6 Stars)
      [{ id: 0, x: 50, y: 80 }, { id: 1, x: 100, y: 90 }, { id: 2, x: 140, y: 120 }, { id: 3, x: 170, y: 170 }, { id: 4, x: 260, y: 180 }, { id: 5, x: 220, y: 220 }],
      // 3: Healing Heart (5 Stars)
      [{ id: 0, x: 150, y: 210 }, { id: 1, x: 80, y: 130 }, { id: 2, x: 115, y: 80 }, { id: 3, x: 150, y: 120 }, { id: 4, x: 185, y: 80 }, { id: 5, x: 220, y: 130 }]
    ];

    const chosenPreset = shapePresets[levelNumber % shapePresets.length];
    setStars(chosenPreset);
    setConnectionChain([]);
  }, [levelNumber]);

  // Handle connection drag line tracing
  const triggerStarSelection = (starId: number) => {
    audioEngine.playStarConnect(440 + starId * 50);

    setConnectionChain((prev) => {
      if (prev.includes(starId)) return prev; // already connected in structure
      
      const updated = [...prev, starId];
      if (updated.length === stars.length) {
        setTimeout(onComplete, 900);
      }
      return updated;
    });
  };

  const handleStarTouchStart = (starId: number) => {
    triggerStarSelection(starId);
  };

  // Canvas drawing chain render lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill night sky
    ctx.fillStyle = '#020617'; // pure void dark sky slate-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw little cosmic twilight ambient stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 25; i++) {
      const seedSx = Math.sin(i * 123) * 150 + 150;
      const seedSy = Math.cos(i * 456) * 120 + 120;
      ctx.fillRect(seedSx, seedSy, 1, 1);
    }

    // Draw complete connection wires
    if (connectionChain.length > 1) {
      ctx.beginPath();
      // Move to initial connected star
      const star1 = stars.find((s) => s.id === connectionChain[0]);
      if (star1) ctx.moveTo(star1.x, star1.y);

      for (let i = 1; i < connectionChain.length; i++) {
        const star = stars.find((s) => s.id === connectionChain[i]);
        if (star) {
          ctx.lineTo(star.x, star.y);
        }
      }
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)'; // glowing star blue sky-400
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    }

    // Draw individual coordinates stars
    stars.forEach((star) => {
      const isConnected = connectionChain.includes(star.id);

      ctx.beginPath();
      ctx.arc(star.x, star.y, isConnected ? 7 : 5, 0, 2 * Math.PI);
      
      ctx.fillStyle = isConnected ? '#38BDF8' : '#64748B'; // lit constellation or gray
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = isConnected ? 10 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Outer rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(star.x, star.y, 14, 0, 2 * Math.PI);
      ctx.stroke();

      // Accessible target tags if colorblind sequence is requested
      if (settings.colorblindFriendly) {
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '7px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((star.id + 1).toString(), star.x, star.y + 24);
      }
    });

  }, [stars, connectionChain, settings]);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative">
        <canvas
          id="constellation-star-canvas"
          ref={canvasRef}
          width={300}
          height={240}
          className="w-full max-w-[300px] aspect-[5/4] rounded-3xl bg-slate-950 border border-slate-900 shadow-md"
        />

        {/* Hot clicks layering anchors directly above stars for touch target optimization */}
        {stars.map((star) => (
          <button
            id={`constellation-star-btn-${star.id}`}
            key={star.id}
            onClick={() => handleStarTouchStart(star.id)}
            className="absolute rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
              width: settings.largeTouchTargets ? '46px' : '36px',
              height: settings.largeTouchTargets ? '46px' : '36px',
              backgroundColor: 'transparent'
            }}
          />
        ))}
      </div>

      <div className="text-[10px] text-slate-400 mt-2 font-mono">
        Progress: {connectionChain.length} / {stars.length} connected
      </div>
    </div>
  );
}


// ==========================================
// 5. NATURE RESTORATION MINI GAME IMPLEMENTATION
// ==========================================
function NatureRestorationGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const [gridCells, setGridCells] = useState<any[]>([]);

  // Construct a parched matrix grid
  useEffect(() => {
    const totalCells = 9; // 3x3 layout
    const initialCells = [];
    const cellTypes: ('grass' | 'flower' | 'bamboo')[] = ['grass', 'flower', 'bamboo'];

    for (let i = 0; i < totalCells; i++) {
      initialCells.push({
        id: i,
        // Deterministic hydration progress
        progress: 0.1,
        type: cellTypes[(i + levelNumber) % cellTypes.length],
        flowerColor: i % 2 === 0 ? 'text-rose-400' : 'text-amber-400'
      });
    }
    setGridCells(initialCells);
  }, [levelNumber]);

  const hydrateCell = (idx: number) => {
    if (gridCells[idx].progress >= 1) return;
    
    // Play light water splash sound effects
    if (Math.random() > 0.6) {
      audioEngine.playWaterDrip();
    }

    setGridCells((prev) => {
      const updated = prev.map((cell, i) => {
        if (i === idx) {
          const nextProg = Math.min(cell.progress + 0.34, 1.0);
          return { ...cell, progress: nextProg };
        }
        return cell;
      });

      // Win Condition check
      if (updated.every((c) => c.progress >= 0.99)) {
        setTimeout(onComplete, 900);
      }

      return updated;
    });
  };

  const entireEcosystemHydrated = gridCells.reduce((acc, cell) => acc + cell.progress, 0) / gridCells.length;

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3 block">Swipe or click land to Water</span>
      
      {/* 3x3 Grassland Grid */}
      <div className="grid grid-cols-3 gap-3 bg-emerald-950/20 p-4 rounded-3xl border border-emerald-900/15 mb-3 w-[240px] h-[240px]">
        {gridCells.map((cell, idx) => {
          const isBlooming = cell.progress >= 0.95;

          return (
            <div
              id={`restoration-patch-${idx}`}
              key={idx}
              onMouseEnter={() => hydrateCell(idx)}
              onClick={() => hydrateCell(idx)}
              className="relative rounded-2xl cursor-pointer flex flex-col items-center justify-center border transition-all text-xs select-none"
              style={{
                // Interpolate from sand-dry (#D1BFA7) to vibrant spring-green (#10B981)
                backgroundColor: cell.progress >= 0.95 
                  ? '#D1FAE5' 
                  : cell.progress >= 0.5 
                  ? '#A7F3D0' 
                  : '#F5E6D3',
                borderColor: cell.progress >= 0.95 ? '#34D399' : '#E2E8F0',
                opacity: 0.8 + cell.progress * 0.2
              }}
            >
              {/* Plant icons sprout up upon hydration */}
              {isBlooming ? (
                <div className="scale-110 duration-500 animate-fade-in flex flex-col items-center">
                  {cell.type === 'grass' && <span className="text-xl">🌿</span>}
                  {cell.type === 'flower' && <span className="text-xl">🌸</span>}
                  {cell.type === 'bamboo' && <span className="text-xl">🎋</span>}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {Math.round(cell.progress * 100)}%
                </div>
              )}

              {/* Moisture gauge progress line */}
              <div className="absolute bottom-1.5 left-2 right-2 h-1 bg-slate-200/50 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300" 
                  style={{ width: `${cell.progress * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-[220px] flex justify-between text-[10px] text-slate-400 font-mono">
        <span>Ecosystem Hydration:</span>
        <span>{Math.round(entireEcosystemHydrated * 100)}%</span>
      </div>
    </div>
  );
}


// ==========================================
// 6. COLOR HARMONY CHALLENGES MINI GAME IMPLEMENTATION
// ==========================================
function ColorHarmonyGame({ settings, levelNumber, onComplete }: { settings: SavedState['settings']; levelNumber: number; onComplete: () => void }) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [selectedBlockIdx, setSelectedBlockIdx] = useState<number | null>(null);

  // Generate scrambled gradient matrix
  useEffect(() => {
    // 3x3 layout (9 blocks)
    // Left Anchors: Soft sky blue. Right Anchors: Pastel Rose pink.
    const baseColors = [
      '#DBEAFE', // Corner Top-Left
      '#E3E9FD', 
      '#ECE0F8', // Corner Top-Right
      '#E0F2FE', 
      '#F5E6D3', 
      '#FCD34D', 
      '#FEE2E2', // Corner Bottom-Left
      '#FEF3C7', 
      '#F9A8D4'  // Corner Bottom-Right
    ];

    const scrambled = baseColors.map((color, id) => {
      // Anchoring the corners (blocks index 0, 2, 6, 8 cannot be moved!)
      const isFixed = id === 0 || id === 2 || id === 6 || id === 8;
      return { id, color, isFixed, currentIndex: id };
    });

    // Scramble the non-fixed center indices determining initial placements
    const scrambleMap = [0, 4, 2, 1, 3, 7, 6, 5, 8]; // static mapped order
    const elements = scrambleMap.map((currIdx, idx) => {
      // Corner elements stay fixed in initial sequence positions
      if (scrambled[idx].isFixed) {
        return { ...scrambled[idx] };
      }
      return { ...scrambled[currIdx] };
    });

    setBlocks(elements);
    setSelectedBlockIdx(null);
  }, [levelNumber]);

  const selectColorCard = (idx: number) => {
    const clickedCard = blocks[idx];
    if (clickedCard.isFixed) {
      audioEngine.playStoneClick();
      return; // Cannot move corner gems
    }

    audioEngine.playStoneClick();

    if (selectedBlockIdx === null) {
      setSelectedBlockIdx(idx);
    } else {
      // Swap coordinates of selected and newly clicked block index!
      if (idx === selectedBlockIdx) {
        setSelectedBlockIdx(null);
        return;
      }

      setBlocks((prev) => {
        const next = [...prev];
        const temp = next[selectedBlockIdx];
        next[selectedBlockIdx] = next[idx];
        next[idx] = temp;

        // Perform win validation check comparing actual card keys to target index
        if (next.every((b, i) => b.id === i)) {
          setTimeout(onComplete, 900);
        }

        return next;
      });
      setSelectedBlockIdx(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-3 block">Arrange tiles into gradient harmony</span>
      
      {/* 4x4 Color blocks box */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-900 p-3 rounded-3xl border border-slate-200 dark:border-slate-800 w-[240px] h-[240px]">
        {blocks.map((block, idx) => {
          const isSelected = selectedBlockIdx === idx;

          return (
            <button
              id={`color-block-btn-${idx}`}
              key={idx}
              onClick={() => selectColorCard(idx)}
              className={`relative rounded-xl border flex items-center justify-center select-none cursor-pointer transition-all ${
                isSelected 
                  ? 'scale-110 shadow-lg ring-[3px] ring-emerald-400 z-10' 
                  : 'hover:brightness-95 active:scale-95'
              } ${settings.largeTouchTargets ? 'p-1' : ''}`}
              style={{
                backgroundColor: block.color,
                borderColor: isSelected ? '#10B981' : block.isFixed ? 'rgba(71, 85, 105, 0.4)' : '#FFFFFF00'
              }}
            >
              {/* Corner diamond anchor marker representing permanent blocks */}
              {block.isFixed && (
                <div className="absolute w-2 h-2 rounded-full bg-slate-950/30 border border-white/50" />
              )}

              {/* Custom indicator icon for accessibility/colorblind support */}
              {settings.colorblindFriendly && (
                <span className="text-white text-[10px] font-bold leading-none bg-black/15 px-1 rounded select-none">
                  {block.id + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-[200px] flex justify-center text-[10px] text-slate-400 font-mono mt-2">
        <span>Corner pegs ( ● ) are locked, swap center cards.</span>
      </div>
    </div>
  );
}
