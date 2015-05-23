/*global window:false*/
import 'normalize.css';
import d3 from 'd3';

import * as tile from './js/tile';
import * as level from './js/level';
import * as board from './js/board';

const demoLevel = new level.Level(
  13,
  10,
  [
    {i: 2, j: 3, name: 'Source', frozen: true},
    {i: 4, j: 3, name: 'ThinBeamSplitter', rotation: 1},

    {i: 0, j: 0, name: 'ThinMirror'},
    {i: 0, j: 1, name: 'ThinSplitter'},
    {i: 0, j: 2, name: 'PolarizingSplitter'},
    {i: 0, j: 3, name: 'CornerCube'},
    {i: 0, j: 4, name: 'Polarizer'},
    {i: 0, j: 5, name: 'PhasePlate'},
    {i: 0, j: 6, name: 'SugarSolution'},
    {i: 0, j: 7, name: 'Mine'},
    {i: 0, j: 8, name: 'Rock'},
    {i: 0, j: 9, name: 'Glass'},
    {i: 1, j: 0, name: 'VacuumJar'},
    {i: 1, j: 1, name: 'Absorber'},
    {i: 1, j: 2, name: 'Detector'},

    {i: 8, j: 0, name: 'ThinMirror'},
    {i: 8, j: 1, name: 'ThinSplitter'},
    {i: 8, j: 2, name: 'PolarizingSplitter'},
    {i: 8, j: 3, name: 'CornerCube'},

    {i: 4, j: 3, name: 'ThinSplitter', rotation: 1},
    {i: 5, j: 3, name: 'ThinSplitter', rotation: 1},
    {i: 6, j: 3, name: 'Rock'},
  ]
);

const gameBoard = new board.Board(demoLevel, d3.select('svg'));
gameBoard.reset();

// for debugging purposes
window.gameBoard = gameBoard;

window.document.getElementById('play').onclick = function () {
  gameBoard.particles.play();
};

//function play(n) {
//    board.stateInit();
//    var i;
//    for (i = 0; i < n; ++i) {
//        board.statePropagate();
//    }
//    board.animationRun();
//}
//
//play(5);
