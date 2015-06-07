/*global window:false*/
import _ from 'lodash';
import d3 from 'd3';

import {TAU, velocityI, velocityJ, perpendicularI, perpendicularJ} from './const';
import {animationStepDuration, tileSize, oscillations, polarizationScaleH, polarizationScaleV, resizeThrottle} from './config';

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
  constructor(board, history, measurementHistory) {

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
    this.board = board;
    this.stepNo = 0;
  }
}

export class SVGParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory) {
    super(board, history, measurementHistory);
    this.particleGroup = null;
    this.currentTimeout = 0;
  }

  stop() {
    window.clearTimeout(this.currentTimeout);
    this.particleGroup.remove();
    this.measurementTextGroup.remove();
  }

  play() {
    this.particleGroup = this.board.svg
      .append('g')
      .attr('class', 'particles');
    this.measurementTextGroup = this.board.svg
      .append('g')
      .attr('class', 'measurement-texts');
    this.nextFrame();
  }

  nextFrame() {
    this.updateParticles();
    this.displayMeasurementTexts();
    this.stepNo++;

    if (this.stepNo < this.history.length - 1) {
      this.currentTimeout = window.setTimeout(
        this.nextFrame.bind(this),
        animationStepDuration
      );
    } else {
      this.exitParticles();
      window.setTimeout(
        this.displayMeasurementTexts.bind(this),
        animationStepDuration
      );
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
        'class': 'particle'
      });

    particles
      .attr({
        transform: (d) => `translate(${d.startX},${d.startY})`
      })
      .style({
        opacity: (d) => d.prob
      });

    particles
      .interrupt()
      .transition()
      .ease([0, 1])
      .duration(animationStepDuration)
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
      .transition().duration(animationStepDuration)
        .style('opacity', 0)
        .delay(animationStepDuration)
        .remove();
  }

  displayMeasurementTexts() {

    _.forEach(this.measurementHistory[this.stepNo], (measurement) => {
      this.measurementTextGroup.datum(measurement)
        .append('text')
          .attr('class', 'measurement-text')
          .attr('x', (d) => tileSize * d.i + tileSize / 2)
          .attr('y', (d) => tileSize * d.j + tileSize / 2)
          .style('font-size', '20px')
          .text((d) => d.measured ? "click!" : "not here...")
          .transition().duration(2 * animationStepDuration)
            .style('font-size', '60px')
            .style('opacity', 0)
            .remove();
    });

  }
}

export class CanvasParticleAnimation extends ParticleAnimation {
  constructor(board, history, measurementHistory) {
    super(board, history, measurementHistory);
    this.canvas = null;
    this.ctx = null;
    this.startTime = 0;
    // Prepare throttled version of resizeCanvas
    this.throttledResizeCanvas =
      _.throttle(this.resizeCanvas, resizeThrottle)
      .bind(this);
  }

  stop() {
    window.removeEventListener('resize', this.throttledResizeCanvas);
    if (this.canvas) {
      this.canvas.remove();
    }
  }

  play() {
    // Create canvas, get context
    this.canvas = d3.select('#game')
      .append('canvas');
    this.ctx = this.canvas[0][0].getContext('2d');
    // Stop animation when clicked on canvas
    this.canvas[0][0].addEventListener('click', this.stop.bind(this));
    // Initial canvas resize
    this.resizeCanvas();
    // Set resize event handler
    window.addEventListener('resize', this.throttledResizeCanvas);
    this.startTime = new Date().getTime();
    window.requestAnimationFrame(this.nextFrame.bind(this));
  }

  resizeCanvas() {
    // Get the size of #game > svg > .background element
    const box = this.board.svg.select('.background').node().getBoundingClientRect();
    this.canvas
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

  nextFrame() {
    const time = new Date().getTime();
    const stepFloat = (time - this.startTime) / animationStepDuration;
    this.stepNo = Math.floor(stepFloat);

    if (this.stepNo < this.history.length) {
      this.updateParticles(stepFloat - this.stepNo);
      window.requestAnimationFrame(this.nextFrame.bind(this));
    } else {
      this.stop();
    }
  }

  /**
   * Draw particles basing on current step (this.stepNo)
   * and t, which represents how far we are in progression
   * from step stepNo to step (stepNo + 1).
   * t is in range [0, 1).
   */
  updateParticles(t) {
    this.ctx.clearRect(
      0, 0,
      this.board.level.width * tileSize,
      this.board.level.height * tileSize
    );
    this.ctx.fillStyle = 'coral';
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
  }
}
