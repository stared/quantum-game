import _ from 'lodash';
import d3 from 'd3';

import {tileSize, tileBorder, DEV_MODE, animationStepDuration} from './config';
import {CanvasParticleAnimation} from './particle/canvas_particle_animation';
import * as simulation from './simulation';
import * as tile from './tile';
import {WinningStatus} from './winning_status';
import {bindDrag} from './drag_and_drop';
import {Logger} from './logger';
import {SoundService} from './sound_service';

export class BareBoard {
  constructor(svg, margin = {}, callbacks = {}) {
    this.svg = svg;
    this.margin = margin;
    this.tileMatrix = [];
    this.animationStepDuration = animationStepDuration;

    // NOTE maybe some event listener instead?
    this.callbacks = {
      tileRotated: callbacks.tileRotated || _.noop,
      tileMouseover: callbacks.tileMouseover || _.noop,
      animationStart: callbacks.animationStart || _.noop,
      animationInterrupt: callbacks.animationInterrupt || _.noop,
      animationEnd: callbacks.animationEnd || _.noop,
      setPlayButtonState: callbacks.setPlayButtonState || _.noop,
    };

    this.logger = new Logger();
    this.logger.logAction('initialLevel');

    // this field is modified by ParticleAnimation
    this.animationExists = false;
  }

