import d3 from './d3-wrapper';

import {tileSize, tileBorder, animationStepDuration} from './config';
import {CanvasParticleAnimation} from './particle/canvas_particle_animation';
import * as simulation from './simulation';
import * as tile from './tile';
import {WinningStatus} from './winning_status';
import {bindDrag} from './drag_and_drop';
import {Logger} from './logger';
import {SoundService} from './sound_service';
import type {D3Selection, TileRecipe} from './types';
import type {Level} from './level';
import type {GameBoard} from './game_board';
import type {Stock} from './stock';
import type {Tile} from './tile';

type DrawMode = 'orthogonal' | 'oscilloscope';
type MeasurementMode = 'Copenhagen' | 'delayed meas.';

interface Margin {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

interface BareBoardCallbacks {
  tileRotated?: (tile: Tile) => void;
  tileMouseover?: (tile: Tile) => void;
  animationStart?: () => void;
  animationInterrupt?: () => void;
  animationEnd?: () => void;
  setPlayButtonState?: (state: 'play' | 'pause') => void;
}

export class BareBoard {
  svg: D3Selection;
  gameBoard: GameBoard;
  drawMode: DrawMode;
  measurementMode: MeasurementMode;
  margin: Margin;
  tileMatrix: Tile[][];
  animationStepDuration: number;
  callbacks: Required<BareBoardCallbacks>;
  logger: Logger;
  animationExists: boolean;
  level!: Level;
  stock?: Stock;
  boardHints?: D3Selection;
  boardGroup?: D3Selection;
  winningStatus!: WinningStatus;
  alreadyWon?: boolean;
  simulationQ!: simulation.Simulation;
  particleAnimation!: CanvasParticleAnimation;

  constructor(svg: D3Selection, gameBoard: GameBoard, drawMode: DrawMode = 'orthogonal', measurementMode: MeasurementMode = 'Copenhagen', margin: Margin = {}, callbacks: BareBoardCallbacks = {}) {
    this.svg = svg;
    this.gameBoard = gameBoard;
    // TODO: refactor as it is being changed remotly
    this.drawMode = drawMode;
    this.measurementMode = measurementMode;

    this.margin = margin;
    this.tileMatrix = [];
    this.animationStepDuration = animationStepDuration;

    // NOTE maybe some event listener instead?
    this.callbacks = {
      tileRotated: callbacks.tileRotated || (() => {}),
      tileMouseover: callbacks.tileMouseover || (() => {}),
      animationStart: callbacks.animationStart || (() => {}),
      animationInterrupt: callbacks.animationInterrupt || (() => {}),
      animationEnd: callbacks.animationEnd || (() => {}),
      setPlayButtonState: callbacks.setPlayButtonState || (() => {}),
    };

    this.logger = new Logger();
    this.logger.logAction('initialLevel');

    // this field is modified by ParticleAnimation
    this.animationExists = false;
  }

  redraw(): void {
    // set tileMatrix according to the recipe
    this.clearTileMatrix();
    this.fillTileMatrix(this.level.tileRecipes);

    // works both as initial drawing and redrawing
    this.resizeSvg();
    this.drawBackground();
    this.drawBoardHints();
    this.drawBoard();
  }

  clearTileMatrix(): void {
    // Create matrix filled with Vacuum
    this.tileMatrix = Array.from({length: this.level.width}, (_, i) =>
        Array.from({length: this.level.height}, (_, j) =>
            new tile.Tile(tile.Vacuum, 0, false, i, j)
        )
    );
  }

  fillTileMatrix(tileRecipes: TileRecipe[]): void {
    tileRecipes.forEach((tileRecipe) => {
      this.tileMatrix[tileRecipe.i]![tileRecipe.j] = new tile.Tile(
        tile[tileRecipe.name as keyof typeof tile] as tile.TileType,
        tileRecipe.rotation || 0,
        !!tileRecipe.frozen,
        tileRecipe.i,
        tileRecipe.j
      );
    });
  }

