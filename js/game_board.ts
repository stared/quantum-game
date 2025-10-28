import d3 from './d3-wrapper';
import stringify from 'json-stringify-pretty-compact';
import {saveAs} from 'file-saver';

import {absorptionDuration, animationStepDurationMin, animationStepDurationMax, playPauseTransitionDuration, stockColumns, tileSize} from './config';
import {Stock} from './stock';
import * as level from './level';
import {BareBoard} from './bare_board';
import {ProgressPearls} from './progress_pearls';
import {TileHelper} from './tile_helper';
import {DetectionBar} from './detection_bar';
import {TitleManager} from './title_manager';
import {levelRecipe2queryString, queryString2levelRecipe} from './level_io_uri';
import type {D3Selection, LevelRecipe} from './types';
import type {Game} from './game';
import type {PopupManager} from './popup_manager';
import type {Storage} from './storage';
import type {Tile} from './tile';
import type {Logger} from './logger';
import type {Level} from './level';

// TODO decide where to use winning status; it seems I should move it here
// TODO top_bar needs a separate module

export class GameBoard {
  bareBoard: BareBoard;
  game: Game;
  svg: D3Selection;
  titleManager: TitleManager;
  popupManager: PopupManager;
  storage: Storage;
  progressPearls: ProgressPearls;
  stock: Stock;
  detectionBar: DetectionBar;
  logger: Logger;
  boardControls: D3Selection;
  tileHelper: TileHelper;

  constructor(svg: D3Selection, blinkSvg: D3Selection, game: Game, popupManager: PopupManager, storage: Storage, levelId: string) {

    const borderMargins = {
      top: 2,
      left: 4,
      bottom: 2,
      right: 1 + stockColumns,
    };
    this.bareBoard = new BareBoard(svg, this, 'orthogonal', 'Copenhagen',
      borderMargins, {
      tileRotated: this.tileRotatedCallback.bind(this),
      tileMouseover: this.tileMouseoverCallback.bind(this),
      animationStart: this.animationStartCallback.bind(this),
      animationInterrupt: this.animationInterruptCallback.bind(this),
      animationEnd: this.animationEndCallback.bind(this),
      setPlayButtonState: this.setPlayButtonState.bind(this),
    });

    this.game = game;
    this.svg = svg;

    this.titleManager = new TitleManager(
      this.svg.select('.title-bar'),
      this.svg.select('.subtitle-bar'),
      blinkSvg
    );
    this.titleManager.activateNextLevelButton(() => this.loadNextLevel());

    this.popupManager = popupManager;
    this.storage = storage;

    this.progressPearls = new ProgressPearls(
      svg,
      level.levels.filter((d) => d.group === 'Game'),
      this
    );
    this.progressPearls.g.attr('transform', `translate(${-1.8 * tileSize},${tileSize})`);
    this.progressPearls.draw();

    this.stock = new Stock(svg, this.bareBoard);
    this.bareBoard.stock = this.stock;  // such monkey patching not nice
    this.detectionBar = new DetectionBar(this.svg.select('.subtitle-bar'));
    this.detectionBar.g.attr('transform', `translate(${0.5 * tileSize},${tileSize / 4})`);
    this.logger = this.bareBoard.logger;
    this.logger.logAction('initialLevel');

    this.boardControls = svg.selectAll('.board-controls');
    this.activateBoardControls();

    this.loadLevel(levelId);
    this.tileHelper = new TileHelper(svg, this.bareBoard, this.game);
  }

  tileRotatedCallback(tile: Tile): void {
    this.showTileHelper(tile);
  }

  tileMouseoverCallback(tile: Tile): void {
    this.showTileHelper(tile);
  }

  animationStartCallback(): void {
    this.saveProgress();
    this.titleManager.displayMessage(
      'Experiment in progress...',
      'progress', -1);
  }

  animationInterruptCallback(): void {
    this.titleManager.displayMessage(
      'Experiment disturbed! Quantum states are fragile...',
      'failure');
    // Reset play/pause button to "play" state
    this.setPlayButtonState('play');
  }

  animationEndCallback(): void {

    const winningStatus = this.bareBoard.winningStatus;
    const level = this.bareBoard.level;

    // Reset play/pause button to "play" state
    this.setPlayButtonState('play');

    this.detectionBar.updateActual(
      winningStatus.totalProbAtDets,
      winningStatus.noOfFedDets,
      winningStatus.noExplosion ? 0 : winningStatus.probsAtMines
    );

    this.titleManager.displayMessage(
      winningStatus.message,
      winningStatus.isWon ? 'success' : 'failure',
      -1
    );

    if (winningStatus.isWon) {

      if (!this.storage.getLevelIsWon(level.id)) {
        if (window.ga) {
          window.ga('send', 'event', 'Level', 'won', level.id);
          window.console.log('level winning logged');
        } else {
          window.console.log('no Google Analytics to track winning');
        }
        window.setTimeout(
          () => this.popupManager.popup('You won!', {close: true, nextLevel: true}),
          absorptionDuration
        );
      }

      this.titleManager.showNextLevelButton(true);
      this.storage.setLevelIsWon(level.id, true);
      this.saveProgress();
      this.progressPearls.update();
    }
  }

