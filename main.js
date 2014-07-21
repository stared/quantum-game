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
var board = [];
var state = {}; // or some hashtable like-tking
// as of now
// {"9,12,2": {x: 9, y: 12, dir: 2, amp: 1.}}
// as of now, no polarizarion and only real amp
var history = [];

var i, j, d, p, k, v, x, y, tile, v0, v1, h;

main();


function main () {

  var svg = d3.select("body").append("svg")
    .attr("id", "game")
    .attr("height", 600)
    .attr("width", 900); 

  for (i = 0; i < SIZE_X; i++) {
    board[i] = [];
    for (j = 0; j < SIZE_Y; j++)
      board[i][j] = "empty";
  }

  board[4][4] = "super_mirror";

  v = {x: 0, y: 4, dir: 0, amp: 0.7};

  state[[v.x, v.y, v.dir]] = v;

  for (i = 0; i < 8; i++) {
    
    history[i] = [];
    for (k in state) {
      history[i].push(state[k]);
    }

    state = propagate(state, board);
  }

  console.log(history);

}


function propagate (state0, board) {

  var state1 = {};

  for (k in state0) {
    v0 = state0[k];

    // also actions for photons otu of board

    tile = board[v.x][v.y];

    // v1 - warning: in most cases there are plenty outputs

    switch ( tile ) {
      case "empty":
        v1 = v0;  // or maybe I need copy?
        v1.x = v0.x + ((v0.dir + 1) % 2) * (1 - v0.dir);
        v1.y = v0.y + (v0.dir % 2) * (2 - v0.dir);
        break;
      case "super_mirror":  // simplest
        v1 = v0;
        v1.x = v0.x - ((v0.dir + 1) % 2) * (1 - v0.dir);
        v1.y = v0.y - (v0.dir % 2) * (2 - v0.dir);
        v1.dir = (v0.dir + 2) % 4;
        break;
    }

    h = [v1.x, v1.y, v1.dir].join(",");  // we can do numerical, if needed for a speedup

    if (h in state1) {
      state1[h].amp += v1.amp;
      if (state1[h].amp === 0) {
        delete state1[h];
      } 
    } else {
      state1[h] = v1;
    }

    return state1;

  }

}