'use strict';
import * as tensor from './tensor';

export const polarizations = ['-', '|'];

export const identity = tensor.fill(polarizations, 1, 0);

export const reflectPhase = {
  '-': [{to: '-', re: -1, im: 0}],
  '|': [{to: '|', re: 1, im: 0}],
};