  reset(): void {
    this.stop();

    // Reset detection
    this.setHeaderTexts();
    this.detectionBar.updateRequirements(
      this.bareBoard.level.requiredDetectionProbability,
      this.bareBoard.level.detectorsToFeed
    );

    // Reset play/pause button to "play" state
    this.setPlayButtonState('play');

    this.bareBoard.redraw();
    // Hack: bareBoard SVG sets its viewBox - use that information to set
    // the viewBox of blinking SVG
    // TODO(pathes): more elegant mechanism
    this.titleManager.blinkSvg.attr('viewBox', this.svg.attr('viewBox'));
    this.stock.elementCount(this.bareBoard.level);
    this.stock.drawStock();
  }

  stop(): void {
    this.bareBoard.stop();
  }

  get level(): Level {
    return this.bareBoard.level;
    // then also shortcut some gameBoard.level below
  }

  get title(): string {
    // const textBefore = (level) =>
    //   level.texts && level.texts.before ? `: "${level.texts.before}"` : '';
    // // const groupPrefix =
    // //   this.bareBoard.level.group ?
    // //   `[${this.bareBoard.level.group}] ` : '';
    // // return `${groupPrefix}${this.bareBoard.level.i}. ${this.bareBoard.level.name}${textBefore(this.bareBoard.level)}`;
    // return `${this.bareBoard.level.name}${textBefore(this.bareBoard.level)}`;
    return this.bareBoard.level.name;
  }

  get goalMessage(): string {
    if (this.bareBoard.level.requiredDetectionProbability === 0) {
      return 'GOAL: Avoid launching any mines!';
    } else if (this.bareBoard.level.detectorsToFeed === 0) {
      return 'GOAL: No goals! Freedom to do whatever you like. :)';
    } else if (this.bareBoard.level.detectorsToFeed === 1) {
      return `GOAL: Make the photon fall into a detector, with ${(100 * this.bareBoard.level.requiredDetectionProbability).toFixed(0)}% chance.`;
    } else {
      return `GOAL: Make the photon fall into ${this.bareBoard.level.detectorsToFeed} detectors, some probability to each, total of ${(100 * this.bareBoard.level.requiredDetectionProbability).toFixed(0)}%.`;
    }
  }

  get levelNumber(): number | string | undefined {
    return this.bareBoard.level.i;
  }

  setHeaderTexts(): void {
    this.titleManager.setTitle(this.title);
    this.titleManager.setDefaultMessage(this.goalMessage, '');
    this.titleManager.setLevelNumber(this.levelNumber);
  }

  showTileHelper(tile: Tile): void {

    this.tileHelper.show(tile);

  }

  /**
   * Set the play/pause button visual state.
   * @param newState string "play" or "pause"
   */
  setPlayButtonState(newState: 'play' | 'pause'): void {
    if (newState !== 'play' && newState !== 'pause') {
      return;
    }
    const actualIcon = this.boardControls.select('.play .actual-icon');
    const newStateIcon = d3.select(`#${newState}-icon`);
    actualIcon
      .transition()
      .duration(playPauseTransitionDuration)
      .attr('d', newStateIcon.attr('d'));
  }

