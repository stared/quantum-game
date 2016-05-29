/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import * as level from './level';
import {GameBoard} from './game_board';
import {PopupManager} from './popup_manager';
import {TitleManager} from './title_manager';
import {SoundService} from './sound_service';
import {Storage} from './storage';

import {GameView} from './views/game_view';
import {LevelSelectorView} from './views/level_selector_view';
import {EncyclopediaSelectorView} from './views/encyclopedia_selector_view';
import {EncyclopediaItemView} from './views/encyclopedia_item_view';

export class Game {
  constructor() {
    // Initialize sound
    SoundService.initialize();
    // Outer dependencies and controllers
    this.storage = new Storage();

    this.titleManager = new TitleManager(
      d3.select('.top-bar__title'),
      d3.select('.top-bar__subtitle'));
    this.popupManager = new PopupManager(
      d3.select('.popup'));

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
  }

  createGameBoard() {
    const initialLevelId = this.storage.getCurrentLevelId() || level.levels[1].id;
    this.gameBoard = new GameBoard(
      d3.select('#game svg'),
      this,
      this.popupManager,
      this.storage,
      initialLevelId);
  }

  bindMenuEvents() {
    this.gameBoard.svg.select('.navigation-controls .level-list')
      .on('click', () => {
        this.gameBoard.stop();
        this.setView('levelSelector');
      });
    this.gameBoard.svg.select('.navigation-controls .help')
      .on('click', () => {
        this.gameBoard.stop();
        this.setView('encyclopediaSelector');
      });
  }

}
