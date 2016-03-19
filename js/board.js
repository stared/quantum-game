import _ from 'lodash';
import d3 from 'd3';
import stringify from 'json-stringify-pretty-compact';

import {tileSize, repositionSpeed, DEV_MODE, animationStepDuration, animationStepDurationMin, animationStepDurationMax, margin, stockColumns} from './config';
import * as config from './config';
import * as particles from './particles';
import * as simulation from './simulation';
import {Stock} from './stock';
import * as tile from './tile';
import {Level} from './level';
import {WinningStatus} from './winning_status';
import {bindDrag} from './drag_and_drop';
import {Logger} from './logger';
import {SoundService} from './sound_service';

function tileSimpler(name, i, j) {
  const tileClass = tile[name];
  return new tile.Tile(tileClass, 0, false, i, j);
}

export class Board {
  constructor(level, svg, helper, titleManager, levels, progressPearls, storage) {
    this.level = level;
    this.levels = levels;
    this.levelsLookup = _.indexBy(levels, (levelRecipe) => `${levelRecipe.group} ${levelRecipe.name}`);
    this.svg = svg;
    this.tileMatrix = [];
    this.helper = helper;
    this.titleManager = titleManager;
    this.progressPearls = progressPearls;
    this.storage = storage;
    this.animationStepDuration = animationStepDuration;
    this.stock = new Stock(svg, this);
    this.logger = new Logger();
    this.logger.logAction('initialLevel');
  }

  reset() {
    // Reset detection
    // TODO(pathes): make a separate component for detection % and next level button
    d3.select('.top-bar__detection__value').html('0%');
    d3.select('.top-bar__detection__caption').html('detection');
    d3.select('.top-bar__detection').classed('top-bar__detection--success', false);
    d3.select('.top-bar__detection').on('click', _.noop);

    // set tileMatrix according to the recipe
    this.clearTileMatrix();
    this.fillTileMatrix(this.level.tileRecipes);

    // Initial drawing
    this.setHeaderTexts();
    this.resizeSvg();
    this.drawBackground();
    this.drawBoard();
    this.stock.elementCount(this.level);
    this.stock.drawStock();
  }

