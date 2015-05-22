/*global window:false*/
import _ from 'lodash';

import {EPSILON} from './const';
import {maxIterations, animationStepDuration, tileSize} from './config';

const displacementX = {
  '>': 1,
  '^': 0,
  '<': -1,
  'v': 0,
};
const displacementY = {
  '>': 0,
  '^': 1,
  '<': 0,
  'v': -1,
};

class ParticleAnimation {
  constructor(history, board) {
    this.history = history;
    this.board = board;
    this.stepNo = 0;
    this.particleGroup = this.board.svg
      .select('.particles');
    this.currentTimeout = 0;
  }
  stop() {
    window.clearTimeout(this.currentTimeout);
  }
  play() {
    this.nextFrame();
  }
  nextFrame() {
    this.updateParticles();
    this.stepNo++;
    if (this.stepNo < this.history.length - 1) {
      this.currentTimeout = window.setTimeout(
        this.nextFrame.bind(this),
        animationStepDuration
      );
    }
  }
  updateParticles() {
    const particles = this.particleGroup
      .selectAll('.particle')
      .data(this.history[this.stepNo]);
    particles
      .exit()
      .remove();
    particles
      .enter()
      .append('use')
      .attr({
        'xlink:href': '#particle',
        'class': 'particle'
      });
    particles
      .attr({
        transform: (d) => `translate(${d.i * tileSize + tileSize / 2},${d.j * tileSize + tileSize / 2})`
      });
  }
}

export class Particles {
  constructor(board) {
    this.board = board;
    this.history = [];
  }

  /**
   * Clear history and make it one-element list
   * containing initial particles state.
   */
  initialize() {
    const initialState =
      _.reduce(_.range(this.board.level.width), (accI, i) => {
        return _.reduce(_.range(this.board.level.height), (accJ, j) => {
          // Recognize generating tiles by having 'generation' method
          if (!this.board.tileMatrix[i][j].type.generation) {
            return accJ;
          }
          const emissions =
            this.board.tileMatrix[i][j].type.generation(
              this.board.tileMatrix[i][j].rotation
            );
          _.forEach(emissions, (emission) => {
            accJ.push({
              i: i,
              j: j,
              to: emission.to,
              re: emission.re,
              im: emission.im,
            });
          });
          return accJ;
        }, accI);
      }, []);
    this.history = [initialState];
  }

  /**
   * Make one propagation step and save it in history.
   * Additionally, return it.
   */
  propagate() {
    const lastState = _.last(this.history);
    const newState = this.interact(this.displace(lastState));
    this.history.push(newState);
    return newState;
  }

  /**
   * Creates a new state basing on input state, with particles
   * moved according to their directions.
   */
  displace(state) {
    return _.map(state, (entry) => {
      // 'to' value = direction + polarization
      const dir = entry.to[0];
      return {
        i: entry.i + displacementX[dir],
        j: entry.j + displacementY[dir],
        to: entry.to,
        re: entry.re,
        im: entry.im,
      };
    });
  }

  /**
   * Creates a new state basing on input state, applying probability
   * function changes from tiles' interactions.
   */
  interact(state) {
    // Collect all transitions into bins. Each bin will be labeled
    // with position (i, j) and momentum direction.
    const bins = _.reduce(state, (acc, entry) => {
      const tile = this.board.tileMatrix[entry.i][entry.j];
      const transition = tile.type.transition(tile.rotation);
      _.each(transition[entry.to], (change) => {
        const binKey = [entry.i, entry.j, change.to].join('_');
        // (a + bi)(c + di) = (ac - bd) + i(ad + bc)
        const re = entry.re * change.re - entry.im * change.im;
        const im = entry.re * change.im + entry.im * change.re;
        // Add to bin
        if (_.has(acc, binKey)) {
          acc[binKey].re += re;
          acc[binKey].im += im;
        } else {
          acc[binKey] = {
            i: entry.i,
            j: entry.j,
            to: change.to,
            re: re,
            im: im,
          };
        }
      });
      return acc;
    }, {});
    // Remove keys; filter out zeroes
    return _.values(bins).filter((entry) =>
      entry.re * entry.re + entry.im * entry.im > EPSILON
    );
  }

  /**
   * Propagate until:
   * - all probabilities go to 0
   * - iteration limit is reached
   */
  propagateToEnd() {
    let stepNo, lastStep;
    for (stepNo = 0; stepNo < maxIterations; ++stepNo) {
      lastStep = this.propagate();
      if (!lastStep.length) {
        break;
      }
    }
  }

  /**
   * Generate history and play animation.
   */
  play() {
    this.initialize();
    this.propagateToEnd();
    if (this.particleAnimation) {
      this.particleAnimation.stop();
    }
    this.particleAnimation = new ParticleAnimation(this.history, this.board);
    this.particleAnimation.play();
  }
}
