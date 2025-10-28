/*global window:false*/

import {TAU, perpendicularI, perpendicularJ} from '../const';
import {oscillations, polarizationScaleH, polarizationScaleV} from '../config';
import {ParticleAnimation, type MeasurementResult, type AbsorptionProbability} from './particle_animation';
import type {D3Selection, ParticleEntry} from '../types';
import type {Particle} from './particle';

export class SVGParticleAnimation extends ParticleAnimation {
  particleGroup!: D3Selection;
  currentTimeout: number;

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
    super(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback, drawMode, displayMessage);
    this.currentTimeout = 0;
  }

  override pause(): void {
    super.pause();
    window.clearTimeout(this.currentTimeout);
  }

  override stop(): void {
    super.stop();
    this.exitParticles();
  }

  override initialize(): void {
    super.initialize();
    this.particleGroup = this.board.svg
      .append('g')
      .attr('class', 'particles');
  }

  override finish(): void {
    super.finish();
    this.exitParticles();
  }

  /**
   * Make next frame of animation, possibly setting the timeout for the
   * next frame of animation.
   */
  override nextFrame(): void {
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

  updateParticles(): void {
    const particles = this.particleGroup.selectAll('.particle').data(this.history[this.stepNo]);

    particles.exit().remove();

    particles.enter().append('use').attr({
        'xlink:href': '#particle',
        'class': 'particle',
      });

    particles.attr('transform', (d: Particle) => `translate(${d.startX},${d.startY})`).style('opacity', (d: Particle) => Math.sqrt(d.prob));

    // @ts-expect-error - D3 v3 compatibility
    particles.interrupt().transition().ease([0, 1]).duration(this.animationStepDuration).attrTween('transform', (d: Particle) => (t: number) => {
        const h = polarizationScaleH * (d.hRe * Math.cos(oscillations * TAU * t) + d.hIm * Math.sin(oscillations * TAU * t)) / Math.sqrt(d.prob);
        const x = (1 - t) * d.startX + t * d.endX + perpendicularI[d.dir] * h;
        const y = (1 - t) * d.startY + t * d.endY + perpendicularJ[d.dir] * h;
        const s = 1 + polarizationScaleV * (d.vRe * Math.cos(oscillations * TAU * t) + d.vIm * Math.sin(oscillations * TAU * t)) / Math.sqrt(d.prob);
        return `translate(${x}, ${y}) scale(${s})`;
      });
  }

  exitParticles(): void {
    // @ts-expect-error - D3 v3 compatibility
    this.particleGroup.selectAll('.particle').transition().duration(this.animationStepDuration).style('opacity', 0).delay(this.animationStepDuration).remove();
  }
}
