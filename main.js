// directions:
// (anticlockwise)
// ["E", "N", "W", "S"]
//
// polazrization:
// ["H", "V"]

// cordinates
//  >
// V


var SIZE_X = 8;
var SIZE_Y = 8;
var TILE_SIZE = 40;
var TIME_STEP = 1000;
var board = [];
var elements = [];
var stash = [];
var state = {}; // or some hashtable like-tking
// as of now
// {"9,12,2": {i: 9, j: 12, dir: 2, amp: 1.}}
// as of now, no polarizarion and only real amp
var history2 = [];


var i2x = function (i) { return TILE_SIZE/2 + TILE_SIZE * i; }
var j2y = function (j) { return TILE_SIZE/2 + TILE_SIZE * j; }

var x2i = function (x) { return Math.floor(x / TILE_SIZE); }
var y2j = function (y) { return Math.floor(y / TILE_SIZE); }

var acronym = {corner_cube: 'cc', beam_splitter_a: 'ba'};

var drawElement = function (d) {

  var g = d3.select(this);
  
  // we need to add rotation as a parameter
  switch (d.val) {
    case ("beam_splitter_a"):
      drawBeamSplitterA(g);
      break;
    case ("beam_splitter_d"):
      drawBeamSplitterD(g);
      break;
    case ("corner_cube"):
      drawCornerCube(g);
      break;
    default:
      g.append("rect")
        .attr("width", 0.5 * TILE_SIZE)
        .attr("height", 0.5 * TILE_SIZE)
        .attr("x", 0.25 * TILE_SIZE)
        .attr("y", 0.25 * TILE_SIZE)
        .style("fill", "#afa")
        .style("opacity", 0.5);

      g.append("text")
        .attr("x", 0.5 * TILE_SIZE)
        .attr("y", 0.5 * TILE_SIZE + 4)
        .style("text-anchor", "middle")
        .text(acronym[d.val]);
  }

}

function drawBeamSplitterD (g) {

  g.append("path")
    .attr("class", "glass")
    .attr("d", "M 8 12 L 12 8 L 32 28 L 28 32");

}

function drawBeamSplitterA (g) {

  g.append("path")
    .attr("class", "glass")
    .attr("d", "M 32 12 L 28 8 L 8 28 L 12 32");

}

function drawCornerCube (g) {

  g.append("path")
    .attr("class", "metal")
    .attr("d", ["M 5 5", "10 5", "20 15", "30 5", "35 5",
                "35 10", "25 20", "35 30", "35 35",
                "30 35", "20 25", "10 35", "5 35",
                "5 30", "15 20", "5 10"].join("L"));

}

var main = function () {

  var i;

  var svg = d3.select("body").append("svg")
    .attr("id", "game")
    .attr("height", 600)
    .attr("width", 900); 

  for (i = 0; i < SIZE_X; i++) {
    board[i] = [];
    for (j = 0; j < SIZE_Y; j++)
      board[i][j] = "beam_splitter_a";
  }

  board[4][4] = "beam_splitter_a";
  board[4][5] = "corner_cube";

  v = {i: 6, j: 4, dir: 2, amp: 0.7};
  state[[v.i, v.j, v.dir]] = v;

  v = {i: 4, j: 2, dir: 3, amp: 0.5};
  state[[v.i, v.j, v.dir]] = v;

  history2 = [];

  visualizeBoard();

}

