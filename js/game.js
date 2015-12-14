/*global window:false*/
import d3 from 'd3';

import * as tile from './tile';
import * as level from './level';
import * as board from './board';

export class Game {
  constructor() {
    this.gameBoard = null;
  }

  htmlReady() {
    this.createGameBoard();
    this.bindMenuEvents();

    // for debugging purposes
    window.gameBoard = this.gameBoard;
    window.tile = tile;
  }

  createGameBoard() {
    const demoLevel = new level.Level(level.levels[0]);
    this.gameBoard = new board.Board(
      demoLevel,
      d3.select('svg'),
      d3.select('#helper'));
    this.gameBoard.reset();
    this.gameBoard.setAnimationControls(d3.select('#animation-controls'));
  }

  bindMenuEvents() {
    d3.select('#select-level').on('click', () => {
      d3.select('#level-selector').remove();
      this.gameBoard.stop();

      const levelSelector = d3.select('body').append('div')
        .attr('id', 'level-selector')
        .attr('class', 'item-selector');

      levelSelector.append('ul').attr('class', 'level-item').selectAll('li')
        .data(level.levels)
        .enter()
        .append('li')
        .attr('class', 'level-item')
        .text((d) => `[${d.group}] ${d.i}. ${d.name}`)
        .on('click', (d) => {
          this.gameBoard.level = new level.Level(d);
          this.gameBoard.reset();
          levelSelector.remove();
        });
    });

    d3.select('#clip-board-a').on('click', function () {
      this.gameBoard.clipBoard(this);
    });
  }
}
