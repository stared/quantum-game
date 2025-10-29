import type { Direction } from './types';

export const TAU = 2 * Math.PI;
export const EPSILON = 1e-5;

// For level-winning conditions 1% seems to be fine
export const EPSILON_DETECTION = 0.01;

export const velocityI: Record<Direction, number> = {
  '>': 1,
  '^': 0,
  '<': -1,
  'v': 0,
};

export const velocityJ: Record<Direction, number> = {
  '>': 0,
  '^': -1, // TODO when changing (i,j) to cartesian, change it to 1
  '<': 0,
  'v': 1, // TODO when changing (i,j) to cartesian, change it to -1
};

// Also changes for cartesian
// With non-cartesian perhaps it's broken anyways :)
export const perpendicularI: Record<Direction, number> = {
  '>': 0,
  '^': -1,
  '<': 0,
  'v': 1,
};

export const perpendicularJ: Record<Direction, number> = {
  '>': -1,
  '^': 0,
  '<': 1,
  'v': 0,
};