function visualizeBoard () {

  var i, j, v;
  var boardFlat = [];

  var drag = d3.behavior.drag()
    .origin(function(d) { return {x: i2x(d.i), y: j2y(d.j)}; })
    .on("drag", dragmove)
    .on("dragend", function (d) {
      // here I don't get d3.event.x);

      board[d.i][d.j] = "empty";

      d.i = x2i(d.x);
      d.j = y2j(d.y);
      d3.select(this)
        .attr("transform", ["translate(", i2x(d.i), ",", j2y(d.j), ")"].join(""));
      
      board[d.i][d.j] = d.val;
      
    });

  function dragmove(d) {
    d3.select(this)
      .attr("transform", ["translate(", d.x = d3.event.x, ",", d.y = d3.event.y, ")"].join(""));
      // .attr("x", d3.event.x)
      // .attr("y", d3.event.y);
  }
  
  for (i = 0; i < SIZE_X; i++) {
    for (j = 0; j < SIZE_Y; j++) {
      v = board[i][j];
      boardFlat.push({i: i, j: j, val: v});
      if (v !== "empty") {
        elements.push({i: i, j: j, val: v});
      }
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
        .attr("y", function (d) { return j2y(d.j); })
        .style("fill", function (d) { return d.val === "empty" ? null : "#aaa"; });

  d3.select("svg").append("g")
    .attr("id", "elements")
    .selectAll(".element")
    .data(elements)
    .enter()
      .append('g')
        .attr("class", "element")
        .attr("transform", function (d) {
          return ["translate(", i2x(d.i), ",", j2y(d.j), ")"].join("");
        })
        .each(drawElement)
        .call(drag);

}


d3.select("#run").on("click", function () {
  simulate();
  vizStep(0);
})

function simulate () {
  for (i = 0; i < 8; i++) {
    
    console.log(state);
    history2.push([]);
    for (k in state) {
      v = state[k];
      history2[i].push({i: v.i, j: v.j, dir: v.dir, amp: v.amp});  // to copy
    }

    state = propagate(state, board);

  }
}

function vizStep (i) {

  var photons = d3.select("#board").selectAll(".photon");

  photons.remove();

  photons = d3.select("#board").selectAll(".photon")
    .data(history2[i]);

  photons.enter()
    .append("circle")
      .attr("class", "photon")
      .attr("r", 10)
      .attr("cx", function (d) { return i2x(d.i - dir2vx(d.dir)) + TILE_SIZE/2; })  // as d.i and d.j are for destination location
      .attr("cy", function (d) { return j2y(d.j - dir2vy(d.dir)) + TILE_SIZE/2; })
      .style("opacity", function (d) { return Math.sqrt(Math.abs(d.amp)); })
      .style("fill", function (d) { return d.amp < 0 ? "violet" : null; });

  photons.transition()
    .ease([0,1])
    .duration(TIME_STEP)
      .attr("cx", function (d) { return i2x(d.i) + TILE_SIZE/2; })
      .attr("cy", function (d) { return j2y(d.j) + TILE_SIZE/2; });

  if ( i + 1 < history2.length ) {
    setTimeout(vizStep, TIME_STEP, i + 1);
  }


}


function propagate (state0, board) {

  var k, v0, i, v1s, h, tile;
  var state1 = {};

  for (k in state0) {
    v0 = state0[k];

    if ( (v0.i < 0) || (v0.i >= SIZE_X) || (v0.j < 0) || (v0.j >= SIZE_Y) ) {
      console.log(v0);
      continue;
    }

    tile = board[v0.i][v0.j];

    // v1 - warning: in most cases there are plenty outputs

    switch ( tile ) {
      case "empty":
        // deserves a separate function as it is used in all other
        v1s = [{i: v0.i, j: v0.j, dir: v0.dir, amp: v0.amp}];
        v1s[0].i = v0.i + dir2vx(v0.dir);
        v1s[0].j = v0.j + dir2vy(v0.dir);
        break;
      case "corner_cube":  // simplest
        v1s = [{i: v0.i, j: v0.j, dir: v0.dir, amp: v0.amp}];
        v1s[0].i = v0.i - dir2vx(v0.dir);
        v1s[0].j = v0.j - dir2vy(v0.dir);
        v1s[0].dir = (v0.dir + 2) % 4;
        break;
      case "beam_splitter_a":
        // antidiagonal; hadamard; not to careful with the sing
        v1s = [];
        // going forward
        v1s.push({i:   v0.i + dir2vx(v0.dir),
                  j:   v0.j + dir2vy(v0.dir),
                  dir: v0.dir,
                  amp: v0.amp/Math.sqrt(2)})
        // bouncing
        var dir1 = v0.dir ^ 1;  // {0:1, 1:0, 2:3, 3:2} 
        v1s.push({i:   v0.i + dir2vx(dir1),
                  j:   v0.j + dir2vy(dir1),
                  dir: dir1,
                  amp: (2 * (dir1 % 2) - 1) * v0.amp/Math.sqrt(2)})  // sign swap for one possibility
        break;
    }

    for (i = 0; i < v1s.length; i++) {

      v1 = v1s[i];

      h = [v1.i, v1.j, v1.dir].join(",");  // we can do numerical, if needed for a speedup

      if (h in state1) {
        state1[h].amp += v1.amp;
        if (state1[h].amp === 0) {
          delete state1[h];
        } 
      } else {
        state1[h] = v1;
      }

    }

  }

  return state1;

}

function dir2vx (direction) {
  return ((direction + 1) % 2) * (1 - direction);
}

function dir2vy (direction) {
  return (direction % 2) * (direction - 2);
}

main();