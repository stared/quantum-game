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

    {i: 5, j: 0, name: 'ThinMirror'},
    {i: 5, j: 1, name: 'ThinSplitter'},
    {i: 5, j: 2, name: 'PolarizingSplitter'},
    {i: 5, j: 3, name: 'CornerCube'},
  ]
);

const gameBoard = new board.Board(demoLevel, d3.select('svg'));
gameBoard.reset();

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
