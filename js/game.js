/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import * as level from './level';
import {GameBoard} from './game_board';
import {TitleManager} from './title_manager';
import {SoundService} from './sound_service';

import {GameView} from './views/game_view';
import {LevelSelectorView} from './views/level_selector_view';
import {EncyclopediaSelectorView} from './views/encyclopedia_selector_view';
import {EncyclopediaItemView} from './views/encyclopedia_item_view';

export class Game {
  constructor() {
    // Initialize sound
    SoundService.initialize();
    // Outer dependencies and controllers
    this.storage = localStorage;

    this.titleManager = new TitleManager(
      d3.select('.top-bar__title'),
      d3.select('.top-bar__subtitle'));

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

  setEncyclopediaItem(item) {
    this.currentEncyclopediaItem = item;
    // Reset the encyclopedia item view
    this.views.encyclopediaItem.resetContent();
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
    // TODO(pathes): load last played level information from storage
    const initialLevel = level.levels[1];
    this.gameBoard = new GameBoard(
      d3.select('#game svg'),
      this,
      this.titleManager,
      this.storage,
      initialLevel,
      level.levels);
    this.gameBoard.reset();
    this.gameBoard.setAnimationControls(
      d3.select('.bottom-bar__animation-controls'));
  }

  bindMenuEvents() {
    d3.select('.top-bar__menu-button').on('click', () => {
      this.gameBoard.stop();
      this.setView('levelSelector');
    });
    d3.select('.bottom-bar__help-button').on('click', () => {
      this.gameBoard.stop();
      this.setView('encyclopediaSelector');
    });
  }

}
