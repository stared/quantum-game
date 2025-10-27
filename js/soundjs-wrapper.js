// Wrapper for SoundJS loaded as a global script
// This allows SoundJS to run in its expected global context
// while still being importable as an ES module

// SoundJS is loaded via script tag in index.html and available as window.createjs
const soundjs = window.createjs;

if (!soundjs || !soundjs.Sound) {
  console.error('SoundJS not loaded! Make sure soundjs.min.js is loaded via script tag before app.js');
}

export const Sound = soundjs ? soundjs.Sound : {};
export default soundjs;
