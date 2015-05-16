// require mechanics.js

Elements = {};


// a base element?

Elements.Vacuum = function () {

  // to all elements:
  // some var self = this, to get no problems in functions? 
  
  this.flavor = "Pure timespace without relativistic energy density.";

  this.g = null;
  this.name = "vacuum";
  this.type = "unitary";
  this.rotation = 0;
  this.maxRotation = 1;
  this.angleOfRotation = 360;  // just in case

  this.amplitudes = [smIdentityFull];  // copy?

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};


Elements.Source = function () {

  // to all elements:
  // some var self = this, to get no problems in functions? 
  
  this.flavor = "Photon generator.";

  this.g = null;
  this.name = "source";
  this.type = "special";
  this.rotation = 0;  // 0: > 1: ^ 2: < 3: v
  this.maxRotation = 4;
  this.angleOfRotation = 90;

  this.amplitudes = [{}, {}, {}, {}];

  this.generates = [
    [{to: '>-', re: 1, im: 0}],
    [{to: '^-', re: 1, im: 0}],
    [{to: '<-', re: 1, im: 0}],
    [{to: 'v-', re: 1, im: 0}],
  ];

  this.generateSv = function () {
    return this.generates[this.rotation];
  };

  // for now - fully transparent
  // probably I will change it into totally absorbing

  this.amplitudes = [smIdentityFull];

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};


Elements.CornerCube = function () {

  this.flavor = "Like a mirrot but cooler. It rotates you, not - reflects.";

  this.g = null;
  this.name = "corner-cube";
  this.type = "unitary";
  this.rotation = 0;
  this.maxRotation = 1;
  this.angleOfRotation = 90;

  var amplitudesDirection = [{
    '>': [{to: '<', re: 1, im: 0}],
    '^': [{to: 'v', re: 1, im: 0}],
    '<': [{to: '>', re: 1, im: 0}],
    'v': [{to: '^', re: 1, im: 0}],
  }];

  this.amplitudes = amplitudesDirection
    .map(function (each) { return smTensorProd(each, smIdentityPolarization); });
  // check it with circular polarization

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};


