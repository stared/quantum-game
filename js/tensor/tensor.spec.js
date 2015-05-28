/*global describe:false, it:false, expect:false*/
import {Tensor} from './tensor';

describe('Tensor', () => {
  it('should create tensors from objects', () => {
    const obj = {A: {A: {re: 1, im: 0}}};
    const t = Tensor.fromObject(obj);
    expect(t instanceof Tensor).toBe(true);
    expect(t.map instanceof Map).toBe(true);
    expect(t.map.get('A') instanceof Map).toBe(true);
    expect(t.map.get('A').get('A')).toEqual({re: 1, im: 0});
  });
});

describe('Tensor.product', () => {
  it('should multiply sparse matrices', () => {
    const first = Tensor.fromObject({
      A: {
        A: {re: 1, im: 0},
        B: {re: 2, im: 3},
      },
      B: {
        B: {re: -1, im: 0},
        C: {re: 2, im: 3},
      },
    });
    const second = Tensor.fromObject({
      a: {
        a: {re: 1, im: 0},
        b: {re: 2, im: 3},
      },
      b: {
        a: {re: -1, im: 0},
        b: {re: 2, im: 3},
      },
    });
    const product = Tensor.fromObject({
      Aa: {
        Aa: {re: 1, im: 0},
        Ab: {re: 2, im: 3},
        Ba: {re: 2, im: 3},
        Bb: {re: -5, im: 12},
      },
      Ab: {
        Aa: {re: -1, im: 0},
        Ab: {re: 2, im: 3},
        Ba: {re: -2, im: -3},
        Bb: {re: -5, im: 12},
      },
      Ba: {
        Aa: {re: -1, im: 0},
        Ab: {re: -2, im: -3},
        Ba: {re: 2, im: 3},
        Bb: {re: -5, im: 12},
      },
      Bb: {
        Aa: {re: 1, im: -0},
        Ab: {re: -2, im: -3},
        Ba: {re: -2, im: -3},
        Bb: {re: -5, im: 12},
      },
    });
    expect(Tensor.product(first, second)).toEqual(product);
    expect(first.product(second)).toEqual(product);
  });
});

describe('Tensor.byConstant', () => {
  it('should multiply matrix by constant', () => {
    const matrix = Tensor.fromObject({
      A: {
        A: {re: 1, im: 0},
        B: {re: 2, im: 3},
      },
      B: {
        B: {re: -1, im: 0},
        C: {re: 2, im: 3},
      },
    });
    const factor = {re: 1, im: 1};
    const product = Tensor.fromObject({
      A: {
        A: {re: 1, im: 1},
        B: {re: -1, im: 5},
      },
      B: {
        B: {re: -1, im: -1},
        C: {re: 5, im: -1},
      },
    });
    expect(Tensor.byConstant(matrix, factor)).toEqual(product);
    expect(matrix.byConstant(factor)).toEqual(product);
  });
});

describe('Tensor.sum', () => {
  it('should add sparse matrices', () => {
    const first = Tensor.fromObject({
      A: {
        A: {re: 1, im: 0},
        B: {re: 2, im: 3},
      },
      B: {
        B: {re: -1, im: 0},
        C: {re: 2, im: 3},
      },
    });
    const second = Tensor.fromObject({
      B: {
        A: {re: 1, im: 0},
        B: {re: 2, im: 3},
      },
      C: {
        B: {re: -1, im: 0},
      },
    });
    const sum = Tensor.fromObject({
      A: {
        A: {re: 1, im: 0},
        B: {re: 2, im: 3},
      },
      B: {
        A: {re: 1, im: 0},
        B: {re: 1, im: 3},
        C: {re: 2, im: 3},
      },
      C: {
        B: {re: -1, im: 0},
      },
    });
    expect(Tensor.sum(first, second)).toEqual(sum);
    expect(first.sum(second)).toEqual(sum);
  });
});

describe('Tensor.fill', () => {
  it('should fill matrix with a value', () => {
    const value = {re: 1, im: 0};
    const keys = ['A', 'B', 'C'];
    const filled = Tensor.fromObject({
      A: {A: value},
      B: {B: value},
      C: {C: value},
    });
    expect(Tensor.fill(keys, value)).toEqual(filled);
  });
});
