// Developer mode (especially for editing levels)
export const DEV_MODE = false;
// Tile size (px)
export const tileSize = 100;
// Rotation speed (ms)
export const rotationSpeed = 250;
// Tile reposition speed (ms)
export const repositionSpeed = 250;
// Maximum iteration count
export const maxIterations = 1000;
// Default animation step duration (ms)
export const animationStepDuration = 600;
// Min animation step duration - for slider (ms)
export const animationStepDurationMin = 100;
// Max animation step duration - for slider (ms)
export const animationStepDurationMax = 2000;
// Play/pause button transition duration
export const playPauseTransitionDuration = 300;
// Oscillations per tile
export const oscillations = 1;
// Horizontal oscillation scale (px)
export const polarizationScaleH = 15;
// Vertical oscillation scale (factor)
export const polarizationScaleV = 0.7;
// Canvas resize throttling (ms)
export const resizeThrottle = 100;
// How often we should draw particles on canvas, measured in light units.
// Example: when set to 20, there should be 20 drawings of dot every time
// when photon travels one tile.
export const canvasDrawFrequency = 20;
// Absorption animation duration (ms)
export const absorptionDuration = 2000;
// Absorption test duration (ms)
export const absorptionTextDuration = 8000;
// Maximal number of stock columns (for interface size)
export const stockColumns = 4;
// Margin around the board (in the number of tiles)
export const margin = 1;
// Display message default timeout (ms)
export const displayMessageTimeout = 3000;
// Pearls per column
export const pearlsPerCol = 36;
// Stock bottom margin, in number of tiles (0 - matches the board height)
export const stockBottomMargin = 4;
