import _ from 'lodash';
import type { ComplexNumber } from '../types';

// Type for tensor object representation (before conversion to Tensor)
export interface TensorObject {
  [outerKey: string]: {
    [innerKey: string]: ComplexNumber;
  };
}

/**
 * Tensor - mathematically it corresponds to sparse matrices.
 * In TypeScript, it's made of Map of Maps with proper typing.
 */
export class Tensor {
  map: Map<string, Map<string, ComplexNumber>>;

  constructor(map: Map<string, Map<string, ComplexNumber>>) {
    this.map = map;
  }

  static fromObject(object: TensorObject): Tensor {
    const map = new Map<string, Map<string, ComplexNumber>>();
    for (const [key, value] of _.toPairs(object)) {
      map.set(key, new Map(_.toPairs(value)));
    }
    return new Tensor(map);
  }

  static product(t1: Tensor, t2: Tensor): Tensor {
    const outerMap = new Map<string, Map<string, ComplexNumber>>();

    for (const [k1, v1] of t1.map) {
      for (const [k2, v2] of t2.map) {
        const innerMap = new Map<string, ComplexNumber>();

        for (const [i1, w1] of v1) {
          for (const [i2, w2] of v2) {
            innerMap.set(
              `${i1}${i2}`,
              {
                re: w1.re * w2.re - w1.im * w2.im,
                im: w1.re * w2.im + w1.im * w2.re,
              }
            );
          }
        }

        outerMap.set(`${k1}${k2}`, innerMap);
      }
    }
    return new Tensor(outerMap);
  }

  product(t: Tensor): Tensor {
    return Tensor.product(this, t);
  }

  static byConstant(t1: Tensor, z: ComplexNumber): Tensor {
    return Tensor.product(t1, Tensor.fromObject(
      {'': {'': {re: z.re, im: z.im}}}
    ));
  }

  byConstant(z: ComplexNumber): Tensor {
    return Tensor.byConstant(this, z);
  }

  static sum(t1: Tensor, t2: Tensor): Tensor {
    const outerMap = new Map<string, Map<string, ComplexNumber>>();
    const outerKeys = new Set([
      ...t1.map.keys(),
      ...t2.map.keys(),
    ]);

    for (const outerKey of outerKeys) {
      const innerMap = new Map<string, ComplexNumber>();
      const sourceMaps = _.compact([
        t1.map.get(outerKey),
        t2.map.get(outerKey),
      ]);

      for (const sourceMap of sourceMaps) {
        for (const [innerKey, innerValue] of sourceMap) {
          if (innerMap.has(innerKey)) {
            const existing = innerMap.get(innerKey);
            if (existing) {
              innerValue.re += existing.re;
              innerValue.im += existing.im;
            }
          }
          innerMap.set(innerKey, innerValue);
        }
      }
      outerMap.set(outerKey, innerMap);
    }
    return new Tensor(outerMap);
  }

  static sumList(ts: Tensor[]): Tensor {
    return ts.reduce((acc, t) => Tensor.sum(acc, t));
  }

  sum(t: Tensor): Tensor {
    return Tensor.sum(this, t);
  }

  static fill(keys: string[], value: ComplexNumber): Tensor {
    const outerMap = new Map<string, Map<string, ComplexNumber>>();
    for (const key of keys) {
      const innerMap = new Map<string, ComplexNumber>();
      innerMap.set(key, value);
      outerMap.set(key, innerMap);
    }
    return new Tensor(outerMap);
  }
}
