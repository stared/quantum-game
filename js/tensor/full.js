import _ from 'lodash';

import * as tensor from './tensor';
import * as direction from './direction';
import * as polarization from './polarization';
import {TAU} from '../const';

/**
 * Module contains (mostly) transition probabilities.
 * Some of them are independent of tile orientation - in this case
 * the probability information is represented as tensor.
 * If there's a dependency between orientation and probability,
 * there appears a list of tensors, one for each orientation.
 */

export const identity = tensor.product(
  direction.identity,
  polarization.identity
);

export const zero = tensor.product(
  direction.zero,
  polarization.zero
);

export const source = _.range(4).map((rotation) => {
  return [{
    to: `${direction.directions[rotation]}-`,
    re: 1.0,
    im: 0.0,
  }];
});

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

export const thinSplitter = _.range(4).map((rotation) =>
  tensor.sum(
    tensor.byConstant(
      identity,
      {re: Math.SQRT1_2, im: 0}
    ),
    tensor.byConstant(
      thinMirror[rotation],
      {re: 0, im: Math.SQRT1_2}
    )
  )
);

export const polarizingSplitter = _.range(2).map((rotation) => {
  // Convert polarizing splitter rotation (/ \) into mirror rotation (- / | \)
  const mirrorRotation = 2 * rotation + 1;
  return _.reduce(direction.directions, (acc, dir) => {
    const reflectedDirection = direction.planeReflectionDirection(dir, mirrorRotation);
    // Polarization - passes through
    acc[`${dir}-`] = [{
      to: `${dir}-`,
      re: 1,
      im: 0,
    }];
    // Polarization | gets reflected
    acc[`${dir}|`] = [{
      to: `${reflectedDirection}|`,
      re: 1,
      im: 0,
    }];
    return acc;
  }, {});
});

// TODO check sign (?)
// Quarter wave-plate
export const glass = tensor.product(
  direction.identity,
  polarization.globalPhase(TAU / 4)
);

// Quarter wave-plate phase, but with opposite sign
export const vacuumJar = tensor.product(
  direction.identity,
  polarization.globalPhase(-TAU / 4)
);


export const absorber = tensor.product(
  direction.identity,
  polarization.globalAbsorption(0.5)
);

// TODO check sign
export const sugarSolution = tensor.product(
  direction.identity,
  polarization.rotation(TAU / 8)
);

// it's not just a product; we need some kind of co-variant product
export const polarizer = _.range(4).map((rotation) =>
  tensor.product(
    direction.identity,
    polarization.projection(rotation * TAU / 8)
  )
);

// it's not just a product; we need some kind of co-variant product
export const phasePlate = _.range(4).map((rotation) =>
  tensor.product(
    direction.identity,
    polarization.phaseShift(rotation * TAU / 8, TAU / 4)
  )
);
