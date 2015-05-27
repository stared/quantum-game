/*global window:false*/
import 'normalize.css';
import d3 from 'd3';

import * as tile from './js/tile';
import * as level from './js/level';
import * as board from './js/board';

const demoLevel = new level.Level(level.levels[0]);

const gameBoard = new board.Board(demoLevel, d3.select('svg'));
gameBoard.reset();

// for debugging purposes
window.gameBoard = gameBoard;

window.document.getElementById('play').onclick = function () {
  gameBoard.play();
};
