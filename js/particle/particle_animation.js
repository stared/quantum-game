/*global window:false*/
import _ from 'lodash';

import {tileSize, absorptionDuration, absorptionTextDuration} from '../config';
import {Particle} from './particle';

export class ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, finishCallback) {

    this.history = history.map((state) => {
      return _.chain(state)
        .groupBy((val) => `${val.i},${val.j},${val.to[0]}`)
        .mapValues((ray) => {
          const rayind = _.indexBy(ray, (val) => val.to[1]);

          const hRe = rayind['-'] ? rayind['-'].re : 0;
          const hIm = rayind['-'] ? rayind['-'].im : 0;
          const vRe = rayind['|'] ? rayind['|'].re : 0;
          const vIm = rayind['|'] ? rayind['|'].im : 0;

          return new Particle(ray[0].i, ray[0].j, ray[0].to[0], hRe, hIm, vRe, vIm);
        })
        .values()
        .value();
    });

    this.measurementHistory = measurementHistory;
    this.absorptionProbabilities = absorptionProbabilities;
    this.animationStepDuration = board.animationStepDuration;
    this.finishCallback = finishCallback;
    this.board = board;
    this.stepNo = 0;
    this.playing = false;
    this.initialized = false;
  }

  initialize() {
    this.measurementTextGroup = this.board.svg
      .append('g')
      .attr('class', 'measurement-texts');
    this.absorptionTextGroup = this.board.svg
      .append('g')
      .attr('class', 'absorption-texts');
    this.initialized = true;
  }

  play() {
    if (!this.initialized) {
      this.initialize();
    }
    if (!this.playing) {
      this.playing = true;
      this.nextFrame();
    }
  }

  stop() {
    this.pause();
    this.removeTexts();
    this.initialized = false;
  }

  pause() {
    this.playing = false;
  }

  forward() {
    this.nextFrame();
  }

  backward() {
    throw new Error('backward() unimplemented');
  }

  nextFrame() {
    throw new Error('nextFrame() unimplemented');
  }

  removeTexts() {
    this.measurementTextGroup.remove();
    this.absorptionTextGroup.remove();
  }

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
    // Make text groups disappear
    window.setTimeout(
      this.removeTexts.bind(this),
      absorptionDuration + absorptionTextDuration
    );
  }

  displayMeasurementTexts(stepNo) {
    _.forEach(this.measurementHistory[stepNo], (measurement) => {
      this.measurementTextGroup.datum(measurement)
        .append('text')
        .attr('class', 'measurement-text')
        .attr('x', (d) => tileSize * d.i + tileSize / 2)
        .attr('y', (d) => tileSize * d.j + tileSize / 2)
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
      .attr('class', 'absorption-text')
      .attr('x', (d) => tileSize * d.i + tileSize / 2)
      .attr('y', (d) => tileSize * d.j + tileSize / 2)
      .text((d) => (100 * d.probability).toFixed(0) + '%')
      .transition().duration(absorptionTextDuration)
      .style('opacity', 0)
      .remove();

  }
}
