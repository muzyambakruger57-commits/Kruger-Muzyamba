import React, { useState } from 'react';
import { ArrowLeft, Flower, Sparkles, Check, Info } from 'lucide-react';
import { GardenItem, SavedState } from '../types';
import { audioEngine } from '../utils/audio';

interface MeditationGardenProps {
  state: SavedState;
  onUpdateGardenItems: (items: GardenItem[]) => void;
  onClose: () => void;
  key?: any;
}

export default function MeditationGarden({ state, onUpdateGardenItems, onClose }: MeditationGardenProps) {
  const { gardenItems } = state;
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  // 6 specific placeable hot-spot vectors representing coordinates (left, top) inside the Garden scene card
  const GARDEN_SLOTS = [
    { label: 'Far Left Shrub', x: 12, y: 55 },
    { label: 'Left Foreground', x: 25, y: 72 },
    { label: 'Center Fountain Spot', x: 50, y: 65 },
    { label: 'Right Path Stone', x: 75, y: 72 },
    { label: 'Far Right Stand', x: 88, y: 55 },
    { label: 'Upper Zen Focus', x: 50, y: 34 }
  ];

  // Helper mapping placed item IDs to designated slots
  const getPlacedItemAtSlot = (slotIdx: number): GardenItem | null => {
    return gardenItems.find((item) => item.isUnlocked && item.position && item.position.x === GARDEN_SLOTS[slotIdx].x && item.position.y === GARDEN_SLOTS[slotIdx].y) || null;
  };

  const handleSlotClicked = (slotIdx: number) => {
    audioEngine.init();
    audioEngine.playStoneClick();
    setSelectedSlotIndex(selectedSlotIndex === slotIdx ? null : slotIdx);
  };

  const placeItemAtSelectedSlot = (itemId: string) => {
    if (selectedSlotIndex === null) return;
    audioEngine.init();
    audioEngine.playWaterDrip();

    const targetSlot = GARDEN_SLOTS[selectedSlotIndex];

    const updatedItems = gardenItems.map((item) => {
      // If placing this item, assign it to the clicked slot's coordinates
      if (item.id === itemId) {
        return {
          ...item,
          position: { x: targetSlot.x, y: targetSlot.y }
        };
      }
      // If another item was previously occupying this slot, clear its position back to inventory
      if (item.position && item.position.x === targetSlot.x && item.position.y === targetSlot.y) {
        return {
          ...item,
          position: undefined
        };
      }
      return item;
    });

    onUpdateGardenItems(updatedItems);
    setSelectedSlotIndex(null); // close selection popup
  };

  const removeItemFromSlot = (slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent re-clicking slot
    audioEngine.init();
    audioEngine.playStoneClick();

    const targetSlot = GARDEN_SLOTS[slotIdx];
    const updatedItems = gardenItems.map((item) => {
      if (item.position && item.position.x === targetSlot.x && item.position.y === targetSlot.y) {
        return {
          ...item,
          position: undefined
        };
      }
      return item;
    });

    onUpdateGardenItems(updatedItems);
  };

  // Click on a placed item inside the garden to trigger its specialized sound & visual effect!
  const triggerItemInteraction = (item: GardenItem, e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.init();

    // Trigger specialized action chime sounds
    if (item.id === 'stone-lantern') {
      audioEngine.playMeditationBell(); // Low striking resonant bell sound
    } else if (item.id === 'koi-pond') {
      audioEngine.playWaterDrip(); // Quick splashy drip sound
    } else if (item.id === 'wind-chimes') {
      audioEngine.playStarConnect(1100 + Math.random() * 400); // Ring high metallic chiming sound
    } else if (item.id === 'bonsai') {
      audioEngine.playSandRake(); // Shrub grooming sound
    } else {
      audioEngine.playWaterDrip();
    }
  };

  const allUnlockedInventory = gardenItems.filter((i) => i.isUnlocked);
  const currentlySelectedSlotItem = selectedSlotIndex !== null ? getPlacedItemAtSlot(selectedSlotIndex) : null;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-emerald-950 z-40 flex flex-col justify-between overflow-y-auto p-4 md:p-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto pt-2">
        <button 
          id="btn-garden-back"
          onClick={onClose}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Exit Haven Garden</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
          <Flower className="w-4 h-4" />
          <span>Your Sanctuary Garden</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto my-4 space-y-6">
        
        {/* Main interactive Zen Garden landscape card */}
        <div 
          id="zen-garden-canvas-frame"
          className="relative w-full aspect-[16/10] bg-gradient-to-b from-sky-100 to-emerald-100/40 dark:from-indigo-950/40 dark:to-emerald-950/30 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-950/40 overflow-hidden shadow-xl"
        >
          {/* Sky background layer / sun/moon element */}
          <div className="absolute top-10 left-12 w-10 h-10 rounded-full bg-amber-400/20 shadow-inner dark:bg-amber-100/10 blur-[1px]" />
          
          {/* Curving green sand hills */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-emerald-100/80 to-emerald-50/20 dark:from-emerald-950/50 dark:to-emerald-950/10 rounded-t-[5rem]" />

          {/* Sand raked grooves running across landscape core */}
          <svg className="absolute bottom-6 left-0 right-0 w-full h-[3rem] opacity-20 text-slate-400 dark:text-slate-500" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 C20,2 40,18 60,10 C80,2 100,10 120,10 C140,18 160,2 180,10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
            <path d="M0,15 C20,7 40,23 60,15 C80,7 100,15 120,15" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>

          {/* Placing slots markers */}
          {GARDEN_SLOTS.map((slot, idx) => {
            const placedItem = getPlacedItemAtSlot(idx);

            return (
              <div
                id={`garden-place-slot-${idx}`}
                key={idx}
                onClick={() => handleSlotClicked(idx)}
                className="absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                {placedItem ? (
                  /* Placed Decor Asset Representation */
                  <div 
                    id={`active-item-${placedItem.id}`}
                    onClick={(e) => triggerItemInteraction(placedItem, e)}
                    className="relative flex flex-col items-center justify-center animate-fade-in group"
                  >
                    {/* Pulsing selection focus ring on hover */}
                    <div className="absolute w-16 h-16 rounded-full bg-emerald-400/10 dark:bg-emerald-400/5 group-hover:scale-125 transition-transform opacity-0 group-hover:opacity-100 blur-[3px]" />
                    
                    {/* Simulated High fidelity Vector Item Graphics with basic Emojis inside glowing pastel cases */}
                    <div className="w-14 h-14 rounded-full bg-white/80 dark:bg-slate-900/80 shadow border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-center text-3xl select-none group-hover:scale-110 active:scale-95 transition-all">
                      {placedItem.icon}
                    </div>

                    <span className="text-[10px] font-medium font-sans bg-slate-900/80 text-white rounded px-1.5 py-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-sm pointer-events-none z-20">
                      {placedItem.name} (Tap)
                    </span>

                    {/* Small transparent delete circle button on hover */}
                    <button
                      id={`remove-item-btn-${placedItem.id}`}
                      onClick={(e) => removeItemFromSlot(idx, e)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold shadow opacity-0 group-hover:opacity-100 transition-all scale-75 hover:scale-100 cursor-pointer"
                      title="Pack away item"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  /* Empty Placement spot button */
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    selectedSlotIndex === idx 
                      ? 'bg-emerald-500 text-white scale-110 shadow-lg rings-2 ring-emerald-300' 
                      : 'bg-white/40 hover:bg-white/90 dark:bg-slate-900/30 dark:hover:bg-slate-900/80 text-slate-500 hover:text-emerald-500 scale-95 border border-dashed border-slate-300 dark:border-slate-800'
                  }`}>
                    <span className="text-xs font-bold">+</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Help Prompt bottom card if nothing is selected or configured */}
          {selectedSlotIndex === null && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/70 dark:bg-slate-900/75 px-4 py-1.5 rounded-full shadow text-[11px] md:text-xs font-medium font-sans flex items-center gap-2 text-slate-500 dark:text-slate-350 pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              <span>Tap + slots to design with unlocked items. Tap placed items to play their resonant sounds.</span>
            </div>
          )}
        </div>

        {/* Placing Item popover dock */}
        {selectedSlotIndex !== null && (
          <div className="w-full bg-white/95 dark:bg-slate-900/95 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-3xl shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-serif text-sm font-semibold">Select decoration for {GARDEN_SLOTS[selectedSlotIndex].label}</h4>
                <p className="text-xs text-slate-400">Choose from unlocked assets in your Zen vault.</p>
              </div>
              <button
                id="cancel-placements-dock-btn"
                onClick={() => setSelectedSlotIndex(null)}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* List of items that can be placed */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-1">
              {allUnlockedInventory.map((item) => {
                const isCurrentlyAtThisSlot = currentlySelectedSlotItem?.id === item.id;
                
                // Check if this item is currently occupied at any slot
                const isPlacedElsewhere = item.position && !isCurrentlyAtThisSlot;

                return (
                  <button
                    id={`select-place-item-card-${item.id}`}
                    key={item.id}
                    onClick={() => placeItemAtSelectedSlot(item.id)}
                    className={`flex items-center gap-3 p-2 rounded-2xl border text-left cursor-pointer transition-all ${
                      isCurrentlyAtThisSlot 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 outline-none' 
                        : isPlacedElsewhere
                        ? 'bg-slate-100/40 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/40 opacity-60 hover:opacity-100'
                        : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-2xl w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-sans font-bold text-slate-700 dark:text-slate-350 truncate">{item.name}</div>
                      <div className="text-[9px] font-sans text-slate-400 truncate">
                        {isCurrentlyAtThisSlot ? 'Selected' : isPlacedElsewhere ? 'Placed else' : 'Available'}
                      </div>
                    </div>
                  </button>
                );
              })}

              {allUnlockedInventory.length === 0 && (
                <div className="col-span-full py-8 text-center text-sm font-sans text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Info className="w-5 h-5 text-slate-400" />
                  <span>No items unlocked yet. Progress through static levels to earn ancient treasures!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Locked objects teaser list */}
        <div className="w-full">
          <h4 className="text-xs font-sans font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" /> Your Haven Sanctuary Treasure Vault
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {gardenItems.map((item) => (
              <div
                id={`teaser-vault-item-${item.id}`}
                key={item.id}
                className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  item.isUnlocked
                    ? 'bg-white dark:bg-slate-900/60 border-emerald-100 dark:border-emerald-950 text-slate-800 dark:text-slate-200'
                    : 'bg-slate-100/30 dark:bg-slate-950/20 border-dashed border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-600'
                }`}
              >
                <div className={`text-2xl mb-1 filter ${item.isUnlocked ? '' : 'grayscale contrast-[0.1]'}`}>
                  {item.icon}
                </div>
                <div className="text-[10px] font-sans font-bold truncate w-full">{item.name}</div>
                <div className="text-[8px] font-sans text-slate-400 truncate w-full">
                  {item.isUnlocked ? 'Unlocked' : `Need: ${item.unlockedAtWorld}`}
                </div>

                {!item.isUnlocked && (
                  <div className="absolute inset-0 bg-slate-950/5 dark:bg-slate-950/10 rounded-2xl flex items-center justify-center opacity-85">
                    <span className="text-[10px] font-sans py-0.5 px-1.5 bg-slate-800 text-slate-200 rounded-md font-bold">🔒</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer advice */}
      <div className="w-full text-center max-w-xl mx-auto pb-2">
        <p className="text-[11px] text-slate-400 dark:text-slate-600 font-serif italic">
          "A garden is not just a place of flowers, but a quiet space to cultivate alignment, step by step."
        </p>
      </div>

    </div>
  );
}
