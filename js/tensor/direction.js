import _ from 'lodash';

import * as tensor from './tensor';

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

export const identity = tensor.fill(directions, 1, 0);

// Reflection direction: reflecting from point
export function pointReflectionDirection(direction) {
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = 360 - incidentAngle;
  return angleToDirection(reflectedAngle);
}

// Reflection direction basing on plane's rotation (- / | \)
export function planeReflectionDirection(direction, rotation) {
  const mirrorPlane = rotation * 45;
  const normalPlane = mirrorPlane + 90;
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = (2 * normalPlane - incidentAngle + 360) % 360;
  return angleToDirection(reflectedAngle);
}

export const cube = _.reduce(directions, (acc, direction) => {
    acc[direction] = [{
      to: pointReflectionDirection(direction),
      re: 1,
      im: 0,
    }];
    return acc;
  }, {}
);

export const mirror = _.range(4).map((rotation) => {
  return _.reduce(directions, (acc, direction) => {
    acc[direction] = [{
      to: planeReflectionDirection(direction, rotation),
      re: 1,
      im: 0,
    }];
    return acc;
  }, {});
});

// it may be not as simple if we include polarization
export const splitter = _.range(4).map((rotation) => {
  return _.reduce(directions, (acc, direction) => {
    const reflectedDirection = planeReflectionDirection(direction, rotation);
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
