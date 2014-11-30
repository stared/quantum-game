// require mechanics.js
// require elements.js

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

  this.stateSpatial = {};


}


Board.prototype.stateInit = function () {

  var source = 0;

  this.stateSpatial = [];

  _.forEach(this.board, function (col, i) {
    _.forEach(col, function (el, j) {
      if (el.name = 'source') {
        source += 1;
        this.stateSpatial.push({i: i, j: j, source})
      }
    })
  })

  if (source) {
    console.log("As of now only one source, sorry.");
  }

}

