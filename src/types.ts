export type GameMode = 'stone-stacking' | 'water-ripples' | 'sand-garden' | 'constellation' | 'nature-restoration' | 'color-harmony';

export type WorldTheme = 'Forest World' | 'Ocean World' | 'Mountain World' | 'Night Sky World' | 'Japanese Garden World' | 'Dream World' | 'Aurora World' | 'Celestial World';

export interface World {
  id: number;
  name: WorldTheme;
  description: string;
  colorTheme: {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    text: string;
  };
  levelsRange: [number, number]; // [start, end]
}

export interface GardenItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAtWorld?: WorldTheme;
  unlockedAtLevel?: number;
  isUnlocked: boolean;
  position?: { x: number; y: number }; // Percentage inside garden canvas
}

export interface SavedState {
  completedLevels: number[];
  unlockedWorlds: WorldTheme[];
  gardenItems: GardenItem[];
  unlockedSounds: string[];
  settings: {
    masterVolume: number;
    bgmVolume: number;
    sfxVolume: number;
    vibrationEnabled: boolean;
    colorblindFriendly: boolean;
    leftHandedMode: boolean;
    largeTouchTargets: boolean;
  };
  dailyCalmCompletedDate?: string; // ISO date
  lastPlayedWorldId?: number; // Last focused or played world ID
}

export interface Quote {
  text: string;
  author: string;
}

// Stacking Game Types
export interface StackingStone {
  id: number;
  width: number;
  height: number;
  x: number; // Offset from center stack line (-50 to +50)
  tilt: number; // Angle (radians)
  color: string;
  radius: number; // rounded corners
}

// Color Harmony block
export interface ColorBlock {
  id: number;
  color: string;
  isFixed: boolean; // corners represent fixed anchors
  correctIndex: number;
}

// Constellation Star
export interface Star {
  id: number;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  size: number;
  connectedTo: number[]; // Target star IDs in the pattern
}

// Water Ripple Node
export interface RippleNode {
  id: number;
  x: number; // Percentage
  y: number; // Percentage
  radius: number;
  isActive: boolean;
  frequency: number; // Synth trigger note
}

// Nature Restoration Grid Cell
export interface GridCell {
  id: number;
  x: number;
  y: number;
  progress: number; // 0 to 1
  type: 'grass' | 'water' | 'flower' | 'bamboo';
  flowerColor?: string;
}
