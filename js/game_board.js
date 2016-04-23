import _ from 'lodash';
import d3 from 'd3';
import stringify from 'json-stringify-pretty-compact';

import {animationStepDurationMin, animationStepDurationMax} from './config';
import {Stock} from './stock';
import {Level} from './level';
import {BareBoard} from './bare_board';
import {ProgressPearls} from './progress_pearls';
import {TileHelper} from './tile_helper';

// FIX level loading/storing is still too hackish
// TODO decide where to use winning status; it seems I should move it here
// TODO top_bar needs a separate module

export class GameBoard {
  constructor(svg, game, titleManager, storage, level, levels) {

    this.bareBoard = new BareBoard(svg, {
      experimentDisturbed: this.experimentDisturbedCallback.bind(this),
      tileRotated: this.tileRotatedCallback.bind(this),
      tileMouseover: this.tileMouseoverCallback.bind(this),
      animationStart: this.animationStartCallback.bind(this),
      animationEnd: this.animationEndCallback.bind(this),
    });

    this.game = game;
    this.levels = levels;
    this.levelsLookup = _.indexBy(levels, (levelRecipe) => `${levelRecipe.group} ${levelRecipe.name}`);

    this.titleManager = titleManager;
    this.storage = storage;

    this.progressPearls = new ProgressPearls(
      svg,
      levels.filter((d) => d.group === 'Game'),
      this
    );
    this.progressPearls.draw();

    this.stock = new Stock(svg, this.bareBoard);
    this.bareBoard.stock = this.stock;  // such monkey patching not nice
    this.logger = this.bareBoard.logger;
    this.logger.logAction('initialLevel');

    this.loadLevel(level);

    this.tileHelper = new TileHelper(svg, this.bareBoard, this.game);
  }

  experimentDisturbedCallback() {
    this.titleManager.displayMessage(
      'Experiment disturbed! Quantum states are fragile...',
      'failure');
  }

  tileRotatedCallback(tile) {
    this.showTileHelper(tile);
  }

  tileMouseoverCallback(tile) {
    this.showTileHelper(tile);
  }

  animationStartCallback() {
    this.saveProgress();
    this.titleManager.displayMessage(
      'Experiment in progress...',
      'progress', -1);
  }

  animationEndCallback() {

    const winningStatus = this.bareBoard.winningStatus;
    const level = this.bareBoard.level;

    d3.select('.top-bar__detection__value').html(`${(100 * winningStatus.totalProbAtDets).toFixed(0)}%`);

    this.titleManager.displayMessage(
      winningStatus.message,
      winningStatus.isWon ? 'success' : 'failure'
    );

    if (winningStatus.isWon) {

      // TODO(migdal): make it more serious
      this.storage.setItem(
        `isWon ${level.group} ${level.name}`,
         'true'
      );
      this.saveProgress();
      this.progressPearls.update();

      d3.select('.top-bar__detection').classed('top-bar__detection--success', true);
      if (level.group === 'Game') {
        // TODO(pathes): make a separate component for detection % and next level button
        d3.select('.top-bar__detection__caption').html('next level »');
        d3.select('.top-bar__detection').on('click', () => {
          this.logger.logAction('nextLevelButton');
          this.loadLevel(level.next);
        });
      }
    }
  }

  reset() {
    // Reset detection
    // TODO(pathes): make a separate component for detection % and next level button
    d3.select('.top-bar__detection__value').html('0%');
    d3.select('.top-bar__detection__caption').html('detection');
    d3.select('.top-bar__detection').classed('top-bar__detection--success', false);
    d3.select('.top-bar__detection').on('click', _.noop);
    this.setHeaderTexts();

    this.bareBoard.redraw();
    this.stock.elementCount(this.bareBoard.level);
    this.stock.drawStock();
  }

  stop() {
    this.bareBoard.stop();
  }

  get level() {
    return this.bareBoard.level;
    // then also shortcut some gameBoard.level below
  }

  get title() {
    const textBefore = (level) =>
      level.texts && level.texts.before ? `: "${level.texts.before}"` : '';

    return `[${this.bareBoard.level.group}] ${this.bareBoard.level.i}. ${this.bareBoard.level.name}${textBefore(this.bareBoard.level)}`;
  }

