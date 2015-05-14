// require mechanics.js
// require elements.js

var TILE_SIZE = 80;

var i2x = function (i) { return TILE_SIZE * i; }
var j2y = function (j) { return TILE_SIZE * j; }

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
      this.board[i][j] = Math.random() > 0.9 ? new Elements.PolarizingBeamSplitter() : new Elements.Vacuum();
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

Board.prototype.drawBackground = function () {
  var boardFlat = [];
  var i, j;

  for (i = 0; i < this.nX; ++i) {
    for (j = 0; j < this.nY; ++j) {
      boardFlat.push({i: i, j: j});
    }
  }

  d3.select("svg").append("g")
    .attr("id", "background")
    .selectAll(".tile")
    .data(boardFlat)
    .enter()
      .append("rect")
      .attr({
        class: 'tile',
        x: function (d) { return i2x(d.i) },
        y: function (d) { return j2y(d.j) },
        width: TILE_SIZE,
        height: TILE_SIZE,
      });

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

  var tiles = d3.select("svg").append("g")
    .attr("id", "board")
    .selectAll(".tile")
    .data(boardFlat)
    .enter()
      .append("g")
      .attr({
        class: 'tile',
        transform: function (d) {
          return 'translate(' + (i2x(d.i) + TILE_SIZE/2) + ',' + (j2y(d.j) + TILE_SIZE/2) + ')';
        },
      });

  tiles
      .append("use")
      .attr({
        'xlink:href': function (d) { return "#" + d.val.name; },
      });
  tiles
      .append("use")
      .attr({
        'xlink:href': '#hitbox',
        'class': 'hitbox',
      });

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



