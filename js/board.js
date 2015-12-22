import _ from 'lodash';
import d3 from 'd3';
import stringify from 'json-stringify-pretty-compact';

import {tileSize, repositionSpeed, DEV_MODE} from './config';
import {EPSILON_DETECTION} from './const';
import * as particles from './particles';
import * as simulation from './simulation';
import {Stock} from './stock';
import * as tile from './tile';
import {TransitionHeatmap} from './transition_heatmap';
import {Level} from './level';

function tileSimpler(name, i, j) {
  const tileClass = tile[name];
  return new tile.Tile(tileClass, 0, false, i, j);
}

export class Board {
  constructor(level, svg, helper, titleManager) {
    this.level = level;
    this.svg = svg;
    this.tileMatrix = [];
    if (DEV_MODE) {
      this.transitionHeatmap = new TransitionHeatmap(helper);
    }
    this.helper = helper;
    this.titleManager = titleManager;
  }

  reset() {
    // Reset detection
    // TODO(pathes): make a separate component for detection % and next level button
    d3.select('.top-bar__detection__value').html('0%');
    d3.select('.top-bar__detection__caption').html('detection');
    d3.select('.top-bar__detection').classed('top-bar__detection--success', false);
    d3.select('.top-bar__detection').on('click', _.noop);
    // Clear tiles
    this.clearTiles();

    // Fill board with proper tiles
    _.each(this.level.tileRecipes, (tileRecipe) => {
      this.tileMatrix[tileRecipe.i][tileRecipe.j] = new tile.Tile(
        tile[tileRecipe.name],
        tileRecipe.rotation || 0,
        !!tileRecipe.frozen,
        tileRecipe.i,
        tileRecipe.j
      );
    });

    const textBefore = (level) =>
      level.texts && level.texts.before ? `: "${level.texts.before}"` : '';

    // Setting texts
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

    // Initial drawing
    this.resizeSvg();
    this.drawBackground();
    this.drawBoard();
    this.drawStock();
  }

