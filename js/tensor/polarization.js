'use strict';
import * as tensor from './tensor';

export const polarizations = ['-', '|'];

export const identity = tensor.fill(polarizations, 1, 0);

export const reflectPhase = {
  '-': [{to: '-', re: -1, im: 0}],
  '|': [{to: '|', re: 1, im: 0}],
};

// leter - check the sign of rotation
export const rotation = (alpha) => ({
  '-': [{to: '-', re: Math.cos(alpha), im: 0},
        {to: '|', re: Math.sin(alpha), im: 0}],
  '|': [{to: '_', re: -Math.sin(alpha), im: 0},
        {to: '|', re: Math.cos(alpha), im: 0}],
});

export const projection = (alpha) => ({
  '-': [{to: '-', re: Math.cos(alpha) * Math.cos(alpha), im: 0},
        {to: '|', re: Math.cos(alpha) * Math.sin(alpha), im: 0}],
  '|': [{to: '_', re: Math.cos(alpha) * Math.sin(alpha), im: 0},
        {to: '|', re: Math.cos(alpha) * Math.cos(alpha), im: 0}],
});

// ones below are NOT polarization-dependent,
// but it might be simpler to keep them there
// or maybe use just tensor.byConstant?

export const globalPhase = (phi) => tensor.fill(polarizations, Math.cos(phi), Math.sin(phi));

export const globalAbsorption = (transmission) => tensor.fill(polarizations, Math.sqrt(transmission), 0);
