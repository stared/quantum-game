/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import {TAU, velocityI, velocityJ, perpendicularI, perpendicularJ} from './const';
import {tileSize, oscillations, polarizationScaleH, polarizationScaleV, resizeThrottle, absorptionDuration, absorptionTextDuration} from './config';

class Particle {

  constructor(i, j, dir, hRe, hIm, vRe, vIm) {
    this.i = i;
    this.j = j;
    this.dir = dir;
    this.hRe = hRe;
    this.hIm = hIm;
    this.vRe = vRe;
    this.vIm = vIm;
  }

  get startX() {
    return tileSize * this.i + tileSize / 2;
  }

  get endX() {
    return tileSize * (this.i + velocityI[this.dir]) + tileSize / 2;
  }

  get startY() {
    return tileSize * this.j + tileSize / 2;
  }

  get endY() {
    return tileSize * (this.j + velocityJ[this.dir]) + tileSize / 2;
  }

  get prob() {
    return this.hRe * this.hRe + this.hIm * this.hIm
         + this.vRe * this.vRe + this.vIm * this.vIm;
  }

}

class ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, callback) {

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
    this.callback = callback;
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
    this.measurementTextGroup.remove();
    this.absorptionTextGroup.remove();
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
      this.callback.bind(this),
      this.absorptionDuration
    );
    // Make text groups disappear
    window.setTimeout(
      this.stop.bind(this),
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

export class SVGParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, callback) {
    super(board, history, measurementHistory, absorptionProbabilities, callback);
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

export class CanvasParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory, absorptionProbabilities, callback) {
    super(board, history, measurementHistory, absorptionProbabilities, callback);
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
    if (this.canvas) {
      this.canvas.remove();
    }
    if (this.helperCanvas) {
      this.helperCanvas.remove();
    }
  }

  play() {
    this.updateStartTime();
    super.play();
  }

  forward() {
    this.updateStartTime();
    super.forward();
  }

  initialize() {
    super.initialize();
    // Create canvas, get context
    this.canvas = d3.select('#game')
      .append('canvas');
    this.ctx = this.canvas[0][0].getContext('2d');
    // Similar for helper canvas
    this.helperCanvas = d3.select('#game')
      .append('canvas');
    this.helperCanvas.classed('helper-canvas', true);
    this.helperCtx = this.helperCanvas[0][0].getContext('2d');
    // Stop animation when clicked on canvas
    this.canvas[0][0].addEventListener('click', this.stop.bind(this));
    // Initial canvas resize
    this.resizeCanvas();
    // Set resize event handler
    window.addEventListener('resize', this.throttledResizeCanvas);
    this.startTime = new Date().getTime();
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
      this.updateParticles(stepFloat - this.stepNo);
      if (stepIncreased) {
        this.displayMeasurementTexts(this.stepNo);
      }
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
   * Draw particles basing on current step (this.stepNo)
   * and t, which represents how far we are in progression
   * from step stepNo to step (stepNo + 1).
   * t is in range [0, 1).
   */
  updateParticles(t) {
    // Copy image to helper context
    this.helperCtx.clearRect(
      0, 0,
      this.board.level.width * tileSize,
      this.board.level.height * tileSize
    );
    this.helperCtx.globalAlpha = 0.97;
    this.helperCtx.drawImage(this.canvas[0][0], 0, 0);
    // Draw image from helper context, a bit faded-out
    this.ctx.clearRect(
      0, 0,
      this.board.level.width * tileSize,
      this.board.level.height * tileSize
    );
    this.ctx.drawImage(this.helperCanvas[0][0], 0, 0);
    // Actual drawing
    this.ctx.fillStyle = 'red';
    _.each(this.history[this.stepNo], (d) => {
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
    // Reset alpha
    this.ctx.globalAlpha = 1;
  }
}
