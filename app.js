/*global window:false*/
import 'normalize.css';
import d3 from 'd3';

import * as tile from './js/tile';
import * as level from './js/level';
import * as board from './js/board';

const demoLevel = new level.Level(level.levels[0]);

const gameBoard = new board.Board(demoLevel, d3.select('svg'), d3.select('#helper'));
gameBoard.reset();

// for debugging purposes
window.gameBoard = gameBoard;
window.tile = tile;

gameBoard.setAnimationControls(d3.select('#animation-controls'));

d3.select('#select-level').on('click', () => {
  d3.select('#level-selector').remove();
  gameBoard.stop();

  const levelSelector = d3.select('body').append('div')
    .attr('id', 'level-selector')
    .attr('class', 'item-selector');

  levelSelector.append('ul').attr('class', 'level-item').selectAll('li')
    .data(level.levels)
    .enter()
      .append('li')
        .attr('class', 'level-item')
        .text((d) => `${d.group}: ${d.name}`)
        .on('click', (d) => {
          gameBoard.level = new level.Level(d);
          gameBoard.reset();
          levelSelector.remove();
        });
});

d3.select('#clip-board-a').on('click', function () {
  gameBoard.clipBoard(this);
});
