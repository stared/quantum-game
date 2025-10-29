import { EPSILON, velocityI, velocityJ } from './const';
import { maxIterations } from './config';
import * as print from './print';
import type { ParticleEntry, AbsorptionEvent, Direction } from './types';
import type { Tile } from './tile';

const zAbs = (z: { re: number; im: number }): number =>
  z.re * z.re + z.im * z.im;

const intensityPerPosition = (state: ParticleEntry[]): Record<string, number> => {
  const grouped = state.reduce((acc, entry) => {
    const key = `${entry.i} ${entry.j}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, ParticleEntry[]>);

  return Object.fromEntries(
    Object.entries(grouped).map(([key, groupedEntry]) => [
      key,
      groupedEntry.reduce((sum, entry) => sum + zAbs(entry), 0),
    ]),
  );
};

export class Simulation {
  tileMatrix: Tile[][];
  levelHeight: number;
  levelWidth: number;
  history: ParticleEntry[][];
  measurementHistory: AbsorptionEvent[][];
  logging: boolean;
  noClickYet: boolean;

  constructor(tileMatrix: Tile[][], logging?: string) {
    this.tileMatrix = tileMatrix;
    this.levelHeight = Math.max(...this.tileMatrix.map((row) => row.length || 0));
    this.levelWidth = this.tileMatrix.length;
    this.history = [];
    this.measurementHistory = [];
    this.logging = (logging === 'logging');
    this.noClickYet = true;
  }

  /**
   * Clear history and make it one-element list
   * containing initial particles state.
   */
  initialize(): void {

    const initialState: ParticleEntry[] = [];
    for (let i = 0; i < this.levelWidth; i++) {
      for (let j = 0; j < this.levelHeight; j++) {
        const tile = this.tileMatrix[i]?.[j];
        if (!tile) continue;

        // Recognize generating tiles by having 'generation' method
        if (!tile.type.generation) {
          continue;
        }
        const emissions = tile.type.generation(tile.rotation);
        // emissions is PhotonGeneration[][] (array of arrays)
        emissions.forEach((emissionSet) => {
          emissionSet.forEach((emission) => {
            initialState.push({
              i:  i,
              j:  j,
              to: emission.to,
              re: emission.re,
              im: emission.im,
            });
          });
        });
      }
    }

    if (this.logging) {
      window.console.log('Simulation started:');
      window.console.log(print.stateToStr(initialState));
    }

    this.history.push(initialState);
    this.measurementHistory.push([]);
    this.noClickYet = true;
  }

  /**
   * Make one propagation step and save it in history.
   * Additionally, return it.
   */
  propagate(quantum?: boolean, onlyDetectors = -1): ParticleEntry[] {

    const lastState = this.history[this.history.length - 1]!;
    const displacedState = this.displace(lastState);
    let newState = this.interact(displacedState);
    const absorbed = this.absorb(displacedState, newState, onlyDetectors);

    if (quantum === true && onlyDetectors < 0) {
      newState = this.normalize(newState);
    }

    this.history.push(newState);
    this.measurementHistory.push(absorbed);

    if (this.logging) {
      window.console.log(print.stateToStr(displacedState));
      if (absorbed.length > 0) {
        window.console.log(print.absorbedToStr(absorbed));
      }
    }

    if (absorbed.some(a => a.measured === true) && quantum === true) {
      return [];
    } else {
      return newState;
    }

  }

  /**
   * Creates a new state basing on input state, with particles
   * moved according to their directions.
   */
  // WARNING: creating may be slower than just modifying i and j
  displace(state: ParticleEntry[]): ParticleEntry[] {
    return state.map((entry) => {
      // 'to' value = direction + polarization
      const dir = (entry.to[0] ?? '>') as Direction;
      const newI = entry.i + velocityI[dir];
      const newJ = entry.j + velocityJ[dir];
      return {
        i:  newI,
        j:  newJ,
        to: entry.to,
        re: entry.re,
        im: entry.im,
      };
    });
  }

  absorb(stateOld: ParticleEntry[], stateNew: ParticleEntry[], onlyDetectors = -1): AbsorptionEvent[] {

    const intensityOld = intensityPerPosition(stateOld);
    const intensityNew = intensityPerPosition(stateNew);

    const bins: AbsorptionEvent[] = Object.entries(intensityOld)
      .map(([location, prob]) => ({
        prob: prob - (intensityNew[location] ?? 0),
        location,
      }))
      .filter(({prob}) => prob > EPSILON)
      .map(({prob, location}): AbsorptionEvent => {
        const coords = location.split(' ');
        return {
          probability: prob,
          measured: false,
          i: parseInt(coords[0] ?? '0'),
          j: parseInt(coords[1] ?? '0'),
        };
      });

    bins.forEach((each) => {
      each.tile = this.tileMatrix[each.i]?.[each.j];
    });


    const rand = Math.random();

    let probSum = 0;
    if (this.noClickYet) {
      if (onlyDetectors > 0) {
        // the cheated variant
        for (const bin of bins) {
          if ((bin.tile as Tile).isDetector) {
            probSum += bin.probability * onlyDetectors;
            if (probSum > rand) {
              bin.measured = true;
              this.noClickYet = false;
              break;
            }
          }
        }
      } else {
        // usual variant
        for (const bin of bins) {
          probSum += bin.probability;
          if (probSum > rand) {
            bin.measured = true;
            this.noClickYet = false;
            break;
          }
        }
      }
    }

    return bins;

  }

  /**
   * Creates a new state basing on input state, applying probability
   * function changes from tiles' interactions.
   */
  interact(state: ParticleEntry[]): ParticleEntry[] {
    // Collect all transitions into bins. Each bin will be labeled
    // with position (i, j) and momentum direction.
    const bins: Record<string, ParticleEntry> = state.reduce<Record<string, ParticleEntry>>((acc, entry) => {
      // Check if particle is out of bound
      if (
           entry.i < 0 || entry.i >= this.levelWidth
        || entry.j < 0 || entry.j >= this.levelHeight
      ) {
        return acc;
      }
      const tile = this.tileMatrix[entry.i]?.[entry.j];
      if (!tile) {
        return acc;
      }

      const transitionAmplitudes = tile.transitionAmplitudes;
      // transitionAmplitudes can be either Tensor or Tensor[] depending on the tile
      // For simulation, we use it as a single Tensor (array case handled elsewhere)
      const firstTensor = Array.isArray(transitionAmplitudes) ? transitionAmplitudes[0] : transitionAmplitudes;
      if (!firstTensor) {
        return acc;
      }
      const tensorMap = firstTensor.map;
      const transition = tensorMap.get(entry.to);
      if (transition) {
        for (const [to, change] of transition) {
          const binKey = [entry.i, entry.j, to].join('_');
          // (a + bi)(c + di) = (ac - bd) + i(ad + bc)
          const re = entry.re * change.re - entry.im * change.im;
          const im = entry.re * change.im + entry.im * change.re;
          // Add to bin
          const existing = acc[binKey];
          if (existing) {
            existing.re += re;
            existing.im += im;
          } else {
            acc[binKey] = {
              i:  entry.i,
              j:  entry.j,
              to: to,
              re: re,
              im: im,
            };
          }
        }
      }
      return acc;
    }, {});
    // Remove keys; filter out zeroes
    return Object.values(bins).filter((entry) =>
      entry.re * entry.re + entry.im * entry.im > EPSILON,
    );
  }

  normalize(state: ParticleEntry[]): ParticleEntry[] {

    let norm = state
      .map((entry) => entry.re * entry.re + entry.im * entry.im)
      .reduce((sum, val) => sum + val, 0);

    norm = Math.sqrt(norm);

    return state.map((entry) =>
      Object.assign(entry, {
        re: entry.re / norm,
        im: entry.im / norm,
      }),
    );

  }

  /**
   * Propagate until:
   * - all probabilities go to 0
   * - iteration limit is reached
   */
  propagateToEnd(quantum = true): void {
    let stepNo: number;
    let lastStep: ParticleEntry[];
    for (stepNo = 0; stepNo < maxIterations; ++stepNo) {
      lastStep = this.propagate(quantum);
      if (!lastStep.length) {
        break;
      }
    }
  }

  // propagation making sure that it will click at one of the detectors
  propagateToEndCheated(absAtDetByTime: number[]): void {
    const totalDetection = absAtDetByTime.reduce((sum, val) => sum + val, 0);
    let detectionSoFar = 0;
    let stepNo: number;
    let lastStep: ParticleEntry[];
    // Start from index 1 because absAtDetByTime[0] is initial state (no absorptions yet)
    // stepNo represents the step number being simulated (1, 2, 3, ...)
    for (stepNo = 1; stepNo < absAtDetByTime.length; ++stepNo) {
      lastStep = this.propagate(true, 1 / (totalDetection - detectionSoFar ));
      detectionSoFar += absAtDetByTime[stepNo];
      if (!lastStep.length) {
        break;
      }
    }

  }

}
