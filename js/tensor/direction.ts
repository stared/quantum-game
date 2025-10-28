import {Tensor} from './tensor';

export type Direction = '>' | '^' | '<' | 'v';

// Moving directions. We allow only four of them:
export const directions: Direction[] = ['>', '^', '<', 'v'];

export function directionToAngle(direction: Direction): number {
  return {
    '>': 0,
    '^': 90,
    '<': 180,
    'v': 270,
  }[direction];
}

export function angleToDirection(angle: number): Direction | undefined {
  return {
    '0': '>',
    '90': '^',
    '180': '<',
    '270': 'v',
  }['' + angle] as Direction | undefined;
}

export const identity = Tensor.fill(directions, {re: 1, im: 0});
export const zero = Tensor.fill(directions, {re: 0, im: 0});

// Reflection direction: reflecting from point
export function pointReflectionDirection(direction: Direction): Direction | undefined {
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = (incidentAngle + 180) % 360;
  return angleToDirection(reflectedAngle);
}

// Reflection direction basing on plane's rotation (- / | \)
export function planeReflectionDirection(direction: Direction, rotation: number): Direction | undefined {
  const mirrorPlaneAngle = rotation * 45;
  const incidentAngle = directionToAngle(direction);
  const reflectedAngle = (2 * mirrorPlaneAngle - incidentAngle + 360) % 360;
  return angleToDirection(reflectedAngle);
}

export const cube = Tensor.fromObject(
  directions.reduce((acc, dirFrom) => {
    const dirTo = pointReflectionDirection(dirFrom);
    acc[dirFrom] = {};
    if (dirTo) {
      acc[dirFrom][dirTo] = {re: 1, im: 0};
    }
    return acc;
  }, {} as Record<string, Record<string, {re: number, im: number}>>),
);

export const mirror = Array.from({length: 4}, (_, rotation) => {
  return Tensor.fromObject(
    directions.reduce((acc, dirFrom) => {
      const dirTo = planeReflectionDirection(dirFrom, rotation);
      acc[dirFrom] = {};
      if (dirFrom !== dirTo && dirTo) {
        acc[dirFrom][dirTo] = {re: 1, im: 0};
      }
      return acc;
    }, {} as Record<string, Record<string, {re: number, im: number}>>),
  );
});

export const mirrorCoated = Array.from({length: 8}, (_, rotation) => {
  return Tensor.fromObject(
    directions.reduce((acc, dirFrom, iFrom) => {
      const dirTo = planeReflectionDirection(dirFrom, rotation);
      const sign = (-rotation/2 + iFrom + 8) % 4 < 1.75 ? -1 : 1;
      acc[dirFrom] = {};
      if (dirFrom !== dirTo && dirTo) {
        acc[dirFrom][dirTo] = {re: sign, im: 0};
      }
      return acc;
    }, {} as Record<string, Record<string, {re: number, im: number}>>),
  );
});

export const diode = Array.from({length: 4}, (_, rotation) => {
  return Tensor.fromObject(
    directions.reduce((acc, dirFrom) => {
      acc[dirFrom] = {};
      if (dirFrom === directions[rotation]) {
        acc[dirFrom][dirFrom] = {re: 1, im: 0};
      }
      return acc;
    }, {} as Record<string, Record<string, {re: number, im: number}>>),
  );
});

export const absorbOneDirReflectOther = Array.from({length: 4}, (_, rotation) => {
  return Tensor.fromObject(
    directions.reduce((acc, dirFrom, iFrom) => {
      const dirTo = pointReflectionDirection(dirFrom);
      acc[dirFrom] = {};
      if (rotation !== iFrom && dirTo) {
        acc[dirFrom][dirTo] = {re: 1, im: 0};
      }
      return acc;
    }, {} as Record<string, Record<string, {re: number, im: number}>>),
  );
});
