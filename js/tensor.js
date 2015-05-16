import _ from 'lodash';

const EPSILON = 1e-5;

export function product(sm1, sm2) {
  const result = {};
  let k1, k2, i1, i2;
  var tmp;

  for (k1 of sm1) {
    for (k2 of sm2) {
      result[k1 + k2] = [];
      tmp = result[k1 + k2];

      for (i1 = 0; i1 < sm1[k1].length; ++i1) {
        for (i2 = 0; i2 < sm2[k2].length; ++i2) {
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

export function propagateState(state0, transitionSm) {
  const state = {},
        absorptionProbs = {};
  let absorptionProb;

  _.forEach(state0, function (v0, k0) {
    absorptionProb = Math.pow(v0.re, 2) + Math.pow(v0.im, 2);

    // TODO we should return some {state, absorptionProbs} here
    if (!transitionSm[k0]) return;

    _.forEach(transitionSm[k0], function (out) {
      const diffRe = v0.re * out.re - v0.im * out.im;
      const diffIm = v0.re * out.im + v0.im * out.re;
      if (_.has(state, out.to)) {
        state[out.to].re += diffRe;
        state[out.to].im += diffIm;
        // TODO purging zero probs here or later?
        // TODO or maybe reducing only in the last step?
      } else {
        state[out.to] = {re: diffRe, im: diffIm};
      }
      absorptionProb -= Math.pow(diffRe, 2) + Math.pow(diffIm, 2);
    });

    if (absorptionProb > EPSILON) {
      absorptionProbs[k0] = absorptionProb;
    }
  });

  return {
    state: state,
    absorptionProbs: absorptionProbs
  };
}

