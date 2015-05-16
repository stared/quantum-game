import * as tensor from 'tensor';

// Moving directions. We allow only four of them:
export const directions = ['>', '^', '<', 'v'];
export function directionToAngle(direction){
  return {
    '>': 0,
    '^': 90,
    '<': 180,
    'v': 270,
  }[direction];
}
export function angleToDirection(angle) {
  return {
    '0': '>',
    '90': '^',
    '180': '<',
    '270': 'v',
  }['' + angle];
}

// Particle polarizations. Our basis consists of two of them:
export const polarizations = ['-', '|'];

// Create a tensor that has the same complex number values for all indices.
function fill(xs, re, im) {
  return _.reduce(xs, (acc, x) => {
    acc[x] = [{
      to: x,
      re: re,
      im: im,
    }];
    return acc;
  }, {});
}

export const directionIdentity = fill(directions, 1, 0);
export const polarizationIdentity = fill(polarizations, 1, 0);
export const fullIdentity = tensor.product(directionIdentity, polarizationIdentity);

export const fullZero = {};
export const polarizationReflectPhase = {
  '-': [{to: '-', re: -1, im: 0}],
  '|': [{to: '|', re: 1, im: 0}],
};

// Reflection direction, basing on mirror's rotation (- / | \)
function reflectDirection(direction, rotation) {
  const mirrorPlane = rotation * 45;
  const normalPlane = mirrorPlane + 90;
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = 2 * normalPlane - incidentAngle;
  return angleToDirection(reflectedAngle);
}
export const directionMirror = _.range(4).map((rotation) => {
  return _.reduce(directions, (direction, acc) => {
    acc[direction] = [{
      to: reflectDirection(direction, rotation),
      re: 1,
      im: 0,
    }];
    return acc;
  }, {});
});

export const directionSplitter = _.range(4).map((rotation) => {
  return _.reduce(directions, (direction, acc) => {
    const reflectedDirection = reflectDirection(direction, rotation);
    if (reflectedDirection === direction) {
      // When beam goes parallel to splitter surface, act like vacuum
      acc[direction] = [{
        to: direction,
        re: 1,
        im: 0
      }];
    } else {
      // When there's a chance for reflection:
      // thin beam splitter = 1/√2 vacuum + i/√2 thin mirror
      acc[direction] = [
        {
          to: direction,
          re: Math.SQRT1_2,
          im: 0,
        },
        {
          to: reflectedDirection,
          re: 0,
          im: Math.SQRT1_2,
        },
      ];
    }
    return acc;
  }, {});
});
export const fullPolarizingSplitter = _.range(2).map((rotation) => {
  // Convert polarizing splitter rotation (/ \) into mirror rotation (- / | \)
  const mirrorRotation = 2 * rotation + 1;
  return _.reduce(directions, (direction, acc) => {
    const reflectedDirection = reflectDirection(direction, mirrorRotation);
    // Polarization | passes through
    acc[direction + '|'] = [{
      to: direction + '|',
      re: 1,
      im: 0,
    }];
    // Polarization - gets reflected
    acc[direction + '-'] = [{
      to: reflectedDirection + '-',
      re: 1,
      im: 0,
    }];
    return acc;
  }, {});
});


export const speedX = {
  '>': 1,
  '^': 0,
  '<': -1,
  'v': 0,
};

export const speedY = {
  '>': 0,
  '^': 1,
  '<': 0,
  'v': -1,
};
