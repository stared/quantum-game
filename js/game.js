/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import * as level from './level';
import * as board from './board';
import * as title_manager from './title_manager';

export class View {
  constructor(game) {
    this.game = game;
  }
  initialize () {}
}

export class LevelSelectorView extends View {
  get title() {
    return 'Quantum game';
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--level-selector';
  }
  initialize() {
    d3.select('.level-selector > ul')
      .selectAll('li')
      .data(level.levels)
      .enter()
      .append('li')
      .attr('class', 'level-item')
      .text((d) => `[${d.group}] ${d.i}. ${d.name}`)
      .on('click', (d) => {
        this.game.gameBoard.loadLevel(d);
        this.game.setView('game');
      });
  }
}

export class GameView extends View {
  get title() {
    return this.game.gameBoard.title;
  }
  get subtitle() {
    return this.game.gameBoard.subtitle;
  }
  get className() {
    return 'view--game';
  }
  initialize() {
    this.game.createGameBoard();
    this.game.bindMenuEvents();
  }

}

export class EncyclopediaSelectorView extends View {
  get title() {
    return 'Encyclopedia';
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--encyclopedia-selector';
  }
}

export class EncyclopediaItemView extends View {
  get title() {
    return this.currentEncyclopediaItem;
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--encyclopedia-item';
  }
}

export class Game {
  constructor() {
    // Outer dependencies and controllers
    this.titleManager = null;
    this.storage = localStorage;
    // View definitions
    this.views = this.createViews();
    // State
    this.gameBoard = null;
    this.currentEncyclopediaItem = null;
  }

  createViews() {
    return {
      levelSelector: new LevelSelectorView(this),
      game: new GameView(this),
      encyclopediaSelector: new EncyclopediaSelectorView(this),
      encyclopediaItem: new EncyclopediaItemView(this),
    }
  }

  setView(viewName) {
    if (!_.has(this.views, viewName)) {
      window.console.error(`Invalid view: ${viewName}`);
      return;
    }
    this.currentView = this.views[viewName];
    // Set titles
    this.titleManager.setTitle(this.currentView.title);
    this.titleManager.setDescription(this.currentView.subtitle);
    this.titleManager.displayMessage('', 'success');
    // Switch visible content
    d3.selectAll(`.${this.currentView.className}`).classed('view--hidden', false);
    d3.selectAll(`.view:not(.${this.currentView.className})`).classed('view--hidden', true);
  }

  htmlReady() {
    // Initialize views' controllers
    for (let view in this.views) {
      this.views[view].initialize();
    }
    this.setView('game');

    // for debugging purposes
    window.gameBoard = this.gameBoard;
    window.tile = tile;
  }

  createGameBoard() {
    const demoLevel = new level.Level(level.levels[1]);
    this.titleManager = new title_manager.TitleManager(
      d3.select('.top-bar__title'),
      d3.select('.top-bar__subtitle'));
    this.gameBoard = new board.Board(
      demoLevel,
      d3.select('#game svg'),
      d3.select('#helper'),
      this.titleManager,
      this.storage);
    this.gameBoard.reset();
    this.gameBoard.setAnimationControls(
      d3.select('.bottom-bar__animation-controls'));
  }

  bindMenuEvents() {
    d3.select('.top-bar__menu-button').on('click', () => {
      this.gameBoard.stop();
      this.setView('levelSelector');
    });
  }
}
