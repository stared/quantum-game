'use strict';

import 'normalize.css';

import 'elements'
import 'js/level'
import 'js/board'

const nX = 13;
const nY = 10;

const board = new Board(nX, nY);

// for (i = 0; i < nX; i++) {
//   board.board[i] = [];
//   for (j = 0; j < nY; j++) {
//     board.board[i][j] = Math.random() > 0.9 ? new Elements.PolarizingBeamSplitter() : new Elements.Vacuum();
//   }
// }

board.board[2][3] = new Elements.Source();

board.board[4][3] = new Elements.ThinBeamSplitter();
board.board[4][3].rotation = 1;

// you can't have more sources, so let's draw all other elements
board.board[0][0] = new Elements.ThinMirror();
board.board[0][1] = new Elements.ThinBeamSplitter();
board.board[0][2] = new Elements.PolarizingBeamSplitter();
board.board[0][3] = new Elements.CornerCube();

board.drawBackground();
board.draw();

function play(n) {
    board.stateInit();
    var i;
    for (i = 0; i < n; ++i) {
        board.statePropagate();
    }
    board.animationRun();
}

play(5);
