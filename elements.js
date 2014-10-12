// require helpers.js


Elements = {};


Elements.Free = function () {
  
  this.g = null;
  this.name = "free";
  this.type = "unitary";
  this.rotation = 0;

  this.rotate = function () {
    console.log("Element " + this.name + " is not rotable!");
  };

  this.draw = function () {};

  this.amplitudes = [smIdentityFull];  // copy?

}


Elements.CornerCube = function () {

  this.g = null;
  this.name = "corner_cube";
  this.type = "unitary";
  this.rotation = 0;

  this.rotate = function () {
    console.log("Element " + this.name + " is not rotable!");
  };

  this.draw = function () {};

  var amplitudesDirection = [{
    '>': [{to: '<', re: 1, im: 0}],
    '^': [{to: 'v', re: 1, im: 0}],
    '<': [{to: '>', re: 1, im: 0}],
    'v': [{to: '^', re: 1, im: 0}],
  }];

  this.amplitudes = amplitudesDirection
    .map(function (each) { return transitionTensor(each, smIdentityPolarization); });
  // check it with circular polarization

}


// magical thin mirror that is easy for implementation (no decoherence!)
Elements.ThinMirror = function () {

  // some var self = this, to get no problems in functions? 

  this.g = null;
  this.name = "mirror";
  this.type = "unitary";
  this.rotation = 0;  // 0: - 1: / 2: | 3: \

  this.rotate = function () {
    this.rotation = (this.rotation + 1) % 4;
  };

  this.draw = function () {};

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
    .map(function (each) { return transitionTensor(each, smReflectionPhasePolarization); });


}

// Elements.SugarSolution
////
// Elements.FaradayRotor
// Elements.HalfWavePlate
// Elements.QuarterWavePlate
// Elements.PolarizingBeamSplitter