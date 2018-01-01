/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import * as level from './level';
import {GameBoard} from './game_board';
import {PopupManager} from './popup_manager';
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
    // Pop-ups
    this.popupManager = new PopupManager(
      d3.select('.popup'),
      () => this.gameBoard.loadNextLevel());
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
    d3.select('.top-bar__title').text(this.currentView.title);
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
    window.mobileLayout = ((window.outerWidth || 1000) < 800);
    this.gameBoard = new GameBoard(
      d3.select('#game svg.game-svg'),
      d3.select('#game svg.blink-svg'),
      this,
      this.popupManager,
      this.storage,
      initialLevelId);
    if (window.mobileLayout) {
      d3.select('#game svg.game-svg').attr('viewBox', '-30 -10 1400 1200');
    }
  }

  bindMenuEvents() {
    this.gameBoard.svg.select('.navigation-controls .level-list')
      .on('click', () => {
        this.gameBoard.stop();
        this.setView('levelSelector');
      })
      .on('mouseover', () =>
        this.gameBoard.titleManager.displayMessage('SELECT LEVEL')
      );
    this.gameBoard.svg.select('.navigation-controls .encyclopedia')
      .on('click', () => {
        this.gameBoard.stop();
        this.setView('encyclopediaSelector');
      })
      .on('mouseover', () =>
        this.gameBoard.titleManager.displayMessage('ENCYCLOPEDIA')
      );

    const overlay = this.gameBoard.svg.select('.interface-hint-overlay');
    this.gameBoard.svg.select('.navigation-controls .help')
      .on('click',     () => overlay.classed('hidden', !overlay.classed('hidden')))
      .on('mouseover', () => overlay.classed('hidden', false))
      .on('mouseout',  () => overlay.classed('hidden', true));

    this.gameBoard.svg.select('.navigation-controls .sandbox')
      .on('click', () => {
        this.gameBoard.loadLevel(level.levels[0].id);
      })
      .on('mouseover', () =>
        this.gameBoard.titleManager.displayMessage('SANDBOX LEVEL')
      );
  }

}
