import _ from 'lodash';
import d3 from 'd3';
import stringify from 'json-stringify-pretty-compact';

import {tileSize, repositionSpeed, DEV_MODE, animationStepDuration, animationStepDurationMin, animationStepDurationMax, margin, stockColumns} from './config';
import * as config from './config';
import * as particles from './particles';
import * as simulation from './simulation';
import {Stock} from './stock';
import * as tile from './tile';
import {TransitionHeatmap} from './transition_heatmap';
import {Level} from './level';
import {WinningStatus} from './winning_status';

function tileSimpler(name, i, j) {
  const tileClass = tile[name];
  return new tile.Tile(tileClass, 0, false, i, j);
}

export class Board {
  constructor(level, svg, helper, titleManager, storage) {
    this.level = level;
    this.svg = svg;
    this.tileMatrix = [];
    if (DEV_MODE) {
      this.transitionHeatmap = new TransitionHeatmap(helper);
    }
    this.helper = helper;
    this.titleManager = titleManager;
    this.storage = storage;
    this.animationStepDuration = animationStepDuration;
    this.stock = new Stock(svg, this, this.bindDrag);
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

  setHeaderTexts() {
    const textBefore = (level) =>
      level.texts && level.texts.before ? `: "${level.texts.before}"` : '';

    this.titleManager.setTitle(
      `[${this.level.group}] ${this.level.i}. ${this.level.name}${textBefore(this.level)}`);

    let description;
    if (this.level.detectorsToFeed === 0) {
      description = 'GOAL: No goals! Freedom to do whatever you like. :)';
    } else if (this.level.detectorsToFeed === 1) {
      description = `GOAL: Make the photon fall into a detector, with ${(100 * this.level.requiredDetectionProbability).toFixed(0)}% chance.`;
    } else {
      description = `GOAL: Make the photon fall into ${this.level.detectorsToFeed} detectors, some probability to each, total of ${(100 * this.level.requiredDetectionProbability).toFixed(0)}%.`;
    }
    this.titleManager.setDescription(description);
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
      .selectAll('.tile')
      .data(_.chain(this.tileMatrix)  // NOTE I cannot just clone due to d.x and d.y getters
        .flatten()
        .map((d) => new tile.Tile(d.type, d.rotation, d.frozen, d.i, d.j))
        .value()
      )
      .enter()
      .append('rect')
      .attr({
        'class': 'tile',
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
    if (DEV_MODE) {
      this.transitionHeatmap.updateFromTensor(d.transitionAmplitudes.map);
    }
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
    const frost = tileSelection
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
        .attr('class', 'hitbox')
        .on('click', (d) => {

          // Avoid rotation when dragged
          if (d3.event.defaultPrevented) {
            return;
          }

          // Avoid rotation when frozen
          if (d.frozen) {
            if (d.tileName === 'Source') {
              this.play();
            }
            return;
          }

          if (this.particleAnimation) {
            this.stop();
            this.titleManager.displayMessage(
              'Experiment disturbed! Quantum states are fragile...',
              'failure');
          }

          d.rotate();
          this.showTileHelper(d);

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
            frost.attr('class', (d2) => d2.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen');
          });
    }

    this.bindDrag(tileSelection, this, this.stock);

  }

  removeTile(i, j) {
    if (this.tileMatrix[i][j].node) {
      this.tileMatrix[i][j].node.remove();
    }
    this.tileMatrix[i][j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  bindDrag(tileSelection, board, stock) {

    function reposition(data, keep = true, speed = repositionSpeed) {
      delete data.newI;
      delete data.newJ;

      data.g
        .transition()
        .duration(speed)
        .attr(
          'transform',
          `translate(${data.x + tileSize / 2},${data.y + tileSize / 2})`
        )
        .delay(speed)
        .each((d) => {
          if (!keep) {
            d.g.remove();
          }
        });
    }

    const drag = d3.behavior.drag();
    drag
      .on('dragstart', (source) => {

        d3.event.sourceEvent.stopPropagation();
        source.top = false;

        if (board.particleAnimation) {
          board.stop();
          board.titleManager.displayMessage(
            'Experiment disturbed! Quantum states are fragile...',
            'failure');
        }

        // Is it from stock?
        if (source.fromStock) {
          window.console.log('stock.stock[source.tileName]', stock.stock[source.tileName]);
          if (stock.stock[source.tileName] === 0) {
            source.dontDrag = true;
            return;
          }
          stock.regenerateTile(d3.select(source.node.parentNode));
          stock.updateCount(source.tileName, -1);
        }

      })
      .on('drag', function (source) {

        // Is it impossible to drag item?
        if (source.frozen) {
          return;
        }

        if (source.dontDrag) {
          return;
        }

        // Move element to the top
        if (!source.top) {
          // TODO still there are problems in Safari
          source.node.parentNode.appendChild(source.node);
          source.top = true;
        }

        d3.select(this)
          .attr('transform', `translate(${d3.event.x},${d3.event.y})`);
        source.newI = Math.floor(d3.event.x / tileSize);
        source.newJ = Math.floor(d3.event.y / tileSize);
      })
      .on('dragend', (source) => {

        if (source.dontDrag) {
          delete source.dontDrag;
          return;
        }

        // No drag? Return.
        if (source.newI == null || source.newJ == null) {
          if (source.fromStock) {
            source.g.remove();
          }
          return;
        }

        // Drag ended outside of board?
        // The put in into the stock!
        if (
             source.newI < 0 || source.newI >= board.level.width
          || source.newJ < 0 || source.newJ >= board.level.height
        ) {
          stock.updateCount(source.tileName, +1);
          if (source.fromStock) {
            reposition(source, false);
          } else {
            board.removeTile(source.i, source.j);
          }
          return;
        }

        // Otherwise...
        // Find target and target element
        const target = board.tileMatrix[source.newI][source.newJ];

        //  Dragged on an occupied tile?
        if (target.tileName !== 'Vacuum') {
          if (source.fromStock) {
            reposition(source, false);
            stock.updateCount(source.tileName, +1);
          } else {
            reposition(source, true);
          }
          return;
        }

        // Dragging on and empty tile
        if (!source.fromStock) {
          board.tileMatrix[source.i][source.j] = new tile.Tile(tile.Vacuum, 0, false, source.i, source.j);
        }
        board.tileMatrix[target.i][target.j] = source;
        source.i = target.i;
        source.j = target.j;
        if (source.fromStock) {
          source.fromStock = false;
          board.boardGroup.node().appendChild(source.node);
        }
        reposition(source, true);

      });

    tileSelection
      .call(drag);
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
        // to reset it to scratch, not only - to the last save
        this.level.initialStock = this.level.initialStock || {};
        this.level.tileRecipes
          .filter((tileRecipe) => !tileRecipe.frozen)
          .forEach((tileRecipe) => {
            this.level.initialStock[tileRecipe.name] = (this.level.initialStock[tileRecipe.name] || 0) + 1;
          });
        this.level.tileRecipes = this.level.tileRecipes
          .filter((tileRecipe) => tileRecipe.frozen);
        this.reset();
      });
    animationControls.select('#download')
      .on('click', function () {
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
        d3.select('.top-bar__detection').classed('top-bar__detection--success', true);
        if (this.level.group === 'Game') {
          // TODO(pathes): make a separate component for detection % and next level button
          d3.select('.top-bar__detection__caption').html('next level »');
          d3.select('.top-bar__detection').on('click', () => {
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
    if (!this.particleAnimation) {
      this.generateHistory();
      this.particleAnimation = new particles.SVGParticleAnimation(
        this,
        this.simulationQ.history,
        this.simulationQ.measurementHistory,
        this.winningStatus.absorptionProbabilities,
        this.generateFooterCallback());
      this.particleAnimation.initialize();
    }
    if (this.particleAnimation.playing) {
      this.particleAnimation.pause();
    } else {
      this.particleAnimation.play();
    }
  }

  stop() {
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
      stock: this.stock.stock,
    };
  }

  clipBoard(link) {
    const levelJSON = stringify(this.exportBoard(), {maxLength: 100, indent: 2});
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(levelJSON)}`;
    window.console.log(levelJSON);
  }

  loadLevel(levelRecipe, checkStorage = true) {

    let levelToLoad;

    if (!checkStorage) {
      levelToLoad = levelRecipe;
    } else {
      // save progress
      // TODO use hash of sorted elements so to ensure levels are unique?
      this.storage.setItem(
        `${this.level.group} ${this.level.name}`,
         stringify(this.exportBoard())
      );

      if (this.storage.hasOwnProperty(`${levelRecipe.group} ${levelRecipe.name}`)) {
        levelToLoad = JSON.parse(this.storage.getItem(`${levelRecipe.group} ${levelRecipe.name}`));
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
