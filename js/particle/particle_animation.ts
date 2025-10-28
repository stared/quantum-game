/*global window:false*/

import {tileSize, absorptionDuration, absorptionTextDuration} from '../config';
import {Particle} from './particle';
import * as print from '../print';
import type {D3Selection, ParticleEntry, Direction} from '../types';
import type {Tile} from '../tile';

// Measurement result for a detector
export interface MeasurementResult {
  i: number;
  j: number;
  measured: boolean;
  tile?: Tile;
}

// Absorption probability result
export interface AbsorptionProbability {
  i: number;
  j: number;
  probability: number;
}

export class ParticleAnimation {
  stateHistory: ParticleEntry[][];
  history: Particle[][];
  measurementHistory: MeasurementResult[][];
  absorptionProbabilities: AbsorptionProbability[];
  animationStepDuration: number;
  absorptionDuration: number;
  interruptCallback: () => void;
  finishCallback: () => void;
  drawMode: string;
  board: any; // GameBoard type - complex, using any for now
  displayMessage: (message: string) => void;
  stepNo: number;
  playing: boolean;
  initialized: boolean;
  previousStepNo: number;
  measurementTextGroup!: D3Selection;
  absorptionTextGroup!: D3Selection;

  constructor(
    board: any,
    history: ParticleEntry[][],
    measurementHistory: MeasurementResult[][],
    absorptionProbabilities: AbsorptionProbability[],
    interruptCallback: () => void,
    finishCallback: () => void,
    drawMode: string,
    displayMessage: (message: string) => void
  ) {

    this.stateHistory = history;
    this.history = history.map((state) => {
      const grouped = state.reduce<Record<string, ParticleEntry[]>>((acc, val) => {
        const key = `${val.i},${val.j},${val.to[0]}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key]!.push(val);
        return acc;
      }, {});

      return Object.values(grouped).map((ray: ParticleEntry[]) => {
        const rayind: Record<string, ParticleEntry> = Object.fromEntries(
          ray.map((val) => [val.to[1], val])
        );

        const hRe = rayind['-'] ? rayind['-']!.re : 0;
        const hIm = rayind['-'] ? rayind['-']!.im : 0;
        const vRe = rayind['|'] ? rayind['|']!.re : 0;
        const vIm = rayind['|'] ? rayind['|']!.im : 0;

        return new Particle(ray[0]!.i, ray[0]!.j, ray[0]!.to[0] as Direction, hRe, hIm, vRe, vIm);
      });
    });

    this.measurementHistory = measurementHistory;
    this.absorptionProbabilities = absorptionProbabilities;
    this.animationStepDuration = board.animationStepDuration;
    this.absorptionDuration = absorptionDuration;
    this.interruptCallback = interruptCallback;
    this.finishCallback = finishCallback;
    this.drawMode = drawMode;
    this.board = board;
    this.displayMessage = displayMessage;
    this.stepNo = 0;
    this.playing = false;
    this.initialized = false;
    // report it to the board
    this.board.animationExists = true;

    this.previousStepNo = -1;
  }

  initialize(): void {
    this.measurementTextGroup = this.board.svg
      .append('g')
      .attr('class', 'measurement-texts');
    this.absorptionTextGroup = this.board.svg
      .append('g')
      .attr('class', 'absorption-texts');
    this.initialized = true;
    this.board.animationExists = true;
  }

  play(): void {
    if (!this.initialized) {
      this.initialize();
    }
    if (!this.playing) {
      this.playing = true;
      this.forward();
    }
  }

  stop(): void {
    this.pause();
    this.removeTexts();
    this.initialized = false;
    this.board.animationExists = false;
  }

  pause(): void {
    this.playing = false;
  }

  forward(): void {
    if (this.stepNo > this.previousStepNo) {
      this.previousStepNo = this.stepNo;
      this.displayMessage(print.stateToStr(this.stateHistory[this.stepNo]!));
    }
    this.nextFrame();
  }

  nextFrame(): void {
    throw new Error('nextFrame() unimplemented');
  }

  removeTexts(): void {
    this.measurementTextGroup.remove();
    this.absorptionTextGroup.remove();
  }

  // NOTE maybe just one timeout would suffice
  finish(): void {
    window.setTimeout(
      this.displayAbsorptionTexts.bind(this),
      absorptionDuration
    );
    const lastStep = this.measurementHistory.length - 1;
    window.setTimeout(
      this.displayMeasurementTexts.bind(this, lastStep),
      this.animationStepDuration
    );
    window.setTimeout(
      this.finishCallback.bind(this),
      this.absorptionDuration
    );
    window.setTimeout(
      () => {this.board.animationExists = false;},
      this.absorptionDuration
    );
    // Make text groups disappear
    window.setTimeout(
      this.removeTexts.bind(this),
      absorptionDuration + absorptionTextDuration
    );
  }

  displayMeasurementTexts(stepNo: number): void {
    this.measurementHistory[stepNo]!.forEach((measurement) => {
      this.measurementTextGroup.datum(measurement)
        .append('text')
        .attr('class', 'measurement-text unselectable')
        .attr('x', (d: MeasurementResult) => tileSize * d.i + tileSize / 2)
        .attr('y', (d: MeasurementResult) => tileSize * d.j + tileSize / 2)
        .attr('dy', '0.5em')
        .style('font-size', '20px')
        .text((d: MeasurementResult) => d.measured ? 'click!' : 'not here...')
        .transition().duration(2 * this.animationStepDuration)
        .style('font-size', '60px')
        .style('opacity', 0)
        .remove();

      this.measurementTextGroup.datum(measurement)
        .each((d: MeasurementResult) => {
          if (d.measured && d.tile != null) {
            d.tile.absorbSound();
            d.tile.absorbAnimation();
          }
        });
    });

  }

  displayAbsorptionTexts(): void {
    // TODO(pmigdal): instead of texts - a heatmap of colorful tiles?
    this.absorptionTextGroup.selectAll('.absorption-text')
      .data(this.absorptionProbabilities)
      .enter()
      .append('text')
      .attr('class', 'absorption-text unselectable')
      .attr('x', (d: AbsorptionProbability) => tileSize * d.i + tileSize)
      .attr('y', (d: AbsorptionProbability) => tileSize * d.j + tileSize)
      .attr('dx', '-0.1em')
      .attr('dy', '-0.1em')
      .text((d: AbsorptionProbability) => (100 * d.probability).toFixed(0) + '%')
      .transition().duration(absorptionTextDuration)
        .style('opacity', 0)
        .remove();

  }
}
