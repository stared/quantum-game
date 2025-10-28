// Wrapper for SoundJS loaded via npm
// This provides a centralized import point for SoundJS

// @ts-ignore - soundjs types may not be available
import * as createjs from 'soundjs/lib/soundjs.js';

export const Sound: any = (createjs as any).Sound || {};
export default createjs;