  redraw() {
    // set tileMatrix according to the recipe
    this.clearTileMatrix();
    this.fillTileMatrix(this.level.tileRecipes);

    // works both as initial drawing and redrawing
    this.resizeSvg();
    this.drawBackground();
    this.drawBoardHints();
    this.drawBoard();
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

  resizeSvg() {
    const top = this.margin.top || 0;
    const left = this.margin.left || 0;
    const bottom = this.margin.bottom || 0;
    const right = this.margin.right || 0;
    // Use margin to calculate effective size
    const width = this.level.width + left + right;
    const height = this.level.height + top + bottom;
    // min-x, min-y, width and height
    this.svg.attr('viewBox', `${-tileSize * left} ${-tileSize * top} ${tileSize * width} ${tileSize * height}`);
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
        x: (d) => d.x + tileBorder,
        y: (d) => d.y + tileBorder,
        width: tileSize - 2 * tileBorder,
        height: tileSize - 2 * tileBorder,
      });
  }

  drawBoardHints() {

    const tipMargin = tileSize / 4;

    this.svg.select('.board-hints').remove();

    this.boardHints = this.svg.append('g')
      .attr('class', 'board-hints')
        .selectAll('.board-hint')
        .data(this.level.boardHints)
        .enter().append('g')
          .attr('class', 'board-hint')
          .attr('transform', (d) =>
            `translate(${tileSize * d.i + tipMargin},${tileSize * d.j + tipMargin})`
          )
          .on('click', function () {
            d3.select(this)
              .style('opacity', 1)
              .transition().duration(animationStepDuration)
                .style('opacity', 0);
          });

    this.boardHints.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', (d) => d.widthI * tileSize - 2 * tipMargin)
      .attr('height', tileSize - 2 * tipMargin);

    this.boardHints.append('text')
      .attr('x', (d) => d.widthI * tileSize / 2 - tipMargin)
      .attr('y', tileSize / 2 - tipMargin)
      .text((d) => d.text);

    // Triangle size unit
    const t = tileSize / 4;
    // Traingle dir to rotation
    const dirToRot = {
      bottom: 0,
      left: 90,
      top: 180,
      right: 270,
    };

    // Board hint can have a triangle tip (like in dialogue balloon)
    this.boardHints.filter((d) => d.triangleI != null)
      .append('path')
        .attr('d', `M${-t/2} 0 L0 ${t} L${t/2} 0 Z`)
        .attr('transform', (d) => `translate(${(d.triangleI - d.i) * tileSize + t}, ${t}) rotate(${dirToRot[d.triangleDir]}) translate(0, ${t})`);

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
      .append('rect')
        .attr('class', 'hitbox')
        .attr('x', -tileSize / 2)
        .attr('y', -tileSize / 2)
        .attr('width', tileSize)
        .attr('height', tileSize);

    this.clickBehavior(tileSelection, this);
    bindDrag(tileSelection, this, this.stock);

  }

  removeTile(i, j) {
    if (this.tileMatrix[i][j].node) {
      this.tileMatrix[i][j].node.remove();
    }
    this.tileMatrix[i][j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  clickBehavior(tileSelection, bareBoard) {
    tileSelection.select('.hitbox').on('click', (d) => {

      // Avoid rotation when dragged
      if (d3.event.defaultPrevented) {
        return;
      }

      // Avoid rotation when frozen
      if (d.frozen) {
        if (d.tileName === 'Source') {
          this.logger.logAction('play', {clickingSource: true});
          bareBoard.play();
        } else {
          // Do nothing on the board - only play the sound
          SoundService.playThrottled('error');
        }
        return;
      }

      if (bareBoard.animationExists) {
        this.logger.logAction('simulationStop', {cause: 'click on element'});
        bareBoard.stop();
        bareBoard.callbacks.animationInterrupt();
      }

      d.rotate();
      SoundService.playThrottled('blip');
      this.logger.logAction('rotate', {name: d.tileName, i: d.i, j: d.j, toRotation: d.rotation});
      bareBoard.callbacks.tileRotated(d);

    })
    .on('mouseover', function (d) {
      bareBoard.callbacks.tileMouseover(d);
      d3.select(this).classed('hitbox-disabled', d.frozen);
    });

    // this is a tricky part
    // freeze/unfreeze traingular button
    // FIX allow adding it later
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
   * Generate history.
   */
  generateHistory() {

    this.winningStatus = new WinningStatus(this.tileMatrix);
    this.winningStatus.run();
    if (this.level.group === 'Game') {
      this.winningStatus.compareToObjectives(
        this.level.requiredDetectionProbability,
        this.level.detectorsToFeed
      );
    } else {
      this.winningStatus.isWon = false;
      this.winningStatus.message = 'No goals, no judgement.';
      // "Wszystko wolno - hulaj dusza
      // Do niczego się nie zmuszaj!"
      // "Nie planować i nie marzyć
      // Co się zdarzy to się zdarzy.
      // Nie znać dobra ani zła
      // To jest gra i tylko gra!"
    }
    window.console.log(this.winningStatus);

    // 'improved' history for the first win
    const firstWin = this.winningStatus.isWon && !this.alreadyWon;
    this.alreadyWon = this.alreadyWon || this.winningStatus.isWon;

    // non-deterministic quantum simulation
    // (for animations)
    this.simulationQ = new simulation.Simulation(this.tileMatrix, 'logging');
    this.simulationQ.initialize();
    if (firstWin && this.winningStatus.totalProbAtDets > 0) {
      this.simulationQ.propagateToEndCheated(this.winningStatus.probsAtDetsByTime);
    } else {
      this.simulationQ.propagateToEnd(true);
    }

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
    * Generate history and animation.
    */
  generateAnimation() {
    if (this.animationExists) {
      this.particleAnimation.stop();
    }
    this.generateHistory();
    this.particleAnimation = new CanvasParticleAnimation(
      this,
      this.simulationQ.history,
      this.simulationQ.measurementHistory,
      this.winningStatus.absorptionProbabilities,
      this.callbacks.animationInterrupt,
      this.callbacks.animationEnd);
  }

  /**
   * Play animation. Generate history if necessary.
   */
  // TODO simplify its logic?
  play() {
    this.logger.logAction('simulationPlay');
    this.callbacks.animationStart();
    if (!this.animationExists) {
      this.generateAnimation();
    }
    // After generation, this.animationExists is true
    if (this.particleAnimation.playing) {
      this.particleAnimation.pause();
      this.callbacks.setPlayButtonState('play');
    } else {
      this.particleAnimation.play();
      this.callbacks.setPlayButtonState('pause');
    }
  }

  stop() {
    this.logger.logAction('simulationStop');
    if (this.animationExists) {
      this.particleAnimation.stop();
      this.callbacks.setPlayButtonState('play');
    }
  }

  forward() {
    if (!this.animationExists) {
      this.generateAnimation();
      this.particleAnimation.initialize();
    }
    // After generation, this.animationExists is true
    if (this.particleAnimation.playing) {
      this.particleAnimation.pause();
      this.callbacks.setPlayButtonState('play');
    } else {
      this.particleAnimation.forward();
    }
  }

  // NOTE maybe only exporting some
  exportBoard() {
    // should match interface from level.js
    return {
      name:   this.level.name,
      group:  this.level.group,
      id:     this.level.id,
      i:      this.level.i,
      next:   this.level.next,
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
      stock:                        this.stock ? this.stock.stock : {},  // hack for non-attached stock
      requiredDetectionProbability: this.level.requiredDetectionProbability,
      detectorsToFeed:              this.level.detectorsToFeed,
      texts:                        this.level.texts,
      initialHint:                  this.level.initialHint,
      boardHints:                   this.level.boardHints,
    };
  }

}
