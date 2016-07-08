import _ from 'lodash';
import * as soundjs from 'soundjs';

const SOUND_DEFS = {
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


const SOUNDS_NEW = {
  mouseclick: '2. I - mouseclick.mp3',
  win: '3. I - win.mp3',
  lose: '4. I - lose.mp3',
  reset: '5. I - reset 1.mp3',
  // : '5. I - reset 2.mp3',
  // : '5. I - reset 3.mp3',
  fire: '6. I - fire.mp3',
  detect: '7. I - detector catch.mp3',
  miss: '8. I - detector miss 1.mp3',
  // : '8. I - detector miss 2.mp3',
  boom: '9. I - boom.mp3',
  blink: '10. I - blink.mp3',
  Source: '11. E - laser 1.mp3',
  // : '11. E - laser 2.mp3',
  PolarizerNS: '12. E - polarizer.mp3',
  PolarizerWE: '12. E - polarizer.mp3',
  ThinSplitter: '13. E - beam split 1.mp3',
  ThinSplitterCoated: '14. E - beam split 2.mp3',
  PolarizingSplitter: '14. E - polarized beam split 1.mp3',
  ThinMirror: '15. I - mirror 1.mp3',
  // : '15. i - mirror 2.mp3',
  FaradayRotator: '16. I - coil 1.mp3',
  // : '16. I - coil 2.mp3',
  // : '17. E - tykanie 1.mp3',
  // : '17. E - tykanie 2.mp3',
  Mine : '17. E - tykanie 3.mp3',
  Detector: '19. E - detector.mp3',
  DetectorFour: '19. E - detector.mp3',
  VacuumJar: '20. E - vacuum.mp3',
  Absorber: '21. E - absorber.mp3',
  // SugarSolution: '22. E - solution.mp3',
  SugarSolution: '22. E - solution 2.mp3',
}

const SOUNDS_NEW_PATH = 'sounds/surma1/';

// missing:
// 'CornerCube',
// 'QuarterWavePlateNS',
// 'QuarterWavePlateWE',
// 'Rock',
// 'Glass'

export class SoundService {
  static initialize() {
    if (SoundService.initialized) {
      return;
    }
    // Register sounds
    _.forIn(SOUND_DEFS, (def, name) => {
      soundjs.Sound.registerSound(`sounds/${def.file}`, name);
    });
    // Registern new sounds
    _.forIn(SOUNDS_NEW, (file, name) => {
      soundjs.Sound.registerSound(`${SOUNDS_NEW_PATH}${file}`, name);
    });

    // FIX now only new sounds throttled
    // Create throttled versions
    SoundService.throttled = _.mapValues(SOUND_DEFS, (def, name) => {
      return _.throttle(
        () => {
          soundjs.Sound.play(name);
        },
        def.throttleMs,
        {
          leading: true,
          trailing: false,
        });
    });
    SoundService.initialized = true;
  }

  static play(name) {
    window.console.log(`SOUND: ${name}`);
    soundjs.Sound.play(name);
  }

  static playThrottled(name) {
    SoundService.throttled[name]();
  }
}
