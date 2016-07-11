/*global describe:false, it:false, expect:false*/
import * as full from './full';
import _ from 'lodash';

function probability(entry) {
  return entry.re * entry.re + entry.im * entry.im;
}

const subspaceAll = ['>-', '>|', '^-', '^|', '<-', '<|', 'v-', 'v|'];
const subspaceDirWE = ['>-', '>|', '<-', '<|'];
const subspaceDirNS = ['^-', '^|', 'v-', 'v|'];

// calculates norm of a random unit vector within a subspace
function matrixNormOnRandomVector(matrix, subspace = subspaceAll) {
  const inputVector = subspace.map((key) => [key, {re: Math.random(), im: Math.random()}]);
  const norm = _.sumBy(inputVector, (input) => probability(input[1]));
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

  return _(outputVector).values().map(probability).sum() / norm;
}


describe('identity', () => {

  it('is unitary', () => {
    expect(matrixNormOnRandomVector(full.identity.map)).toBeCloseTo(1, 5);
  });

});


describe('zero', () => {

  it('absorbs all', () => {
    expect(matrixNormOnRandomVector(full.zero.map)).toBeCloseTo(0, 5);
  });

});


describe('thinMirror', () => {

  it('should consist of 4 tensors', () => {
    expect(full.thinMirror.length).toBe(4);
  });

  it('diagonal orientations should consist of unitary tensors', () => {
    expect(matrixNormOnRandomVector(full.thinMirror[1].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.thinMirror[3].map)).toBeCloseTo(1, 5);
  });

  it('| and - orientations should be unitary for perpendicular directions', () => {

    expect(matrixNormOnRandomVector(
      full.thinMirror[0].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinMirror[2].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

  });

});


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
      full.thinSplitter[0].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinSplitter[2].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

  });

});


describe('thinSplitterCoated', () => {

  it('should consist of 8 tensors', () => {
    expect(full.thinSplitterCoated.length).toBe(8);
  });

  it('diagonal orientations should consist of unitary tensors', () => {
    expect(matrixNormOnRandomVector(full.thinSplitterCoated[1].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.thinSplitterCoated[3].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.thinSplitterCoated[5].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.thinSplitterCoated[7].map)).toBeCloseTo(1, 5);
  });

  it('| and - orientations should be unitary for perpendicular directions', () => {

    expect(matrixNormOnRandomVector(
      full.thinSplitterCoated[0].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinSplitterCoated[2].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinSplitterCoated[4].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.thinSplitterCoated[6].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

  });

});


describe('polarizingSplitter', () => {

  it('should consist of 2 tensors', () => {
    expect(full.polarizingSplitter.length).toBe(2);
  });

  it('should consist of unitary tensors', () => {
    expect(matrixNormOnRandomVector(full.polarizingSplitter[0].map)).toBeCloseTo(1, 5);
    expect(matrixNormOnRandomVector(full.polarizingSplitter[1].map)).toBeCloseTo(1, 5);
  });

});


describe('polarizerNS', () => {

  it('should consist of 4 tensors', () => {
    expect(full.polarizerNS.length).toBe(4);
  });

  it('WE directions should be zero', () => {

    full.polarizerNS.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirWE
      )).toBeCloseTo(0, 5);
    });

  });

});


describe('polarizerWE', () => {

  it('should consist of 4 tensors', () => {
    expect(full.polarizerWE.length).toBe(4);
  });

  it('NS directions should be zero', () => {

    full.polarizerWE.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirNS
      )).toBeCloseTo(0, 5);
    });

  });

});


describe('quarterWavePlateNS', () => {

  it('should consist of 4 tensors', () => {
    expect(full.quarterWavePlateNS.length).toBe(4);
  });

  it('should consist of unitary tensors for NS', () => {

    full.quarterWavePlateNS.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirNS
      )).toBeCloseTo(1, 5);
    });

  });

  it('WE directions should be zero', () => {

    full.quarterWavePlateNS.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirWE
      )).toBeCloseTo(0, 5);
    });

  });

});


describe('quarterWavePlateWE', () => {

  it('should consist of 4 tensors', () => {
    expect(full.quarterWavePlateWE.length).toBe(4);
  });

  it('should consist of unitary tensors for WE', () => {

    full.quarterWavePlateWE.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirWE
      )).toBeCloseTo(1, 5);
    });

  });

  it('NS directions should be zero', () => {

    full.quarterWavePlateWE.forEach((tensor) => {
      expect(matrixNormOnRandomVector(
        tensor.map, subspaceDirNS
      )).toBeCloseTo(0, 5);
    });

  });

});


describe('sugarSolution', () => {

  it('should be a unitary tensor', () => {

    expect(matrixNormOnRandomVector(
      full.sugarSolution.map
    )).toBeCloseTo(1, 5);

  });

});


describe('doubleSugarSolution', () => {

  it('should be a unitary tensor', () => {

    expect(matrixNormOnRandomVector(
      full.doubleSugarSolution.map
    )).toBeCloseTo(1, 5);

  });

});


describe('glass', () => {

  it('should be a unitary tensor', () => {

    expect(matrixNormOnRandomVector(
      full.glass.map
    )).toBeCloseTo(1, 5);

  });

});


describe('vacuumJar', () => {

  it('should be a unitary tensor', () => {

    expect(matrixNormOnRandomVector(
      full.vacuumJar.map
    )).toBeCloseTo(1, 5);

  });

});


describe('absorber', () => {

  it('should absorb 50%', () => {

    expect(matrixNormOnRandomVector(
      full.absorber.map
    )).toBeCloseTo(0.5, 5);

  });

});


describe('faradayRotator', () => {

  it('should consist of 4 tensors', () => {
    expect(full.faradayRotator.length).toBe(4);
  });

  it('unitary along its orientation', () => {

    expect(matrixNormOnRandomVector(
      full.faradayRotator[0].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[1].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[2].map, subspaceDirWE
    )).toBeCloseTo(1, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[3].map, subspaceDirNS
    )).toBeCloseTo(1, 5);

  });

  it('absorbing in the perpendicular direction', () => {

    expect(matrixNormOnRandomVector(
      full.faradayRotator[0].map, subspaceDirNS
    )).toBeCloseTo(0, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[1].map, subspaceDirWE
    )).toBeCloseTo(0, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[2].map, subspaceDirNS
    )).toBeCloseTo(0, 5);

    expect(matrixNormOnRandomVector(
      full.faradayRotator[3].map, subspaceDirWE
    )).toBeCloseTo(0, 5);

  });

});
