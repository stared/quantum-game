/*global window:false*/
import _ from 'lodash';

import {velocityI, velocityJ} from './const';
import {animationStepDuration, tileSize} from './config';

class Particle {
  constructor(i, j, to, re, im) {
    this.i = i;
    this.j = j;
    this.to = to;
    this.re = re;
    this.im = im;
  }
  get startX() {
    return tileSize * this.i + tileSize / 2;
  }
  get endX() {
    return tileSize * (this.i + velocityI[this.to[0]]) + tileSize / 2;
  }
  get startY() {
    return tileSize * this.j + tileSize / 2;
  }
  get endY() {
    return tileSize * (this.j + velocityJ[this.to[0]]) + tileSize / 2;
  }
}

export class ParticleAnimation {

  constructor(history, board) {

    this.history = history.map((state) =>
      _.values(state).map((val) =>
        new Particle(val.i, val.j, val.to, val.re, val.im)
      )
    );

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
        opacity: (d) => d.re * d.re + d.im * d.im
      });

    particles
      .interrupt()
      .transition()
      .ease([0, 1])
      .duration(animationStepDuration)
      .attrTween('transform', (d) => (t) => {
        const x = (1 - t) * d.startX + t * d.endX;
        const y = (1 - t) * d.startY + t * d.endY;
        const s = 1;
        return `translate(${x}, ${y}) scale(${s})`;
      })
      // .attrTween("cy", (d) => (t) =>
      //   5 * Math.sin(5 * 2 * Math.PI * t)
      // )
      // .attrTween("r",  (d) => (t) =>
      //   7 + 3 * Math.sin(5 * 2 * Math.PI * t - 0)
      // );

  }
}