  clearTileMatrix() {
    // Create matrix filled with Vacuum
    this.tileMatrix = _.range(this.level.width).map((i) =>
        _.range(this.level.height).map((j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
  }

  fillTileMatrix(tileRecipes) {
    _.each(tileRecipes, (tileRecipe) => {
      this.tileMatrix[tileRecipe.i][tileRecipe.j] = new tile.Tile(
        tile[tileRecipe.name],
        tileRecipe.rotation || 0,
        !!tileRecipe.frozen,
        tileRecipe.i,
        tileRecipe.j
      );
    });
  }

  get title() {
    const textBefore = (level) =>
      level.texts && level.texts.before ? `: "${level.texts.before}"` : '';

    return `[${this.level.group}] ${this.level.i}. ${this.level.name}${textBefore(this.level)}`;
  }

  get subtitle() {
    if (this.level.detectorsToFeed === 0) {
      return 'GOAL: No goals! Freedom to do whatever you like. :)';
    } else if (this.level.detectorsToFeed === 1) {
      return `GOAL: Make the photon fall into a detector, with ${(100 * this.level.requiredDetectionProbability).toFixed(0)}% chance.`;
    } else {
      return `GOAL: Make the photon fall into ${this.level.detectorsToFeed} detectors, some probability to each, total of ${(100 * this.level.requiredDetectionProbability).toFixed(0)}%.`;
    }
  }

  setHeaderTexts() {
    this.titleManager.setTitle(this.title);
    this.titleManager.setDescription(this.subtitle);
  }

  resizeSvg() {
    const width = this.level.width + 2 * margin + stockColumns;
    const height = this.level.height + 2 * margin;
    // top left width height
    this.svg.attr('viewBox', `${-tileSize} ${-tileSize} ${tileSize * width} ${tileSize * height}`);
  }

  /**
   * Draw background - a grid of squares.
   */
  drawBackground() {

    this.svg.select('.background').remove();

    this.svg
      .append('g')
      .attr('class', 'background')
      .selectAll('.background-tile')
      .data(_.chain(this.tileMatrix)  // NOTE I cannot just clone due to d.x and d.y getters
        .flatten()
        .map((d) => new tile.Tile(d.type, d.rotation, d.frozen, d.i, d.j))
        .value()
      )
      .enter()
      .append('rect')
      .attr({
        'class': 'background-tile',
        x: (d) => d.x,
        y: (d) => d.y,
        width: tileSize,
        height: tileSize,
      });
  }

  showTileHelper(d) {

    // temporary hover
    this.titleManager.displayMessage(
      `this is: ${d.type.desc.name}`,
      'hover');

    // things below currently don't work (due to interface changes)
    this.helper.select('#element-name').html(d.type.desc.name);
    this.helper.select('#element-summary').html(d.type.desc.summary);
    this.helper.select('#element-flavour').html(d.type.desc.flavour ? `"${d.type.desc.flavour}"` : '');
  }

  /**
   * Draw board: tiles and their hitboxes.
   * Also, bind click and drag events.
   */
  drawBoard() {

    this.svg.select('.board').remove();
    this.boardGroup = this.svg
      .append('g')
      .attr('class', 'board');

    _.flatten(this.tileMatrix)
        .filter((t) => t.type !== tile.Vacuum)
        .forEach((t) => this.addTile(t));
  }

  addTile(tileObj) {

    this.removeTile(tileObj.i, tileObj.j);
    this.tileMatrix[tileObj.i][tileObj.j] = tileObj;

    const tileSelection = this.boardGroup
      .datum(tileObj)
      .append('g')
        .attr('class', 'tile')
        .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`);

    tileObj.g = tileSelection;
    // DOM element for g
    tileObj.node = tileSelection[0][0];

    // frozen background
    tileSelection
      .append('rect')
        .attr('class', (d) => d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen')
        .attr('x', -tileSize / 2)
        .attr('y', -tileSize / 2)
        .attr('width', tileSize)
        .attr('height', tileSize);

    tileObj.draw();

    // hitbox
    tileSelection
      .append('use')
        .attr('xlink:href', '#hitbox')
        .attr('class', 'hitbox');

    this.clickBehavior(tileSelection, this);
    bindDrag(tileSelection, this, this.stock);

  }

  removeTile(i, j) {
    if (this.tileMatrix[i][j].node) {
      this.tileMatrix[i][j].node.remove();
    }
    this.tileMatrix[i][j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  clickBehavior(tileSelection, board) {
    tileSelection.select('.hitbox').on('click', (d) => {

      // Avoid rotation when dragged
      if (d3.event.defaultPrevented) {
        return;
      }

      // Avoid rotation when frozen
      if (d.frozen) {
        if (d.tileName === 'Source') {
          this.logger.logAction('play', {clickingSource: true});
          board.play();
        } else {
          // Do nothing on the board - only play the sound
          SoundService.playThrottled('error');
        }
        return;
      }

      if (board.particleAnimation) {
        this.logger.logAction('simulationStop', {cause: 'click on element'});
        board.stop();
        board.titleManager.displayMessage(
          'Experiment disturbed! Quantum states are fragile...',
          'failure');
      }

      d.rotate();
      SoundService.playThrottled('blip');
      this.logger.logAction('rotate', {name: d.tileName, i: d.i, j: d.j, toRotation: d.rotation});
      board.showTileHelper(d);

    })
    .on('mouseover', (d) => this.showTileHelper(d));

    // freeze/unfreeze traingular button
    if (this.level.group === 'A Dev' || DEV_MODE) {
      tileSelection
        .append('path')
          .attr('class', 'triangular')
          .attr('d', 'M 0 0 L -1 0 L 0 1 Z')
          .attr('transform', `translate(${tileSize / 2},${-tileSize / 2}) scale(${tileSize / 4})`)
          .on('click', (d) => {
            d.frozen = !d.frozen;
            this.logger.logAction('changeFreeze', {name: d.tileName, i: d.i, j: d.j, toFrozen: d.frozen});
            d.g.select('.frost')
              .attr('class', d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen');
          });
    }
  }

  /**
   * Set up animation controls - bind events to buttons
   * @param animationControls d3-wrapped container for control buttons
   */
  setAnimationControls(animationControls) {
    // Don't let d3 bind clicked element as `this` to methods.
    const board = this;
    animationControls.select('.play')
      .on('click', this.play.bind(board));
    animationControls.select('.stop')
      .on('click', this.stop.bind(board));
    animationControls.select('.backward')
      .style('opacity', 0.4)  // as not yet implemented
      .on('click', this.backward.bind(board));
    animationControls.select('.forward')
      .on('click', this.forward.bind(board));
    animationControls.select('.reset')
      .on('click', () => {
        this.loadLevel(this.levelsLookup[`${this.level.group} ${this.level.name}`], false);
      });
    animationControls.select('#download')
      .on('click', function () {
        this.logger.logAction('reset');
        board.clipBoard(this);
      });

    const durationToSlider = d3.scale.log()
      .domain([animationStepDurationMax, animationStepDurationMin])
      .range([0, 1]);

    animationControls.select('#speed')
      .on('click', function () {
        const sliderWidth = this.getBoundingClientRect().width;
        const mouseX = d3.mouse(this)[0];
        board.animationStepDuration = durationToSlider.invert(mouseX/sliderWidth);
        window.console.log(`New speed: ${(1000/board.animationStepDuration).toFixed(2)} tiles/s`);

        d3.select(this).select('rect')
          .attr('x', 32 * mouseX/sliderWidth - 1);
      });

  }

  /**
   * Generate history.
   */
  generateHistory() {

    // non-deterministic quantum simulation
    // (for animations)
    this.simulationQ = new simulation.Simulation(this.tileMatrix, 'logging');
    this.simulationQ.initialize();
    this.simulationQ.propagateToEnd(true);

    this.winningStatus = new WinningStatus(this.tileMatrix);
    this.winningStatus.run();
    this.winningStatus.compareToObjectives(this.level.requiredDetectionProbability, this.level.detectorsToFeed);
    window.console.log(this.winningStatus);
    this.logger.logAction('run', {
      isWon: this.winningStatus.isWon,
      enoughProbability: this.winningStatus.enoughProbability,
      totalProbAtDets: this.winningStatus.totalProbAtDets,
      enoughDetectors: this.winningStatus.enoughDetectors,
      noOfFedDets: this.winningStatus.noOfFedDets,
      noExplosion: this.winningStatus.noExplosion,
      probsAtMines: this.winningStatus.probsAtMines,
    });

  }

  /**
   * Generate footer callback.
   * @returns {Function} footer callback
   */
  generateFooterCallback() {

    this.titleManager.displayMessage(
      'Experiment in progress...',
      'progress');

    const footerCallback = () => {
      d3.select('.top-bar__detection__value').html(`${(100 * this.winningStatus.totalProbAtDets).toFixed(0)}%`);

      this.titleManager.displayMessage(
        this.winningStatus.message,
        this.winningStatus.isWon ? 'success' : 'failure'
      );

      if (this.winningStatus.isWon) {

        // TODO(migdal): make it more serious
        this.storage.setItem(
          `isWon ${this.level.group} ${this.level.name}`,
           'true'
        );
        this.progressPearls.update();

        d3.select('.top-bar__detection').classed('top-bar__detection--success', true);
        if (this.level.group === 'Game') {
          // TODO(pathes): make a separate component for detection % and next level button
          d3.select('.top-bar__detection__caption').html('next level »');
          d3.select('.top-bar__detection').on('click', () => {
            this.logger.logAction('nextLevelButton');
            this.loadLevel(this.level.next);
          });
        }
      }

      this.particleAnimation = null;
    };

    return footerCallback;
  }

  /**
   * Play animation. Generate history if necessary.
   */
  play() {
    this.logger.logAction('simulationPlay');
    if (!this.particleAnimation) {
      this.generateHistory();
      this.particleAnimation = new particles.CanvasParticleAnimation(
        this,
        this.simulationQ.history,
        this.simulationQ.measurementHistory,
        this.winningStatus.absorptionProbabilities,
        this.generateFooterCallback());
    }
    if (this.particleAnimation.playing) {
      this.particleAnimation.pause();
    } else {
      this.particleAnimation.play();
    }
  }

  stop() {
    this.logger.logAction('simulationStop');
    if (this.particleAnimation) {
      this.particleAnimation.stop();
      this.particleAnimation = null;
    }
  }

  forward() {
    if (this.particleAnimation) {
      if (this.particleAnimation.playing) {
        this.particleAnimation.pause();
      } else {
        this.particleAnimation.forward();
      }
    }
  }

  backward() {
    if (this.particleAnimation) {
      if (this.particleAnimation.playing) {
        this.particleAnimation.pause();
      } else {
        this.particleAnimation.backward();
      }
    }
  }

  exportBoard() {
    // should match interface from level.js
    return {
      name:   this.level.name,
      group:  this.level.group,
      width:  this.level.width,
      height: this.level.height,
      tiles:  _.chain(this.tileMatrix)
        .flatten()
        .filter((d) => d.tileName !== 'Vacuum')
        .map((d) => ({
          i: d.i,
          j: d.j,
          name: d.tileName,
          rotation: d.rotation,
          frozen: d.frozen,
        })),
      stock:                        this.stock.stock,
      requiredDetectionProbability: this.level.requiredDetectionProbability,
      detectorsToFeed:              this.level.detectorsToFeed,
      texts:                        this.level.texts,
    };
  }

  clipBoard(link) {
    const levelJSON = stringify(this.exportBoard(), {maxLength: 100, indent: 2});
    link.download = _.kebabCase(`${this.level.name}_${(new Date()).toISOString()}`) + '.json';
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(levelJSON)}`;
    window.console.log(levelJSON);
  }

  loadLevel(levelRecipe, checkStorage = true) {

    window.console.log('log from the last level', stringify(this.logger.log));
    this.logger.save();
    this.logger.reset();

    let levelToLoad;

    if (!checkStorage) {
      levelToLoad = levelRecipe;
      this.logger.logAction('loadLevel', {fromStorage: false});
    } else {
      // save progress
      // TODO use hash of sorted elements so to ensure levels are unique?
      this.storage.setItem(
        `${this.level.group} ${this.level.name}`,
         stringify(this.exportBoard())
      );

      if (this.storage.hasOwnProperty(`${levelRecipe.group} ${levelRecipe.name}`)) {
        levelToLoad = JSON.parse(this.storage.getItem(`${levelRecipe.group} ${levelRecipe.name}`));
        this.logger.logAction('loadLevel', {fromStorage: true});
      } else {
        levelToLoad = levelRecipe;
      }
    }

    this.level = new Level(levelToLoad);
    this.level.i = levelRecipe.i;
    this.level.next = levelRecipe.next;
    this.reset();

  }
}
