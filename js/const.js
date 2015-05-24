export const TAU = 2 * Math.PI;
export const EPSILON = 1e-5;
export const velocityI = {
  '>': 1,
  '^': 0,
  '<': -1,
  'v': 0,
};
export const velocityJ = {
  '>': 0,
  '^': -1, // TODO when changing (i,j) to cartesian, change it to 1
  '<': 0,
  'v': 1, // TODO when changing (i,j) to cartesian, change it to -1
};

// also changes for cartesian
// with non-cartesian perhaps its broken anyways :)
export const perpendicularI = {
  '>': 0,
  '^': -1,
  '<': 0,
  'v': 1,
};
export const perpendicularJ = {
  '>': -1,
  '^': 0,
  '<': 1,
  'v': 0,
};
