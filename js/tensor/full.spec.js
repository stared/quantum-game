/*global describe:false, it:false, expect:false*/
import * as full from './full';
import _ from 'lodash';

function probability(entry) {
  return entry.re * entry.re + entry.im * entry.im;
}

const subspaceAll = ['>-', '>|', '^-', '^|', '<-', '<|', 'v-', 'v|'];
const subspaceDirHorizontal = ['>-', '>|', '<-', '<|'];
const subspaceDirVertical = ['^-', '^|', 'v-', 'v|'];

// calculates norm of a random unit vector within a subspace
function matrixNormOnRandomVector(matrix, subspace = subspaceAll) {
  const inputVector = subspace.map((key) => [key, {re: Math.random(), im: Math.random()}]);
  const norm = _.sum(inputVector, (input) => probability(input[1]));
  const outputVector = {};
  let zIn;
  inputVector.forEach((input) => {
    zIn = input[1];
    matrix.get(input[0]).forEach((zOut, keyOut) => {
      if (!_.has(outputVector, keyOut)) {
        outputVector[keyOut] = {re: 0, im: 0};
      }
      outputVector[keyOut].re += zIn.re * zOut.re - zIn.im * zOut.im;
      outputVector[keyOut].im += zIn.re * zOut.im + zIn.im * zOut.re;
    });
  });

  return _.sum(outputVector, probability) / norm;
}


describe('thinSplitter', () => {

  it('should consist of 4 tensors', () => {
    expect(full.thinSplitter.length).toBe(4);
  });

  it('diagonal orientations should consist of unitary tensors', () => {
    expect(matrixNormOnRandomVector(full.thinSplitter[1].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.thinSplitter[3].map)).toBeCloseTo(1, 5);
  });

  it('| and - orientations should be unitary for perpendicular directions', () => {

    expect(matrixNormOnRandomVector(
      full.thinSplitter[0].map, subspaceDirVertical
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinSplitter[2].map, subspaceDirHorizontal
    )).toBeCloseTo(1, 5);

  });

});
