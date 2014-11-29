
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

// abstracting complex numbers?

// arrays or objects in the last point?


// sm stands for 'sparse matrix', not 'sado-maso'!

var smTensorProd = function (sm1, sm2) {
  var sm = {};
  var k1, k2, i1, i2, amp1, amp2;
  var tmp;

  for (k1 in sm1) {
    for (k2 in sm2) {

      sm[k1 + k2] = [];
      tmp = sm[k1 + k2];

      for (i1 = 0; i1 < sm1[k1].length; i1++) {
        for (i2 = 0; i2 < sm2[k2].length; i2++) {

          amp1 = sm1[k1][i1];
          amp2 = sm2[k2][i2];
          
          tmp.push({
            to: amp1.to + amp2.to,  // string concatenation
            re: amp1.re * amp2.re - amp1.im * amp2.im,
            im: amp1.re * amp2.im + amp1.im * amp2.re
          });

        }
      }

    }
  }

  return sm;

};


var smSum = function (sm1, sm2) {

  var sm = {};

  _.union(_.keys(sm1), _.keys(sm2)).forEach(function (kIn) {
    
    sm[kIn] = _.chain(sm1[kIn] || []).concat(sm2[kIn] || [])
      .groupBy('to')
      .mapValues(function (x) {
        return _.reduce(x, function (acc, y) {
          return {re: acc.re + y.re, im: acc.im + y.im};
        });
      })
      .value();

  }); 

  // removing zeros?

  return sm;

};


var smMultiplyZ = function (sm, z) {
  // an inefficient trick by a smart but lazy programmer
  return smTensorProd(sm, {'': [{to: '', re: z.re, im: z.im}]});
};


var smPropagateState = function (state0, transitionSm) {
  var state = {};
  var absorptionProbs = {};
  var absorptionProb, diffRe, diffIm;

  _.forEach(state0, function (v0, k0) {

    absorptionProb = Math.pow(v0.re, 2) + Math.pow(v0.im, 2);
    
    if (!transitionSm[k0]) return;

    _.forEach(transitionSm[k0], function (out) {

      diffRe = v0.re * out.re - v0.im * out.im;
      diffIm = v0.re * out.im + v0.im * out.re;
      
      if (out.to in state) {
        state[out.to].re += diffRe
        state[out.to].im += diffIm;
        // purging zero probs here or later?
        // or maybe reducing only in the last step?
      } else {
        state[out.to] = {re: diffRe, im: diffIm};
      }

      absorptionProb -=  Math.pow(diffRe, 2) + Math.pow(diffIm, 2);

    });

    if (absorptionProb > e-5) {
      absorptionProbs[k0] = absorptionProb;
    }


  });

  return {state: state, absorptionProbs: absorptionProbs};

};



//
// Some constants
//


// the most fundamental constant in QM
var sq2inv = 1/Math.sqrt(2);

var rotateCW = {
  '>': '^',
  '^': '<',
  '<': 'v',
  'v': '>',
};

var smIdentityDirection = {
  '>': [{to: '>', re: 1, im: 0}],
  '^': [{to: '^', re: 1, im: 0}],
  '<': [{to: '<', re: 1, im: 0}],
  'v': [{to: 'v', re: 1, im: 0}],
};

var smIdentityPolarization = {
  '-': [{to: '-', re: 1, im: 0}],
  '|': [{to: '|', re: 1, im: 0}],
};

var smReflectionPhasePolarization = {
  '-': [{to: '-', re: -1, im: 0}],
  '|': [{to: '|', re: 1, im: 0}],
};

var smIdentityFull = smTensorProd(smIdentityDirection, smIdentityPolarization);

// some tests would help
