/*global window:false*/
import 'normalize.css';
import d3 from 'd3';
import _ from 'lodash';

import * as tile from './js/tile';
import * as level from './js/level';
import * as board from './js/board';

const demoLevel = new level.Level(level.levels[0]);

const gameBoard = new board.Board(demoLevel, d3.select('svg'), d3.select('#helper'));
gameBoard.reset();

// for debugging purposes
window.gameBoard = gameBoard;
window.tile = tile;

window.document.getElementById('play').onclick = function () {
  gameBoard.play();
};

window.document.getElementById('select-level').onclick = function () {

  d3.select('#level-selector').remove();

  const levelSelector = d3.select('body').append('div')
    .attr('id', 'level-selector')
    .attr('class', 'item-selector');

  levelSelector.append('ul').attr('class', 'level-item').selectAll('li')
    .data(_.sortBy(level.levels, (level) => `${level.group} ${level.name}`))
    .enter()
      .append('li')
        .attr('class', 'level-item')
        .text((d) => `${d.group}: ${d.name}`)
        .on('click', (d) => {
          gameBoard.level = new level.Level(d);
          gameBoard.reset();
          levelSelector.remove();
        });

};

window.document.getElementById('clip-board').onclick = function () {
  gameBoard.clipBoard();
};