// magical thin mirror that is easy for implementation (no decoherence!)
Elements.ThinMirror = function () {

  this.flavor = "Works both ways [like 13]. So thin that it can serve as a pad... I mean iPad.";

  this.g = null;
  this.name = "thin-mirror";
  this.type = "unitary";
  this.rotation = 0;  // 0: - 1: / 2: | 3: \
  this.maxRotation = 4;
  this.angleOfRotation = 45;

  var amplitudesDirection =
  [
    // -
    { 
      '>': [{to: '>', re: 1, im: 0}],
      '^': [{to: 'v', re: 1, im: 0}],
      '<': [{to: '<', re: 1, im: 0}],
      'v': [{to: '^', re: 1, im: 0}],
    },
    // /
    {
      '>': [{to: '^', re: 1, im: 0}],
      '^': [{to: '>', re: 1, im: 0}],
      '<': [{to: 'v', re: 1, im: 0}],
      'v': [{to: '<', re: 1, im: 0}],
    },
    // |
    {
      '>': [{to: '<', re: 1, im: 0}],
      '^': [{to: '^', re: 1, im: 0}],
      '<': [{to: '>', re: 1, im: 0}],
      'v': [{to: 'v', re: 1, im: 0}],
    },
    // \
    {
      '>': [{to: 'v', re: 1, im: 0}],
      '^': [{to: '<', re: 1, im: 0}],
      '<': [{to: '^', re: 1, im: 0}],
      'v': [{to: '>', re: 1, im: 0}],
    },
  ];

  this.amplitudes = amplitudesDirection
    .map(function (each) { return smTensorProd(each, smReflectionPhasePolarization); });

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};

 
Elements.ThinBeamSplitter = function () {

  // it is also possible to create it as a superposition:
  // ~ (vacuum  + i * thin_mirror)
  // helpers for linear operations on sparse matrices

  this.flavor = "Making photons in two places at once. And binding them again.";

  this.g = null;
  this.name = "thin-beam-splitter";
  this.type = "unitary";
  this.rotation = 0;  // 0: - 1: / 2: | 3: \
  this.maxRotation = 4;
  this.angleOfRotation = 45;

  // TO FIX!
  var amplitudesDirection =
  [
    // -
    { 
      '>': [{to: '>', re: 1, im: 0}],
      '^': [{to: '^', re: sq2inv, im: 0}, {to: 'v', re: 0, im: sq2inv}],
      '<': [{to: '<', re: 1, im: 0}],
      'v': [{to: 'v', re: sq2inv, im: 0}, {to: '^', re: 0, im: sq2inv}],
    },
    // /
    {
      '>': [{to: '>', re: sq2inv, im: 0}, {to: '^', re: 0, im: sq2inv}],
      '^': [{to: '^', re: sq2inv, im: 0}, {to: '>', re: 0, im: sq2inv}],
      '<': [{to: '<', re: sq2inv, im: 0}, {to: 'v', re: 0, im: sq2inv}],
      'v': [{to: 'v', re: sq2inv, im: 0}, {to: '<', re: 0, im: sq2inv}],
    },
    // |
    {
      '>': [{to: '>', re: sq2inv, im: 0}, {to: '<', re: 0, im: sq2inv}],
      '^': [{to: '^', re: 1, im: 0}],
      '<': [{to: '<', re: sq2inv, im: 0}, {to: '>', re: 0, im: sq2inv}],
      'v': [{to: 'v', re: 1, im: 0}],
    },
    // \
    {
      '>': [{to: '>', re: sq2inv, im: 0}, {to: 'v', re: 0, im: sq2inv}],
      '^': [{to: '^', re: sq2inv, im: 0}, {to: '<', re: 0, im: sq2inv}],
      '<': [{to: '<', re: sq2inv, im: 0}, {to: '^', re: 0, im: sq2inv}],
      'v': [{to: 'v', re: sq2inv, im: 0}, {to: '>', re: 0, im: sq2inv}],
    },
  ];

  // damn it, this thing is not as simple;
  // the only reflected thing are reflections, not - transmittions
  // this thing with sparse linear operations would 
  this.amplitudes = amplitudesDirection
    .map(function (each) { return smTensorProd(each, smReflectionPhasePolarization); });

  // WARNING: propagation alone should not change phases

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};


Elements.PolarizingBeamSplitter = function () {

  this.flavor = "It separates ones how wave up and down from ones waving left and right.\n"
                + "Like religion-politics separation.";

  this.g = null;
  this.name = "polarizing-beam-splitter";
  this.type = "unitary";
  this.rotation = 0;  // 0: [/] 1: [\]
  this.maxRotation = 2;
  this.angleOfRotation = 90;

  // double check if this polarization
  // I assumed that - is being reflected and | just passes
  this.amplitudes =
  [
    // [/]
    {
      '>-': [{to: '^-', re: 1, im: 0}],
      '^-': [{to: '>-', re: 1, im: 0}],
      '<-': [{to: 'v-', re: 1, im: 0}],
      'v-': [{to: '<-', re: 1, im: 0}],
      '>|': [{to: '>|', re: 1, im: 0}],
      '^|': [{to: '^|', re: 1, im: 0}],
      '<|': [{to: '<|', re: 1, im: 0}],
      'v|': [{to: 'v|', re: 1, im: 0}],
    },
    // [\]
    {
      '>-': [{to: 'v-', re: 1, im: 0}],
      '^-': [{to: '<-', re: 1, im: 0}],
      '<-': [{to: '^-', re: 1, im: 0}],
      'v-': [{to: '>-', re: 1, im: 0}],
      '>|': [{to: '>|', re: 1, im: 0}],
      '^|': [{to: '^|', re: 1, im: 0}],
      '<|': [{to: '<|', re: 1, im: 0}],
      'v|': [{to: 'v|', re: 1, im: 0}],
    },
  ];

  this.transitionSm = function () {
    return this.amplitudes[this.rotation];
  };

};


// Elements.SugarSolution
//// "Vodka is a solution. But Sugar Solution is the sweetest solution."
// Elements.FaradayRotor
//// "You can go back, but it won't be the same."
// Elements.HalfWavePlate
// Elements.QuarterWavePlate
// Elements.PolarizingBeamSplitter