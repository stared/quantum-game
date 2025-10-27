/**
 * Shared type definitions for Quantum Game
 */

// Direction types for particle movement
export type Direction = '>' | '^' | '<' | 'v';

// Complex number representation
export interface ComplexNumber {
  re: number;
  im: number;
}

// Coordinate types
export interface Coordinates {
  i: number;
  j: number;
}

// Tile rotation (in multiples of 90 degrees)
export type Rotation = 0 | 1 | 2 | 3;

// Mode for game/dev
export type GameMode = 'game' | 'dev';

// View mode for visualization
export type ViewMode = 'orthogonal' | 'polar';

// Measurement mode
export type MeasurementMode = 'Copenhagen' | 'Many-worlds';
