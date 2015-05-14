
var nX = 18;
var nY = 12;

var board = new Board(nX, nY);

board.draw();

// for (i = 0; i < nX; i++) {
//   board.board[i] = [];
//   for (j = 0; j < nY; j++) {
//     board.board[i][j] = Math.random() > 0.9 ? new Elements.PolarizingBeamSplitter() : new Elements.Vacuum();
//   }
// }

board.board[2][4] = new Elements.Source();

board.stateInit();

board.statePropagate();
board.statePropagate();
board.statePropagate();
