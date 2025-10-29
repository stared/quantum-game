// Wrapper for SoundJS loaded via npm
// This provides a centralized import point for SoundJS

// @ts-expect-error - soundjs types may not be available
import * as createjs from 'soundjs/lib/soundjs.js';

interface SoundJS {
  Sound?: unknown;
}

export const Sound = (createjs as SoundJS).Sound !== undefined ? (createjs as SoundJS).Sound : {};
export default createjs;
