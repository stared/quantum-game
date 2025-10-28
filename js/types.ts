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

// Minimal D3 Selection interface for v3 compatibility
// Full typing will be added when we upgrade to D3 v7
export interface D3Selection {
  append(name: string): D3Selection;
  select(selector: string): D3Selection;
  attr(name: string, value: string | number | ((d: unknown, i: number) => string | number)): D3Selection;
  style(name: string, value: string | number): D3Selection;
  transition(): D3Selection;
  duration(milliseconds: number): D3Selection;
  delay(milliseconds: number): D3Selection;
  ease(easing: string): D3Selection;
  remove(): D3Selection;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow other D3 methods until we have full types
}

// Tile description
export interface TileDescription {
  name: string;
  flavour: string;
  summary: string;
}

// Photon generation info (for Source tile)
export interface PhotonGeneration {
  to: string;
  re: number;
  im: number;
}

// Tile recipe from level JSON
export interface TileRecipe {
  name: string;
  i: number;
  j: number;
  rotation?: number;
  frozen?: boolean;
}

// Board hints for levels (actual structure in JSON may vary)
export interface BoardHint {
  i?: number;
  j?: number;
  widthI?: number;
  text: string;
  triangleI?: number;
  triangleDir?: string;
  coord?: { i: number; j: number };
}

// Stock configuration - tile name to count mapping
export type Stock = Record<string, number>;

// Mode for level loading
export type LevelMode = 'game' | 'dev' | 'as_it_is';

// Level recipe from JSON
export interface LevelRecipe {
  next?: string;
  name: string;
  group: string;
  i?: number;
  id?: string;
  width: number;
  height: number;
  initialHint?: string;
  boardHints?: BoardHint[];
  texts?: Record<string, string>;
  tiles: TileRecipe[];
  stock?: Stock | 'all' | 'non-frozen';
  requiredDetectionProbability?: number;
  detectorsToFeed?: number;
}

// Particle state entry for simulation
export interface ParticleEntry {
  i: number;
  j: number;
  to: string; // direction + polarization
  re: number;
  im: number;
}

// Absorption event in simulation
export interface AbsorptionEvent {
  probability: number;
  measured: boolean;
  i: number;
  j: number;
  tile?: { tileName: string }; // Tile type, but avoiding circular dependency
}
