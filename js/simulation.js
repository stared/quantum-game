/*global window:false*/
import _ from 'lodash';

import {EPSILON, velocityI, velocityJ} from './const';
import {maxIterations} from './config';
import * as print from './print';

const zAbs = (z) =>
  z.re * z.re + z.im * z.im;

const intensityPerPosition = (state) =>
  _(state)
    .groupBy((entry) => `${entry.i} ${entry.j}`)
    .mapValues((groupedEntry) =>
      _.sum(groupedEntry, zAbs)
    )
    .value();

export class Simulation {

  constructor(tileMatrix, logging) {
    this.tileMatrix = tileMatrix;
    this.levelHeight = Math.max(...this.tileMatrix.map((row) => row.length || 0));
    this.levelWidth = this.tileMatrix.length;
    this.history = [];
    this.measurementHistory = [];
    this.logging = (logging === 'logging');
  }

  /**
   * Clear history and make it one-element list
   * containing initial particles state.
   */
  initialize() {

    const initialState =
      _.reduce(_.range(this.levelWidth), (accI, i) => {
        return _.reduce(_.range(this.levelHeight), (accJ, j) => {
          // Recognize generating tiles by having 'generation' method
          if (!this.tileMatrix[i][j].type.generation) {
            return accJ;
          }
          const emissions =
            this.tileMatrix[i][j].type.generation(
              this.tileMatrix[i][j].rotation
            );
          _.forEach(emissions, (emission) => {
            accJ.push({i:  i,
                       j:  j,
                       to: emission.to,
                       re: emission.re,
                       im: emission.im,
                      });
          });
          return accJ;
        }, accI);
      }, []);

    if (this.logging) {
      window.console.log('Simulation started:');
      window.console.log(print.stateToStr(initialState));
    }

    this.history.push(initialState);
    this.measurementHistory.push([]);
  }

  /**
   * Make one propagation step and save it in history.
   * Additionally, return it.
   */
  propagate(quantum, onlyDetectors = -1) {

    const lastState = _.last(this.history);
    const displacedState = this.displace(lastState);
    let newState = this.interact(displacedState);
    const absorbed = this.absorb(displacedState, newState, onlyDetectors);

    if (quantum && onlyDetectors < 0) {
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

    if (_.any(absorbed, 'measured') && quantum) {
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
  displace(state) {
    return _.map(state, (entry) => {
      // 'to' value = direction + polarization
      const dir = entry.to[0];
      const newI = entry.i + velocityI[dir];
      const newJ = entry.j + velocityJ[dir];
      return {i:  newI,
              j:  newJ,
              to: entry.to,
              re: entry.re,
              im: entry.im,
            };
    });
  }

  absorb(stateOld, stateNew, onlyDetectors = -1) {

    const intensityOld = intensityPerPosition(stateOld);
    const intensityNew = intensityPerPosition(stateNew);

    const bins = _(intensityOld)
      .mapValues((prob, location) =>
        prob - (intensityNew[location] || 0)
      )
      .pick((prob) => prob > EPSILON)
      .map((prob, location) => {
        return {
          probability: prob,
          measured: false,
          i: parseInt(location.split(' ')[0]),
          j: parseInt(location.split(' ')[1]),
        };
      })
      .value();

    bins.forEach((each) => {
      each.tile = this.tileMatrix[each.i] && this.tileMatrix[each.i][each.j];
    });


    const rand = Math.random();

    let probSum = 0;
    if (onlyDetectors > 0) {
      // the cheated variant
      for (let k = 0; k < bins.length; k++) {
        if (bins[k].tile.isDetector) {
          probSum += bins[k].probability * onlyDetectors;
          if (probSum > rand) {
            bins[k].measured = true;
            break;
          }
        }
      }
    } else {
      // usual variarant
      for (let k = 0; k < bins.length; k++) {
        probSum += bins[k].probability;
        if (probSum > rand) {
          bins[k].measured = true;
          break;
        }
      }
    }

    return bins;

  }

  /**
   * Creates a new state basing on input state, applying probability
   * function changes from tiles' interactions.
   */
  interact(state) {
    // Collect all transitions into bins. Each bin will be labeled
    // with position (i, j) and momentum direction.
    const bins = _.reduce(state, (acc, entry) => {
      // Check if particle is out of bound
      if (
           entry.i < 0 || entry.i >= this.levelWidth
        || entry.j < 0 || entry.j >= this.levelHeight
      ) {
        return acc;
      }
      const tile = this.tileMatrix[entry.i][entry.j];

      const transition = tile.transitionAmplitudes.map.get(entry.to);
      for (let [to, change] of transition) {
        const binKey = [entry.i, entry.j, to].join('_');
        // (a + bi)(c + di) = (ac - bd) + i(ad + bc)
        const re = entry.re * change.re - entry.im * change.im;
        const im = entry.re * change.im + entry.im * change.re;
        // Add to bin
        if (_.has(acc, binKey)) {
          acc[binKey].re += re;
          acc[binKey].im += im;
        } else {
          acc[binKey] = {i:  entry.i,
                         j:  entry.j,
                         to: to,
                         re: re,
                         im: im,
                        };
        }
      }
      return acc;
    }, {});
    // Remove keys; filter out zeroes
    return _.values(bins).filter((entry) =>
      entry.re * entry.re + entry.im * entry.im > EPSILON
    );
  }

  normalize(state) {

    let norm = _.chain(state)
      .map((entry) => entry.re * entry.re + entry.im * entry.im)
      .sum();

    norm = Math.sqrt(norm);

    return state.map((entry) =>
      _.assign(entry, {
        re: entry.re / norm,
        im: entry.im / norm,
      })
    );

  }

  /**
   * Propagate until:
   * - all probabilities go to 0
   * - iteration limit is reached
   */
  propagateToEnd(quantum = true) {
    let stepNo, lastStep;
    for (stepNo = 0; stepNo < maxIterations; ++stepNo) {
      lastStep = this.propagate(quantum);
      if (!lastStep.length) {
        break;
      }
    }
  }

  // propagation making sure that it will click at one of the detectors
  propagateToEndCheated(absAtDetByTime) {
    const totalDetection = _.sum(absAtDetByTime);
    let detectionSoFar = 0;
    let stepNo, lastStep;
    for (stepNo = 0; stepNo < absAtDetByTime.length; ++stepNo) {
      lastStep = this.propagate(true, 1 / (totalDetection - detectionSoFar ));
      detectionSoFar += absAtDetByTime[stepNo+1];
      if (!lastStep.length) {
        break;
      }
    }

  }

}
