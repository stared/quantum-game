import _ from 'lodash';

//// One-particle identity matrix looks like that:
//
// {
//   '>-': [
//     {
//       to: '>-',
//       re: 1,
//       im: 0
//     }
//   ],
//   ''>|': [
//     {
//       'to': >|',
//       're': 1,
//       'im': 0
//     }
//   ],
//   ...
// }
//
//// sm stands for 'sparse matrix', not 'sado-maso'!

export function product(sm1, sm2) {
  const result = {};

  for (let k1 of _.keys(sm1)) {
    for (let k2 of _.keys(sm2)) {
      result[k1 + k2] = [];
      const tmp = result[k1 + k2];

      for (let i1 = 0; i1 < sm1[k1].length; ++i1) {
        for (let i2 = 0; i2 < sm2[k2].length; ++i2) {
          const amp1 = sm1[k1][i1];
          const amp2 = sm2[k2][i2];
          tmp.push({
            to: amp1.to + amp2.to,  // string concatenation
            re: amp1.re * amp2.re - amp1.im * amp2.im,
            im: amp1.re * amp2.im + amp1.im * amp2.re
          });
        }
      }
    }
  }

  return result;
}

export function byConstant(sm, z) {
  // an inefficient trick by a smart but lazy programmer
  return product(sm, {'': [{to: '', re: z.re, im: z.im}]});
}

export function sum(sm1, sm2) {
  const result = {};

  _.union(_.keys(sm1), _.keys(sm2)).forEach(function (key) {
    result[key] = _.chain(sm1[key] || []).concat(sm2[key] || [])
      .groupBy('to')
      .mapValues(function (x) {
        return _.reduce(x, function (acc, y) {
          return {re: acc.re + y.re, im: acc.im + y.im};
        });
      })
      .value();
  });

  // TODO removing zeros?
  return result;
}

// Create a tensor that has the same complex number values for all indices.
export function fill(xs, re, im) {
  return _.reduce(xs, (acc, x) => {
    acc[x] = [{
      to: x,
      re: re,
      im: im,
    }];
    return acc;
  }, {});
}