  clearTiles() {
    // Create matrix filled with Vacuum
    this.tileMatrix = _.range(this.level.width).map((i) =>
        _.range(this.level.height).map((j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
  }

  resizeSvg() {
    const margin = 1;
    const stockColumns = 2;
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

  drawStock() {
    // Reset stock object
    this.stock = new Stock(this.level);
    // Reset element
    this.svg.select('.stock').remove();
    this.stockGroup = this.svg
      .append('g')
      .attr('class', 'stock');
    const stockNames = this.stock.usedStockNames();
    // Add background
    const maxColumns = Math.ceil(stockNames.length / this.level.height);
    this.stockGroup
      .append('rect')
      .attr('width', maxColumns * tileSize)
      .attr('height', this.level.height * tileSize)
      .attr('transform', `translate(${(this.level.width + 1) * tileSize},0)`)
      .attr('class', 'stock-bg');
    // Create cells
    let column = 0;
    let row = 0;
    _.forEach(stockNames, (stockName) => {
      this.addStockCell(stockName, row, column);
      row++;
      if (row >= this.level.height) {
        row = 0;
        column++;
      }
    });
  }

  showTileHelper(d) {
    if (DEV_MODE) {
      this.transitionHeatmap.updateFromTensor(d.transitionAmplitudes.map);
    }
    this.helper.select('#element-name').html(d.type.desc.name);
    this.helper.select('#element-summary').html(d.type.desc.summary);
    this.helper.select('#element-flavour').html(d.type.desc.flavour ? `"${d.type.desc.flavour}"` : '');
  }

  addStockCell(stockName, row, column) {
    const i = this.level.width + 1 + column;
    const j = row;
    const tileObj = tileSimpler(stockName, i, j);
    // Additional information in tile - store stock data
    tileObj.stockItem = this.stock.stock[stockName];
    const tileSelection = this.stockGroup
      .datum(tileObj)
      .append('g')
        .attr('transform', (d) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`);
    tileObj.g = tileSelection;
    // DOM element for g
    tileObj.node = tileSelection[0][0];
    // Draw tile
    tileObj.draw();
    // Draw count
    const tileCount = tileSelection
      .append('text')
        .attr('transform', `translate(${tileSize / 4},${tileSize / 2})`);
    // Draw hitbox
    tileSelection
      .append('use')
        .attr('xlink:href', '#hitbox')
        .attr('class', 'hitbox')
        .on('mouseover', (d) => this.showTileHelper(d));
    // Bind drag handler
    this.bindDrag(tileSelection);
    // Store counter updater in stock
    tileObj.stockItem.update = () => {
      tileCount
        .html((d) => d.stockItem.currentCount);
      tileSelection
        .attr('class', (d) => {
          if (d.stockItem.currentCount > 0) {
            return 'tile stock--available';
          } else {
            return 'tile stock--depleted';
          }
        });
    };
    // ...and call it immediately.
    tileObj.stockItem.update();
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
    if (this.level.kind === 'dev' || DEV_MODE) {
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

    this.bindDrag(tileSelection);

  }

  removeTile(i, j) {
    if (this.tileMatrix[i][j].node) {
      this.tileMatrix[i][j].node.remove();
    }
    this.tileMatrix[i][j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  bindDrag(tileSelection) {

    function reposition(data, elem, speed = repositionSpeed) {
      delete data.newI;
      delete data.newJ;
      elem
        .transition()
        .duration(speed)
        .attr(
          'transform',
          `translate(${data.x + tileSize / 2},${data.y + tileSize / 2})`
        );
    }

    const drag = d3.behavior.drag();
    drag
      .on('dragstart', (source) => {
        d3.event.sourceEvent.stopPropagation();
        source.top = false;
        if (this.particleAnimation) {
          this.stop();
          this.titleManager.displayMessage(
            'Experiment disturbed! Quantum states are fragile...',
            'failure');
        }
      })
      .on('drag', function (source) {
        // Move element to the top
        if (!source.top) {
          // TODO still there are problems in Safari
          source.node.parentNode.appendChild(source.node);
          source.top = true;
        }
        // Is it impossible to drag item?
        if (source.frozen) {
          return;
        }

        d3.select(this)
          .attr('transform', `translate(${d3.event.x},${d3.event.y})`);
        source.newI = Math.floor(d3.event.x / tileSize);
        source.newJ = Math.floor(d3.event.y / tileSize);
      })
      .on('dragend', (source) => {
        // No drag? Return.
        if (source.newI == null || source.newJ == null) {
          return;
        }

        // Find source element
        const sourceElem = d3.select(source.node);
        const sourceTileName = source.tileName;

        // Drag ended outside of board?
        if (
             source.newI < 0 || source.newI >= this.level.width
          || source.newJ < 0 || source.newJ >= this.level.height
        ) {
          if (source.stockItem) {
            // Stock tile case: reposition.
            reposition(source, sourceElem);
          } else {
            // Board tile case: remove the tile and increase the counter in stock.
            this.stock.stock[sourceTileName].currentCount++;
            this.stock.stock[sourceTileName].update();
            this.removeTile(source.i, source.j);
          }
          return;
        }

        // Find target and target element
        const target = this.tileMatrix[source.newI][source.newJ];
        const targetElem = d3.select(target.node || null);
        const targetTileName = target.tileName;

        // Is it impossible to swap items? Reposition source and return.
        if (source.frozen || target.frozen) {
          reposition(source, sourceElem);
          return;
        }

        // Is it impossible to create item because stock limit depleted?
        if (source.stockItem) {
          if (source.stockItem.currentCount <= 0) {
            reposition(source, sourceElem);
            return;
          }
        }

        if (source.stockItem) {
          // Stock tile case:
          // Remove the target element
          if (targetTileName !== 'Vacuum') {
            this.removeTile(target.i, target.j);
            this.stock.stock[targetTileName].currentCount++;
            this.stock.stock[targetTileName].update();
          }
          // Create new element in place of the old one
          this.addTile(tileSimpler(sourceTileName, target.i, target.j));
          this.stock.stock[sourceTileName].currentCount--;
          this.stock.stock[sourceTileName].update();
          // Reposition instantly the stock element
          reposition(source, sourceElem, 0);
        } else {
          // Board tile case:
          // Swap items in matrix
          [this.tileMatrix[source.i][source.j], this.tileMatrix[target.i][target.j]] =
          [this.tileMatrix[target.i][target.j], this.tileMatrix[source.i][source.j]];
          // Swap items positions
          [source.i, source.j, target.i, target.j] =
          [target.i, target.j, source.i, source.j];
          // Reposition both elements
          reposition(source, sourceElem);
          reposition(target, targetElem);
        }
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
  }

  /**
   * Generate history.
   */
  generateHistory() {

    // non-deterministic quantum simulation
    // (for animations)
    this.simulationQ = new simulation.Simulation(this, 'logging');
    this.simulationQ.initialize();
    this.simulationQ.propagateToEnd(true);

    // deterministic classical simulation / quantum many-run probability
    // for winning conditions
    this.simulationC = new simulation.Simulation(this);
    this.simulationC.initialize();
    this.simulationC.propagateToEnd(false);
    this.absorptionProbabilities = _(this.simulationC.measurementHistory)
      .flatten()
      .groupBy((entry) => `${entry.i} ${entry.j}`)
      .mapValues((groupedEntry) =>
        _.sum(groupedEntry, 'probability')
    )
      .map((probability, location) => ({
        probability: probability,
        i: parseInt(location.split(' ')[0]),
        j: parseInt(location.split(' ')[1]),
      }))
      .value();

    // debugging, mostly the for numerical accuracy
    window.console.log('absorptionProbabilities', this.absorptionProbabilities);
  }

  /**
   * Generate footer callback.
   * @returns {Function} footer callback
   */
  generateFooterCallback() {
    const probsAtDets = this.absorptionProbabilities.filter((entry) =>
      this.tileMatrix[entry.i] && this.tileMatrix[entry.i][entry.j] && this.tileMatrix[entry.i][entry.j].tileName === 'Detector'
    );

    const totalProbAtDets = _.sum(probsAtDets, 'probability');

    this.titleManager.displayMessage(
      'Experiment in progress...',
      'progress');

    const footerCallback = () => {
      // TODO(pathes): make a separate component for detection % and next level button
      d3.select('.top-bar__detection__value').html(`${(100 * totalProbAtDets).toFixed(0)}%`);
      if (totalProbAtDets > this.level.requiredDetectionProbability - EPSILON_DETECTION) {
        if (probsAtDets.length === this.level.detectorsToFeed) {
          this.titleManager.displayMessage(
            'You did it!',
            'success');
          // TODO(pathes): make a separate component for detection % and next level button
          d3.select('.top-bar__detection').classed('top-bar__detection--success', true);
          // Is there a next level?
          if (this.level.kind === 'level') {
            // TODO(pathes): make a separate component for detection % and next level button
            d3.select('.top-bar__detection__caption').html('next level »');
            d3.select('.top-bar__detection').on('click', () => {
              this.level = new Level(this.level.next);
              this.reset();
            });
          }
        } else {
          this.titleManager.displayMessage(
            `${this.level.detectorsToFeed - probsAtDets.length} detector feels sad and forgotten. Be fair! Give some chance to every detector!`,
            'failure');
        }
      } else if (totalProbAtDets > EPSILON_DETECTION) {
        this.titleManager.displayMessage(
          `Only ${(100 * totalProbAtDets).toFixed(0)}% (out of ${(100 * this.level.requiredDetectionProbability).toFixed(0)}%) chance of detecting a photon at a detector. Try harder!`,
          'failure');
      } else {
        this.titleManager.displayMessage(
          'No chance to detect a photon at a detector.',
          'failure');
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
        this.absorptionProbabilities,
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
    };
  }

  clipBoard(link) {
    const levelJSON = stringify(this.exportBoard(), {maxLength: 100, indent: 2});
    link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(levelJSON)}`;
    window.console.log(levelJSON);
  }

}