   /**
    * Set up animation controls - bind events to buttons
    */
  activateBoardControls(): void {
    // Don't let d3 bind clicked element as `this` to methods.
    const gameBoard = this;
    const bareBoard = this.bareBoard;
    const boardControls = this.boardControls;
    boardControls.select('.play')
      .on('click', bareBoard.play.bind(bareBoard))
      .on('mouseover', () => gameBoard.titleManager.displayMessage('PLAY/PAUSE'));
    boardControls.select('.stop')
      .on('click', bareBoard.stop.bind(bareBoard))
      .on('mouseover', () => gameBoard.titleManager.displayMessage('STOP'));
    boardControls.select('.forward')
      .on('click', bareBoard.forward.bind(bareBoard))
      .on('mouseover', () => gameBoard.titleManager.displayMessage('NEXT STEP'));
    const durationToSlider = d3.scale.log()
      .domain([animationStepDurationMax, animationStepDurationMin])
      .range([0, 1]);

    boardControls.select('.speed')
      .on('click', function () {
        const baseWidth = 100; // width in px in SVG without scaling
        const mouseX = d3.mouse(this)[0];
        bareBoard.animationStepDuration = durationToSlider.invert(mouseX/baseWidth);
        gameBoard.titleManager.displayMessage(
          `Speed of light: ${(1000/bareBoard.animationStepDuration).toFixed(2)} tiles/s`,
          ''
        );

        d3.select(this).select('rect')
          .attr('x', mouseX - 3);
      })
      .on('mouseover', () => gameBoard.titleManager.displayMessage('CHANGE SPEED'));

    boardControls.select('.reset')
      .on('click', () => {
        gameBoard.reloadLevel(false);
      })
      .on('mouseover', () => gameBoard.titleManager.displayMessage('RESET LEVEL'));

    boardControls.select('.download')
      .on('click', () => {
        bareBoard.logger.logAction('download');
        gameBoard.downloadCurrentLevel();
      })
      .on('mouseover', () => gameBoard.titleManager.displayMessage('DOWNLOAD LEVEL AS JSON'));

    boardControls.select('.view-mode')
      .on('click', function () {
        let newMode;
        if (bareBoard.drawMode === 'oscilloscope') {
          newMode = 'orthogonal';
        } else {
          newMode = 'oscilloscope';
        }
        bareBoard.drawMode = newMode;
        d3.select(this)
          .select('text')
          .html(newMode);
      });

    boardControls.select('.measurement-mode')
      .on('click', function () {
        let newMode;
        if (bareBoard.measurementMode === 'Copenhagen') {
          newMode = 'delayed meas.';
        } else {
          newMode = 'Copenhagen';
        }
        bareBoard.measurementMode = newMode;
        d3.select(this)
          .select('text')
          .html(newMode);
      });
  }

  downloadCurrentLevel(): void {
    const levelJSON = stringify(this.bareBoard.exportBoard(), {maxLength: 100, indent: 2});
    const timestamp = (new Date()).toISOString();
    const fileName = `${this.bareBoard.level.name}_${timestamp}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json';
    const blob = new Blob([levelJSON], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, fileName);
    window.console.log(levelJSON);

    // now for testing
    window.console.log(
      'levelRecipe2queryString(this.bareBoard.exportBoard())',
      levelRecipe2queryString(this.bareBoard.exportBoard() as LevelRecipe)
    );

    window.console.log(
      'queryString2levelRecipe(levelRecipe2queryString(this.bareBoard.exportBoard()))',
       queryString2levelRecipe(levelRecipe2queryString(this.bareBoard.exportBoard() as LevelRecipe))
    );
  }


  loadLevel(levelId: string, checkStorage = true, dev = false): void {

    this.saveProgress();
    this.logger.save();
    this.logger.reset();

    let levelToLoad = null;
    let loadedFromStorage = false;

    // Try to load level from storage
    if (checkStorage && this.storage.hasLevelProgress(levelId)) {
      levelToLoad = this.storage.getLevelProgress(levelId);
      this.logger.logAction('loadLevel', {fromStorage: true});
      loadedFromStorage = true;
    }

    // Try to create level from scratch, if such exists
    if (!loadedFromStorage && level.idToLevel[levelId] != null) {
      levelToLoad = level.idToLevel[levelId];
      this.logger.logAction('loadLevel', {fromStorage: false});
    }

    // If levelId is invalid, load first Level
    if (levelToLoad == null) {
      // TODO(pathes): remove magic constant
      levelToLoad = level.levels[1];
      // NOTE(migdal): it is an ugly piece which already made me waste some time
      // ideally - exception; at very least - console.log
      window.console.log(`XXX For levelId ${levelId} there is no level; falling back to the first level.`);
      this.logger.logAction('invalidLoadLevel', {});
    }

    // Additionally, check if level is passed. If not, show popup.
    if (!this.storage.getLevelIsWon(levelToLoad.id) && levelToLoad.initialHint != null) {
      this.popupManager.popup(levelToLoad.initialHint, {close: true, nextLevel: false});
    }

    this.storage.setCurrentLevelId(levelId);
    this.bareBoard.level = new level.Level(levelToLoad, dev ? 'dev' : 'game');
    this.bareBoard.alreadyWon = this.storage.getLevelIsWon(levelId);
    this.reset();
    this.progressPearls.update();

    this.titleManager.showNextLevelButton(this.bareBoard.alreadyWon);

  }

  loadNextLevel(): void {
    if (this.bareBoard.level && this.bareBoard.level.next) {
      this.loadLevel(this.bareBoard.level.next);
    }
  }

  // dev = true only from console
  reloadLevel(dev = false): void {
    this.loadLevel(this.bareBoard.level.id!, false, dev);
  }

  saveProgress(): void {
    // Save progress if there was any level loaded
    if (this.bareBoard.level != null) {
      this.storage.setLevelProgress(this.bareBoard.level.id!, this.bareBoard.exportBoard());
    }
  }
}
