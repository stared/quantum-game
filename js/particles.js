/*global window:false*/
import _ from 'lodash';

import {TAU, velocityI, velocityJ, perpendicularI, perpendicularJ} from './const';
import {animationStepDuration, tileSize, oscillations, polarizationScaleH, polarizationScaleV} from './config';

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
    return this.hRe*this.hRe + this.hIm*this.hIm + this.vRe*this.vRe + this.vIm*this.vIm;
  }

}

export class ParticleAnimation {

  constructor(history, board) {

    this.history = history.map((state) => {
      // console.log("groupBy", _.groupBy(state, (val) => `${val.i},${val.j},${val.to[0]}`))
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

    this.board = board;
    this.stepNo = 0;
    this.particleGroup = this.board.svg
      .select('.particles');

    this.currentTimeout = 0;
  }

  stop() {
    window.clearTimeout(this.currentTimeout);
    this.particleGroup
      .selectAll('.particle')
      .remove();
  }

  play() {
    this.nextFrame();
  }

  nextFrame() {
    this.updateParticles();
    this.stepNo++;

    if (this.stepNo < this.history.length - 1) {
      this.currentTimeout = window.setTimeout(
        this.nextFrame.bind(this),
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
      })

  }
}
