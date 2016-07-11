import _ from 'lodash';

/**
 * Tensor - mathematically it corresponds to sparse matrices.
 * In JS, it's made of map of maps.
 */
export class Tensor {
  constructor(map) {
    this.map = map;
  }

  static fromObject(object) {
    const map = new Map(null);
    for (let [key, value] of _.toPairs(object)) {
      map.set(key, new Map(_.toPairs(value)));
    }
    return new Tensor(map);
  }

  static product(t1, t2) {
    const outerMap = new Map(null);

    for (let [k1, v1] of t1.map) {
      for (let [k2, v2] of t2.map) {
        const innerMap = new Map(null);

        for (let [i1, w1] of v1) {
          for (let [i2, w2] of v2) {
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

  product(t) {
    return Tensor.product(this, t);
  }

  static byConstant(t1, z) {
    return Tensor.product(t1, Tensor.fromObject(
      {'': {'': {re: z.re, im: z.im}}}
    ));
  }

  byConstant(z) {
    return Tensor.byConstant(this, z);
  }

  static sum(t1, t2) {
    const outerMap = new Map(null);
    const outerKeys = new Set([
      ...t1.map.keys(),
      ...t2.map.keys(),
    ]);
    for (let outerKey of outerKeys) {
      const innerMap = new Map(null);
      const sourceMaps = _.compact([
        t1.map.get(outerKey),
        t2.map.get(outerKey)]
      );
      for (let sourceMap of sourceMaps) {
        for (let [innerKey, innerValue] of sourceMap) {
          if (innerMap.has(innerKey)) {
            const existing = innerMap.get(innerKey);
            innerValue.re += existing.re;
            innerValue.im += existing.im;
          }
          innerMap.set(innerKey, innerValue);
        }
      }
      outerMap.set(outerKey, innerMap);
    }
    return new Tensor(outerMap);
  }

  static sumList(ts) {
    return ts.reduce((acc, t) => Tensor.sum(acc, t));
  }

  sum(t) {
    return Tensor.sum(this, t);
  }

  static fill(keys, value) {
    const outerMap = new Map(null);
    for (let key of keys) {
      const innerMap = new Map(null);
      innerMap.set(key, value);
      outerMap.set(key, innerMap);
    }
    return new Tensor(outerMap);
  }
}
