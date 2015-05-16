// require mechanics.js
// require elements.js

var TILE_SIZE = 80;
var TIME_STEP = 500;
var VIZ_IS_ON = false;

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

  // just to have it at the right layer
  d3.select("svg").append("g")
    .attr("id", "photons");

}

Board.prototype.draw = function () {

  var i, j, v, s;
  var boardFlat = [];

  var thisBoard = this;
  
  for (i = 0; i < this.nX; i++) {
    for (j = 0; j < this.nY; j++) {
      v = this.board[i][j];
      v.i = i;
      v.j = j;
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

  // Keep tile node reference
  tiles.each(function (d) {
    d.val.node = this;
  });

  // Create element
  tiles
      .append("use")
      .attr({
        'xlink:href': function (d) { return "#" + d.val.name; },
        'class': 'element',
        transform: function (d) {
          return 'rotate(' + (d.val.angleOfRotation * d.val.rotation) + ',0,0)';
        },
      });
  // Create hitbox
  tiles
      .append("use")
      .attr({
        'xlink:href': '#hitbox',
        class: 'hitbox',
      })
      .on('click', function (d) {

        if (d3.event.defaultPrevented) return;

        d.val.rotation = (d.val.rotation + 1) % d.val.maxRotation;
        
        var element = d3.select(d.val.node).select('.element');

        if (d.val.rotation === 0) {
          element.attr('transform', 'rotate(' +  (- d.val.angleOfRotation) + ',0,0)')
        }

        element.transition().duration(300)
          .attr('transform', 'rotate(' +  (d.val.angleOfRotation * d.val.rotation ) + ',0,0)');
      });

  // Drag and drop

  var drag = d3.behavior.drag()
      .on('dragstart', function (d) {
        d3.event.sourceEvent.stopPropagation();
      })
      .on('drag', function (d) {
        d3.select(this).attr("transform", 'translate(' + d3.event.x + ',' + d3.event.y + ')');
        d.val.newI = x2i(d3.event.x);
        d.val.newJ = y2j(d3.event.y);
      })
      .on('dragend', function (d) {
        // No drag?
        if (d.val.newI == null || d.val.newJ == null) {
          return;
        }
        // Intuitive naming
        var from = d.val;

        var to = thisBoard.board[from.newI][from.newJ];

        // Swap items if it's possible
        var canSwap = true; // TODO detect if "to" element is frozen. If not, let it go.
        if (canSwap) {
          // Swap items in matrix
          thisBoard.board[from.i][from.j] = to;
          thisBoard.board[from.newI][from.newJ] = from;
          // Swap items' positions
          to.i = from.i;
          to.j = from.j;
          from.i = from.newI;
          from.j = from.newJ;
        }
        delete from.newI;
        delete from.newJ;
        // Move element (if exists)
        if (to.node) {
          d3.select(to.node).transition().duration(300).attr('transform',
              'translate(' + (i2x(to.i) + TILE_SIZE/2) +
              ',' + (j2y(to.j) + TILE_SIZE/2) + ')'
          );
        }
        // "from" element is draggable, so it exists
        d3.select(from.node).transition().duration(300).attr('transform',
            'translate(' + (i2x(from.i) + TILE_SIZE/2) +
            ',' + (j2y(from.j) + TILE_SIZE/2) + ')'
        );
      });
  tiles
      .call(drag);

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

  this.stateHistory = [_.cloneDeep(this.stateSpatial)];

};


// as of now - only single particle interactions
// as of now - very inefficient (I should query elements only once)
// as of now - without absorption
// some of it should go to mechanics.js BTW
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
        stateSpatialDict[keyOut].re += diffRe;
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

  this.stateHistory.push(_.cloneDeep(this.stateSpatial));

}


Board.prototype.animationRun = function () {

  this.step = this.step || 0;

  if (this.step === 0) {
    VIZ_IS_ON = true;
  }

  d3.select("#photons").selectAll(".photon").remove();;

  var photons = d3.select("#photons").selectAll(".photon")
    .data(this.stateHistory[this.step]);

  photons.enter()
    .append("circle")
      .attr("class", "photon")
      .attr("r", 10)
      .attr("cx", function (d) { return i2x(d.i) + TILE_SIZE/2; })
      .attr("cy", function (d) { return j2y(d.j) + TILE_SIZE/2; })
      .style("opacity", function (d) { return Math.sqrt(d.re*d.re + d.im*d.im); });

  photons.transition()
    .ease([0,1])
    .duration(TIME_STEP)
      .attr("cx", function (d) { return i2x(d.i + speedX[d.to[0]]) + TILE_SIZE/2; })
      .attr("cy", function (d) { return j2y(d.j + speedY[d.to[0]]) + TILE_SIZE/2; });

  var thisFunction = this.animationRun.bind(this);
  this.step += 1;

  if ( this.step < this.stateHistory.length && VIZ_IS_ON) {
    setTimeout(thisFunction, TIME_STEP);
  } else {
    this.step = 0;
    VIZ_IS_ON = false;
  }

};


Board.prototype.exportJSON = function () {

  var elements = [];
  var i, j, el;

  for (i = 0; i < this.nX; i++) {
    for (j = 0; j < this.nY; j++) {

      el = this.board[i][j];

      if (el instanceof Elements.Vacuum) {
        continue;
      } else {
        elements.push({name:     el.name,
                       i:        i,
                       j:        j,
                       rotation: el.rotation});
      }
    }
  }

  return JSON.stringify({
    board: {
      width: this.nX,
      height: this.nY
    },
    elements: elements
  }, null, 2);

}
