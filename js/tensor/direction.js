import _ from 'lodash';

import {Tensor} from './tensor';

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

export const identity = Tensor.fill(directions, {re: 1, im: 0});
export const zero = Tensor.fill(directions, {re: 0, im: 0});

// Reflection direction: reflecting from point
export function pointReflectionDirection(direction) {
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = (incidentAngle + 180) % 360;
  return angleToDirection(reflectedAngle);
}

// Reflection direction basing on plane's rotation (- / | \)
export function planeReflectionDirection(direction, rotation) {
  const mirrorPlaneAngle = rotation * 45;
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = (2 * mirrorPlaneAngle - incidentAngle + 360) % 360;
  return angleToDirection(reflectedAngle);
}

export const cube = Tensor.fromObject(
  _.reduce(directions, (acc, dirFrom) => {
    const dirTo = pointReflectionDirection(dirFrom);
    acc[dirFrom] = {};
    acc[dirFrom][dirTo] = {re: 1, im: 0};
    return acc;
  }, {})
);

export const mirror = _.range(4).map((rotation) => {
  return Tensor.fromObject(
    _.reduce(directions, (acc, dirFrom) => {
      const dirTo = planeReflectionDirection(dirFrom, rotation);
      acc[dirFrom] = {};
      if (dirFrom !== dirTo) {
        acc[dirFrom][dirTo] = {re: 1, im: 0};
      }
      return acc;
    }, {})
  );
});
