// require mechanics.js
// require elements.js

var TILE_SIZE = 20;

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
      boardFlat.push({i: i, j: j, val: v});
    }
  }

  d3.select("svg").append("g")
    .attr("id", "board")
    .selectAll(".tile")
    .data(boardFlat)
    .enter()
      .append("rect")
        .attr("class", "tile")
        .attr("width", 0.95 * TILE_SIZE)
        .attr("height", 0.95 * TILE_SIZE)
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
        console.log('i', i, 'j', j, 'el', el);
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

};


// as of now - only single particle interactions
Board.prototype.statePropagate = function () {

  var stateSpatial0 = this.stateSpatial;
  var stateSpatial = [];

  // _.chain(stateSpatial0)
  //   .groupBy(function (each) { return [each.i, each.j].join(" "); })
  //   .map(function ())



  // _.groupBy(this.stateSpatial, function (vIn) {
  //   vIn 
  // })

}



