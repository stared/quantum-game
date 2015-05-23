/*global window:false*/
import _ from 'lodash';

import {EPSILON} from './const';
import {maxIterations, animationStepDuration, tileSize} from './config';
import * as print from './print';

const velocityI = {
  '>': 1,
  '^': 0,
  '<': -1,
  'v': 0,
};
const velocityJ = {
  '>': 0,
  '^': -1, // TODO when changing (i,j) to cartesian, change it to 1
  '<': 0,
  'v': 1, // TODO when changing (i,j) to cartesian, change it to -1
};

class Particle {
  constructor(i, j, to, re, im) {
    this.i = i;
    this.j = j;
    this.to = to;
    this.re = re;
    this.im = im;
  }
  get startX() {
    return tileSize * this.i + tileSize / 2;
  }
  get endX() {
    return tileSize * (this.i + velocityI[this.to[0]]) + tileSize / 2;
  }
  get startY() {
    return tileSize * this.j + tileSize / 2;
  }
  get endY() {
    return tileSize * (this.j + velocityJ[this.to[0]]) + tileSize / 2;
  }
}

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
    this.particleGroup
      .selectAll('.particle')
      .remove();
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
        transform: (d) => `translate(${d.startX},${d.startY})`
      })
      .style({
        opacity: (d) => d.re * d.re + d.im * d.im
      });
    particles
      .transition()
      .ease([0, 1])
      .duration(animationStepDuration)
      .attr('transform', (d) => `translate(${d.endX},${d.endY})`);
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
            accJ.push(new Particle(i, j, emission.to, emission.re, emission.im));
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
      const newI = entry.i + velocityI[dir];
      const newJ = entry.j + velocityJ[dir];
      return new Particle(newI, newJ, entry.to, entry.re, entry.im);
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
      // Check if particle is out of bound
      if (
           entry.i < 0 || entry.i >= this.board.level.width
        || entry.j < 0 || entry.j >= this.board.level.height
      ) {
        return acc;
      }
      const tile = this.board.tileMatrix[entry.i][entry.j];
      const transition = tile.transitionAmplitudes;
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
          acc[binKey] = new Particle(entry.i, entry.j, change.to, re, im);
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

    this.history.forEach((state) => {
      console.log(print.stateToStr(state));
    });

    if (this.particleAnimation) {
      this.particleAnimation.stop();
    }
    this.particleAnimation = new ParticleAnimation(this.history, this.board);
    this.particleAnimation.play();
  }
}
