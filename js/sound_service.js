import _ from 'lodash';
import * as soundjs from 'soundjs';

console.log(soundjs);

const SOUND_DEFS = {
  blip: {
    file: 'blip.wav',
    throttleMs: 100,
  },
  error: {
    file: 'error.wav',
    throttleMs: 500,
  },
};


export class SoundService {
  static initialize() {
    if (SoundService.initialized) {
      return;
    }
    // Register sounds
    _.forIn(SOUND_DEFS, (def, name) => {
      soundjs.Sound.registerSound(`/sounds/${def.file}`, name);
    });
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
    soundjs.Sound.play(name);
  }

  static playThrottled(name) {
    console.log(name);
    SoundService.throttled[name]();
  }
}
