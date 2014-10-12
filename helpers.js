
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


// sm stands for 'sparse matrix', not 'sado-maso'!

var transitionTensor = function (sm1, sm2) {
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

}

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

var smIdentityFull = transitionTensor(smIdentityDirection, smIdentityPolarization);

// some tests would help
