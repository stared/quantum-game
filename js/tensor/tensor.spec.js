/*global describe:false, it:false, expect:false*/
import * as tensor from './tensor';

describe('product', () => {
  it('should multiply sparse matrices', () => {
    const first = {
      A: [
        {to: 'A', re: 1, im: 0},
        {to: 'B', re: 2, im: 3},
      ],
      B: [
        {to: 'B', re: -1, im: 0},
        {to: 'C', re: 2, im: 3},
      ],
    };
    const second = {
      a: [
        {to: 'a', re: 1, im: 0},
        {to: 'b', re: 2, im: 3},
      ],
      b: [
        {to: 'a', re: -1, im: 0},
        {to: 'b', re: 2, im: 3},
      ],
    };
    const product = {
      Aa: [
        {to: 'Aa', re: 1, im: 0},
        {to: 'Ab', re: 2, im: 3},
        {to: 'Ba', re: 2, im: 3},
        {to: 'Bb', re: -5, im: 12},
      ],
      Ab: [
        {to: 'Aa', re: -1, im: 0},
        {to: 'Ab', re: 2, im: 3},
        {to: 'Ba', re: -2, im: -3},
        {to: 'Bb', re: -5, im: 12},
      ],
      Ba: [
        {to: 'Ba', re: -1, im: 0},
        {to: 'Bb', re: -2, im: -3},
        {to: 'Ca', re: 2, im: 3},
        {to: 'Cb', re: -5, im: 12},
      ],
      Bb: [
        {to: 'Ba', re: 1, im: -0},
        {to: 'Bb', re: -2, im: -3},
        {to: 'Ca', re: -2, im: -3},
        {to: 'Cb', re: -5, im: 12},
      ],
    };
    expect(tensor.product(first, second)).toEqual(product);
  });
});

describe('product', () => {
  it('should multiply matrix by constant', () => {
    const matrix = {
      A: [
        {to: 'A', re: 1, im: 0},
        {to: 'B', re: 2, im: 3},
      ],
      B: [
        {to: 'B', re: -1, im: 0},
        {to: 'C', re: 2, im: -3},
      ],
    };
    const factor = {re: 1, im: 1};
    const product = {
      A: [
        {to: 'A', re: 1, im: 1},
        {to: 'B', re: -1, im: 5},
      ],
      B: [
        {to: 'B', re: -1, im: -1},
        {to: 'C', re: 5, im: -1},
      ],
    };
    expect(tensor.byConstant(matrix, factor)).toEqual(product);
  });
});

describe('sum', () => {
  it('should add sparse matrices', () => {
    const first = {
      A: [
        {to: 'A', re: 1, im: 0},
        {to: 'B', re: 2, im: 3},
      ],
      B: [
        {to: 'B', re: -1, im: 0},
        {to: 'C', re: 2, im: 3},
      ],
    };
    const second = {
      B: [
        {to: 'A', re: 1, im: 0},
        {to: 'B', re: 2, im: 3},
      ],
      C: [
        {to: 'B', re: -1, im: 0},
      ],
    };
    const sum = {
      A: [
        {to: 'A', re: 1, im: 0},
        {to: 'B', re: 2, im: 3},
      ],
      B: [
        // As long as we use Arrays instead of Sets, order matters
        {to: 'B', re: 1, im: 3},
        {to: 'C', re: 2, im: 3},
        {to: 'A', re: 1, im: 0},
      ],
      C: [
        {to: 'B', re: -1, im: 0},
      ],
    };
    expect(tensor.sum(first, second)).toEqual(sum);
  });
});