  resizeSvg(): void {
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
  drawBackground(): void {

    this.svg.select('.background').remove();

    this.svg
      .append('g')
      .attr('class', 'background')
      .selectAll('.background-tile')
      .data(
        this.tileMatrix.flat().map((d) => new tile.Tile(d.type, d.rotation, d.frozen, d.i, d.j))
      )
      .enter()
      .append('rect')
      .attr('class', 'background-tile')
      .attr('x', (d: tile.Tile) => d.x + tileBorder)
      .attr('y', (d: tile.Tile) => d.y + tileBorder)
      .attr('width', tileSize - 2 * tileBorder)
      .attr('height', tileSize - 2 * tileBorder);
  }

  drawBoardHints(): void {

    const tipMargin = tileSize / 4;

    this.svg.select('.board-hints').remove();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.boardHints = this.svg.append('g')
      .attr('class', 'board-hints')
        .selectAll('.board-hint')
        .data(this.level.boardHints)
        .enter().append('g')
          .attr('class', 'board-hint')
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr('transform', (d: any) =>
            `translate(${tileSize * d.i + tipMargin},${tileSize * d.j + tipMargin})`
          )
          .on('click', function (this: Element, _event) {
            d3.select(this)
              .style('opacity', 1)
              .transition().duration(animationStepDuration)
                .style('opacity', 0);
          });

    this.boardHints!.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('width', (d: any) => d.widthI * tileSize - 2 * tipMargin)
      .attr('height', tileSize - 2 * tipMargin);

    this.boardHints!.append('text')
      .attr('x', (d: any) => d.widthI * tileSize / 2 - tipMargin)
      .attr('y', tileSize / 2 - tipMargin)
      .text((d: any) => d.text);

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.boardHints!.filter((d: any) => d.triangleI != null)
      .append('path')
        .attr('d', `M${-t/2} 0 L0 ${t} L${t/2} 0 Z`)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .attr('transform', (d: any) => `translate(${(d.triangleI - d.i) * tileSize + t}, ${t}) rotate(${dirToRot[d.triangleDir as keyof typeof dirToRot]}) translate(0, ${t})`);

  }

  /**
   * Draw board: tiles and their hitboxes.
   * Also, bind click and drag events.
   */
  drawBoard(): void {

    this.svg.select('.board').remove();
    this.boardGroup = this.svg
      .append('g')
      .attr('class', 'board');

    this.tileMatrix.flat()
        .filter((t) => t.type !== tile.Vacuum)
        .forEach((t) => this.addTile(t));
  }

  addTile(tileObj: Tile): void {

    this.removeTile(tileObj.i, tileObj.j);
    this.tileMatrix[tileObj.i]![tileObj.j] = tileObj;

    const tileSelection = this.boardGroup!
      .append('g')
        .datum(tileObj)
        .attr('class', 'tile')
        .attr('transform', (d: tile.Tile) => `translate(${d.x + tileSize / 2},${d.y + tileSize / 2})`);

    tileObj.g = tileSelection;
    // DOM element for g
    tileObj.node = tileSelection.node() as Element;

    // frozen background
    tileSelection
      .append('rect')
        .attr('class', (d: tile.Tile) => d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen')
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
    bindDrag(tileSelection, this, this.stock!);

  }

  removeTile(i: number, j: number): void {
    if (this.tileMatrix[i]![j]!.node) {
      this.tileMatrix[i]![j]!.node!.remove();
    }
    this.tileMatrix[i]![j] = new tile.Tile(tile.Vacuum, 0, false, i, j);
  }

  clickBehavior(tileSelection: D3Selection, bareBoard: BareBoard): void {
    tileSelection.select('.hitbox').on('click', (event, d: Tile) => {

      // Avoid rotation when dragged
      if (event.defaultPrevented) {
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
    .on('mouseover', function (_event: any, d: Tile) {
      bareBoard.callbacks.tileMouseover(d);
      d3.select(this).classed('hitbox-disabled', d.frozen);
    });

    // this is a tricky part
    // freeze/unfreeze traingular button
    // FIX allow adding it later
    if (this.level.group === 'A Dev') {
      tileSelection
        .append('path')
          .attr('class', 'triangular')
          .attr('d', 'M 0 0 L -1 0 L 0 1 Z')
          .attr('transform', `translate(${tileSize / 2},${-tileSize / 2}) scale(${tileSize / 4})`)
          .on('click', (_event, d: Tile) => {
            d.frozen = !d.frozen;
            this.logger.logAction('changeFreeze', {name: d.tileName, i: d.i, j: d.j, toFrozen: d.frozen});
            d.g!.select('.frost')
              .attr('class', d.frozen ? 'frost frost-frozen' : 'frost frost-nonfrozen');
          });
    }
  }


  /**
   * Generate history.
   */
  generateHistory(): void {

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

    if (this.measurementMode == 'Copenhagen') {
      if (firstWin && this.winningStatus.totalProbAtDets > 0) {
        // TO DO - to fix!
        this.simulationQ.propagateToEndCheated(this.winningStatus.probsAtDetsByTime);
      } else {
        this.simulationQ.propagateToEnd(true);
      }
    } else {
      this.simulationQ.propagateToEnd(false);
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
  generateAnimation(): void {
    if (this.animationExists) {
      this.particleAnimation.stop();
    }
    this.generateHistory();
    this.particleAnimation = new CanvasParticleAnimation(
      this,
      this.simulationQ.history,
      this.simulationQ.measurementHistory as any,
      this.winningStatus.absorptionProbabilities,
      this.callbacks.animationInterrupt,
      this.callbacks.animationEnd,
      this.drawMode,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (s: any) => (this.gameBoard as any).titleManager.displayMessage(s, 'progress', -1)
    );
  }

  /**
   * Play animation. Generate history if necessary.
   */
  // TODO simplify its logic?
  play(): void {
    this.logger.logAction('simulationPlay');
    this.callbacks.animationStart();
    if (!this.animationExists) {
      this.generateAnimation();
    }
    // After generation, this.animationExists is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.particleAnimation as any).playing) {
      this.particleAnimation.pause();
      this.callbacks.setPlayButtonState('play');
    } else {
      this.particleAnimation.play();
      this.callbacks.setPlayButtonState('pause');
    }
  }

  stop(): void {
    this.logger.logAction('simulationStop');
    if (this.animationExists) {
      this.particleAnimation.stop();
      this.callbacks.setPlayButtonState('play');
    }
  }

  forward(): void {
    if (!this.animationExists) {
      this.generateAnimation();
      this.particleAnimation.initialize();
    }
    // After generation, this.animationExists is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((this.particleAnimation as any).playing) {
      this.particleAnimation.pause();
      this.callbacks.setPlayButtonState('play');
    } else {
      this.particleAnimation.forward();
    }
  }

  // NOTE maybe only exporting some
  exportBoard(): Record<string, unknown> {
    // should match interface from level.js
    return {
      name:   this.level.name,
      group:  this.level.group,
      id:     this.level.id,
      i:      this.level.i,
      next:   this.level.next,
      width:  this.level.width,
      height: this.level.height,
      tiles:  this.tileMatrix
        .flat()
        .filter((d) => d.tileName !== 'Vacuum')
        .map((d) => ({
          i: d.i,
          j: d.j,
          name: d.tileName,
          rotation: d.rotation,
          frozen: d.frozen,
        })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stock:                        this.stock ? (this.stock as any).stock : {},  // hack for non-attached stock
      requiredDetectionProbability: this.level.requiredDetectionProbability,
      detectorsToFeed:              this.level.detectorsToFeed,
      texts:                        this.level.texts,
      initialHint:                  this.level.initialHint,
      boardHints:                   this.level.boardHints,
    };
  }

}
