import _ from 'lodash';
import * as soundjs from 'soundjs';

console.log(soundjs);

const SOUND_DEFS = {
  blip: {
    file: 'blip.wav',
  },
  error: {
    file: 'error.wav',
  },
};


export class SoundService {
  static initialize() {
    if (SoundService.initialized) {
      return;
    }
    _.forIn(SOUND_DEFS, (def, name) => {
      soundjs.Sound.registerSound(`/sounds/${def.file}`, name);
    });
    SoundService.initialized = true;
  }

  static play(name) {
    soundjs.Sound.play(name);
  }
}
