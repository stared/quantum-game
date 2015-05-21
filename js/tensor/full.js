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

// for sugar it should be just a product,
// but let's then double check convention
// AND 
// check sign (so it works well for typical sugar)
export const sugarSolution = [
  tensor.product(
    direction.identity,
    polarization.rotation(tau/4)
  )
];

// it's not just a product; we need some kind of co-variant product
export const polarizer = _.range(4).map((rotation) =>
  tensor.product(
    direction.identity,
    polarization.projection(rotation * tau/8)
  )
);

// it's not just a product; we need some kind of co-variant product
export const phasePlate = _.range(4).map((rotation) =>
  tensor.product(
    direction.identity,
    polarization.phaseShift(rotation * tau/8, tau/4)
  )
);
