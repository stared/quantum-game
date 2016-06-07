import {Tensor} from './tensor';
import {TAU} from '../const';

export const polarizations = ['-', '|'];

export const identity = Tensor.fill(polarizations, {re: 1, im: 0});
export const zero = Tensor.fill(polarizations, {re: 0, im: 0});

export const source = Tensor.fromObject({
  '-': {'-': {re: 1, im: 0}},
});

export const reflectPhaseFromLighter = Tensor.fromObject({
  '-': {'-': {re: -1, im: 0}},
  '|': {'|': {re: 1, im: 0}},
});

export const reflectPhaseFromDenser = Tensor.fromObject({
  '-': {'-': {re: 1, im: 0}},
  '|': {'|': {re: -1, im: 0}},
});

/**
 * Creates polarization rotation matrix for given angle alpha.
 * Sample usage: polarization twister.
 */
// TODO check the sign of rotation
// TODO tests
export const rotation = (alpha) => Tensor.fromObject({
  '-': {'-': {re: Math.cos(alpha), im: 0},
        '|': {re: Math.sin(alpha), im: 0}},
  '|': {'-': {re: -Math.sin(alpha), im: 0},
        '|': {re: Math.cos(alpha), im: 0}},
});

/**
 * Creates polarization projection matrix for given angle alpha.
 * Sample usage: polarizer.
 */
// TODO tests
export const projection = (alpha) => Tensor.fromObject({
  '-': {'-': {re: Math.cos(alpha) * Math.cos(alpha), im: 0},
        '|': {re: Math.cos(alpha) * Math.sin(alpha), im: 0}},
  '|': {'-': {re: Math.cos(alpha) * Math.sin(alpha), im: 0},
        '|': {re: Math.sin(alpha) * Math.sin(alpha), im: 0}},
});

// note to myself:
// TAU/2 is symmetry
// TAU/4 is rotation to the perpendicular coordinates

// one gets shifted, second stays the same
// TODO better description
// TODO tests
export const phaseShift = (alpha, phi) => (
  Tensor.sum(
    Tensor.byConstant(
      projection(alpha),
      {re: Math.cos(phi), im: Math.sin(phi)}
    ),
    projection(alpha + TAU / 4)
  )
);

// TODO for the three functions above - invent something to purge almost-zero entries?

// ones below are NOT polarization-dependent,
// but it might be simpler to keep them there
// or maybe use just tensor.byConstant?

export const globalPhase = (phi) => Tensor.fill(
  polarizations, {re: Math.cos(phi), im: Math.sin(phi)}
);

export const globalAbsorption = (transmission) => Tensor.fill(
  polarizations, {re: Math.sqrt(transmission), im: 0}
);
