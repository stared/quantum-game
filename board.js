// require mechanics.js
// require elements.js

var TILE_SIZE = 40;

var i2x = function (i) { return TILE_SIZE/2 + TILE_SIZE * i; }
var j2y = function (j) { return TILE_SIZE/2 + TILE_SIZE * j; }

var x2i = function (x) { return Math.floor(x / TILE_SIZE); }
var y2j = function (y) { return Math.floor(y / TILE_SIZE); }

function Board (nX, nY) {

  this.nX = nX;
  this.nY = nY;

  var i, j;

  // or sparse representation
  this.board = [];

  for (i = 0; i < nX; i++) {
    this.board[i] = [];
    for (j = 0; j < nY; j++) {
      this.board[i][j] = new Elements.Vacuum();
    }
  }

  this.stateSpatial = [];

  for (i = 0; i < nX; i++) {
    this.stateSpatial[i] = [];
    for (j = 0; j < nY; j++) {
      this.stateSpatial[i][j] = {};
    }
  }

}

Board.prototype.draw = function () {

  var i, j, v, s;
  var boardFlat = [];
  
  for (i = 0; i < this.nX; i++) {
    for (j = 0; j < this.nY; j++) {
      v = this.board[i][j];
      if (v instanceof Elements.Vacuum) {
        continue;
      }
      boardFlat.push({i: i, j: j, val: v});
    }
  }

  d3.select("svg").append("g")
    .attr("id", "board")
    .selectAll(".tile")
    .data(boardFlat)
    .enter()
      .append("use")
        .attr("xlink:href", function (d) { return "#" + d.val.name; })
        .attr("class", "tile")
        .attr("width", 0.5 * TILE_SIZE)
        .attr("height", 0.5 * TILE_SIZE)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", function (d) { return i2x(d.i); })
        .attr("y", function (d) { return j2y(d.j); });

}


// only single photon sources
Board.prototype.stateInit = function () {

  var sources = 0;

  this.stateSpatial = [];

  var stateSpatial = this.stateSpatial;  // this issue

  _.forEach(this.board, function (col, i) {
    _.forEach(col, function (el, j) {
      if (el.name === 'source') {
        sources += 1;
        _.forEach(el.generateSv(), function (out) {
          stateSpatial.push({
            i:  i,
            j:  j,
            to: out.to,  // for more particles, more things will go it 'to'
            re: out.re,
            im: out.im
          })
        })
      }
    });
  });

  if (sources > 1) {
    console.log("As of now only one source, sorry.");
  }

  console.log("stateSpatial", this.stateSpatial);

};


// as of now - only single particle interactions
// as of now - very inefficient (I should query elements only once)
// as of now - without absorption
Board.prototype.statePropagate = function () {

  var board = this.board;
  var stateSpatial0 = this.stateSpatial;
  var stateSpatialDict = {};

  var keyOut, diffRe, diffIm;

  stateSpatial0 = _.map(stateSpatial0, function (stateIn) {
    stateIn.i += speedX[stateIn.to[0]];
    stateIn.j += speedY[stateIn.to[0]];
    return stateIn;
  });

  _.forEach(stateSpatial0, function (stateIn) {
    
    var transitionAmps = board[stateIn.i][stateIn.j].transitionSm();
    
    _.forEach(transitionAmps[stateIn.to], function (out) {

      keyOut = [stateIn.i, stateIn.j, out.to].join("_");
      diffRe = stateIn.re * out.re - stateIn.im * out.im;
      diffIm = stateIn.re * out.im + stateIn.im * out.re;
      
      if (out.to in stateSpatialDict) {
        stateSpatialDict[keyOut].re += diffRe
        stateSpatialDict[keyOut].im += diffIm;

      } else {
        stateSpatialDict[keyOut] = {i:  stateIn.i,
                                    j:  stateIn.j,
                                    to: out.to,
                                    re: diffRe,
                                    im: diffIm};
      }

    });

  });

  this.stateSpatial = _.values(stateSpatialDict)
    .filter(function (state) { return Math.pow(state.re, 2) + Math.pow(state.im, 2) > 1e-5; });

  console.log("new stateSpatial", this.stateSpatial);

}
