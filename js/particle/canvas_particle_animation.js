/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import {TAU, perpendicularI, perpendicularJ} from '../const';
import {tileSize, oscillations, polarizationScaleH, polarizationScaleV, resizeThrottle, canvasDrawFrequency} from '../config';
import {ParticleAnimation} from './particle_animation';

export class CanvasParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback) {
    super(board, history, measurementHistory, absorptionProbabilities, interruptCallback, finishCallback);
    this.canvas = null;
    this.helperCanvas = null;
    this.ctx = null;
    this.startTime = 0;
    this.pauseTime = 0;
    // Prepare throttled version of resizeCanvas
    this.throttledResizeCanvas =
      _.throttle(this.resizeCanvas, resizeThrottle)
      .bind(this);
  }

  updateStartTime() {
    // If we paused, we have to change startTime for animation to work.
    if (!this.playing && this.startTime <= this.pauseTime) {
      const time = new Date().getTime();
      this.startTime += time - this.pauseTime;
    }
  }

  stop() {
    super.stop();
    window.removeEventListener('resize', this.throttledResizeCanvas);
    this.canvas.classed('canvas--hidden', true);
  }

  play() {
    this.updateStartTime();
    super.play();
    this.canvas.classed('canvas--hidden', false);
  }

  forward() {
    this.updateStartTime();
    super.forward();
  }

  initialize() {
    super.initialize();
    // Create canvas, get context
    this.canvas = d3.select('#gameCanvas');
    this.ctx = this.canvas[0][0].getContext('2d');
    // Similar for helper canvas
    this.helperCanvas = d3.select('#gameHelperCanvas');
    this.helperCtx = this.helperCanvas[0][0].getContext('2d');
    // Interrupt animation when clicked on canvas
    this.canvas[0][0].addEventListener('click', this.interrupt.bind(this));
    // Initial canvas resize
    this.resizeCanvas();
    // Cancel old clearing events
    CanvasParticleAnimation.stopClearing();
    // Set resize event handler
    window.addEventListener('resize', this.throttledResizeCanvas);
    this.startTime = new Date().getTime();
    this.lastStepFloat = 0;
    // Show the canvas (useful when initing animation via "next step" button)
    this.canvas.classed('canvas--hidden', false);
  }

  interrupt() {
    this.stop();
    this.interruptCallback();
  }

  resizeCanvas() {
    // Get the size of #game > svg > .background element
    const box = this.board.svg.select('.background').node().getBoundingClientRect();
    const resizer = (canvas) => {
      canvas
        .style({
          width:  `${Math.round(box.width)}px`,
          height: `${Math.round(box.height)}px`,
          top:    `${Math.round(box.top)}px`,
          left:   `${Math.round(box.left)}px`,
        })
        .attr({
          width:  this.board.level.width * tileSize,
          height: this.board.level.height * tileSize,
        });
    }
    resizer(this.canvas);
    resizer(this.helperCanvas);
  }

  nextFrame() {
    const time = new Date().getTime();
    const stepFloat = (time - this.startTime) / this.animationStepDuration;
    const oldStepNo = this.stepNo;
    this.stepNo = Math.floor(stepFloat);
    const stepIncreased = this.stepNo > oldStepNo;

    if (this.stepNo < this.history.length - 1) {
      const relativeStepNo = stepFloat - this.stepNo;
      const relativeLastStepNo = this.lastStepFloat - this.stepNo;
      this.updateParticles(relativeStepNo, relativeLastStepNo);
      if (stepIncreased) {
        this.displayMeasurementTexts(this.stepNo);
      }
      // Update last step
      this.lastStepFloat = stepFloat;
      // Request next frame if playing or if the animation didn't manage
      // to get to the keyframe.
      if (this.playing || !stepIncreased) {
        window.requestAnimationFrame(this.nextFrame.bind(this));
      } else {
        this.pauseTime = time;
      }
    } else {
      this.finish();
    }
  }

  /**
   *
   */
  updateParticles(stepFloat, lastStepFloat) {
    const substepStart = Math.round(lastStepFloat * canvasDrawFrequency);
    const substepEnd = Math.round(stepFloat * canvasDrawFrequency);
    for (let substep = substepStart; substep <= substepEnd; ++substep) {
      this.updateParticlesHelper(substep / canvasDrawFrequency);
    }
  }

  /**
   * Draw particles basing on current step (this.stepNo)
   * and t, which represents how far we are in progression
   * from step stepNo to step (stepNo + 1).
   *
   * `t` usually should be in range [0, 1).
   * It may happen that it's below 0, e.g. when we draw particles from previous
   * frame.
   */
  updateParticlesHelperOrig(t) {
    this.clearAlpha(0.95);
    // Determine which step to access. It is possible that we progressed with
    // this.stepNo, but we have still to draw some dots from previous step.
    let stepNo = this.stepNo;
    while (t < 0) {
      stepNo--;
      t += 1;
    }
    // Actual drawing
    this.ctx.fillStyle = 'red';
    _.each(this.history[stepNo], (d) => {
      this.ctx.beginPath();
      this.ctx.globalAlpha = d.prob;
      const h = polarizationScaleH * (d.hRe * Math.cos(oscillations * TAU * t) + d.hIm * Math.sin(oscillations * TAU * t)) / Math.sqrt(d.prob);
      const x = (1 - t) * d.startX + t * d.endX + perpendicularI[d.dir] * h;
      const y = (1 - t) * d.startY + t * d.endY + perpendicularJ[d.dir] * h;
      const s = 10 * (
          1 + polarizationScaleV * (
              d.vRe * Math.cos(oscillations * TAU * t)
            + d.vIm * Math.sin(oscillations * TAU * t)
          ) / Math.sqrt(d.prob)
        );
      this.ctx.arc(x, y, s, 0, 360, false);
      this.ctx.fill();
    });
  }
  updateParticlesHelper(t) {
    this.clearAlpha(0.9);
    // Determine which step to access. It is possible that we progressed with
    // this.stepNo, but we have still to draw some dots from previous step.
    let stepNo = this.stepNo;
    while (t < 0) {
      stepNo--;
      t += 1;
    }
    // Actual drawing
    this.ctx.fillStyle = 'red';
    _.each(this.history[stepNo], (d) => {

      const movX = (1 - t) * d.startX + t * d.endX;
      const movY = (1 - t) * d.startY + t * d.endY;

      const polH = 25 * (d.hRe * Math.cos(oscillations * TAU * t) + d.hIm * Math.sin(oscillations * TAU * t));
      const polV = 25 * (d.vRe * Math.cos(oscillations * TAU * t) + d.vIm * Math.sin(oscillations * TAU * t));

      const polX = perpendicularI[d.dir] * polV + perpendicularJ[d.dir] * polH;
      const polY = perpendicularI[d.dir] * polH + perpendicularJ[d.dir] * polV;

      const x = movX + polX;
      const y = movY + polY;

      this.ctx.beginPath();
      this.ctx.globalAlpha = d.prob * 0.5;
      this.ctx.strokeStyle = 'orange';
      this.ctx.arc(movX, movY, 45, 0, 360, false);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.globalAlpha = d.prob;
      this.ctx.fillStyle = 'red';
      this.ctx.arc(x, y, 5, 0, 360, false);
      this.ctx.fill();
    });
  }

  finish() {
    super.finish();
    this.startClearing();
  }

  startClearing() {
    // There may be multiple existing instances of CanvasParticleAnimation
    // at the same time - if player presses `play` just after previous animation
    // has ended. There may be an overlap between old animation clearing
    // and new animation.
    // Global counter allowing one animation to cancel clearing of the other one.
    CanvasParticleAnimation.clearingFramesLeft = 20;
    this.clearing();
  }

  clearing() {
    if (
      CanvasParticleAnimation.clearingFramesLeft == null
      || CanvasParticleAnimation.clearingFramesLeft <= 0
    ) {
      return;
    }
    if (CanvasParticleAnimation.clearingFramesLeft === 1) {
      this.clearAlpha(0);
      this.canvas.classed('canvas--hidden', true);
      return;
    }
    CanvasParticleAnimation.clearingFramesLeft--;
    this.clearAlpha(0.8);
    window.setTimeout(this.clearing.bind(this), 50);
  }

  static stopClearing() {
    CanvasParticleAnimation.clearingFramesLeft = 0;
  }

  /**
   * clearRect with alpha support.
   * alpha - how much (in terms of transparency) of previous frame stays.
   * clearAlpha(0) should work like clearRect().
   */
   clearAlpha(alpha) {
     // Reset alpha
     this.ctx.globalAlpha = 1;
     // Copy image to helper context
     if (alpha > 0) {
       this.helperCtx.clearRect(
         0, 0,
         this.board.level.width * tileSize,
         this.board.level.height * tileSize
       );
       this.helperCtx.globalAlpha = alpha;
       this.helperCtx.drawImage(this.canvas[0][0], 0, 0);
     }
     // Draw image from helper context, a bit faded-out
     this.ctx.clearRect(
       0, 0,
       this.board.level.width * tileSize,
       this.board.level.height * tileSize
     );
     if (alpha > 0) {
       this.ctx.drawImage(this.helperCanvas[0][0], 0, 0);
     }
   }
}
