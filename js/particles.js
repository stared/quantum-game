import _ from 'lodash';

import {EPSILON} from './const';

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

export class Particles {
  constructor(board) {
    this.board = board;
    this.history = [];
  }
  initialize() {
    const initialState =
      _.reduce(_.range(this.board.level.width), (accI, i) => {
        return _.reduce(_.range(this.board.level.height), (accJ, j) => {
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
    this.history.push(initialState);
  }
  propagate() {
    const lastState = _.last(this.history);
    const newState = this.interact(this.displace(lastState));
    this.history.push(newState);
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
}
