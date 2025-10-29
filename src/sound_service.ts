import * as soundjs from './soundjs-wrapper';

interface SoundDef {
  file: string;
  throttleMs: number;
}

type SoundName = 'blip' | 'error' | 'detector' | 'mine' | 'rock' | 'absorber';

const SOUND_DEFS: Record<SoundName, SoundDef> = {
  blip: {
    file: 'blip.mp3',
    throttleMs: 100,
  },
  error: {
    file: 'error.mp3',
    throttleMs: 250,
  },
  detector: {
    file: 'detector.mp3',
    throttleMs: 100,
  },
  mine: {
    file: 'mine.mp3',
    throttleMs: 1000,
  },
  rock: {
    file: 'rock.mp3',
    throttleMs: 1000,
  },
  absorber: {
    file: 'absorber.mp3',
    throttleMs: 1000,
  },
};


export class SoundService {
  static initialized: boolean;
  static throttled: Record<string, () => void>;

  static initialize(): void {
    if (SoundService.initialized) {
      return;
    }
    // Register sounds
    const soundAPI = soundjs.Sound as { registerSound: (path: string, id: string) => void; play: (id: string) => void };
    Object.entries(SOUND_DEFS).forEach(([name, def]) => {
      soundAPI.registerSound(`/sounds/${def.file}`, name);
    });
    // Create throttled versions
    SoundService.throttled = Object.fromEntries(
      Object.entries(SOUND_DEFS).map(([name, def]): [string, () => void] => {
        // Simple throttle implementation
        let lastCall = 0;
        const throttled = (): void => {
          const now = Date.now();
          if (now - lastCall >= def.throttleMs) {
            lastCall = now;
            soundAPI.play(name);
          }
        };
        return [name, throttled];
      }),
    );
    SoundService.initialized = true;
  }

  static play(name: string): void {
    const soundAPI = soundjs.Sound as { play: (id: string) => void };
    soundAPI.play(name);
  }

  static playThrottled(name: string): void {
    SoundService.throttled[name]!();
  }
}
