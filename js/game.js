/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import * as tile from './tile';
import * as level from './level';
import * as board from './board';
import * as title_manager from './title_manager';
import {TransitionHeatmap} from './transition_heatmap';
import {ProgressPearls} from './progress_pearls';
import {SoundService} from './sound_service';

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
  initialize() {
    this.createSelectorEntries();
    this.bindMenuEvents();
  }
  createSelectorEntries() {
    const items = d3.select('.encyclopedia-selector > ul')
      .selectAll('li')
      .data(tile.nonVacuumTiles)
      .enter()
      .append('li')
      .append('button')
      .on('click', (d) => {
        this.game.setEncyclopediaItem(d);
        this.game.setView('encyclopediaItem');
      });
    items
      .append('svg')
      .attr('viewBox', '0 0 100 100')
      .append('use')
      .attr('xlink:href', (d) => `#${tile[d].svgName}`)
      .attr('transform', 'translate(50, 50)');
    items
      .append('h4')
      .text((d) => tile[d].desc.name);
  }
  bindMenuEvents() {
    d3.select('.bottom-bar__back-to-game-button').on('click', () => {
      this.game.setView('game');
    });
  }
}

export class EncyclopediaItemView extends View {
  get title() {
    return tile[this.game.currentEncyclopediaItem].desc.name;
  }
  get subtitle() {
    return '';
  }
  get className() {
    return 'view--encyclopedia-item';
  }
  initialize() {
    this.bindMenuEvents();
  }
  resetContent() {
    if (!this.game.currentEncyclopediaItem) {
      return;
    }

    const tileData = tile[this.game.currentEncyclopediaItem];

    const container = d3.select('.encyclopedia-item');

    container
      .html(null);
    const article = container.append('article');
    article
      .append('svg')
      .attr('viewBox', '0 0 100 100')
      .append('use')
      .attr('xlink:href', `#${tileData.svgName}`)
      .attr('transform', 'translate(50, 50)');
    article
      .append('h4')
      .text(tileData.desc.name);
    article
      .append('div')
      .classed('content', true)
      .text(tileData.desc.summary);

    article
      .append('div')
      .classed('content', true)
      .append('i')
      .text(`"${tileData.desc.flavour}"`);

    const hm = article
      .append('div')
      .attr('class', 'content heatmap');

    // TODO something for rotation...
    const tileObj = new tile.Tile(tileData);
    const transitionHeatmap = new TransitionHeatmap(hm);
    window.console.log('tileObj', tileObj);
    transitionHeatmap.updateFromTensor(tileObj.transitionAmplitudes.map);

  }
  bindMenuEvents() {
    d3.select('.bottom-bar__back-to-encyclopedia-selector-button').on('click', () => {
      this.game.setView('encyclopediaSelector');
    });
  }
}

export class Game {
  constructor() {
    // Initialize sound
    SoundService.initialize();
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
    const demoLevel = new level.Level(level.levels[1]);
    this.titleManager = new title_manager.TitleManager(
      d3.select('.top-bar__title'),
      d3.select('.top-bar__subtitle'));
    this.progressPearls = new ProgressPearls(
      d3.select('#game svg'),
      level.levels.filter((d) => d.group === 'Game'),
      this
    );
    this.progressPearls.draw();
    this.gameBoard = new board.Board(
      demoLevel,
      d3.select('#game svg'),
      d3.select('#helper'),
      this.titleManager,
      level.levels,
      this.progressPearls,
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
    d3.select('.bottom-bar__help-button').on('click', () => {
      this.gameBoard.stop();
      this.setView('encyclopediaSelector');
    });
  }

  currentLevelName() {
    if (this.gameBoard == null) {
      return null;
    }
    return this.gameBoard.level.name;
  }
}
