/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import {TAU, perpendicularI, perpendicularJ} from '../const';
import {oscillations, polarizationScaleH, polarizationScaleV} from '../config';
import {ParticleAnimation} from './particle_animation';

export class SVGParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback) {
    super(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback);
    this.particleGroup = null;
    this.currentTimeout = 0;
  }

  pause() {
    super.pause();
    window.clearTimeout(this.currentTimeout);
  }

  stop() {
    super.stop();
    this.exitParticles();
  }

  initialize() {
    super.initialize();
    this.particleGroup = this.board.svg
      .append('g')
      .attr('class', 'particles');
  }

  finish() {
    super.finish();
    this.exitParticles();
  }

  /**
   * Make next frame of animation, possibly setting the timeout for the
   * next frame of animation.
   */
  nextFrame() {
    this.updateParticles();
    this.displayMeasurementTexts(this.stepNo);
    this.stepNo++;

    if (this.stepNo < this.history.length - 1) {
      // Set timeout only if playing
      if (this.playing) {
        this.currentTimeout = window.setTimeout(
          this.nextFrame.bind(this),
          this.animationStepDuration
        );
      }
    } else {
      this.finish();
    }
  }

  updateParticles() {
    const particles = this.particleGroup
      .selectAll('.particle')
      .data(this.history[this.stepNo]);

    particles
      .exit()
      .remove();

    particles
      .enter()
      .append('use')
      .attr({
        'xlink:href': '#particle',
        'class': 'particle',
      });

    particles
      .attr('transform', (d) => `translate(${d.startX},${d.startY})`)
      .style('opacity', (d) => Math.sqrt(d.prob));

    particles
      .interrupt()
      .transition()
      .ease([0, 1])
      .duration(this.animationStepDuration)
      .attrTween('transform', (d) => (t) => {
        const h = polarizationScaleH * (d.hRe * Math.cos(oscillations * TAU * t) + d.hIm * Math.sin(oscillations * TAU * t)) / Math.sqrt(d.prob);
        const x = (1 - t) * d.startX + t * d.endX + perpendicularI[d.dir] * h;
        const y = (1 - t) * d.startY + t * d.endY + perpendicularJ[d.dir] * h;
        const s = 1 + polarizationScaleV * (d.vRe * Math.cos(oscillations * TAU * t) + d.vIm * Math.sin(oscillations * TAU * t)) / Math.sqrt(d.prob);
        return `translate(${x}, ${y}) scale(${s})`;
      });
  };

  exitParticles() {
    this.particleGroup.selectAll('.particle')
      .transition().duration(this.animationStepDuration)
        .style('opacity', 0)
        .delay(this.animationStepDuration)
        .remove();
  }
}
