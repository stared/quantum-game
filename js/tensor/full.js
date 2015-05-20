'use strict';
import _ from 'lodash';

import * as tensor from './tensor';
import * as direction from './direction';
import * as polarization from './polarization';

const tau = 2 * Math.PI;

export const identity = tensor.product(
  direction.identity,
  polarization.identity
);

// or should it be all entries with empty lists?
export const zero = {};

export const cornerCube = tensor.product(
  direction.cube,
  polarization.identity
);

export const thinMirror = _.range(4).map((rotation) =>
  tensor.product(
    direction.mirror[rotation],
    polarization.reflectPhase
  )
);

// check this - it may be not a product
export const thinSplitter = _.range(4).map((rotation) =>
  tensor.product(
    direction.splitter[rotation],
    polarization.reflectPhase
  )
);

export const polarizingSplitter = _.range(2).map((rotation) => {
  // Convert polarizing splitter rotation (/ \) into mirror rotation (- / | \)
  const mirrorRotation = 2 * rotation + 1;
  return _.reduce(direction.directions, (acc, dir) => {
    const reflectedDirection = direction.planeReflectionDirection(dir, mirrorRotation);
    // Polarization | passes through
    acc[`${dir}|`] = [{
      to: `${dir}|`,
      re: 1,
      im: 0,
    }];
    // Polarization - gets reflected
    acc[`${dir}-`] = [{
      to: `${reflectedDirection}-`,
      re: 1,
      im: 0,
    }];
    return acc;
  }, {});
});

// later - check sign
// quater phase
export const glass = [
  tensor.product(
    direction.identity,
    polarization.globalPhase(tau/4)
  )
];

// quater phase, but opposite sign
export const vacuumJar = [
  tensor.product(
    direction.identity,
    polarization.globalPhase(-tau/4)
  )
];

export const absorber = [
  tensor.product(
    direction.identity,
    polarization.globalAbsorption(0.5)
  )
];
