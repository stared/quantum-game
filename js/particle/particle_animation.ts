// @ts-nocheck
/*global window:false*/

import {tileSize, absorptionDuration, absorptionTextDuration} from '../config';
import {Particle} from './particle';
import * as print from '../print';

export class ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback, drawMode, displayMessage) {

    this.stateHistory = history;
    this.history = history.map((state) => {
      const grouped = state.reduce((acc, val) => {
        const key = `${val.i},${val.j},${val.to[0]}`;
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(val);
        return acc;
      }, {});

      return Object.values(grouped).map((ray) => {
        const rayind = Object.fromEntries(
          ray.map((val) => [val.to[1], val])
        );

        const hRe = rayind['-'] ? rayind['-'].re : 0;
        const hIm = rayind['-'] ? rayind['-'].im : 0;
        const vRe = rayind['|'] ? rayind['|'].re : 0;
        const vIm = rayind['|'] ? rayind['|'].im : 0;

        return new Particle(ray[0].i, ray[0].j, ray[0].to[0], hRe, hIm, vRe, vIm);
      });
    });

    this.measurementHistory = measurementHistory;
    this.absorptionProbabilities = absorptionProbabilities;
    this.animationStepDuration = board.animationStepDuration;
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

  initialize() {
    this.measurementTextGroup = this.board.svg
      .append('g')
      .attr('class', 'measurement-texts');
    this.absorptionTextGroup = this.board.svg
      .append('g')
      .attr('class', 'absorption-texts');
    this.initialized = true;
    this.board.animationExists = true;
  }

  play() {
    if (!this.initialized) {
      this.initialize();
    }
    if (!this.playing) {
      this.playing = true;
      this.forward();
    }
  }

  stop() {
    this.pause();
    this.removeTexts();
    this.initialized = false;
    this.board.animationExists = false;
  }

  pause() {
    this.playing = false;
  }

  forward() {
    if (this.stepNo > this.previousStepNo) {
      this.previousStepNo = this.stepNo;
      this.displayMessage(print.stateToStr(this.stateHistory[this.stepNo]));
    }
    this.nextFrame();
  }

  nextFrame() {
    throw new Error('nextFrame() unimplemented');
  }

  removeTexts() {
    this.measurementTextGroup.remove();
    this.absorptionTextGroup.remove();
  }

  // NOTE maybe just one timeout would suffice
  finish() {
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

  displayMeasurementTexts(stepNo) {
    this.measurementHistory[stepNo].forEach((measurement) => {
      this.measurementTextGroup.datum(measurement)
        .append('text')
        .attr('class', 'measurement-text unselectable')
        .attr('x', (d) => tileSize * d.i + tileSize / 2)
        .attr('y', (d) => tileSize * d.j + tileSize / 2)
        .attr('dy', '0.5em')
        .style('font-size', '20px')
        .text((d) => d.measured ? 'click!' : 'not here...')
        .transition().duration(2 * this.animationStepDuration)
        .style('font-size', '60px')
        .style('opacity', 0)
        .remove();

      this.measurementTextGroup.datum(measurement)
        .each((d) => {
          if (d.measured && d.tile != null) {
            d.tile.absorbSound();
            d.tile.absorbAnimation();
          }
        });
    });

  }

  displayAbsorptionTexts() {
    // TODO(pmigdal): instead of texts - a heatmap of colorful tiles?
    this.absorptionTextGroup
      .selectAll('.absorption-text')
      .data(this.absorptionProbabilities)
      .enter()
      .append('text')
      .attr('class', 'absorption-text unselectable')
      .attr('x', (d) => tileSize * d.i + tileSize)
      .attr('y', (d) => tileSize * d.j + tileSize)
      .attr('dx', '-0.1em')
      .attr('dy', '-0.1em')
      .text((d) => (100 * d.probability).toFixed(0) + '%')
      .transition().duration(absorptionTextDuration)
        .style('opacity', 0)
        .remove();

  }
}