  get subtitle() {
    if (this.bareBoard.level.detectorsToFeed === 0) {
      return 'GOAL: No goals! Freedom to do whatever you like. :)';
    } else if (this.bareBoard.level.detectorsToFeed === 1) {
      return `GOAL: Make the photon fall into a detector, with ${(100 * this.bareBoard.level.requiredDetectionProbability).toFixed(0)}% chance.`;
    } else {
      return `GOAL: Make the photon fall into ${this.bareBoard.level.detectorsToFeed} detectors, some probability to each, total of ${(100 * this.bareBoard.level.requiredDetectionProbability).toFixed(0)}%.`;
    }
  }

  setHeaderTexts() {
    this.titleManager.setTitle(this.title);
    this.titleManager.setDescription(this.subtitle);
  }

  showTileHelper(tile) {

    this.tileHelper.show(tile);

  }

   /*
   * Set up animation controls - bind events to buttons
   * @param animationControls d3-wrapped container for control buttons
   */
  setAnimationControls(animationControls) {
    // Don't let d3 bind clicked element as `this` to methods.
    const gameBoard = this;
    const bareBoard = this.bareBoard;
    animationControls.select('.play')
      .on('click', bareBoard.play.bind(bareBoard));
    animationControls.select('.stop')
      .on('click', bareBoard.stop.bind(bareBoard));
    animationControls.select('.forward')
      .on('click', bareBoard.forward.bind(bareBoard));
    animationControls.select('.reset')
      .on('click', () => {
        gameBoard.reloadLevel(false);
      });
    animationControls.select('#download')
      .on('click', function () {
        bareBoard.logger.logAction('reset');
        gameBoard.clipBoard(this);
      });

    const durationToSlider = d3.scale.log()
      .domain([animationStepDurationMax, animationStepDurationMin])
      .range([0, 1]);

    animationControls.select('#speed')
      .on('click', function () {
        const sliderWidth = this.getBoundingClientRect().width;
        const mouseX = d3.mouse(this)[0];
        bareBoard.animationStepDuration = durationToSlider.invert(mouseX/sliderWidth);
        window.console.log(`New speed: ${(1000/bareBoard.animationStepDuration).toFixed(2)} tiles/s`);

        d3.select(this).select('rect')
          .attr('x', 32 * mouseX/sliderWidth - 1);
      });

  }

  clipBoard(link) {
    const levelJSON = stringify(this.bareBoard.exportBoard(), {maxLength: 100, indent: 2});
    link.download = _.kebabCase(`${this.bareBoard.level.name}_${(new Date()).toISOString()}`) + '.json';
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(levelJSON)}`;
    window.console.log(levelJSON);
  }

  loadLevel(levelRecipe, checkStorage = true, dev = false) {

    window.console.log('log from the last level', stringify(this.logger.log));
    this.logger.save();
    this.logger.reset();

    let levelToLoad;

    if (!checkStorage) {
      levelToLoad = levelRecipe;
      this.logger.logAction('loadLevel', {fromStorage: false});
    } else {
      this.saveProgress();

      if (this.storage.hasOwnProperty(`${levelRecipe.group} ${levelRecipe.name}`)) {
        levelToLoad = JSON.parse(this.storage.getItem(`${levelRecipe.group} ${levelRecipe.name}`));
        this.logger.logAction('loadLevel', {fromStorage: true});
      } else {
        levelToLoad = levelRecipe;
      }
    }

    this.bareBoard.level = new Level(levelToLoad, dev ? 'dev' : 'game');
    this.bareBoard.level.i = levelRecipe.i;
    this.bareBoard.level.next = levelRecipe.next;
    this.reset();
    this.progressPearls.update();
  }

  // dev = true only from console
  reloadLevel(dev) {
    this.loadLevel(this.levelsLookup[`${this.bareBoard.level.group} ${this.bareBoard.level.name}`], false, dev);
  }

  saveProgress() {
    // Save progress if there was any level loaded
    // TODO use hash of sorted elements so to ensure levels are unique?
    if (this.bareBoard.level != null) {
      this.storage.setItem(
        `${this.bareBoard.level.group} ${this.bareBoard.level.name}`,
         stringify(this.bareBoard.exportBoard())
      );
    }
  }
}
