/*global window:false*/
import d3 from 'd3';

import * as tile from './tile';
import * as level from './level';
import * as board from './board';
import * as title_manager from './title_manager';

export class Game {
  constructor() {
    this.gameBoard = null;
    this.titleManager = null;
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
    this.titleManager = new title_manager.TitleManager(
      d3.select('.top-bar__title'),
      d3.select('.top-bar__subtitle'));
    this.gameBoard = new board.Board(
      demoLevel,
      d3.select('#game svg'),
      d3.select('#helper'),
      this.titleManager);
    this.gameBoard.reset();
    this.gameBoard.setAnimationControls(
      d3.select('.bottom-bar__animation-controls'));
  }

  bindMenuEvents() {
    d3.select('.top-bar__menu-button ').on('click', () => {
      d3.select('#level-selector').remove();
      this.gameBoard.stop();

      const levelSelectorShadow = d3.select('body').append('div')
        .attr('class', 'shadow-overlay')
        .on('click', () => {
          levelSelectorShadow.remove();
          levelSelector.remove();
        });

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
          levelSelectorShadow.remove();
          levelSelector.remove();
        });
    });
  }
}
