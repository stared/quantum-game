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
var state = {}; // or some hashtable like-tking
// as of now
// {"9,12,2": {x: 9, y: 12, dir: 2, amp: 1.}}
// as of now, no polarizarion and only real amp
var history2 = [];

var tiles2colors = {empty: null,
                    super_mirror: "black",
                    beam_splitter_a: "blue"};

// this thing is dangerous;
// de facto global varibles for loops

var main = function () {

  var i;

  var svg = d3.select("body").append("svg")
    .attr("id", "game")
    .attr("height", 600)
    .attr("width", 900); 

  for (i = 0; i < SIZE_X; i++) {
    board[i] = [];
    for (j = 0; j < SIZE_Y; j++)
      board[i][j] = "empty";
  }

  board[4][4] = "beam_splitter_a";
  board[4][5] = "super_mirror";

  v = {x: 6, y: 4, dir: 2, amp: 0.7};
  state[[v.x, v.y, v.dir]] = v;

  v = {x: 4, y: 2, dir: 3, amp: 0.5};
  state[[v.x, v.y, v.dir]] = v;

  history2 = [];

  for (i = 0; i < 8; i++) {
    
    console.log(state);
    history2.push([]);
    for (k in state) {
      v = state[k];
      history2[i].push({x: v.x, y: v.y, dir: v.dir, amp: v.amp});  // to copy
    }

    state = propagate(state, board);

  }

  visualize();

}

function visualize () {

  var i, j;
  var boardFlat = [];

  for (i = 0; i < SIZE_X; i++) {
    for (j = 0; j < SIZE_Y; j++)
      boardFlat.push({x: i, y: j, val: board[i][j]});
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
        .attr("x", function (d) { return TILE_SIZE/2 + TILE_SIZE * d.x; })
        .attr("y", function (d) { return TILE_SIZE/2 + TILE_SIZE * d.y; })
        .style("fill", function (d) { return tiles2colors[d.val]; });

  $( ".tile" )
    .draggable({
      revert: true,
      revertDuration: 200,
      cursorAt: { left: 20, top: 60 }
    })
    .bind('mousedown', function(event, ui){
      // bring target to front
      $(event.target.parentElement).append( event.target );
    })
    .bind('drag', function(event, ui){
      // update coordinates manually, since top/left style props don't work on SVG
      event.target.setAttribute('x', ui.position.left);
      event.target.setAttribute('y', ui.position.top);
    });


  vizStep(0);

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
      .attr("cx", function (d) { return TILE_SIZE + TILE_SIZE * (d.x - dir2vx(d.dir)); })  // as d.x and d.y are for destination location
      .attr("cy", function (d) { return TILE_SIZE + TILE_SIZE * (d.y - dir2vy(d.dir)); })
      .style("opacity", function (d) { return Math.abs(d.amp); })
      .style("fill", function (d) { return d.amp < 0 ? "violet" : null; });

  photons.transition()
    .ease([0,1])
    .duration(TIME_STEP)
      .attr("cx", function (d) { return TILE_SIZE + TILE_SIZE * d.x; })
      .attr("cy", function (d) { return TILE_SIZE + TILE_SIZE * d.y; });

  if ( i + 1 < history2.length ) {
    setTimeout(vizStep, TIME_STEP, i + 1);
  }


}


function propagate (state0, board) {

  var k, v0, i, v1s, h, tile;
  var state1 = {};

  for (k in state0) {
    v0 = state0[k];

    if ( (v0.x < 0) || (v0.x >= SIZE_X) || (v0.y < 0) || (v0.y >= SIZE_Y) ) {
      console.log(v0);
      continue;
    }

    tile = board[v0.x][v0.y];

    // v1 - warning: in most cases there are plenty outputs

    switch ( tile ) {
      case "empty":
        // deserves a separate function as it is used in all other
        v1s = [{x: v0.x, y: v0.y, dir: v0.dir, amp: v0.amp}];
        v1s[0].x = v0.x + dir2vx(v0.dir);
        v1s[0].y = v0.y + dir2vy(v0.dir);
        break;
      case "super_mirror":  // simplest
        v1s = [{x: v0.x, y: v0.y, dir: v0.dir, amp: v0.amp}];
        v1s[0].x = v0.x - dir2vx(v0.dir);
        v1s[0].y = v0.y - dir2vy(v0.dir);
        v1s[0].dir = (v0.dir + 2) % 4;
        break;
      case "beam_splitter_a":
        // antidiagonal; hadamard; not to careful with the sing
        v1s = [];
        // going forward
        v1s.push({x:   v0.x + dir2vx(v0.dir),
                  y:   v0.y + dir2vy(v0.dir),
                  dir: v0.dir,
                  amp: v0.amp/Math.sqrt(2)})
        // bouncing
        var dir1 = v0.dir ^ 1;  // {0:1, 1:0, 2:3, 3:2} 
        v1s.push({x:   v0.x + dir2vx(dir1),
                  y:   v0.y + dir2vy(dir1),
                  dir: dir1,
                  amp: (2 * (dir1 % 2) - 1) * v0.amp/Math.sqrt(2)})  // sign swap for one possibility
        break;
    }

    for (i = 0; i < v1s.length; i++) {

      v1 = v1s[i];

      h = [v1.x, v1.y, v1.dir].join(",");  // we can do numerical, if needed for a speedup

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