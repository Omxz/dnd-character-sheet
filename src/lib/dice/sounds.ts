// Sound effects for dice rolling
import { Howl } from "howler";

// Sound effect URLs (using free sounds)
// In production, these should be hosted locally in /public/sounds/
const SOUND_URLS = {
  roll: "/sounds/dice-roll.mp3",
  hit: "/sounds/dice-hit.mp3",
  critical: "/sounds/critical.mp3",
  fumble: "/sounds/fumble.mp3",
};

let soundsLoaded = false;
let soundEnabled = true;

const sounds: Record<string, Howl> = {};

// Initialize sounds (call once on app load)
export function initializeSounds(): void {
  if (soundsLoaded) return;
  
  try {
    sounds.roll = new Howl({
      src: [SOUND_URLS.roll],
      volume: 0.5,
      preload: true,
    });
    
    sounds.hit = new Howl({
      src: [SOUND_URLS.hit],
      volume: 0.3,
      preload: true,
    });
    
    sounds.critical = new Howl({
      src: [SOUND_URLS.critical],
      volume: 0.6,
      preload: true,
    });
    
    sounds.fumble = new Howl({
      src: [SOUND_URLS.fumble],
      volume: 0.4,
      preload: true,
    });
    
    soundsLoaded = true;
  } catch (error) {
    console.warn("Failed to initialize sounds:", error);
  }
}

// Enable/disable sounds
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

// Play a sound effect
export function playSound(sound: "roll" | "hit" | "critical" | "fumble"): void {
  if (!soundEnabled || !soundsLoaded) return;
  
  try {
    sounds[sound]?.play();
  } catch (error) {
    console.warn(`Failed to play sound ${sound}:`, error);
  }
}

// Play the appropriate sound for a roll result
export function playRollSound(isCritical: boolean, isFumble: boolean): void {
  if (!soundEnabled) return;
  
  // Play roll sound first
  playSound("roll");
  
  // After a delay, play result sound
  setTimeout(() => {
    if (isCritical) {
      playSound("critical");
    } else if (isFumble) {
      playSound("fumble");
    } else {
      playSound("hit");
    }
  }, 500); // Delay to sync with animation
}
